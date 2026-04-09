from typing import Optional
"""
JobFlow-AI — France Travail Scraper (ex-Pôle Emploi)
Uses the public France Travail API + web fallback.
"""

import logging
import re
from datetime import datetime, timedelta

import httpx

from scrapers.base_scraper import BaseScraper

logger = logging.getLogger(__name__)


class FranceTravailScraper(BaseScraper):
    """
    Scrapes France Travail (Pôle Emploi) using their public API.
    API: https://francetravail.io/data/api/offres-emploi
    No API key required for basic search.
    """

    PLATFORM = "francetravail"
    API_BASE = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search"
    WEB_BASE = "https://candidat.francetravail.fr/offres/recherche"
    MIN_DELAY = 2.0
    MAX_DELAY = 5.0

    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape France Travail for job offers."""
        results = []

        # Try API first, then web fallback
        try:
            results = await self._scrape_api(keywords, max_results)
        except Exception as e:
            logger.warning(f"[FranceTravail] API failed: {e}, trying web fallback")

        if not results:
            results = await self._scrape_web(keywords, max_results)

        return results

    async def _scrape_api(self, keywords: list[str], max_results: int) -> list[dict]:
        """Scrape using France Travail's public API."""
        results = []
        query = " ".join(keywords)

        headers = {
            "User-Agent": self.get_random_user_agent(),
            "Accept": "application/json",
        }

        # France Travail API parameters
        # typeContrat: CDD, CDI, MIS, SAI, LIB, REP, FRA (FRA = alternance)
        # departement: 75 (Paris), 92, 93, 94
        params = {
            "motsCles": query,
            "departement": "75,92,93,94",
            "typeContrat": "CDD,FRA",  # FRA = alternance/apprentissage
            "range": f"0-{min(max_results - 1, 149)}",
            "sort": 1,  # Sort by date
            "publieeDepuis": 7,  # Last 7 days
        }

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self.API_BASE,
                params=params,
                headers=headers,
            )

            if response.status_code == 200:
                data = response.json()
                offers = data.get("resultats", [])

                for raw in offers[:max_results]:
                    offer = self._parse_api_offer(raw)
                    if offer:
                        offer["location_score"] = self.score_location(offer.get("location", ""))
                        if offer["location_score"] >= -5:
                            results.append(offer)

            elif response.status_code == 204:
                logger.info("[FranceTravail] No results found")
            else:
                logger.warning(f"[FranceTravail] API returned {response.status_code}")
                raise Exception(f"API error: {response.status_code}")

        return results

    def _parse_api_offer(self, raw: dict) -> "Optional[dict]":
        """Parse a France Travail API offer."""
        try:
            title = raw.get("intitule", "")
            if not title:
                return None

            # Relevance filter
            relevant = ["support", "helpdesk", "technicien", "it", "informatique",
                        "assistant", "réseau", "système", "micro"]
            if not any(kw in title.lower() for kw in relevant):
                return None

            company = raw.get("entreprise", {}).get("nom", "Entreprise")
            location = raw.get("lieuTravail", {}).get("libelle", "")

            # Description
            description = raw.get("description", "")[:2000]

            # Skills from competences
            skills = []
            for comp in raw.get("competences", []):
                if isinstance(comp, dict):
                    skills.append(comp.get("libelle", ""))
                elif isinstance(comp, str):
                    skills.append(comp)

            # Posted date
            posted_at = raw.get("dateCreation", "")
            if posted_at and "T" in posted_at:
                posted_at = posted_at.split("T")[0]

            # Contract type
            type_contrat = raw.get("typeContrat", "")
            offer_type = "alternance"
            if type_contrat == "FRA":
                offer_type = "alternance"
            elif type_contrat in ("CDD", "MIS"):
                offer_type = self.classify_offer_type(title, description)

            # Source URL
            offer_id = raw.get("id", "")
            source_url = f"https://candidat.francetravail.fr/offres/recherche/detail/{offer_id}"

            return {
                "title": title.strip(),
                "company": company.strip() if company else "Entreprise",
                "location": location.strip(),
                "description": description.strip(),
                "source_url": source_url,
                "posted_at": posted_at or datetime.now().strftime("%Y-%m-%d"),
                "offer_type": offer_type,
                "required_skills": skills[:10],
                "source_platform": self.PLATFORM,
            }

        except Exception as e:
            logger.debug(f"[FranceTravail] Parse error: {e}")
            return None

    async def _scrape_web(self, keywords: list[str], max_results: int) -> list[dict]:
        """Fallback: scrape France Travail website with Playwright."""
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

            # Block heavy resources
            await context.route("**/*.{png,jpg,jpeg,gif,svg,webp,ico}", lambda route: route.abort())

            page = await context.new_page()

            try:
                url = (
                    f"{self.WEB_BASE}?"
                    f"motsCles={query}"
                    f"&offresPartenaires=true"
                    f"&tri=1"  # Sort by date
                )

                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await self.random_delay(3, 6)

                # Scroll to load results
                for _ in range(3):
                    await page.evaluate("window.scrollBy(0, 600)")
                    await self.random_delay(0.5, 1.0)

                # Parse job cards
                cards = await page.query_selector_all("[data-testid='result'], .result, li.result")

                for card in cards[:max_results]:
                    try:
                        title_el = await card.query_selector("h2 a, h3 a, .media-heading a")
                        title = await title_el.inner_text() if title_el else None
                        if not title:
                            continue

                        link = await title_el.get_attribute("href") if title_el else None
                        source_url = f"https://candidat.francetravail.fr{link}" if link and not link.startswith("http") else (link or "")

                        company_el = await card.query_selector(".subtext, .company, [data-testid='company']")
                        company = await company_el.inner_text() if company_el else "Entreprise"

                        location_el = await card.query_selector(".subtext + .subtext, .location, [data-testid='location']")
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
                        logger.debug(f"[FranceTravail] Web card parse error: {e}")

            except Exception as e:
                logger.error(f"[FranceTravail] Web scraping error: {e}")
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
