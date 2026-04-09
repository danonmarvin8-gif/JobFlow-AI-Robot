"""
JobFlow-AI — Configuration
Loads settings from environment variables (.env file)
"""

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Load .env from project root
ENV_PATH = Path(__file__).parent.parent / ".env"
load_dotenv(ENV_PATH)


class Config:
    """Application configuration loaded from environment."""

    # ── Paths ──
    BASE_DIR = Path(__file__).parent.parent
    STORAGE_DIR = BASE_DIR / "storage" / "generated_cvs"
    CV_DATA_PATH = BASE_DIR / "cv_data.json"

    # ── Database ──
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'jobflow.db'}")

    # ── AI (Google Gemini Free Tier) ──
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-1.5-flash-latest"  # Free, fast, 15 RPM

    # ── OSINT (Hunter.io Free: 25 searches/month) ──
    HUNTER_API_KEY: str = os.getenv("HUNTER_API_KEY", "")

    # ── Email (Brevo Free: 300/day) ──
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    BREVO_SMTP_SERVER: str = os.getenv("BREVO_SMTP_SERVER", "smtp-relay.brevo.com")
    BREVO_SMTP_PORT: int = int(os.getenv("BREVO_SMTP_PORT", "587"))
    BREVO_SMTP_LOGIN: str = os.getenv("BREVO_SMTP_LOGIN", "")
    BREVO_SMTP_PASSWORD: str = os.getenv("BREVO_SMTP_PASSWORD", "")

    # ── Sender ──
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "")
    SENDER_NAME: str = os.getenv("SENDER_NAME", "Marvin BOTTI DANON")

    # ── Proxy (Optional) ──
    PROXY_URL: Optional[str] = os.getenv("PROXY_URL", None)
    PROXY_USERNAME: Optional[str] = os.getenv("PROXY_USERNAME", None)
    PROXY_PASSWORD: Optional[str] = os.getenv("PROXY_PASSWORD", None)

    # ── App Settings ──
    MAX_DAILY_EMAILS: int = int(os.getenv("MAX_DAILY_EMAILS", "30"))
    SCRAPE_INTERVAL_MINUTES: int = int(os.getenv("SCRAPE_INTERVAL_MINUTES", "15"))

    # ── Location Preferences (Paris chic areas prioritized) ──
    PREFERRED_LOCATIONS: list[str] = [
        loc.strip() for loc in os.getenv(
            "PREFERRED_LOCATIONS",
            "Paris 1er,Paris 2e,Paris 3e,Paris 4e,Paris 5e,Paris 6e,Paris 7e,"
            "Paris 8e,Paris 9e,Paris 16e,Paris 17e,Neuilly-sur-Seine,"
            "Boulogne-Billancourt,Levallois-Perret,Issy-les-Moulineaux,"
            "La Défense,Saint-Cloud"
        ).split(",")
    ]

    AVOID_LOCATIONS: list[str] = [
        loc.strip() for loc in os.getenv(
            "AVOID_LOCATIONS",
            "Saint-Denis,Aubervilliers,La Courneuve,Pierrefitte,Stains,"
            "Bobigny,Bondy,Sevran,Aulnay-sous-Bois,Clichy-sous-Bois,Montfermeil"
        ).split(",")
    ]

    # ── Search Keywords ──
    SEARCH_KEYWORDS: list[str] = [
        "support informatique",
        "technicien support IT",
        "helpdesk",
        "support utilisateur",
        "technicien informatique",
        "assistant IT",
        "technicien informatique junior",
        "support IT junior",
    ]

    OFFER_TYPES: list[str] = ["alternance", "job étudiant", "stage"]

    @classmethod
    def ensure_dirs(cls):
        """Create required directories if they don't exist."""
        cls.STORAGE_DIR.mkdir(parents=True, exist_ok=True)


config = Config()
config.ensure_dirs()
