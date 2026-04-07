"""
JobFlow-AI — Indeed Scraper
Scrapes Indeed France for IT support jobs using Playwright.
"""

import asyncio
import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class IndeedScraper(BaseScraper):
    PLATFORM = "indeed"
    BASE_URL = "https://fr.indeed.com"
    MIN_DELAY = 3.0
    MAX_DELAY = 8.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape Indeed France for job offers."""
        from playwright.async_api import async_playwright

        results = []
        query = " ".join(keywords)
        location = "Paris (75)"

        async with async_playwright() as p:
            browser_args = {
                "headless": True,
                "args": [
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                ]
            }

            proxy = self.get_proxy()
            if proxy:
                browser_args["proxy"] = proxy

            browser = await p.chromium.launch(**browser_args)

            context = await browser.new_context(
                user_agent=self.get_random_user_agent(),
                viewport={"width": 1920, "height": 1080},
                locale="fr-FR",
                timezone_id="Europe/Paris",
            )

            # Block unnecessary resources for speed
            await context.route("**/*.{png,jpg,jpeg,gif,svg,webp,ico}", lambda route: route.abort())
            await context.route("**/*google*analytics*", lambda route: route.abort())
            await context.route("**/*facebook*", lambda route: route.abort())

            page = await context.new_page()

            try:
                search_url = (
                    f"{self.BASE_URL}/jobs?"
                    f"q={quote_plus(query)}"
                    f"&l={quote_plus(location)}"
                    f"&sort=date"
                    f"&fromage=7"  # Last 7 days
                )

                logger.info(f"[Indeed] Navigating to: {search_url}")
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(2, 5)

                # Scroll down to load more results
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 800)")
                    await self.random_delay(0.5, 1.5)

                # Extract job cards
                job_cards = await page.query_selector_all(".job_seen_beacon, .jobsearch-ResultsList > li")

                for card in job_cards[:max_results]:
                    try:
                        offer = await self._parse_indeed_card(card, page)
                        if offer:
                            offer["source_platform"] = self.PLATFORM
                            offer["offer_type"] = self.classify_offer_type(
                                offer.get("title", ""),
                                offer.get("description", "")
                            )
                            offer["location_score"] = self.score_location(offer.get("location", ""))
                            results.append(offer)
                    except Exception as e:
                        logger.debug(f"[Indeed] Failed to parse card: {e}")

                    if self.pages_scraped >= self.MAX_PAGES_PER_SESSION:
                        break

                    await self.random_delay(0.3, 1.0)

            except Exception as e:
                logger.error(f"[Indeed] Scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_indeed_card(self, card, page) -> dict | None:
        """Parse a single Indeed job card."""
        try:
            # Title
            title_el = await card.query_selector("h2.jobTitle a, h2.jobTitle span")
            title = await title_el.inner_text() if title_el else None
            if not title:
                return None

            # Check relevance
            title_lower = title.lower()
            relevant_keywords = ["support", "helpdesk", "technicien", "it", "informatique", "assistant"]
            if not any(kw in title_lower for kw in relevant_keywords):
                return None

            # Link
            link_el = await card.query_selector("h2.jobTitle a")
            href = await link_el.get_attribute("href") if link_el else None
            source_url = f"{self.BASE_URL}{href}" if href and not href.startswith("http") else href
            if not source_url:
                return None

            # Company
            company_el = await card.query_selector("[data-testid='company-name'], .companyName")
            company = await company_el.inner_text() if company_el else "Entreprise inconnue"

            # Location
            location_el = await card.query_selector("[data-testid='text-location'], .companyLocation")
            location = await location_el.inner_text() if location_el else ""

            # Skip avoided locations
            if self.score_location(location) < -5:
                logger.debug(f"[Indeed] Skipping offer in avoided location: {location}")
                return None

            # Date
            date_el = await card.query_selector(".date, [data-testid='myJobsStateDate']")
            date_text = await date_el.inner_text() if date_el else ""
            posted_at = self._parse_date(date_text)

            # Snippet / description preview
            snippet_el = await card.query_selector(".job-snippet, [data-testid='job-snippet']")
            description = await snippet_el.inner_text() if snippet_el else ""

            # Extract skills from description
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
            logger.debug(f"[Indeed] Card parse error: {e}")
            return None

    def _parse_date(self, text: str) -> str:
        """Convert Indeed relative dates to ISO format."""
        text = text.lower().strip()
        today = datetime.now()

        if "aujourd'hui" in text or "à l'instant" in text:
            return today.strftime("%Y-%m-%d")
        elif "hier" in text:
            return (today - timedelta(days=1)).strftime("%Y-%m-%d")

        # Match "il y a X jours"
        match = re.search(r"(\d+)\s*jour", text)
        if match:
            days = int(match.group(1))
            return (today - timedelta(days=days)).strftime("%Y-%m-%d")

        return today.strftime("%Y-%m-%d")

    def _extract_skills(self, text: str) -> list[str]:
        """Extract IT skills from text."""
        known_skills = [
            "Windows", "Windows 10", "Windows 11", "Windows Server",
            "MacOS", "Linux", "Ubuntu",
            "Active Directory", "Office 365", "O365", "Microsoft 365",
            "DHCP", "DNS", "TCP/IP", "VPN", "VLAN",
            "ITIL", "GLPI", "ServiceNow", "JIRA",
            "SCCM", "Intune", "Azure AD",
            "Helpdesk", "Ticketing", "N1", "N2",
            "Cisco", "HP", "Dell",
            "VMware", "Hyper-V",
            "Python", "PowerShell", "Bash",
            "Réseau", "Routage", "Firewall",
        ]

        found = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill.lower() in text_lower and skill not in found:
                found.append(skill)

        return found[:10]  # Limit to 10 skills
