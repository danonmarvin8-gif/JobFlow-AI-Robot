from typing import Optional
"""
JobFlow-AI — Google Jobs Scraper
Scrapes Google Jobs via Google Search (jobs tab).
Google Jobs is a massive aggregator pulling from many sources.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class GoogleJobsScraper(BaseScraper):
    """
    Scrapes Google Jobs (google.com/search?ibp=htl;jobs).
    Aggregates offers from nearly every major board.
    Uses Playwright to interact with Google's Jobs UI.
    """

    PLATFORM = "googlejobs"
    MIN_DELAY = 3.0
    MAX_DELAY = 8.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape Google Jobs for job offers."""
        from playwright.async_api import async_playwright

        results = []
        query = " ".join(keywords) + " alternance Paris"

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

            page = await context.new_page()

            try:
                # Google Jobs URL — ibp=htl;jobs triggers the Jobs tab
                search_url = (
                    f"https://www.google.com/search?"
                    f"q={quote_plus(query)}"
                    f"&ibp=htl;jobs"
                    f"&hl=fr"
                )

                logger.info(f"[GoogleJobs] Navigating to: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Accept cookies if Google shows consent
                try:
                    consent_btn = await page.query_selector(
                        "button:has-text('Tout accepter'), "
                        "button:has-text('Accept all'), "
                        "#L2AGLb"
                    )
                    if consent_btn:
                        await consent_btn.click()
                        await self.random_delay(2, 4)
                except Exception:
                    pass

                # Wait for jobs list to load
                await self.random_delay(2, 4)

                # Google Jobs renders job cards in a specific container
                # The job list items are li elements inside the jobs results
                cards = await page.query_selector_all(
                    "li.iFjolb, "            # Main job card selector
                    "[data-ved] li, "         # Fallback
                    ".PwjeAc, "              # Job card class
                    "[jscontroller] li"       # Generic JS-controlled list
                )

                for card in cards[:max_results]:
                    try:
                        # Click on card to load details
                        await card.click()
                        await self.random_delay(1, 2)

                        offer = await self._parse_job(page, card)
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
                        logger.debug(f"[GoogleJobs] Card parse error: {e}")

                    await self.random_delay(0.5, 1.0)

            except Exception as e:
                logger.error(f"[GoogleJobs] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_job(self, page, card) -> "Optional[dict]":
        """Parse a Google Jobs card + detail panel."""
        try:
            # Title from card
            title_el = await card.query_selector(
                ".BjJfJf, "    # Job title class in Google Jobs
                "div[role='heading'], "
                "h2, h3"
            )
            title = await title_el.inner_text() if title_el else None
            if not title:
                return None

            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro", "admin"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            # Company
            company_el = await card.query_selector(
                ".vNEEBe, "    # Company name class
                "div[class*='company'], "
                "span[class*='company']"
            )
            company = await company_el.inner_text() if company_el else "Entreprise"

            # Location
            location_el = await card.query_selector(
                ".Qk80Jf, "   # Location class
                "div[class*='location'], "
                "span[class*='location']"
            )
            location = await location_el.inner_text() if location_el else ""

            # Try to get description from the detail panel
            description = ""
            desc_el = await page.query_selector(
                ".HBvzbc, "   # Description container
                "[class*='description'], "
                ".YgLbBe"
            )
            if desc_el:
                description = await desc_el.inner_text()
                description = description[:2000]

            # Try to get the "Apply" link for source URL
            source_url = ""
            apply_el = await page.query_selector(
                "a.pMhGee, "   # Apply button
                "a[class*='apply'], "
                "a:has-text('Postuler'), "
                "a:has-text('Apply')"
            )
            if apply_el:
                source_url = await apply_el.get_attribute("href") or ""

            # Date
            date_el = await card.query_selector(
                ".SuWscb, "    # Date class
                "span[class*='date']"
            )
            date_text = await date_el.inner_text() if date_el else ""
            posted_at = self._parse_date(date_text)

            skills = self._extract_skills(f"{title} {description}")

            return {
                "title": title.strip(),
                "company": company.strip(),
                "location": location.strip(),
                "description": description.strip(),
                "source_url": source_url,
                "posted_at": posted_at,
                "required_skills": skills,
            }

        except Exception as e:
            logger.debug(f"[GoogleJobs] Parse error: {e}")
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
            "Windows", "Windows 10", "Windows 11", "Windows Server",
            "MacOS", "Linux", "Active Directory", "Office 365",
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
