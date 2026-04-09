"""
JobFlow-AI — OSINT Email Finder
Finds HR/recruiter emails using Hunter.io free tier + email pattern guessing.
"""

import logging
import re
from typing import Optional

import httpx
from slugify import slugify

from config import config

logger = logging.getLogger(__name__)


class EmailFinder:
    """
    Multi-strategy email finder:
    1. Hunter.io domain search (25 free searches/month)
    2. Email pattern guessing based on common corporate patterns
    3. Google dorking fallback
    """

    # Common corporate email patterns
    EMAIL_PATTERNS = [
        "{first}.{last}@{domain}",
        "{first}{last}@{domain}",
        "{f}{last}@{domain}",
        "{first}.{l}@{domain}",
        "{first}@{domain}",
        "{f}.{last}@{domain}",
        "{last}.{first}@{domain}",
        "{first}-{last}@{domain}",
        "{first}_{last}@{domain}",
    ]

    # Typical HR/IT department titles
    HR_TITLES = [
        "responsable rh", "directeur rh", "drh",
        "chargé de recrutement", "talent acquisition",
        "recruteur", "recruteuse",
        "responsable recrutement",
        "human resources", "hr manager", "hr director",
        "people", "talent",
    ]

    IT_TITLES = [
        "directeur it", "dsi", "responsable it",
        "manager it", "responsable support",
        "responsable informatique", "cto",
        "it manager", "head of it",
    ]

    async def find_contact(
        self,
        company_name: str,
        company_domain: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Find HR or IT manager contact for a company.
        Returns: {full_name, email, role, source, confidence_score, osint_profile}
        """
        # Step 1: Try Hunter.io if API key available
        if config.HUNTER_API_KEY:
            contact = await self._search_hunter(company_name, company_domain)
            if contact:
                logger.info(f"[OSINT] Found contact via Hunter.io: {contact['email']}")
                return contact

        # Step 2: Try domain guessing
        domain = company_domain or self._guess_domain(company_name)
        if domain:
            contact = await self._verify_email_patterns(company_name, domain)
            if contact:
                logger.info(f"[OSINT] Found email via pattern guess: {contact['email']}")
                return contact

        # Step 3: Fallback — generic contact
        if domain:
            generic = self._create_generic_contact(company_name, domain)
            logger.info(f"[OSINT] Using generic contact: {generic['email']}")
            return generic

        logger.warning(f"[OSINT] No contact found for {company_name}")
        return None

    async def _search_hunter(
        self,
        company_name: str,
        domain: Optional[str] = None,
    ) -> Optional[dict]:
        """Search Hunter.io for HR/recruiter emails."""
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # First, try domain search
                if domain:
                    response = await client.get(
                        "https://api.hunter.io/v2/domain-search",
                        params={
                            "domain": domain,
                            "api_key": config.HUNTER_API_KEY,
                            "type": "personal",
                            "department": "human_resources",
                            "limit": 5,
                        }
                    )

                    if response.status_code == 200:
                        data = response.json().get("data", {})
                        emails = data.get("emails", [])

                        # Find HR person first
                        for email_data in emails:
                            position = (email_data.get("position") or "").lower()
                            if any(title in position for title in self.HR_TITLES):
                                return {
                                    "full_name": f"{email_data.get('first_name', '')} {email_data.get('last_name', '')}".strip(),
                                    "email": email_data["value"],
                                    "role": "RH",
                                    "source": "hunter.io",
                                    "confidence_score": email_data.get("confidence", 50) / 100,
                                    "osint_profile": {
                                        "position": email_data.get("position", ""),
                                        "department": email_data.get("department", ""),
                                        "linkedin": email_data.get("linkedin", ""),
                                        "sources": [s.get("uri", "") for s in email_data.get("sources", [])[:3]],
                                    }
                                }

                        # Fall back to IT manager
                        for email_data in emails:
                            position = (email_data.get("position") or "").lower()
                            if any(title in position for title in self.IT_TITLES):
                                return {
                                    "full_name": f"{email_data.get('first_name', '')} {email_data.get('last_name', '')}".strip(),
                                    "email": email_data["value"],
                                    "role": "Manager IT",
                                    "source": "hunter.io",
                                    "confidence_score": email_data.get("confidence", 50) / 100,
                                    "osint_profile": {
                                        "position": email_data.get("position", ""),
                                        "department": email_data.get("department", ""),
                                    }
                                }

                        # Take any person if available
                        if emails:
                            email_data = emails[0]
                            return {
                                "full_name": f"{email_data.get('first_name', '')} {email_data.get('last_name', '')}".strip(),
                                "email": email_data["value"],
                                "role": "Recruteur",
                                "source": "hunter.io",
                                "confidence_score": email_data.get("confidence", 50) / 100,
                                "osint_profile": {
                                    "position": email_data.get("position", ""),
                                }
                            }

                # Company search (as fallback)
                if not domain:
                    response = await client.get(
                        "https://api.hunter.io/v2/email-finder",
                        params={
                            "company": company_name,
                            "api_key": config.HUNTER_API_KEY,
                            "department": "human_resources",
                        }
                    )

                    if response.status_code == 200:
                        data = response.json().get("data", {})
                        if data.get("email"):
                            return {
                                "full_name": f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
                                "email": data["email"],
                                "role": "RH",
                                "source": "hunter.io",
                                "confidence_score": data.get("score", 50) / 100,
                                "osint_profile": {}
                            }

        except Exception as e:
            logger.warning(f"[OSINT] Hunter.io error: {e}")

        return None

    async def _verify_email_patterns(
        self,
        company_name: str,
        domain: str,
    ) -> Optional[dict]:
        """
        Generate likely email patterns and verify them via Hunter.io verify.
        """
        if not config.HUNTER_API_KEY:
            # Without Hunter, just return the most common pattern
            clean_name = self._clean_company_name(company_name)
            return {
                "full_name": "Recrutement",
                "email": f"recrutement@{domain}",
                "role": "Recruteur",
                "source": "pattern_guess",
                "confidence_score": 0.3,
                "osint_profile": {"note": "Email généré par pattern, non vérifié"}
            }

        # Try to verify common recruitment emails
        common_emails = [
            f"recrutement@{domain}",
            f"rh@{domain}",
            f"careers@{domain}",
            f"jobs@{domain}",
            f"recruitment@{domain}",
            f"hr@{domain}",
        ]

        async with httpx.AsyncClient(timeout=10) as client:
            for email in common_emails:
                try:
                    response = await client.get(
                        "https://api.hunter.io/v2/email-verifier",
                        params={
                            "email": email,
                            "api_key": config.HUNTER_API_KEY,
                        }
                    )

                    if response.status_code == 200:
                        data = response.json().get("data", {})
                        if data.get("result") in ("deliverable", "risky"):
                            return {
                                "full_name": "Recrutement",
                                "email": email,
                                "role": "Recruteur",
                                "source": "pattern_verify",
                                "confidence_score": 0.6 if data["result"] == "deliverable" else 0.4,
                                "osint_profile": {
                                    "verification": data.get("result"),
                                    "smtp_server": data.get("smtp_server", ""),
                                }
                            }

                except Exception:
                    continue

        return None

    def _guess_domain(self, company_name: str) -> Optional[str]:
        """Guess company domain from name."""
        # Common known domains
        known_domains = {
            "capgemini": "capgemini.com",
            "bnp paribas": "bnpparibas.com",
            "bnp": "bnpparibas.com",
            "société générale": "socgen.com",
            "societe generale": "socgen.com",
            "ubisoft": "ubisoft.com",
            "publicis": "publicis.com",
            "louis vuitton": "louisvuitton.com",
            "lvmh": "lvmh.com",
            "accenture": "accenture.com",
            "sopra steria": "soprasteria.com",
            "atos": "atos.net",
            "orange": "orange.com",
            "sfr": "sfr.com",
            "bouygues": "bouygues.com",
            "thales": "thalesgroup.com",
            "dassault": "dassault.fr",
            "airbus": "airbus.com",
            "total": "totalenergies.com",
            "totalenergies": "totalenergies.com",
            "microsoft": "microsoft.com",
            "google": "google.com",
            "amazon": "amazon.com",
            "ibm": "ibm.com",
            "dell": "dell.com",
            "hp": "hp.com",
        }

        name_lower = company_name.lower().strip()
        for key, domain in known_domains.items():
            if key in name_lower:
                return domain

        # Generic guess: company-name.com or company-name.fr
        slug = slugify(company_name, separator="")
        return f"{slug}.com"

    def _clean_company_name(self, name: str) -> str:
        """Clean company name for use in patterns."""
        # Remove common suffixes
        for suffix in [" SAS", " SA", " SARL", " SNC", " EURL", " Group", " France"]:
            name = name.replace(suffix, "")
        return name.strip()

    def _create_generic_contact(self, company_name: str, domain: str) -> dict:
        """Create a generic recruitment contact."""
        return {
            "full_name": "Service Recrutement",
            "email": f"recrutement@{domain}",
            "role": "Recruteur",
            "source": "generic",
            "confidence_score": 0.2,
            "osint_profile": {
                "note": "Adresse générique estimée — vérifier manuellement",
                "company": company_name,
            }
        }
