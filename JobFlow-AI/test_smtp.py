
import smtplib
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(ENV_PATH)

def test_smtp():
    host = "smtp-relay.brevo.com"
    port = 587
    user = os.getenv("BREVO_SMTP_LOGIN")
    pwd = os.getenv("BREVO_SMTP_PASSWORD")
    
    print(f"Testing SMTP with user: {user}")
    try:
        server = smtplib.SMTP(host, port)
        server.starttls()
        server.login(user, pwd)
        print("✅ SMTP Login Successful!")
        server.quit()
    except Exception as e:
        print(f"❌ SMTP Login Failed: {e}")

if __name__ == "__main__":
    test_smtp()
