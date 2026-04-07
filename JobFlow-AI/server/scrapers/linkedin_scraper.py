"""
JobFlow-AI — LinkedIn Scraper (via Google Dorking)
Avoids direct LinkedIn scraping by using Google search.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class LinkedInScraper(BaseScraper):
    PLATFORM = "linkedin"
    MIN_DELAY = 4.0
    MAX_DELAY = 10.0

    async def scrape(self, keywords: list[str], max_results: int = 30) -> list[dict]:
        """
        Scrape LinkedIn job listings via Google dorking.
        This avoids direct LinkedIn scraping which is heavily protected.
        Uses: site:linkedin.com/jobs "keyword" "Paris"
        """
        from playwright.async_api import async_playwright

        results = []
        query = " ".join(keywords)

        # Google dork query for LinkedIn jobs
        google_query = (
            f'site:linkedin.com/jobs/view '
            f'"{query}" '
            f'"Paris" OR "Île-de-France" '
            f'("alternance" OR "étudiant" OR "stage")'
        )

        async with async_playwright() as p:
            browser_args = {"headless": True}
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

            page = await context.new_page()

            try:
                # Search Google for LinkedIn job postings
                search_url = f"https://www.google.com/search?q={quote_plus(google_query)}&num=20"
                logger.info(f"[LinkedIn/Google] Searching: {search_url}")

                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Extract Google search results
                search_results = await page.query_selector_all("#search .g, .tF2Cxc")

                for result in search_results[:max_results]:
                    try:
                        offer = await self._parse_google_result(result)
                        if offer:
                            offer["source_platform"] = self.PLATFORM
                            offer["offer_type"] = self.classify_offer_type(
                                offer.get("title", ""),
                                offer.get("description", "")
                            )
                            offer["location_score"] = self.score_location(offer.get("location", ""))

                            # Skip low-score locations
                            if offer["location_score"] < -5:
                                continue

                            results.append(offer)
                    except Exception as e:
                        logger.debug(f"[LinkedIn/Google] Parse error: {e}")

                    await self.random_delay(0.3, 0.8)

                # Try to get more details by visiting LinkedIn public pages
                for i, offer in enumerate(results[:5]):  # Limit to 5 to avoid detection
                    try:
                        enriched = await self._enrich_from_linkedin(page, offer)
                        if enriched:
                            results[i] = enriched
                    except Exception as e:
                        logger.debug(f"[LinkedIn] Enrichment failed: {e}")

                    await self.random_delay(5, 12)

            except Exception as e:
                logger.error(f"[LinkedIn/Google] Error: {e}")
                raise
            finally:
                await browser.close()

        return results

    async def _parse_google_result(self, result) -> dict | None:
        """Parse a Google search result pointing to LinkedIn jobs."""
        try:
            # Get link
            link_el = await result.query_selector("a[href*='linkedin.com/jobs']")
            if not link_el:
                return None

            href = await link_el.get_attribute("href")
            if not href or "linkedin.com/jobs" not in href:
                return None

            # Clean URL
            source_url = href.split("&")[0] if "&" in href else href

            # Get title from Google result
            title_el = await result.query_selector("h3")
            title = await title_el.inner_text() if title_el else ""

            # Clean up LinkedIn title format (usually "Title - Company | LinkedIn")
            title = re.sub(r'\s*[\|\-–]\s*LinkedIn.*$', '', title)
            parts = title.split(" - ")

            job_title = parts[0].strip() if parts else title
            company = parts[1].strip() if len(parts) > 1 else "Entreprise"

            # Get snippet
            snippet_el = await result.query_selector(".VwiC3b, .st")
            snippet = await snippet_el.inner_text() if snippet_el else ""

            # Extract location from snippet
            location = self._extract_location(snippet)
            skills = self._extract_skills(f"{job_title} {snippet}")

            return {
                "title": job_title,
                "company": company,
                "location": location,
                "description": snippet,
                "source_url": source_url,
                "posted_at": datetime.now().strftime("%Y-%m-%d"),
                "required_skills": skills,
            }

        except Exception as e:
            logger.debug(f"[LinkedIn/Google] Result parse error: {e}")
            return None

    async def _enrich_from_linkedin(self, page, offer: dict) -> dict | None:
        """Visit public LinkedIn job page to get more details."""
        try:
            await page.goto(offer["source_url"], wait_until="domcontentloaded", timeout=20000)
            await self.random_delay(3, 6)

            # Try to get description
            desc_el = await page.query_selector(
                ".description__text, .show-more-less-html__markup, "
                "[data-testid='job-details']"
            )
            if desc_el:
                description = await desc_el.inner_text()
                offer["description"] = description[:2000]
                offer["required_skills"] = self._extract_skills(description)

            # Try to get company name
            company_el = await page.query_selector(
                ".topcard__org-name-link, .top-card-layout__company-url, "
                "a[data-tracking-control-name='public_jobs_topcard-org-name']"
            )
            if company_el:
                company = await company_el.inner_text()
                offer["company"] = company.strip()

            # Try to get location
            location_el = await page.query_selector(
                ".topcard__flavor--bullet, .top-card-layout__bullet"
            )
            if location_el:
                location = await location_el.inner_text()
                offer["location"] = location.strip()

            return offer

        except Exception:
            return None

    def _extract_location(self, text: str) -> str:
        """Try to extract a location from text."""
        paris_patterns = [
            r"Paris\s*\d{1,2}[eè]?",
            r"Paris",
            r"Île-de-France",
            r"La Défense",
            r"Neuilly-sur-Seine",
            r"Boulogne-Billancourt",
            r"Levallois-Perret",
            r"Issy-les-Moulineaux",
        ]

        for pattern in paris_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)

        return "Paris"  # Default

    def _extract_skills(self, text: str) -> list[str]:
        """Extract IT skills from text."""
        known_skills = [
            "Windows", "Windows 10", "Windows 11", "Windows Server",
            "MacOS", "Linux", "Ubuntu",
            "Active Directory", "Office 365", "O365",
            "DHCP", "DNS", "TCP/IP", "VPN", "VLAN",
            "ITIL", "GLPI", "ServiceNow", "JIRA",
            "SCCM", "Intune", "Azure AD", "Azure",
            "Helpdesk", "N1", "N2",
            "VMware", "Hyper-V",
            "Python", "PowerShell", "Bash",
            "Réseau", "Firewall",
        ]

        found = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill.lower() in text_lower and skill not in found:
                found.append(skill)

        return found[:10]
