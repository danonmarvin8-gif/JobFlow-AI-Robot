"""
JobFlow-AI — Base Scraper
Abstract base class with built-in anti-ban protections.
"""

import asyncio
import logging
import random
from abc import ABC, abstractmethod
from typing import Optional

from config import config

logger = logging.getLogger(__name__)

# ── Realistic User-Agent Pool ──
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
]


class BaseScraper(ABC):
    """
    Abstract scraper with anti-ban protections:
    - Random human-like delays
    - User-Agent rotation
    - Optional proxy rotation
    - Automatic retry with exponential backoff
    - Circuit breaker (stops after N consecutive failures)
    """

    PLATFORM: str = "unknown"
    MAX_RETRIES: int = 3
    CIRCUIT_BREAKER_THRESHOLD: int = 3
    MIN_DELAY: float = 2.0
    MAX_DELAY: float = 7.0
    MAX_PAGES_PER_SESSION: int = 20

    def __init__(self):
        self.consecutive_failures = 0
        self.pages_scraped = 0
        self.is_circuit_open = False

    async def random_delay(self, min_s: float = None, max_s: float = None):
        """Human-like random delay between actions."""
        min_s = min_s or self.MIN_DELAY
        max_s = max_s or self.MAX_DELAY
        delay = random.uniform(min_s, max_s)
        await asyncio.sleep(delay)

    def get_random_user_agent(self) -> str:
        return random.choice(USER_AGENTS)

    def get_proxy(self) -> Optional[dict]:
        """Return proxy configuration if available."""
        if config.PROXY_URL:
            proxy = {"server": config.PROXY_URL}
            if config.PROXY_USERNAME:
                proxy["username"] = config.PROXY_USERNAME
                proxy["password"] = config.PROXY_PASSWORD or ""
            return proxy
        return None

    def check_circuit_breaker(self) -> bool:
        """Check if we should stop scraping due to too many failures."""
        if self.consecutive_failures >= self.CIRCUIT_BREAKER_THRESHOLD:
            if not self.is_circuit_open:
                logger.warning(
                    f"[{self.PLATFORM}] Circuit breaker OPEN — "
                    f"{self.consecutive_failures} consecutive failures. "
                    f"Pausing for 30 minutes."
                )
                self.is_circuit_open = True
            return True
        return False

    def record_success(self):
        """Record a successful scrape, reset failure counter."""
        self.consecutive_failures = 0
        self.is_circuit_open = False
        self.pages_scraped += 1

    def record_failure(self, error: str = ""):
        """Record a failed scrape."""
        self.consecutive_failures += 1
        logger.warning(f"[{self.PLATFORM}] Scrape failure #{self.consecutive_failures}: {error}")

    def score_location(self, location: str) -> int:
        """
        Score a location based on preferences.
        Higher = better. Negative = avoided zone.
        """
        if not location:
            return 0

        location_lower = location.lower()

        # Check avoided locations first
        for avoided in config.AVOID_LOCATIONS:
            if avoided.lower() in location_lower:
                return -10

        # Check preferred locations
        for i, preferred in enumerate(config.PREFERRED_LOCATIONS):
            if preferred.lower() in location_lower:
                # Earlier in list = higher priority
                return 10 - min(i, 9)

        # Generic Paris match
        if "paris" in location_lower:
            return 5

        # Generic Île-de-France
        if any(kw in location_lower for kw in ["île-de-france", "idf", "92", "75"]):
            return 3

        return 0

    def classify_offer_type(self, title: str, description: str = "") -> str:
        """Classify the offer type from title and description."""
        text = f"{title} {description}".lower()

        if any(kw in text for kw in ["alternance", "alternant", "contrat pro", "apprentissage"]):
            return "alternance"
        elif any(kw in text for kw in ["job étudiant", "job etudiant", "étudiant", "temps partiel", "weekend"]):
            return "job_etudiant"
        elif any(kw in text for kw in ["stage", "stagiaire", "internship"]):
            return "stage"

        return "alternance"  # Default

    @abstractmethod
    async def scrape(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """
        Scrape job offers. Must return a list of dicts with:
        {
            "title": str,
            "company": str,
            "location": str,
            "description": str,
            "source_url": str,
            "posted_at": str (ISO date),
            "offer_type": str,
            "required_skills": list[str],
            "source_platform": str,
        }
        """
        pass

    async def scrape_with_retry(self, keywords: list[str], max_results: int = 50) -> list[dict]:
        """Scrape with automatic retry and exponential backoff."""
        if self.check_circuit_breaker():
            logger.info(f"[{self.PLATFORM}] Circuit breaker is OPEN, skipping scrape.")
            return []

        for attempt in range(self.MAX_RETRIES):
            try:
                results = await self.scrape(keywords, max_results)
                self.record_success()
                logger.info(f"[{self.PLATFORM}] Scraped {len(results)} offers (attempt {attempt + 1})")
                return results
            except Exception as e:
                self.record_failure(str(e))
                if attempt < self.MAX_RETRIES - 1:
                    backoff = (2 ** attempt) * random.uniform(5, 15)
                    logger.info(f"[{self.PLATFORM}] Retrying in {backoff:.1f}s...")
                    await asyncio.sleep(backoff)
                else:
                    logger.error(f"[{self.PLATFORM}] All {self.MAX_RETRIES} attempts failed: {e}")

        return []
