from typing import Optional
"""
JobFlow-AI — Balance Ton Alternance Scraper
Scrapes balancetonalternance.com — site spécialisé en alternance.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class BalanceTonAlternanceScraper(BaseScraper):
    """
    Scrapes Balance Ton Alternance — specialized French alternance job board.
    Uses Playwright for web scraping.
    """

    PLATFORM = "balancetonalternance"
    BASE_URL = "https://www.balancetonalternance.com"
    MIN_DELAY = 2.0
    MAX_DELAY = 5.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape Balance Ton Alternance for job offers."""
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

            # Block heavy resources
            await context.route("**/*.{png,jpg,jpeg,gif,svg,webp,ico}", lambda route: route.abort())

            page = await context.new_page()

            try:
                search_url = (
                    f"{self.BASE_URL}/offres?"
                    f"q={quote_plus(query)}"
                    f"&lieu=Paris"
                    f"&rayon=30"
                )

                logger.info(f"[BalanceTonAlternance] Navigating to: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Accept cookies if needed
                try:
                    cookie_btn = await page.query_selector(
                        "button:has-text('Accepter'), "
                        "[data-testid='cookie-accept'], "
                        "#cookie-accept"
                    )
                    if cookie_btn:
                        await cookie_btn.click()
                        await self.random_delay(1, 2)
                except Exception:
                    pass

                # Scroll to load results
                for _ in range(4):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await self.random_delay(0.5, 1.5)

                # Parse job cards — try multiple selectors
                cards = await page.query_selector_all(
                    "article, "
                    ".offer-card, "
                    "[class*='offerCard'], "
                    "[class*='job-card'], "
                    ".card, "
                    "[data-testid='offer-item']"
                )

                for card in cards[:max_results]:
                    try:
                        offer = await self._parse_card(card)
                        if offer:
                            offer["source_platform"] = self.PLATFORM
                            offer["offer_type"] = "alternance"  # This site is exclusively alternance
                            offer["location_score"] = self.score_location(offer.get("location", ""))
                            if offer["location_score"] >= -5:
                                results.append(offer)
                    except Exception as e:
                        logger.debug(f"[BTA] Card parse error: {e}")

                    await self.random_delay(0.3, 0.8)

            except Exception as e:
                logger.error(f"[BalanceTonAlternance] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_card(self, card) -> "Optional[dict]":
        """Parse a single job card."""
        try:
            # Title
            title_el = await card.query_selector(
                "h2 a, h3 a, h2, h3, "
                "[class*='title'] a, [class*='title']"
            )
            title = await title_el.inner_text() if title_el else None
            if not title:
                return None

            # Relevance filter
            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro", "développeur",
                        "dev", "admin"]
            title_lower = title.lower()
            if not any(kw in title_lower for kw in relevant):
                return None

            # Link
            link_el = await card.query_selector("a[href*='/offre'], a[href*='/job'], h2 a, h3 a")
            href = await link_el.get_attribute("href") if link_el else None
            source_url = f"{self.BASE_URL}{href}" if href and not href.startswith("http") else (href or "")

            # Company
            company_el = await card.query_selector(
                "[class*='company'], [class*='entreprise'], "
                "span[class*='comp'], p[class*='comp']"
            )
            company = await company_el.inner_text() if company_el else "Entreprise"

            # Location
            location_el = await card.query_selector(
                "[class*='location'], [class*='lieu'], "
                "[class*='city'], span[class*='loc']"
            )
            location = await location_el.inner_text() if location_el else ""

            # Description snippet
            desc_el = await card.query_selector(
                "[class*='description'], [class*='desc'], "
                "p[class*='excerpt']"
            )
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
            logger.debug(f"[BTA] Parse error: {e}")
            return None

    def _extract_skills(self, text: str) -> list[str]:
        """Extract IT skills from text."""
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
