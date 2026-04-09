from typing import Optional
"""
JobFlow-AI — LesJeudis Scraper
Scrapes lesjeudis.com — specialized French IT job board.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class LesJeudisScraper(BaseScraper):
    """
    Scrapes LesJeudis (lesjeudis.com) — specialized French IT & tech job board.
    Uses Playwright for web scraping.
    Note: LesJeudis merged with HelloWork but maintains its own interface.
    """

    PLATFORM = "lesjeudis"
    BASE_URL = "https://www.lesjeudis.com"
    MIN_DELAY = 2.5
    MAX_DELAY = 6.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape LesJeudis for IT job offers."""
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
            await context.route("**/*google*analytics*", lambda route: route.abort())

            page = await context.new_page()

            try:
                search_url = (
                    f"{self.BASE_URL}/fr-fr/emploi-informatique/recherche.html?"
                    f"k={quote_plus(query)}"
                    f"&l=Paris"
                    f"&d=30"
                )

                logger.info(f"[LesJeudis] Navigating to: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Accept cookies
                try:
                    cookie_btn = await page.query_selector(
                        "#didomi-notice-agree-button, "
                        "button:has-text('Accepter'), "
                        "[data-testid='cookie-accept']"
                    )
                    if cookie_btn:
                        await cookie_btn.click()
                        await self.random_delay(1, 2)
                except Exception:
                    pass

                # Scroll to load results
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await self.random_delay(0.5, 1.5)

                # Parse job cards — LesJeudis shares some structure with HelloWork
                cards = await page.query_selector_all(
                    "[data-testid='offer-card'], "
                    "article[class*='offer'], "
                    ".offer-card, "
                    "[class*='JobCard'], "
                    ".search-result, "
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
                        logger.debug(f"[LesJeudis] Card parse error: {e}")

                    await self.random_delay(0.3, 0.8)

            except Exception as e:
                logger.error(f"[LesJeudis] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_card(self, card) -> "Optional[dict]":
        """Parse a single LesJeudis job card."""
        try:
            # Title
            title_el = await card.query_selector(
                "h3 a, h2 a, [data-testid='offer-title'], "
                "[class*='title'] a, a[class*='Title']"
            )
            title = await title_el.inner_text() if title_el else None
            if not title:
                return None

            # On LesJeudis, most jobs are IT so relevance is broader
            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro", "admin",
                        "devops", "sysadmin", "infrastructure"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            # Link
            link = await title_el.get_attribute("href") if title_el else None
            source_url = f"{self.BASE_URL}{link}" if link and not link.startswith("http") else (link or "")

            # Company
            company_el = await card.query_selector(
                "[data-testid='company-name'], "
                "[class*='company'], span[class*='Company'], "
                "p[class*='company']"
            )
            company = await company_el.inner_text() if company_el else "Entreprise"

            # Location
            location_el = await card.query_selector(
                "[data-testid='offer-location'], "
                "[class*='location'], span[class*='Location'], "
                "p[class*='location']"
            )
            location = await location_el.inner_text() if location_el else ""

            # Description
            desc_el = await card.query_selector(
                "[class*='description'], p[class*='desc'], "
                "p[class*='excerpt']"
            )
            description = await desc_el.inner_text() if desc_el else ""

            # Date
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
            logger.debug(f"[LesJeudis] Parse error: {e}")
            return None

    def _parse_date(self, text: str) -> str:
        """Parse relative dates."""
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
        """Extract IT skills from text."""
        known_skills = [
            "Windows", "Windows 10", "Windows 11", "Windows Server",
            "MacOS", "Linux", "Ubuntu", "Debian",
            "Active Directory", "Office 365", "Microsoft 365",
            "DHCP", "DNS", "TCP/IP", "VPN", "VLAN",
            "ITIL", "GLPI", "ServiceNow", "JIRA",
            "SCCM", "Intune", "Azure AD", "Azure",
            "Helpdesk", "Ticketing", "N1", "N2", "N3",
            "Cisco", "HP", "Dell",
            "VMware", "Hyper-V", "Docker", "Kubernetes",
            "Python", "PowerShell", "Bash", "Ansible",
            "Réseau", "Routage", "Firewall", "Fortinet",
            "AWS", "GCP", "DevOps",
        ]

        found = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill.lower() in text_lower and skill not in found:
                found.append(skill)

        return found[:10]
