"""
JobFlow-AI — Database Models (SQLAlchemy ORM)
Supports both SQLite (local dev) and PostgreSQL (production)
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey, Integer,
    String, Text, UniqueConstraint, create_engine
)
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

from config import config

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


# ═══════════════════════════════════════════════
# USER
# ═══════════════════════════════════════════════
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    base_cvs = relationship("BaseCV", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="user", cascade="all, delete-orphan")


# ═══════════════════════════════════════════════
# BASE CV
# ═══════════════════════════════════════════════
class BaseCV(Base):
    __tablename__ = "base_cvs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(255), nullable=False)
    target_type = Column(String(50), nullable=False)  # alternance, job_etudiant, stage
    cv_data = Column(JSON, nullable=False)
    original_file_path = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="base_cvs")
    applications = relationship("Application", back_populates="base_cv")


# ═══════════════════════════════════════════════
# COMPANY
# ═══════════════════════════════════════════════
class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False)
    domain = Column(String(255))
    industry = Column(String(255))
    size_range = Column(String(50))
    linkedin_url = Column(String(500))
    website_url = Column(String(500))
    metadata_extra = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)

    offers = relationship("JobOffer", back_populates="company")
    contacts = relationship("CompanyContact", back_populates="company", cascade="all, delete-orphan")


# ═══════════════════════════════════════════════
# COMPANY CONTACT (HR / Recruiter)
# ═══════════════════════════════════════════════
class CompanyContact(Base):
    __tablename__ = "company_contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(255))
    email = Column(String(255))
    role = Column(String(100))  # RH, Manager IT, Recruteur
    linkedin_url = Column(String(500))
    osint_profile = Column(JSON, default=dict)  # tone, interests, recent posts
    source = Column(String(100))  # hunter.io, rocketreach, linkedin_scrape, pattern_guess
    confidence_score = Column(Float, default=0.0)
    discovered_at = Column(DateTime, default=utcnow)

    company = relationship("Company", back_populates="contacts")
    applications = relationship("Application", back_populates="contact")


# ═══════════════════════════════════════════════
# JOB OFFER
# ═══════════════════════════════════════════════
class JobOffer(Base):
    __tablename__ = "job_offers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"))
    title = Column(String(500), nullable=False)
    offer_type = Column(String(50), nullable=False)  # alternance, job_etudiant, stage
    source_platform = Column(String(50), nullable=False)  # linkedin, indeed, wttj
    source_url = Column(String(1000), unique=True, nullable=False)
    description = Column(Text)
    location = Column(String(255))
    contract_duration = Column(String(100))
    posted_at = Column(DateTime)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    salary_range = Column(String(100))
    required_skills = Column(JSON, default=list)
    extracted_keywords = Column(JSON, default=list)
    location_score = Column(Integer, default=0)  # Higher = preferred area
    scraped_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    company = relationship("Company", back_populates="offers")
    applications = relationship("Application", back_populates="offer")


# ═══════════════════════════════════════════════
# CAMPAIGN
# ═══════════════════════════════════════════════
class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="active")  # active, paused, completed
    schedule_config = Column(JSON, default=lambda: {"cron": "*/15 * * * *", "active_hours": [8, 22]})
    max_daily_sends = Column(Integer, default=30)
    total_sent = Column(Integer, default=0)
    started_at = Column(DateTime, default=utcnow)
    paused_at = Column(DateTime)

    user = relationship("User", back_populates="campaigns")
    applications = relationship("Application", back_populates="campaign")
    filters = relationship("CampaignFilter", back_populates="campaign", cascade="all, delete-orphan")


class CampaignFilter(Base):
    __tablename__ = "campaign_filters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    filter_type = Column(String(100), nullable=False)
    filter_value = Column(String(500), nullable=False)

    campaign = relationship("Campaign", back_populates="filters")


# ═══════════════════════════════════════════════
# APPLICATION
# ═══════════════════════════════════════════════
class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("user_id", "offer_id", name="uq_user_offer"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offer_id = Column(String(36), ForeignKey("job_offers.id", ondelete="CASCADE"), nullable=False)
    base_cv_id = Column(String(36), ForeignKey("base_cvs.id", ondelete="SET NULL"))
    campaign_id = Column(String(36), ForeignKey("campaigns.id", ondelete="SET NULL"))
    contact_id = Column(String(36), ForeignKey("company_contacts.id", ondelete="SET NULL"))
    status = Column(String(50), default="pending")
    applied_at = Column(DateTime)
    opened_at = Column(DateTime)
    replied_at = Column(DateTime)
    retry_count = Column(Integer, default=0)
    error_message = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="applications")
    offer = relationship("JobOffer", back_populates="applications")
    base_cv = relationship("BaseCV", back_populates="applications")
    campaign = relationship("Campaign", back_populates="applications")
    contact = relationship("CompanyContact", back_populates="applications")
    generated_cv = relationship("GeneratedCV", back_populates="application", uselist=False, cascade="all, delete-orphan")
    generated_email = relationship("GeneratedEmail", back_populates="application", uselist=False, cascade="all, delete-orphan")
    logs = relationship("ApplicationLog", back_populates="application", cascade="all, delete-orphan")


# ═══════════════════════════════════════════════
# GENERATED CV
# ═══════════════════════════════════════════════
class GeneratedCV(Base):
    __tablename__ = "generated_cvs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    tailored_cv_data = Column(JSON, nullable=False)
    pdf_path = Column(String(500))
    ai_prompt_used = Column(Text)
    ai_modifications_summary = Column(Text)
    generated_at = Column(DateTime, default=utcnow)

    application = relationship("Application", back_populates="generated_cv")


# ═══════════════════════════════════════════════
# GENERATED EMAIL
# ═══════════════════════════════════════════════
class GeneratedEmail(Base):
    __tablename__ = "generated_emails"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    subject = Column(String(500), nullable=False)
    body_html = Column(Text, nullable=False)
    body_plain = Column(Text, nullable=False)
    tone = Column(String(50), default="semi-formel")
    personalization_data = Column(JSON, default=dict)
    message_id = Column(String(255))
    delivery_status = Column(String(50), default="queued")
    sent_at = Column(DateTime)

    application = relationship("Application", back_populates="generated_email")


# ═══════════════════════════════════════════════
# APPLICATION LOG
# ═══════════════════════════════════════════════
class ApplicationLog(Base):
    __tablename__ = "application_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    message = Column(Text)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=utcnow)

    application = relationship("Application", back_populates="logs")


# ═══════════════════════════════════════════════
# DATABASE ENGINE & SESSION
# ═══════════════════════════════════════════════
engine = create_engine(
    config.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in config.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for FastAPI — yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
