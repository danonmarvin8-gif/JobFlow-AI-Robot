"""
JobFlow-AI — Email Dispatcher
Sends personalized application emails via Brevo SMTP (free: 300/day).
"""

import logging
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

from config import config

logger = logging.getLogger(__name__)


class EmailDispatcher:
    """
    Sends application emails with attached CV PDFs.
    Uses Brevo SMTP relay (free tier: 300 emails/day).
    """

    def send_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        body_html: str,
        body_plain: str,
        cv_pdf_path: Optional[str] = None,
    ) -> dict:
        """
        Send an email with optional CV attachment.
        Returns: {success, message_id, error}
        """
        if not config.BREVO_SMTP_LOGIN or not config.BREVO_SMTP_PASSWORD:
            logger.warning("[Email] SMTP not configured — email not sent")
            return {
                "success": False,
                "message_id": None,
                "error": "SMTP credentials not configured",
            }

        try:
            # Build MIME message
            msg = MIMEMultipart("mixed")
            msg["From"] = f"{config.SENDER_NAME} <{config.SENDER_EMAIL}>"
            msg["To"] = f"{to_name} <{to_email}>" if to_name else to_email
            msg["Subject"] = subject
            msg["Reply-To"] = config.SENDER_EMAIL

            # Add custom headers for tracking
            msg["X-JobFlow-AI"] = "automated-application"

            # Create alternative part (plain + HTML)
            alt_part = MIMEMultipart("alternative")
            alt_part.attach(MIMEText(body_plain, "plain", "utf-8"))
            alt_part.attach(MIMEText(body_html, "html", "utf-8"))
            msg.attach(alt_part)

            # Attach CV PDF if provided
            if cv_pdf_path:
                pdf_path = Path(cv_pdf_path)
                if pdf_path.exists() and pdf_path.suffix.lower() == ".pdf":
                    with open(pdf_path, "rb") as f:
                        pdf_attachment = MIMEApplication(f.read(), _subtype="pdf")
                        pdf_attachment.add_header(
                            "Content-Disposition",
                            "attachment",
                            filename=pdf_path.name,
                        )
                        msg.attach(pdf_attachment)
                    logger.info(f"[Email] Attached CV: {pdf_path.name}")
                elif pdf_path.exists() and pdf_path.suffix.lower() == ".html":
                    # If WeasyPrint wasn't available, attach HTML version
                    with open(pdf_path, "rb") as f:
                        html_attachment = MIMEApplication(f.read(), _subtype="html")
                        html_attachment.add_header(
                            "Content-Disposition",
                            "attachment",
                            filename=pdf_path.name,
                        )
                        msg.attach(html_attachment)

            # Send via Brevo SMTP
            with smtplib.SMTP(config.BREVO_SMTP_SERVER, config.BREVO_SMTP_PORT) as server:
                server.starttls()
                server.login(config.BREVO_SMTP_LOGIN, config.BREVO_SMTP_PASSWORD)
                result = server.send_message(msg)

            message_id = msg.get("Message-ID", "")
            logger.info(f"[Email] Sent to {to_email} — Message-ID: {message_id}")

            return {
                "success": True,
                "message_id": message_id,
                "error": None,
            }

        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"[Email] SMTP auth failed: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": f"SMTP authentication failed: {str(e)}",
            }

        except smtplib.SMTPRecipientsRefused as e:
            logger.error(f"[Email] Recipient refused: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": f"Recipient refused: {str(e)}",
            }

        except Exception as e:
            logger.error(f"[Email] Send error: {e}")
            return {
                "success": False,
                "message_id": None,
                "error": str(e),
            }

    def test_connection(self) -> bool:
        """Test SMTP connection."""
        try:
            with smtplib.SMTP(config.BREVO_SMTP_SERVER, config.BREVO_SMTP_PORT) as server:
                server.starttls()
                server.login(config.BREVO_SMTP_LOGIN, config.BREVO_SMTP_PASSWORD)
                logger.info("[Email] SMTP connection test successful")
                return True
        except Exception as e:
            logger.error(f"[Email] Connection test failed: {e}")
            return False
