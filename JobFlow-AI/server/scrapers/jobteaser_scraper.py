from typing import Optional
"""
JobFlow-AI — JobTeaser Scraper
Scrapes jobteaser.com — platform for students & alternance.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class JobTeaserScraper(BaseScraper):
    """
    Scrapes JobTeaser (jobteaser.com) — student & young grad job board.
    Very relevant for alternance and stage positions.
    Uses Playwright for web scraping.
    """

    PLATFORM = "jobteaser"
    BASE_URL = "https://www.jobteaser.com"
    MIN_DELAY = 3.0
    MAX_DELAY = 7.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape JobTeaser for job offers."""
        from playwright.async_api import async_playwright

        results = []
        query = " ".join(keywords)

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent=self.get_random_user_agent(),
                viewport={"width": 1920, "height": 1080},
                locale="fr-FR",
                timezone_id="Europe/Paris",
            )

            await context.route("**/*.{png,jpg,jpeg,gif,svg,webp,ico}", lambda route: route.abort())

            page = await context.new_page()

            try:
                search_url = (
                    f"{self.BASE_URL}/fr/emplois?"
                    f"query={quote_plus(query)}"
                    f"&location=Paris"
                    f"&contract_types[]=apprenticeship"
                    f"&contract_types[]=internship"
                )

                logger.info(f"[JobTeaser] Navigating to: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Accept cookies
                try:
                    cookie_btn = await page.query_selector(
                        "#onetrust-accept-btn-handler, "
                        "button:has-text('Accepter'), "
                        "button:has-text('Accept'), "
                        "[data-testid='cookie-accept']"
                    )
                    if cookie_btn:
                        await cookie_btn.click()
                        await self.random_delay(1, 2)
                except Exception:
                    pass

                # Scroll to load
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await self.random_delay(0.5, 1.5)

                # Parse cards
                cards = await page.query_selector_all(
                    "[data-testid='job-offer-card'], "
                    "article[class*='offer'], "
                    "[class*='JobCard'], "
                    "[class*='job-card'], "
                    ".offer-item, "
                    "li[class*='result']"
                )

                for card in cards[:max_results]:
                    try:
                        offer = await self._parse_card(card)
                        if offer:
                            offer["source_platform"] = self.PLATFORM
                            offer["offer_type"] = self.classify_offer_type(
                                offer.get("title", ""),
                                offer.get("description", ""),
                            )
                            offer["location_score"] = self.score_location(offer.get("location", ""))
                            if offer["location_score"] >= -5:
                                results.append(offer)
                    except Exception as e:
                        logger.debug(f"[JobTeaser] Card parse error: {e}")

                    await self.random_delay(0.3, 0.8)

            except Exception as e:
                logger.error(f"[JobTeaser] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_card(self, card) -> "Optional[dict]":
        """Parse a single JobTeaser job card."""
        try:
            title_el = await card.query_selector(
                "h2 a, h3 a, [class*='title'] a, "
                "[data-testid='job-title'], a[class*='Title']"
            )
            title = await title_el.inner_text() if title_el else None
            if not title:
                return None

            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro", "dev"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            link = await title_el.get_attribute("href") if title_el else None
            source_url = f"{self.BASE_URL}{link}" if link and not link.startswith("http") else (link or "")

            company_el = await card.query_selector(
                "[data-testid='company-name'], [class*='company'], "
                "span[class*='Company'], p[class*='company']"
            )
            company = await company_el.inner_text() if company_el else "Entreprise"

            location_el = await card.query_selector(
                "[data-testid='location'], [class*='location'], "
                "span[class*='Location']"
            )
            location = await location_el.inner_text() if location_el else ""

            desc_el = await card.query_selector("[class*='description'], p[class*='desc']")
            description = await desc_el.inner_text() if desc_el else ""

            skills = self._extract_skills(f"{title} {description}")

            return {
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": description.strip()[:2000],
                "source_url": source_url,
                "posted_at": datetime.now().strftime("%Y-%m-%d"),
                "required_skills": skills,
            }

        except Exception as e:
            logger.debug(f"[JobTeaser] Parse error: {e}")
            return None

    def _extract_skills(self, text: str) -> list[str]:
        known_skills = [
            "Windows", "MacOS", "Linux", "Active Directory", "Office 365",
            "DHCP", "DNS", "TCP/IP", "VPN", "ITIL", "GLPI",
            "ServiceNow", "JIRA", "SCCM", "Intune", "Azure",
            "Helpdesk", "VMware", "Python", "PowerShell",
            "Réseau", "Firewall", "N1", "N2",
        ]
        found = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill.lower() in text_lower and skill not in found:
                found.append(skill)
        return found[:10]
