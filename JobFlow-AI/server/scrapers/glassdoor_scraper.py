from typing import Optional
"""
JobFlow-AI — Glassdoor Scraper
Scrapes glassdoor.fr for IT support jobs.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class GlassdoorScraper(BaseScraper):
    """
    Scrapes Glassdoor France (glassdoor.fr).
    Uses Playwright for web scraping.
    """

    PLATFORM = "glassdoor"
    BASE_URL = "https://www.glassdoor.fr"
    MIN_DELAY = 3.0
    MAX_DELAY = 8.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape Glassdoor for job offers."""
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
                    f"{self.BASE_URL}/Emploi/paris-emploi-SRCH_IL.0,5_IC2881970_"
                    f"KO6,{6 + len(query)}.htm?"
                    f"keyword={quote_plus(query)}"
                )

                logger.info(f"[Glassdoor] Navigating to: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Accept cookies
                try:
                    cookie_btn = await page.query_selector(
                        "#onetrust-accept-btn-handler, "
                        "button:has-text('Accepter'), "
                        "[data-testid='cookie-accept']"
                    )
                    if cookie_btn:
                        await cookie_btn.click()
                        await self.random_delay(1, 2)
                except Exception:
                    pass

                # Close signup modal if shown
                try:
                    close_btn = await page.query_selector(
                        "[data-testid='modal-close'], "
                        "button[class*='close'], "
                        ".modal_closeIcon"
                    )
                    if close_btn:
                        await close_btn.click()
                        await self.random_delay(1, 2)
                except Exception:
                    pass

                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await self.random_delay(0.5, 1.5)

                cards = await page.query_selector_all(
                    "li.react-job-listing, "
                    "[data-test='jobListing'], "
                    "[class*='JobCard'], "
                    "article[class*='job'], "
                    "li[class*='JobsList']"
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
                        logger.debug(f"[Glassdoor] Card parse error: {e}")

                    await self.random_delay(0.3, 0.8)

            except Exception as e:
                logger.error(f"[Glassdoor] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_card(self, card) -> "Optional[dict]":
        """Parse a single Glassdoor job card."""
        try:
            title_el = await card.query_selector(
                "a[data-test='job-title'], "
                "[class*='jobTitle'] a, "
                "a[class*='JobCard_jobTitle'], "
                "h2 a, h3 a"
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
                "[data-test='emp-name'], "
                "[class*='EmployerProfile'], "
                "span[class*='company']"
            )
            company = await company_el.inner_text() if company_el else "Entreprise"

            location_el = await card.query_selector(
                "[data-test='emp-location'], "
                "[class*='location'], "
                "span[class*='Location']"
            )
            location = await location_el.inner_text() if location_el else ""

            date_el = await card.query_selector(
                "[data-test='job-age'], "
                "[class*='listingAge'], "
                "span[class*='date']"
            )
            date_text = await date_el.inner_text() if date_el else ""
            posted_at = self._parse_date(date_text)

            skills = self._extract_skills(title)

            return {
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": "",
                "source_url": source_url,
                "posted_at": posted_at,
                "required_skills": skills,
            }

        except Exception as e:
            logger.debug(f"[Glassdoor] Parse error: {e}")
            return None

    def _parse_date(self, text: str) -> str:
        text = text.lower().strip()
        today = datetime.now()
        if "aujourd'hui" in text or "à l'instant" in text or "24h" in text:
            return today.strftime("%Y-%m-%d")
        match = re.search(r"(\d+)\s*j", text)
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
