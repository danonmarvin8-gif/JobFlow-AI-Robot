"""
JobFlow-AI — Pipeline Orchestrator
Runs the complete automated pipeline: scrape → osint → tailor → send.
Designed to run via cron (GitHub Actions or local scheduler).
"""

import asyncio
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import config
from models import (
    Application, BaseCV, Campaign, Company, CompanyContact,
    GeneratedCV, GeneratedEmail, JobOffer, SessionLocal, User,
    init_db, ApplicationLog,
)
from scrapers.indeed_scraper import IndeedScraper
from scrapers.linkedin_scraper import LinkedInScraper
from scrapers.wttj_scraper import WTTJScraper
from osint.email_finder import EmailFinder
from tailoring.cv_generator import CVGenerator
from tailoring.email_writer import EmailWriter
from tailoring.pdf_renderer import PDFRenderer
from tasks.email_sender import EmailDispatcher

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class PipelineOrchestrator:
    """
    Complete automated pipeline:
    1. Scrape job offers from all platforms
    2. Find HR contacts via OSINT
    3. Generate tailored CVs using AI
    4. Generate personalized emails
    5. Send emails with CV attached
    """

    def __init__(self):
        self.scrapers = [
            IndeedScraper(),
            LinkedInScraper(),
            WTTJScraper(),
        ]
        self.email_finder = EmailFinder()
        self.cv_generator = CVGenerator()
        self.email_writer = EmailWriter()
        self.pdf_renderer = PDFRenderer()
        self.email_dispatcher = EmailDispatcher()

    async def run_full_pipeline(self):
        """Execute the complete pipeline once."""
        logger.info("=" * 60)
        logger.info("JobFlow-AI Pipeline — Starting full cycle")
        logger.info("=" * 60)

        db = SessionLocal()

        try:
            # Ensure default user and CV exist
            user = self._ensure_default_user(db)
            base_cv = self._ensure_default_cv(db, user.id)

            # Get or create active campaign
            campaign = self._get_active_campaign(db, user.id)
            if not campaign:
                logger.info("No active campaign found. Creating one...")
                campaign = self._create_default_campaign(db, user.id)

            # Check daily send limit
            daily_sent = self._get_daily_send_count(db, user.id)
            remaining = config.MAX_DAILY_EMAILS - daily_sent
            if remaining <= 0:
                logger.info(f"Daily send limit reached ({config.MAX_DAILY_EMAILS}). Skipping.")
                return

            logger.info(f"Daily budget: {remaining} emails remaining")

            # ═══════════ STEP 1: SCRAPE ═══════════
            logger.info("\n📡 STEP 1: Scraping job offers...")
            new_offers = await self._scrape_all(db)
            logger.info(f"→ Found {len(new_offers)} new offers")

            # ═══════════ STEP 2-5: PROCESS EACH OFFER ═══════════
            processed = 0
            for offer in new_offers[:remaining]:
                try:
                    success = await self._process_offer(db, offer, user, base_cv, campaign)
                    if success:
                        processed += 1
                        logger.info(f"✅ Processed offer #{processed}: {offer.title} @ {offer.company.name if offer.company else 'Unknown'}")
                    else:
                        logger.warning(f"⚠️ Failed to process: {offer.title}")
                except Exception as e:
                    logger.error(f"❌ Error processing offer {offer.id}: {e}")
                    self._log_event(db, None, "error", f"Pipeline error: {e}")

                # Delay between offers to avoid rate limits
                await asyncio.sleep(5)

            logger.info(f"\n{'=' * 60}")
            logger.info(f"Pipeline complete: {processed}/{len(new_offers)} offers processed")
            logger.info(f"{'=' * 60}")

        except Exception as e:
            logger.error(f"Pipeline fatal error: {e}", exc_info=True)
        finally:
            db.close()

    async def _scrape_all(self, db) -> list:
        """Scrape all sources and store new offers in DB."""
        all_new_offers = []

        for scraper in self.scrapers:
            try:
                logger.info(f"  Scraping {scraper.PLATFORM}...")
                raw_offers = await scraper.scrape_with_retry(
                    keywords=config.SEARCH_KEYWORDS[:2],  # Use first 2 keywords
                    max_results=20,
                )

                for raw in raw_offers:
                    offer = self._upsert_offer(db, raw)
                    if offer:
                        all_new_offers.append(offer)

            except Exception as e:
                logger.error(f"  {scraper.PLATFORM} scraper error: {e}")

        db.commit()
        return all_new_offers

    def _upsert_offer(self, db, raw: dict):
        """Insert offer if not exists (deduplicate by source_url)."""
        source_url = raw.get("source_url", "")
        if not source_url:
            return None

        existing = db.query(JobOffer).filter_by(source_url=source_url).first()
        if existing:
            return None  # Already scraped

        # Find or create company
        company_name = raw.get("company", "").strip()
        company = None
        if company_name:
            company = db.query(Company).filter_by(name=company_name).first()
            if not company:
                company = Company(
                    name=company_name,
                    domain=self.email_finder._guess_domain(company_name),
                )
                db.add(company)
                db.flush()

        offer = JobOffer(
            company_id=company.id if company else None,
            title=raw.get("title", ""),
            offer_type=raw.get("offer_type", "alternance"),
            source_platform=raw.get("source_platform", "other"),
            source_url=source_url,
            description=raw.get("description", ""),
            location=raw.get("location", ""),
            posted_at=datetime.fromisoformat(raw["posted_at"]) if raw.get("posted_at") else None,
            required_skills=raw.get("required_skills", []),
            extracted_keywords=raw.get("extracted_keywords", []),
            location_score=raw.get("location_score", 0),
        )

        db.add(offer)
        db.flush()
        return offer

    async def _process_offer(self, db, offer, user, base_cv, campaign) -> bool:
        """Process a single offer: OSINT → tailor CV → generate email → send."""

        # Check if already applied
        existing_app = db.query(Application).filter_by(
            user_id=user.id, offer_id=offer.id
        ).first()
        if existing_app:
            return False

        company = offer.company

        # ── STEP 2: OSINT — Find HR contact ──
        logger.info(f"  🕵️ OSINT: Finding contact for {company.name if company else 'Unknown'}...")
        contact_data = await self.email_finder.find_contact(
            company_name=company.name if company else "",
            company_domain=company.domain if company else None,
        )

        contact = None
        if contact_data and contact_data.get("email"):
            # Store contact
            contact = db.query(CompanyContact).filter_by(
                email=contact_data["email"]
            ).first()

            if not contact:
                contact = CompanyContact(
                    company_id=company.id if company else None,
                    full_name=contact_data.get("full_name", ""),
                    email=contact_data["email"],
                    role=contact_data.get("role", "Recruteur"),
                    osint_profile=contact_data.get("osint_profile", {}),
                    source=contact_data.get("source", "unknown"),
                    confidence_score=contact_data.get("confidence_score", 0.0),
                )
                db.add(contact)
                db.flush()

            logger.info(f"    → Contact: {contact.full_name} ({contact.email})")
        else:
            logger.warning(f"    → No contact found, skipping")
            return False

        # ── Create Application record ──
        application = Application(
            user_id=user.id,
            offer_id=offer.id,
            base_cv_id=base_cv.id,
            campaign_id=campaign.id,
            contact_id=contact.id if contact else None,
            status="pending",
        )
        db.add(application)
        db.flush()

        # ── STEP 3: Generate tailored CV ──
        logger.info(f"  ✂️ Tailoring CV for {offer.title}...")
        cv_result = await self.cv_generator.generate_tailored_cv(
            base_cv=base_cv.cv_data,
            job_title=offer.title,
            company_name=company.name if company else "",
            job_description=offer.description or "",
            required_skills=offer.required_skills or [],
            offer_type=offer.offer_type,
        )

        # Render PDF
        pdf_path = self.pdf_renderer.render(
            cv_data=cv_result["tailored_cv_data"],
            output_filename=f"CV_Marvin_{company.name if company else 'Unknown'}_{offer.id[:8]}.pdf",
        )

        # Store generated CV
        gen_cv = GeneratedCV(
            application_id=application.id,
            tailored_cv_data=cv_result["tailored_cv_data"],
            pdf_path=pdf_path,
            ai_prompt_used=cv_result.get("prompt_used", ""),
            ai_modifications_summary=cv_result.get("modifications_summary", ""),
        )
        db.add(gen_cv)

        application.status = "cv_generated"
        self._log_event(db, application.id, "cv_gen", f"CV generated: {pdf_path}")

        # ── STEP 4: Generate personalized email ──
        logger.info(f"  📧 Generating email for {contact.full_name}...")

        strengths = base_cv.cv_data.get("hard_skills", {}).get("reseaux_systemes", [])
        strengths += base_cv.cv_data.get("hard_skills", {}).get("developpement", [])

        email_result = await self.email_writer.generate_email(
            job_title=offer.title,
            company_name=company.name if company else "",
            offer_type=offer.offer_type,
            hr_name=contact.full_name if contact else "",
            hr_role=contact.role if contact else "Recruteur",
            hr_email=contact.email if contact else "",
            osint_profile=contact.osint_profile if contact else {},
            candidate_strengths=strengths[:8],
            job_description=offer.description or "",
        )

        gen_email = GeneratedEmail(
            application_id=application.id,
            subject=email_result["subject"],
            body_html=email_result["body_html"],
            body_plain=email_result["body_plain"],
            tone=email_result.get("tone", "semi-formel"),
            personalization_data=email_result.get("personalization_data", {}),
        )
        db.add(gen_email)

        # ── STEP 5: Send email ──
        logger.info(f"  📤 Sending email to {contact.email}...")
        send_result = self.email_dispatcher.send_email(
            to_email=contact.email,
            to_name=contact.full_name or "",
            subject=email_result["subject"],
            body_html=email_result["body_html"],
            body_plain=email_result["body_plain"],
            cv_pdf_path=pdf_path,
        )

        if send_result["success"]:
            application.status = "email_sent"
            application.applied_at = datetime.now(timezone.utc)
            gen_email.message_id = send_result.get("message_id", "")
            gen_email.delivery_status = "sent"
            gen_email.sent_at = datetime.now(timezone.utc)

            campaign.total_sent = (campaign.total_sent or 0) + 1

            self._log_event(db, application.id, "email_send",
                          f"Email sent to {contact.email}")
        else:
            application.status = "error"
            application.error_message = send_result.get("error", "Unknown error")
            gen_email.delivery_status = "dropped"

            self._log_event(db, application.id, "error",
                          f"Email failed: {send_result.get('error')}")

        db.commit()
        return send_result["success"]

    # ── Helper Methods ──

    def _ensure_default_user(self, db) -> User:
        """Ensure default user exists."""
        user = db.query(User).filter_by(email="Bottimarvin@gmail.com").first()
        if not user:
            user = User(
                email="Bottimarvin@gmail.com",
                full_name="Marvin BOTTI DANON",
            )
            db.add(user)
            db.commit()
        return user

    def _ensure_default_cv(self, db, user_id: str) -> BaseCV:
        """Ensure default CV exists."""
        cv = db.query(BaseCV).filter_by(user_id=user_id, is_active=True).first()
        if not cv:
            cv_path = config.CV_DATA_PATH
            if cv_path.exists():
                cv_data = json.loads(cv_path.read_text(encoding="utf-8"))
            else:
                cv_data = {"personal": {"full_name": "Marvin BOTTI DANON"}}

            cv = BaseCV(
                user_id=user_id,
                label="CV Alternance Support IT",
                target_type="alternance",
                cv_data=cv_data,
                is_active=True,
            )
            db.add(cv)
            db.commit()
        return cv

    def _get_active_campaign(self, db, user_id: str):
        return db.query(Campaign).filter_by(user_id=user_id, status="active").first()

    def _create_default_campaign(self, db, user_id: str) -> Campaign:
        campaign = Campaign(
            user_id=user_id,
            name="Alternance Support IT — Paris",
            status="active",
            max_daily_sends=config.MAX_DAILY_EMAILS,
        )
        db.add(campaign)
        db.commit()
        return campaign

    def _get_daily_send_count(self, db, user_id: str) -> int:
        today = datetime.now(timezone.utc).date()
        return db.query(Application).filter(
            Application.user_id == user_id,
            Application.status == "email_sent",
            Application.applied_at >= datetime(today.year, today.month, today.day, tzinfo=timezone.utc),
        ).count()

    def _log_event(self, db, application_id, event_type, message, details=None):
        if application_id:
            log = ApplicationLog(
                application_id=application_id,
                event_type=event_type,
                message=message,
                details=details or {},
            )
            db.add(log)


# ── CLI Entry Point ──
async def main():
    """Run the pipeline once (called from cron/GitHub Actions)."""
    init_db()
    orchestrator = PipelineOrchestrator()
    await orchestrator.run_full_pipeline()


if __name__ == "__main__":
    asyncio.run(main())
