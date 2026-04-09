from typing import Optional
"""
JobFlow-AI — Talent.com Scraper (formerly Neuvoo)
Scrapes talent.com — massive global job aggregator.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class TalentScraper(BaseScraper):
    """
    Scrapes Talent.com (formerly Neuvoo) — global job aggregator.
    Aggregates from many sources. Uses Playwright.
    """

    PLATFORM = "talent"
    BASE_URL = "https://fr.talent.com"
    MIN_DELAY = 2.5
    MAX_DELAY = 6.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape Talent.com for job offers."""
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
            await context.route("**/*google*analytics*", lambda route: route.abort())

            page = await context.new_page()

            try:
                search_url = (
                    f"{self.BASE_URL}/jobs?"
                    f"k={quote_plus(query)}"
                    f"&l=Paris"
                    f"&radius=30"
                )

                logger.info(f"[Talent.com] Navigating to: {search_url}")
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

                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await self.random_delay(0.5, 1.5)

                # Talent.com job cards
                cards = await page.query_selector_all(
                    ".card--job, "
                    "[class*='card'], "
                    "article[class*='job'], "
                    "[data-testid='job-card'], "
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
                        logger.debug(f"[Talent.com] Card parse error: {e}")

                    await self.random_delay(0.3, 0.8)

            except Exception as e:
                logger.error(f"[Talent.com] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_card(self, card) -> "Optional[dict]":
        """Parse a single Talent.com job card."""
        try:
            title_el = await card.query_selector(
                "h2 a, h3 a, [class*='title'] a, "
                "a[class*='link--job-title'], "
                "[data-testid='job-title']"
            )
            title = await title_el.inner_text() if title_el else None
            if not title:
                return None

            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            link = await title_el.get_attribute("href") if title_el else None
            source_url = f"{self.BASE_URL}{link}" if link and not link.startswith("http") else (link or "")

            company_el = await card.query_selector(
                "[class*='company'], [data-testid='company'], "
                "span[class*='Company']"
            )
            company = await company_el.inner_text() if company_el else "Entreprise"

            location_el = await card.query_selector(
                "[class*='location'], [data-testid='location'], "
                "span[class*='Location']"
            )
            location = await location_el.inner_text() if location_el else ""

            desc_el = await card.query_selector(
                "[class*='description'], p[class*='snippet']"
            )
            description = await desc_el.inner_text() if desc_el else ""

            date_el = await card.query_selector(
                "time, [class*='date'], span[class*='Date']"
            )
            date_text = await date_el.inner_text() if date_el else ""
            posted_at = self._parse_date(date_text)

            skills = self._extract_skills(f"{title} {description}")

            return {
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": description.strip()[:2000],
                "source_url": source_url,
                "posted_at": posted_at,
                "required_skills": skills,
            }

        except Exception as e:
            logger.debug(f"[Talent.com] Parse error: {e}")
            return None

    def _parse_date(self, text: str) -> str:
        text = text.lower().strip()
        today = datetime.now()
        if "aujourd'hui" in text or "à l'instant" in text:
            return today.strftime("%Y-%m-%d")
        elif "hier" in text:
            return (today - timedelta(days=1)).strftime("%Y-%m-%d")
        match = re.search(r"(\d+)\s*jour", text)
        if match:
            return (today - timedelta(days=int(match.group(1)))).strftime("%Y-%m-%d")
        return today.strftime("%Y-%m-%d")

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
