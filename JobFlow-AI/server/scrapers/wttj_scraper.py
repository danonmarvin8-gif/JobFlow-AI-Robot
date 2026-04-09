from typing import Optional
"""
JobFlow-AI — Welcome to the Jungle Scraper
Uses WTTJ's semi-public API for job searching.
"""

import logging
import re
from datetime import datetime

import httpx

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class WTTJScraper(BaseScraper):
    PLATFORM = "wttj"
    API_BASE = "https://api.welcometothejungle.com/api/v1/jobs"
    WEBSITE_BASE = "https://www.welcometothejungle.com/fr/companies"
    MIN_DELAY = 2.0
    MAX_DELAY = 5.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """
        Scrape Welcome to the Jungle using their semi-public API.
        Faster and more reliable than Playwright for this site.
        """
        results = []
        query = " ".join(keywords)

        headers = {
            "User-Agent": self.get_random_user_agent(),
            "Accept": "application/json",
            "Accept-Language": "fr-FR,fr;q=0.9",
            "Referer": "https://www.welcometothejungle.com/",
            "Origin": "https://www.welcometothejungle.com",
        }

        params = {
            "query": query,
            "refinementList[office.city][]": "Paris",
            "refinementList[contract_type][]": ["internship", "apprenticeship", "other"],
            "page": 1,
            "aroundLatLng": "48.8566,2.3522",  # Paris coordinates
            "aroundRadius": 30000,  # 30km radius
            "hitsPerPage": min(max_results, 20),
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                # Try API first
                response = await client.get(
                    "https://api.welcometothejungle.com/api/v1/jobs",
                    params=params,
                    headers=headers,
                )

                if response.status_code == 200:
                    data = response.json()
                    jobs = data.get("jobs", data.get("hits", []))

                    for job in jobs[:max_results]:
                        offer = self._parse_api_job(job)
                        if offer:
                            offer["location_score"] = self.score_location(offer.get("location", ""))
                            if offer["location_score"] >= -5:
                                results.append(offer)

                    logger.info(f"[WTTJ] API returned {len(results)} offers")

                else:
                    logger.warning(f"[WTTJ] API returned {response.status_code}, falling back to web scraping")
                    results = await self._scrape_web(keywords, max_results)

            except Exception as e:
                logger.warning(f"[WTTJ] API error: {e}, falling back to web scraping")
                results = await self._scrape_web(keywords, max_results)

        return results

    def _parse_api_job(self, job: dict) -> Optional[dict]:
        """Parse a job from WTTJ API response."""
        try:
            title = job.get("name", job.get("title", ""))
            if not title:
                return None

            # Check relevance
            relevant = ["support", "helpdesk", "technicien", "it", "informatique", "assistant"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            company_name = ""
            if isinstance(job.get("organization"), dict):
                company_name = job["organization"].get("name", "")
            elif isinstance(job.get("company"), dict):
                company_name = job["company"].get("name", "")
            else:
                company_name = job.get("company_name", job.get("organization_name", ""))

            # Location
            location = ""
            if isinstance(job.get("office"), dict):
                location = job["office"].get("city", "")
                district = job["office"].get("district", "")
                if district:
                    location = f"{location} {district}"
            else:
                location = job.get("office_city", job.get("location", "Paris"))

            # Contract type mapping
            contract_map = {
                "apprenticeship": "alternance",
                "internship": "stage",
                "other": "job_etudiant",
                "full_time": "alternance",
                "part_time": "job_etudiant",
            }
            contract_type = job.get("contract_type", "")
            offer_type = contract_map.get(contract_type, "alternance")

            # URL
            slug = job.get("slug", job.get("reference", ""))
            org_slug = ""
            if isinstance(job.get("organization"), dict):
                org_slug = job["organization"].get("slug", "")
            source_url = f"https://www.welcometothejungle.com/fr/companies/{org_slug}/jobs/{slug}" if slug else ""

            if not source_url:
                source_url = job.get("url", job.get("website_url", f"https://www.welcometothejungle.com/jobs/{slug}"))

            # Description
            description = job.get("description", job.get("profile", ""))
            if isinstance(description, str):
                description = re.sub(r'<[^>]+>', ' ', description)  # Strip HTML
                description = re.sub(r'\s+', ' ', description).strip()[:2000]

            # Skills
            skills = []
            if isinstance(job.get("skills"), list):
                skills = [s.get("name", s) if isinstance(s, dict) else str(s) for s in job["skills"]]
            else:
                skills = self._extract_skills(f"{title} {description}")

            # Posted date
            posted_at = job.get("published_at", job.get("created_at", datetime.now().strftime("%Y-%m-%d")))
            if "T" in str(posted_at):
                posted_at = posted_at.split("T")[0]

            return {
                "title": title.strip(),
                "company": company_name.strip() or "Entreprise",
                "location": location.strip() or "Paris",
                "description": description,
                "source_url": source_url,
                "posted_at": posted_at,
                "offer_type": offer_type,
                "required_skills": skills[:10],
                "source_platform": self.PLATFORM,
            }

        except Exception as e:
            logger.debug(f"[WTTJ] API parse error: {e}")
            return None

    async def _scrape_web(self, keywords: list[str], max_results: int) -> list[dict]:
        """Fallback: scrape WTTJ website with Playwright."""
        from playwright.async_api import async_playwright

        results = []
        query = "+".join(keywords)

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=self.get_random_user_agent(),
                viewport={"width": 1920, "height": 1080},
                locale="fr-FR",
            )

            page = await context.new_page()

            try:
                url = (
                    f"https://www.welcometothejungle.com/fr/jobs?"
                    f"query={query}"
                    f"&refinementList%5Bcontract_type%5D%5B%5D=apprenticeship"
                    f"&refinementList%5Bcontract_type%5D%5B%5D=internship"
                    f"&aroundQuery=Paris"
                )

                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Scroll to load results
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 600)")
                    await self.random_delay(0.8, 1.5)

                # Parse job cards
                cards = await page.query_selector_all("[data-testid='search-results-list-item-wrapper'], article")

                for card in cards[:max_results]:
                    try:
                        title_el = await card.query_selector("h4, h3, [role='heading']")
                        title = await title_el.inner_text() if title_el else None
                        if not title:
                            continue

                        company_el = await card.query_selector("span, [data-testid='company-name']")
                        company = await company_el.inner_text() if company_el else "Entreprise"

                        link_el = await card.query_selector("a[href*='/jobs/']")
                        href = await link_el.get_attribute("href") if link_el else None
                        source_url = f"https://www.welcometothejungle.com{href}" if href else ""

                        location_el = await card.query_selector("[data-testid='job-location'], .sc-dQelHR")
                        location = await location_el.inner_text() if location_el else "Paris"

                        results.append({
                            "title": title.strip(),
                            "company": company.strip(),
                            "location": location.strip(),
                            "description": "",
                            "source_url": source_url,
                            "posted_at": datetime.now().strftime("%Y-%m-%d"),
                            "offer_type": self.classify_offer_type(title),
                            "required_skills": self._extract_skills(title),
                            "source_platform": self.PLATFORM,
                        })

                    except Exception as e:
                        logger.debug(f"[WTTJ] Web card parse error: {e}")

            except Exception as e:
                logger.error(f"[WTTJ] Web scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

    def _extract_skills(self, text: str) -> list[str]:
        """Extract IT skills from text."""
        known_skills = [
            "Windows", "MacOS", "Linux", "Active Directory",
            "Office 365", "DHCP", "DNS", "TCP/IP", "VPN",
            "ITIL", "GLPI", "ServiceNow", "JIRA", "SCCM",
            "Intune", "Azure", "Helpdesk", "VMware",
            "Python", "PowerShell", "Réseau", "Firewall",
        ]

        found = []
        text_lower = text.lower()
        for skill in known_skills:
            if skill.lower() in text_lower and skill not in found:
                found.append(skill)

        return found[:10]
