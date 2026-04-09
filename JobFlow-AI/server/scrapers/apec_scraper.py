from typing import Optional
"""
JobFlow-AI — APEC Scraper
Scrapes apec.fr — major French job board for cadres & IT.
"""

import logging
import re
from datetime import datetime, timedelta
from urllib.parse import quote_plus

import httpx

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class APECScraper(BaseScraper):
    """
    Scrapes APEC (apec.fr) — French Association for Executive Employment.
    Uses their public search API + web fallback.
    """

    PLATFORM = "apec"
    API_BASE = "https://api.apec.fr/offres/v2/search"
    WEB_BASE = "https://www.apec.fr"
    MIN_DELAY = 2.0
    MAX_DELAY = 5.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape APEC for job offers."""
        results = []

        # Try API first
        try:
            results = await self._scrape_api(keywords, max_results)
        except Exception as e:
            logger.warning(f"[APEC] API failed: {e}, trying web fallback")

        if not results:
            results = await self._scrape_web(keywords, max_results)

        return results

    async def _scrape_api(self, keywords: list[str], max_results: int) -> list[dict]:
        """Scrape via APEC's search API."""
        results = []
        query = " ".join(keywords)

        headers = {
            "User-Agent": self.get_random_user_agent(),
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Referer": "https://www.apec.fr/",
            "Origin": "https://www.apec.fr",
        }

        payload = {
            "sorts": [{"type": "DATE", "direction": "DESCENDING"}],
            "pagination": {"startIndex": 0, "range": min(max_results, 50)},
            "activeFilters": [],
            "keywords": query,
            "location": {"place": "Paris", "radius": 30},
            "contractType": ["Alternance", "Stage"],
        }

        async with httpx.AsyncClient(timeout=30) as client:
            try:
                response = await client.post(
                    self.API_BASE,
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 200:
                    data = response.json()
                    offers = data.get("results", data.get("offres", []))

                    for raw in offers[:max_results]:
                        offer = self._parse_api_offer(raw)
                        if offer:
                            offer["location_score"] = self.score_location(offer.get("location", ""))
                            if offer["location_score"] >= -5:
                                results.append(offer)

                    logger.info(f"[APEC] API returned {len(results)} offers")
                else:
                    raise Exception(f"API returned {response.status_code}")

            except Exception as e:
                raise

        return results

    def _parse_api_offer(self, raw: dict) -> "Optional[dict]":
        """Parse an APEC API offer."""
        try:
            title = raw.get("title", raw.get("intitule", ""))
            if not title:
                return None

            # Relevance filter
            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            company = raw.get("companyName", raw.get("entreprise", {}).get("nom", "Entreprise"))
            location = raw.get("location", raw.get("lieuTravail", ""))
            if isinstance(location, dict):
                location = location.get("libelle", location.get("ville", "Paris"))

            description = raw.get("description", raw.get("texteHtml", ""))
            if description:
                description = re.sub(r'<[^>]+>', ' ', description)[:2000]

            posted_at = raw.get("publicationDate", raw.get("datePublication", ""))
            if posted_at and "T" in str(posted_at):
                posted_at = str(posted_at).split("T")[0]

            offer_id = raw.get("id", raw.get("reference", ""))
            source_url = f"https://www.apec.fr/tous-les-emplois/{offer_id}" if offer_id else ""

            skills = self._extract_skills(f"{title} {description}")

            return {
                "title": title.strip(),
                "company": company.strip() if company else "Entreprise",
                "location": location.strip() if isinstance(location, str) else "Paris",
                "description": description.strip() if description else "",
                "source_url": source_url,
                "posted_at": posted_at or datetime.now().strftime("%Y-%m-%d"),
                "offer_type": self.classify_offer_type(title, description or ""),
                "required_skills": skills,
                "source_platform": self.PLATFORM,
            }

        except Exception as e:
            logger.debug(f"[APEC] API parse error: {e}")
            return None

    async def _scrape_web(self, keywords: list[str], max_results: int) -> list[dict]:
        """Fallback: scrape APEC website with Playwright."""
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
                    f"{self.WEB_BASE}/tous-les-emplois?"
                    f"motsCles={query}"
                    f"&lieu=Paris"
                    f"&typeContrat=Alternance,Stage"
                )

                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
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

                # Scroll
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 600)")
                    await self.random_delay(0.5, 1.0)

                # Parse cards
                cards = await page.query_selector_all(
                    "[class*='card-offer'], "
                    "article[class*='offer'], "
                    "[data-testid='offer-card'], "
                    ".search-result-item"
                )

                for card in cards[:max_results]:
                    try:
                        title_el = await card.query_selector("h2 a, h3 a, [class*='title'] a")
                        title = await title_el.inner_text() if title_el else None
                        if not title:
                            continue

                        link = await title_el.get_attribute("href") if title_el else None
                        source_url = f"{self.WEB_BASE}{link}" if link and not link.startswith("http") else (link or "")

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
                            "offer_type": self.classify_offer_type(title),
                            "required_skills": self._extract_skills(title),
                            "source_platform": self.PLATFORM,
                        })

                    except Exception as e:
                        logger.debug(f"[APEC] Web card parse error: {e}")

            except Exception as e:
                logger.error(f"[APEC] Web scraping error: {e}")
                raise
            finally:
                await browser.close()

        return results

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
