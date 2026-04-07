"""
JobFlow-AI — FastAPI Backend
REST API for the dashboard + webhook endpoints.
"""

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from config import config
from models import (
    Application, BaseCV, Campaign, Company, CompanyContact,
    GeneratedCV, GeneratedEmail, JobOffer, SessionLocal,
    User, init_db, get_db,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Initialize DB ──
init_db()

# ── Create FastAPI App ──
app = FastAPI(
    title="JobFlow-AI",
    description="Automated job application system for IT support positions",
    version="1.0.0",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Serve Dashboard ──
dashboard_path = Path(__file__).parent.parent / "dashboard"
if dashboard_path.exists():
    app.mount("/static", StaticFiles(directory=str(dashboard_path)), name="static")


# ═══════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════

@app.get("/")
async def root():
    """Serve the dashboard."""
    index_path = dashboard_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "JobFlow-AI API", "version": "1.0.0"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


# ── Stats ──
@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    total_offers = db.query(JobOffer).filter_by(is_active=True).count()
    total_sent = db.query(Application).filter_by(status="email_sent").count()
    total_opened = db.query(Application).filter_by(status="opened").count()
    total_replied = db.query(Application).filter_by(status="replied").count()
    total_pending = db.query(Application).filter_by(status="pending").count()
    total_errors = db.query(Application).filter_by(status="error").count()

    return {
        "offers_scraped": total_offers,
        "emails_sent": total_sent,
        "emails_opened": total_opened,
        "replies": total_replied,
        "pending": total_pending,
        "errors": total_errors,
    }


# ── Offers ──
@app.get("/api/offers")
async def list_offers(
    offer_type: Optional[str] = None,
    source: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List job offers with optional filters."""
    query = db.query(JobOffer).filter_by(is_active=True)

    if offer_type and offer_type != "all":
        query = query.filter_by(offer_type=offer_type)
    if source and source != "all":
        query = query.filter_by(source_platform=source)

    # Prioritize preferred locations
    offers = query.order_by(
        JobOffer.location_score.desc(),
        JobOffer.scraped_at.desc(),
    ).offset(offset).limit(limit).all()

    return [
        {
            "id": o.id,
            "title": o.title,
            "company": o.company.name if o.company else "Unknown",
            "location": o.location,
            "offer_type": o.offer_type,
            "source_platform": o.source_platform,
            "source_url": o.source_url,
            "required_skills": o.required_skills or [],
            "posted_at": str(o.posted_at) if o.posted_at else None,
            "location_score": o.location_score,
        }
        for o in offers
    ]


# ── Applications ──
@app.get("/api/applications")
async def list_applications(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List applications with status filter."""
    query = db.query(Application)

    if status and status != "all":
        query = query.filter_by(status=status)

    apps = query.order_by(Application.created_at.desc()).limit(limit).all()

    return [
        {
            "id": a.id,
            "company": a.offer.company.name if a.offer and a.offer.company else "Unknown",
            "title": a.offer.title if a.offer else "Unknown",
            "contact_name": a.contact.full_name if a.contact else None,
            "contact_email": a.contact.email if a.contact else None,
            "status": a.status,
            "cv_pdf": a.generated_cv.pdf_path if a.generated_cv else None,
            "email_subject": a.generated_email.subject if a.generated_email else None,
            "applied_at": str(a.applied_at) if a.applied_at else None,
            "created_at": str(a.created_at),
        }
        for a in apps
    ]


# ── CV Management ──
@app.get("/api/cvs")
async def list_cvs(db: Session = Depends(get_db)):
    """List base CVs."""
    cvs = db.query(BaseCV).all()
    return [
        {
            "id": cv.id,
            "label": cv.label,
            "target_type": cv.target_type,
            "is_active": cv.is_active,
            "created_at": str(cv.created_at),
        }
        for cv in cvs
    ]


@app.post("/api/cvs/upload")
async def upload_cv(
    file: UploadFile = File(...),
    label: str = "CV Alternance Support IT",
    target_type: str = "alternance",
    db: Session = Depends(get_db),
):
    """Upload a new base CV (JSON format)."""
    if not file.filename.endswith(".json"):
        raise HTTPException(400, "Only JSON CV files are accepted")

    content = await file.read()
    try:
        cv_data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid JSON file")

    user = db.query(User).first()
    if not user:
        user = User(email="Bottimarvin@gmail.com", full_name="Marvin BOTTI DANON")
        db.add(user)
        db.commit()

    cv = BaseCV(
        user_id=user.id,
        label=label,
        target_type=target_type,
        cv_data=cv_data,
        is_active=True,
    )
    db.add(cv)
    db.commit()

    return {"id": cv.id, "message": "CV uploaded successfully"}


# ── Campaign Control ──
@app.post("/api/campaign/toggle")
async def toggle_campaign(db: Session = Depends(get_db)):
    """Start or pause the active campaign."""
    user = db.query(User).first()
    if not user:
        raise HTTPException(404, "No user found")

    campaign = db.query(Campaign).filter_by(
        user_id=user.id, status="active"
    ).first()

    if campaign:
        campaign.status = "paused"
        db.commit()
        return {"status": "paused", "message": "Campaign paused"}
    else:
        # Resume or create
        paused = db.query(Campaign).filter_by(
            user_id=user.id, status="paused"
        ).first()

        if paused:
            paused.status = "active"
            db.commit()
            return {"status": "active", "message": "Campaign resumed"}
        else:
            campaign = Campaign(
                user_id=user.id,
                name="Alternance Support IT — Paris",
                status="active",
                max_daily_sends=config.MAX_DAILY_EMAILS,
            )
            db.add(campaign)
            db.commit()
            return {"status": "active", "message": "New campaign created"}


@app.get("/api/campaign/status")
async def campaign_status(db: Session = Depends(get_db)):
    """Get current campaign status."""
    user = db.query(User).first()
    if not user:
        return {"active": False, "total_sent": 0}

    campaign = db.query(Campaign).filter_by(user_id=user.id).order_by(
        Campaign.started_at.desc()
    ).first()

    if not campaign:
        return {"active": False, "total_sent": 0}

    return {
        "active": campaign.status == "active",
        "name": campaign.name,
        "total_sent": campaign.total_sent or 0,
        "max_daily": campaign.max_daily_sends,
        "started_at": str(campaign.started_at),
    }


# ── Manual Pipeline Trigger ──
@app.post("/api/pipeline/run")
async def trigger_pipeline():
    """Manually trigger one pipeline cycle."""
    import asyncio
    from tasks.orchestrator import PipelineOrchestrator

    orchestrator = PipelineOrchestrator()

    # Run in background
    asyncio.create_task(orchestrator.run_full_pipeline())

    return {"message": "Pipeline triggered", "status": "running"}


# ═══════════════════════════════════════════════
# RUN
# ═══════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
