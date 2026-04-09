"""
JobFlow-AI — Native OSINT Email Finder
Finds HR/recruiter contacts WITHOUT relying on Hunter.io.
Uses DuckDuckGo dorking + DNS MX verification + SMTP ping.
"""

import asyncio
import logging
import re
import smtplib
import socket
from typing import Optional

import dns.resolver
import httpx
from ddgs import DDGS
from slugify import slugify

from config import config

logger = logging.getLogger(__name__)


class NativeEmailFinder:
    """
    Multi-strategy email finder — 100 % interne, 0 dépendance payante.
    
    Pipeline:
    1. DuckDuckGo dorking → chercher profils LinkedIn RH/IT de l'entreprise
    2. Extraction du prénom + nom depuis les résultats
    3. Génération de permutations email (prenom.nom@domaine, etc.)
    4. Résolution DNS MX → trouver le serveur mail de l'entreprise
    5. SMTP RCPT TO ping (port 25) → valider quelle permutation existe
    6. Fallback : pattern le + courant (prenom.nom@domaine) si le SMTP ping échoue
    """

    # ── Common corporate email patterns ──
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

    # ── Generic recruitment addresses to try ──
    GENERIC_EMAILS = [
        "recrutement@{domain}",
        "rh@{domain}",
        "careers@{domain}",
        "jobs@{domain}",
        "recruitment@{domain}",
        "hr@{domain}",
        "contact@{domain}",
    ]

    # ── HR titles to look for ──
    HR_KEYWORDS = [
        "recrutement", "talent acquisition", "chargé de recrutement",
        "chargée de recrutement", "responsable rh", "directeur rh",
        "recruteuse", "recruteur", "human resources", "hr manager",
        "people", "talent", "drh",
    ]

    IT_KEYWORDS = [
        "directeur it", "dsi", "responsable it", "manager it",
        "responsable support", "responsable informatique", "cto",
        "it manager", "head of it", "tech lead",
    ]

    # ── Well-known corporate domains ──
    KNOWN_DOMAINS = {
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
        "ceva logistics": "cevalogistics.com",
        "cevalogistics": "cevalogistics.com",
        "seatpi": "seatpi.com",
        "azurreo": "azurreo.com",
        "flexify": "flexify.com",
    }

    async def find_contact(
        self,
        company_name: str,
        company_domain: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Main method — find best contact for a company.
        Returns: {full_name, email, role, source, confidence_score, osint_profile}
        """
        domain = company_domain or self._guess_domain(company_name)
        if not domain:
            logger.warning(f"[OSINT] Could not determine domain for '{company_name}'")
            return None

        logger.info(f"[OSINT] Searching contact for '{company_name}' (domain: {domain})")

        # ── Strategy 1: DuckDuckGo dorking → find HR name on LinkedIn ──
        contact = await self._search_linkedin_via_ddg(company_name, domain)
        if contact:
            logger.info(f"[OSINT] ✅ Found named contact via DDG: {contact['email']}")
            return contact

        # ── Strategy 2: Try generic recruitment emails via SMTP verify ──
        contact = await self._try_generic_emails(company_name, domain)
        if contact:
            logger.info(f"[OSINT] ✅ Verified generic email: {contact['email']}")
            return contact

        # ── Strategy 3: Fallback — use best-guess generic ──
        fallback = self._create_fallback_contact(company_name, domain)
        logger.info(f"[OSINT] Using fallback: {fallback['email']}")
        return fallback

    # ═══════════════════════════════════════════════
    # STRATEGY 1: DuckDuckGo LinkedIn Dorking
    # ═══════════════════════════════════════════════

    async def _search_linkedin_via_ddg(
        self,
        company_name: str,
        domain: str,
    ) -> Optional[dict]:
        """
        Use DuckDuckGo to find LinkedIn profiles of HR/recruiters at the company.
        Then generate email permutations and verify via SMTP.
        """
        try:
            # Build targeted search queries
            queries = [
                f'site:linkedin.com/in ("recrutement" OR "talent acquisition" OR "RH") "{company_name}"',
                f'site:linkedin.com/in ("recruteur" OR "chargé de recrutement") "{company_name}"',
                f'site:linkedin.com/in ("responsable IT" OR "DSI" OR "support informatique") "{company_name}"',
            ]

            names_found = []

            for query in queries:
                try:
                    with DDGS() as ddgs:
                        results = list(ddgs.text(query, max_results=5, region="fr-fr"))

                    for result in results:
                        name = self._extract_name_from_linkedin(result)
                        if name:
                            # Determine role based on which query matched
                            role = "Recruteur"
                            title = result.get("title", "").lower()
                            body = result.get("body", "").lower()
                            combined = f"{title} {body}"

                            if any(kw in combined for kw in self.IT_KEYWORDS):
                                role = "Responsable IT"
                            elif any(kw in combined for kw in self.HR_KEYWORDS):
                                role = "RH"

                            names_found.append({
                                "full_name": name,
                                "role": role,
                                "source_url": result.get("href", ""),
                                "title": result.get("title", ""),
                            })

                    # Small delay between searches
                    await asyncio.sleep(1.5)

                except Exception as e:
                    logger.debug(f"[OSINT] DDG search error: {e}")
                    continue

            if not names_found:
                return None

            # Try to verify emails for found names
            for person in names_found:
                first, last = self._split_name(person["full_name"])
                if not first or not last:
                    continue

                # Generate email permutations
                candidates = self._generate_email_permutations(first, last, domain)

                # Try SMTP verification
                verified = await self._verify_emails_smtp(candidates, domain)
                if verified:
                    return {
                        "full_name": person["full_name"],
                        "email": verified,
                        "role": person["role"],
                        "source": "native_osint",
                        "confidence_score": 0.85,
                        "osint_profile": {
                            "linkedin": person.get("source_url", ""),
                            "method": "ddg_linkedin + smtp_verify",
                            "title": person.get("title", ""),
                        },
                    }

                # If SMTP verify failed, use most common pattern
                best_guess = candidates[0] if candidates else None
                if best_guess:
                    return {
                        "full_name": person["full_name"],
                        "email": best_guess,
                        "role": person["role"],
                        "source": "native_osint",
                        "confidence_score": 0.55,
                        "osint_profile": {
                            "linkedin": person.get("source_url", ""),
                            "method": "ddg_linkedin + pattern_guess",
                            "note": "SMTP verify unavailable, using most common pattern",
                        },
                    }

        except Exception as e:
            logger.warning(f"[OSINT] DDG LinkedIn search failed: {e}")

        return None

    def _extract_name_from_linkedin(self, result: dict) -> Optional[str]:
        """
        Extract a person's name from a DuckDuckGo/LinkedIn result.
        LinkedIn titles usually look like: "Prénom Nom - Titre | LinkedIn"
        """
        title = result.get("title", "")

        # Pattern: "Prénom Nom - Titre chez Entreprise | LinkedIn"
        # Or: "Prénom Nom – Titre | LinkedIn"
        match = re.match(
            r'^([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)\s*[\-–|]',
            title
        )
        if match:
            name = match.group(1).strip()
            # Sanity check: 2 or 3 words, no numbers
            parts = name.split()
            if 2 <= len(parts) <= 4 and not any(c.isdigit() for c in name):
                return name

        # Simpler fallback: first two capitalized words
        match = re.match(
            r'^([A-ZÀ-Ÿ][a-zà-ÿ]+)\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ]+)',
            title
        )
        if match:
            name = f"{match.group(1)} {match.group(2)}"
            if len(name) > 4:
                return name

        return None

    def _split_name(self, full_name: str) -> tuple[str, str]:
        """Split full name into (first, last). Handle accented chars."""
        parts = full_name.strip().split()
        if len(parts) >= 2:
            first = parts[0].lower()
            last = parts[-1].lower()
            # Remove accents for email generation
            first = self._remove_accents(first)
            last = self._remove_accents(last)
            return first, last
        return "", ""

    def _remove_accents(self, text: str) -> str:
        """Remove accents for email-safe strings."""
        import unicodedata
        nfkd = unicodedata.normalize('NFKD', text)
        return ''.join(c for c in nfkd if not unicodedata.combining(c))

    def _generate_email_permutations(
        self, first: str, last: str, domain: str
    ) -> list[str]:
        """Generate all common corporate email patterns."""
        f = first[0] if first else ""
        l = last[0] if last else ""

        candidates = []
        for pattern in self.EMAIL_PATTERNS:
            try:
                email = pattern.format(
                    first=first, last=last, f=f, l=l, domain=domain
                )
                candidates.append(email)
            except (KeyError, IndexError):
                continue

        return candidates

    # ═══════════════════════════════════════════════
    # STRATEGY 2: Generic Emails
    # ═══════════════════════════════════════════════

    async def _try_generic_emails(
        self, company_name: str, domain: str
    ) -> Optional[dict]:
        """Try common generic emails and verify via SMTP."""
        candidates = [p.format(domain=domain) for p in self.GENERIC_EMAILS]

        verified = await self._verify_emails_smtp(candidates, domain)
        if verified:
            return {
                "full_name": "Service Recrutement",
                "email": verified,
                "role": "Recruteur",
                "source": "native_osint",
                "confidence_score": 0.65,
                "osint_profile": {
                    "method": "generic_smtp_verify",
                    "company": company_name,
                },
            }

        return None

    # ═══════════════════════════════════════════════
    # SMTP Verification Engine
    # ═══════════════════════════════════════════════

    async def _verify_emails_smtp(
        self, candidates: list[str], domain: str
    ) -> Optional[str]:
        """
        Verify email addresses by talking to the mail server (SMTP RCPT TO).
        Returns the first verified address, or None.
        """
        # Resolve MX record
        mx_host = await self._get_mx_host(domain)
        if not mx_host:
            return None

        # Check if catch-all domain (accepts everything)
        is_catchall = await self._is_catch_all(mx_host, domain)
        if is_catchall:
            logger.debug(f"[OSINT] {domain} is catch-all, skipping SMTP verify")
            return None  # Can't verify on catch-all

        # Try each candidate
        for email in candidates:
            try:
                is_valid = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, self._smtp_verify_sync, email, mx_host
                    ),
                    timeout=10.0,
                )
                if is_valid:
                    logger.info(f"[OSINT] SMTP verified: {email}")
                    return email
            except asyncio.TimeoutError:
                logger.debug(f"[OSINT] SMTP timeout for {email}")
            except Exception as e:
                logger.debug(f"[OSINT] SMTP error for {email}: {e}")

        return None

    def _smtp_verify_sync(self, email: str, mx_host: str) -> bool:
        """
        Synchronous SMTP RCPT TO test.
        Connects to the MX server and checks if the recipient is accepted.
        """
        try:
            server = smtplib.SMTP(timeout=8)
            server.connect(mx_host, 25)
            server.helo("jobflow.ai")
            server.mail("verify@jobflow.ai")
            code, _ = server.rcpt(email)
            server.quit()
            return code == 250
        except Exception:
            return False

    async def _get_mx_host(self, domain: str) -> Optional[str]:
        """Resolve MX record for domain."""
        try:
            loop = asyncio.get_event_loop()
            mx_records = await loop.run_in_executor(
                None,
                lambda: dns.resolver.resolve(domain, 'MX')
            )
            # Get highest priority MX (lowest preference number)
            best = sorted(mx_records, key=lambda r: r.preference)
            if best:
                host = str(best[0].exchange).rstrip('.')
                logger.debug(f"[OSINT] MX for {domain}: {host}")
                return host
        except Exception as e:
            logger.debug(f"[OSINT] MX resolve failed for {domain}: {e}")
        return None

    async def _is_catch_all(self, mx_host: str, domain: str) -> bool:
        """Check if domain accepts all emails (catch-all)."""
        try:
            fake_email = f"zzznonexistent99999@{domain}"
            loop = asyncio.get_event_loop()
            result = await asyncio.wait_for(
                loop.run_in_executor(
                    None, self._smtp_verify_sync, fake_email, mx_host
                ),
                timeout=8.0,
            )
            return result  # If fake email accepted → catch-all
        except Exception:
            return False

    # ═══════════════════════════════════════════════
    # Domain Guessing
    # ═══════════════════════════════════════════════

    def _guess_domain(self, company_name: str) -> Optional[str]:
        """Guess company domain from name."""
        name_lower = company_name.lower().strip()

        # Check known domains
        for key, domain in self.KNOWN_DOMAINS.items():
            if key in name_lower:
                return domain

        # Clean & slugify
        slug = slugify(company_name, separator="")
        return f"{slug}.com"

    # ═══════════════════════════════════════════════
    # Fallback
    # ═══════════════════════════════════════════════

    def _create_fallback_contact(self, company_name: str, domain: str) -> dict:
        """Create a generic recruitment contact as last resort."""
        return {
            "full_name": "Service Recrutement",
            "email": f"recrutement@{domain}",
            "role": "Recruteur",
            "source": "native_fallback",
            "confidence_score": 0.2,
            "osint_profile": {
                "note": "Adresse générique estimée — non vérifiée",
                "company": company_name,
                "method": "fallback",
            },
        }
