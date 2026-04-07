# 🚀 JobFlow-AI

**Système automatisé de candidature 24/7** pour alternances et jobs étudiants en support informatique.

![Dashboard](https://img.shields.io/badge/Dashboard-Premium%20Dark%20Mode-6366f1)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-a855f7)
![Status](https://img.shields.io/badge/Status-Active%2024%2F7-22c55e)

## ✨ Fonctionnalités

- 🔍 **Scraping automatique** — Indeed, LinkedIn, Welcome to the Jungle
- 🕵️ **OSINT** — Détection automatique des emails RH (Hunter.io + patterns)
- 🤖 **IA** — CV sur mesure + emails personnalisés (Google Gemini)
- 📧 **Envoi automatique** — Emails avec CV PDF en pièce jointe (Brevo)
- 📊 **Dashboard** — Suivi temps réel des candidatures
- 🛡️ **Anti-ban** — Proxies, délais humains, rotation User-Agent
- 📍 **Géolocalisation** — Paris & quartiers chics en priorité

## 🏗️ Stack

| Composant | Technologie | Coût |
|-----------|------------|------|
| Frontend | HTML/CSS/JS (Dashboard premium) | Gratuit |
| Backend | Python FastAPI | Gratuit |
| IA | Google Gemini Flash | Gratuit (1500 req/j) |
| OSINT | Hunter.io | Gratuit (25/mois) |
| Email | Brevo SMTP | Gratuit (300/j) |
| Scraping | Playwright | Gratuit |
| Automation | GitHub Actions | Gratuit |
| Database | SQLite | Gratuit |

## 🚀 Démarrage rapide

### 1. Cloner & configurer

```bash
git clone https://github.com/bottimarvin-a11y/JobFlow-AI.git
cd JobFlow-AI
cp .env.example .env
# Remplir les clés API dans .env
```

### 2. Installer les dépendances

```bash
cd server
pip install -r requirements.txt
playwright install chromium
```

### 3. Lancer en local

```bash
# Terminal 1 — API Backend
cd server && python main.py

# Terminal 2 — L'API sert aussi le dashboard sur http://localhost:8000
```

### 4. Activer le 24/7 (GitHub Actions)

1. Va dans les **Settings** de ton repo GitHub
2. **Secrets and variables** → **Actions** → Ajouter :
   - `GEMINI_API_KEY`
   - `HUNTER_API_KEY`
   - `BREVO_SMTP_LOGIN`
   - `BREVO_SMTP_PASSWORD`
   - `SENDER_EMAIL`
3. Le workflow s'exécute automatiquement toutes les 15 minutes

## 📁 Structure

```
JobFlow-AI/
├── dashboard/           # Frontend premium dark-mode
│   ├── index.html
│   ├── style.css
│   └── app.js
├── server/              # Backend Python
│   ├── main.py          # FastAPI
│   ├── config.py        # Configuration
│   ├── models/          # SQLAlchemy ORM
│   ├── scrapers/        # Indeed, LinkedIn, WTTJ
│   ├── osint/           # Email finder
│   ├── tailoring/       # CV generator, Email writer, PDF
│   └── tasks/           # Orchestrator, Email sender
├── .github/workflows/   # GitHub Actions (cron 24/7)
├── cv_data.json         # CV de base en JSON
└── .env.example         # Template des variables
```

## ⚠️ Avertissements

- Respecte les CGU des sites scrapés
- Inclus un lien de désinscription dans les emails
- Limite le volume d'envoi pour éviter le blacklisting
- Configure SPF/DKIM/DMARC sur ton domaine d'envoi

---

**Made with 💜 by Marvin BOTTI DANON — Powered by AntiGravity AI**
