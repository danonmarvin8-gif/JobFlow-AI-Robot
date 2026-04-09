from typing import Optional
"""
JobFlow-AI — 1jeune1solution Scraper
Scrapes 1jeune1solution.gouv.fr — government platform for youth employment.
"""

import logging
import re
from datetime import datetime
from urllib.parse import quote_plus

import httpx

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class UnJeuneUneSolutionScraper(BaseScraper):
    """
    Scrapes 1jeune1solution (1jeune1solution.gouv.fr).
    Government-backed platform for alternance, stage, emploi jeune.
    Uses their API (built on top of France Travail / La Bonne Alternance).
    """

    PLATFORM = "1jeune1solution"
    API_BASE = "https://labonnealternance.apprentissage.beta.gouv.fr/api"
    WEB_BASE = "https://www.1jeune1solution.gouv.fr"
    MIN_DELAY = 2.0
    MAX_DELAY = 5.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape 1jeune1solution for alternance/stage offers."""
        results = []

        # Try La Bonne Alternance API first (powers 1jeune1solution)
        try:
            results = await self._scrape_api(keywords, max_results)
        except Exception as e:
            logger.warning(f"[1J1S] API failed: {e}, trying web fallback")

        if not results:
            results = await self._scrape_web(keywords, max_results)

        return results

    async def _scrape_api(self, keywords: list[str], max_results: int) -> list[dict]:
        """Scrape via La Bonne Alternance API."""
        results = []
        query = " ".join(keywords)

        headers = {
            "User-Agent": self.get_random_user_agent(),
            "Accept": "application/json",
        }

        # La Bonne Alternance API
        params = {
            "romes": "",  # Will use keyword search instead
            "latitude": 48.8566,
            "longitude": 2.3522,
            "radius": 30,
            "caller": "jobflow-ai",
        }

        async with httpx.AsyncClient(timeout=30) as client:
            # Try the jobs endpoint
            try:
                response = await client.get(
                    f"{self.API_BASE}/v1/jobs",
                    params={**params, "title": query},
                    headers=headers,
                )

                if response.status_code == 200:
                    data = response.json()
                    jobs = data.get("lbaCompanies", []) + data.get("peJobs", []) + data.get("matchas", [])

                    for job in jobs[:max_results]:
                        offer = self._parse_api_job(job)
                        if offer:
                            offer["location_score"] = self.score_location(offer.get("location", ""))
                            if offer["location_score"] >= -5:
                                results.append(offer)

                    logger.info(f"[1J1S] API returned {len(results)} offers")

            except Exception as e:
                logger.debug(f"[1J1S] Jobs API error: {e}")

            # Also try the alternance-specific endpoint
            if not results:
                try:
                    response = await client.get(
                        f"{self.API_BASE}/v1/jobs/search",
                        params={
                            "romes": "M1801,M1810,I1401",  # IT support ROME codes
                            "latitude": 48.8566,
                            "longitude": 2.3522,
                            "radius": 30,
                        },
                        headers=headers,
                    )

                    if response.status_code == 200:
                        data = response.json()
                        for key in ["peJobs", "matchas", "lbaCompanies", "lbbCompanies"]:
                            for job in data.get(key, []):
                                offer = self._parse_api_job(job)
                                if offer:
                                    offer["location_score"] = self.score_location(offer.get("location", ""))
                                    if offer["location_score"] >= -5:
                                        results.append(offer)

                except Exception as e:
                    logger.debug(f"[1J1S] Alt API error: {e}")
                    raise

        return results

    def _parse_api_job(self, job: dict) -> "Optional[dict]":
        """Parse a job from the API response."""
        try:
            # Handle nested structure
            if isinstance(job, dict) and "company" in job:
                company_data = job.get("company", {})
                title = job.get("title", job.get("intitule", ""))
                company = company_data.get("name", company_data.get("enseigne", "Entreprise"))
                location = job.get("place", {}).get("city", company_data.get("place", {}).get("city", ""))
                description = job.get("description", "")
                source_url = job.get("url", job.get("link", ""))
            else:
                title = job.get("title", job.get("intitule", job.get("name", "")))
                company = job.get("company", job.get("entreprise", {}).get("nom", "Entreprise"))
                if isinstance(company, dict):
                    company = company.get("name", "Entreprise")
                location = job.get("location", job.get("lieuTravail", {}).get("libelle", ""))
                if isinstance(location, dict):
                    location = location.get("city", location.get("libelle", ""))
                description = job.get("description", "")
                source_url = job.get("url", job.get("link", ""))

            if not title:
                return None

            # Relevance filter
            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            if isinstance(description, str):
                description = re.sub(r'<[^>]+>', ' ', description)[:2000]

            posted_at = job.get("createdAt", job.get("dateCreation", ""))
            if posted_at and "T" in str(posted_at):
                posted_at = str(posted_at).split("T")[0]

            skills = self._extract_skills(f"{title} {description}")

            return {
                "title": title.strip(),
                "company": company.strip() if isinstance(company, str) else "Entreprise",
                "location": location.strip() if isinstance(location, str) else "Paris",
                "description": description.strip() if isinstance(description, str) else "",
                "source_url": source_url or f"{self.WEB_BASE}/emploi",
                "posted_at": posted_at or datetime.now().strftime("%Y-%m-%d"),
                "offer_type": "alternance",
                "required_skills": skills,
                "source_platform": self.PLATFORM,
            }

        except Exception as e:
            logger.debug(f"[1J1S] Parse error: {e}")
            return None

    async def _scrape_web(self, keywords: list[str], max_results: int) -> list[dict]:
        """Fallback: scrape 1jeune1solution website."""
        from playwright.async_api import async_playwright

        results = []
        query = "+".join(keywords)

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
                url = (
                    f"{self.WEB_BASE}/emplois?"
                    f"motsCles={query}"
                    f"&lieuDeTravail=Paris"
                    f"&typeDeContrats=Alternance,Stage"
                )

                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Accept cookies
                try:
                    cookie_btn = await page.query_selector(
                        "button:has-text('Accepter'), "
                        "#tarteaucitronPersonalize2, "
                        "[data-testid='cookie-accept']"
                    )
                    if cookie_btn:
                        await cookie_btn.click()
                        await self.random_delay(1, 2)
                except Exception:
                    pass

                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 600)")
                    await self.random_delay(0.5, 1.0)

                cards = await page.query_selector_all(
                    "[class*='card'], article, "
                    "[data-testid='offer-card'], "
                    "li[class*='result']"
                )

                for card in cards[:max_results]:
                    try:
                        title_el = await card.query_selector("h2 a, h3 a, [class*='title'] a")
                        title = await title_el.inner_text() if title_el else None
                        if not title:
                            continue

                        link = await title_el.get_attribute("href") if title_el else None
                        source_url = link if link and link.startswith("http") else f"{self.WEB_BASE}{link}" if link else ""

                        company_el = await card.query_selector("[class*='company'], [class*='entreprise']")
                        company = await company_el.inner_text() if company_el else "Entreprise"

                        location_el = await card.query_selector("[class*='location'], [class*='lieu']")
                        location = await location_el.inner_text() if location_el else ""

                        results.append({
                            "title": title.strip(),
                            "company": company.strip(),
                            "location": location.strip(),
                            "description": "",
                            "source_url": source_url,
                            "posted_at": datetime.now().strftime("%Y-%m-%d"),
                            "offer_type": "alternance",
                            "required_skills": self._extract_skills(title),
                            "source_platform": self.PLATFORM,
                        })

                    except Exception as e:
                        logger.debug(f"[1J1S] Web card parse error: {e}")

            except Exception as e:
                logger.error(f"[1J1S] Web scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

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
