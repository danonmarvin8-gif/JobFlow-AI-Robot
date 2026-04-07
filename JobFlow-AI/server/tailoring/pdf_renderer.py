"""
JobFlow-AI — PDF CV Renderer
Generates a premium PDF CV from tailored JSON data using HTML/CSS + WeasyPrint.
"""

import logging
from pathlib import Path
from datetime import datetime

from jinja2 import Template

from config import config

logger = logging.getLogger(__name__)

# ── Premium CV HTML Template ──
CV_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

@page {
    size: A4;
    margin: 0;
}

body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.5;
    color: #1a1a2e;
    background: white;
}

.cv-container {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: 297mm;
}

/* ── Left Sidebar ── */
.sidebar {
    background: #0f0f23;
    color: #e0e0f0;
    padding: 32px 20px;
}

.photo-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28pt;
    font-weight: 700;
    color: white;
    letter-spacing: 1px;
}

.sidebar h2 {
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #a78bfa;
    margin: 24px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #2d2d4a;
}

.sidebar .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 8pt;
    line-height: 1.4;
    color: #c0c0d8;
    word-break: break-all;
}

.sidebar .contact-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    margin-top: 1px;
    opacity: 0.7;
}

.skill-group {
    margin-bottom: 12px;
}

.skill-group-title {
    font-size: 7.5pt;
    font-weight: 600;
    color: #e0e0f0;
    margin-bottom: 6px;
}

.skill-tag {
    display: inline-block;
    background: rgba(99, 102, 241, 0.2);
    color: #c4b5fd;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 7pt;
    margin: 2px 2px;
    border: 1px solid rgba(99, 102, 241, 0.15);
}

.soft-skill {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 8pt;
    color: #c0c0d8;
}

.soft-skill::before {
    content: "◆";
    color: #a78bfa;
    font-size: 5pt;
}

.language-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 8pt;
}

.language-level {
    color: #a78bfa;
    font-weight: 500;
}

.certification-item {
    font-size: 8pt;
    color: #c0c0d8;
    margin-bottom: 4px;
    padding-left: 12px;
    position: relative;
}

.certification-item::before {
    content: "✓";
    position: absolute;
    left: 0;
    color: #22c55e;
    font-weight: 700;
}

/* ── Main Content ── */
.main {
    padding: 32px 28px;
}

.header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #6366f1;
}

.header h1 {
    font-size: 20pt;
    font-weight: 800;
    color: #0f0f23;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
}

.header .subtitle {
    font-size: 11pt;
    color: #6366f1;
    font-weight: 600;
    margin-bottom: 4px;
}

.header .rhythm {
    font-size: 8pt;
    color: #666;
    font-style: italic;
}

.profile-text {
    font-size: 9pt;
    line-height: 1.6;
    color: #444;
    margin-bottom: 24px;
    padding: 12px 16px;
    background: #f8f7ff;
    border-left: 3px solid #6366f1;
    border-radius: 0 6px 6px 0;
}

.section {
    margin-bottom: 20px;
}

.section h2 {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #0f0f23;
    margin-bottom: 12px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e5f0;
}

.education-item {
    margin-bottom: 14px;
    position: relative;
    padding-left: 16px;
}

.education-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6366f1;
}

.education-item .school {
    font-weight: 600;
    font-size: 9.5pt;
    color: #1a1a2e;
}

.education-item .diploma {
    font-size: 8.5pt;
    color: #444;
}

.education-item .period {
    font-size: 7.5pt;
    color: #888;
    font-weight: 500;
}

.education-item .courses {
    font-size: 7.5pt;
    color: #666;
    margin-top: 2px;
}

.project-group {
    margin-bottom: 12px;
}

.project-group-title {
    font-size: 8.5pt;
    font-weight: 600;
    color: #6366f1;
    margin-bottom: 6px;
}

.project-item {
    font-size: 8pt;
    color: #444;
    padding-left: 14px;
    position: relative;
    margin-bottom: 3px;
}

.project-item::before {
    content: "›";
    position: absolute;
    left: 4px;
    color: #a78bfa;
    font-weight: 700;
}

.tools-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.tool-tag {
    display: inline-block;
    background: #f0f0ff;
    color: #4338ca;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 7.5pt;
    border: 1px solid #e0e0f5;
}

.hobbies-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.hobby-tag {
    font-size: 8pt;
    color: #666;
    padding: 3px 10px;
    background: #fafafa;
    border-radius: 12px;
    border: 1px solid #eee;
}
</style>
</head>
<body>
<div class="cv-container">
    <!-- SIDEBAR -->
    <div class="sidebar">
        <div class="photo-placeholder">{{ initials }}</div>

        <h2>Contact</h2>
        <div class="contact-item">
            <span>📞</span>
            <span>{{ cv.personal.phone }}</span>
        </div>
        <div class="contact-item">
            <span>✉️</span>
            <span>{{ cv.personal.email }}</span>
        </div>
        <div class="contact-item">
            <span>📍</span>
            <span>{{ cv.personal.location }}</span>
        </div>
        {% if cv.personal.linkedin %}
        <div class="contact-item">
            <span>🔗</span>
            <span>LinkedIn</span>
        </div>
        {% endif %}
        {% if cv.personal.portfolio %}
        <div class="contact-item">
            <span>💼</span>
            <span>{{ cv.personal.portfolio }}</span>
        </div>
        {% endif %}

        <h2>Compétences</h2>
        {% if cv.hard_skills.reseaux_systemes %}
        <div class="skill-group">
            <div class="skill-group-title">Réseaux & Systèmes</div>
            {% for skill in cv.hard_skills.reseaux_systemes %}
            <span class="skill-tag">{{ skill }}</span>
            {% endfor %}
        </div>
        {% endif %}

        {% if cv.hard_skills.developpement %}
        <div class="skill-group">
            <div class="skill-group-title">Développement</div>
            {% for skill in cv.hard_skills.developpement %}
            <span class="skill-tag">{{ skill }}</span>
            {% endfor %}
        </div>
        {% endif %}

        <h2>Soft Skills</h2>
        {% for skill in cv.soft_skills %}
        <div class="soft-skill">{{ skill }}</div>
        {% endfor %}

        <h2>Langues</h2>
        {% for lang in cv.personal.languages %}
        <div class="language-item">
            <span>{{ lang.language }}</span>
            <span class="language-level">{{ lang.level }}</span>
        </div>
        {% endfor %}

        {% if cv.certifications %}
        <h2>Certifications</h2>
        {% for cert in cv.certifications %}
        <div class="certification-item">{{ cert }}</div>
        {% endfor %}
        {% endif %}
    </div>

    <!-- MAIN -->
    <div class="main">
        <div class="header">
            <h1>{{ cv.personal.full_name }}</h1>
            <div class="subtitle">{{ cv.personal.title }}</div>
            {% if cv.personal.rhythm %}
            <div class="rhythm">{{ cv.personal.rhythm }}</div>
            {% endif %}
        </div>

        <div class="profile-text">{{ cv.profile }}</div>

        <div class="section">
            <h2>Formation & Diplômes</h2>
            {% for edu in cv.education %}
            <div class="education-item">
                <div class="period">{{ edu.period }}</div>
                <div class="school">{{ edu.school }}{% if edu.location %} — {{ edu.location }}{% endif %}</div>
                <div class="diploma">{{ edu.diploma }}{% if edu.status %} ({{ edu.status }}){% endif %}</div>
                {% if edu.courses %}
                <div class="courses">{{ edu.courses | join(', ') }}</div>
                {% endif %}
            </div>
            {% endfor %}
        </div>

        <div class="section">
            <h2>Projets & TP Réalisés</h2>

            {% if cv.projects.developpement %}
            <div class="project-group">
                <div class="project-group-title">Développement</div>
                {% for p in cv.projects.developpement %}
                <div class="project-item">{{ p }}</div>
                {% endfor %}
            </div>
            {% endif %}

            {% if cv.projects.reseaux_systemes %}
            <div class="project-group">
                <div class="project-group-title">Réseaux & Systèmes</div>
                {% for p in cv.projects.reseaux_systemes %}
                <div class="project-item">{{ p }}</div>
                {% endfor %}
            </div>
            {% endif %}
        </div>

        {% if cv.hard_skills.outils %}
        <div class="section">
            <h2>Outils & Logiciels</h2>
            <div class="tools-list">
                {% for tool in cv.hard_skills.outils %}
                <span class="tool-tag">{{ tool }}</span>
                {% endfor %}
            </div>
        </div>
        {% endif %}

        {% if cv.hobbies %}
        <div class="section">
            <h2>Centres d'intérêt</h2>
            <div class="hobbies-list">
                {% for hobby in cv.hobbies %}
                <span class="hobby-tag">{{ hobby }}</span>
                {% endfor %}
            </div>
        </div>
        {% endif %}
    </div>
</div>
</body>
</html>
"""


class PDFRenderer:
    """Renders tailored CV JSON to a premium PDF using WeasyPrint."""

    def render(self, cv_data: dict, output_filename: str = None) -> str:
        """
        Render CV JSON to PDF.
        Returns the path to the generated PDF file.
        """
        if output_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            company = cv_data.get("personal", {}).get("title", "cv").split(" ")[-1]
            output_filename = f"CV_Marvin_BOTTI_DANON_{company}_{timestamp}.pdf"

        output_path = config.STORAGE_DIR / output_filename

        # Generate initials
        name = cv_data.get("personal", {}).get("full_name", "MB")
        initials = "".join([part[0] for part in name.split()[:2]]).upper()

        # Render HTML
        template = Template(CV_TEMPLATE)
        html_content = template.render(cv=cv_data, initials=initials)

        try:
            from weasyprint import HTML
            HTML(string=html_content).write_pdf(str(output_path))
            logger.info(f"[PDF] Generated CV: {output_path}")
            return str(output_path)
        except ImportError:
            # Fallback: save as HTML if WeasyPrint not installed
            html_path = output_path.with_suffix(".html")
            html_path.write_text(html_content, encoding="utf-8")
            logger.warning(f"[PDF] WeasyPrint not installed — saved HTML: {html_path}")
            return str(html_path)
        except Exception as e:
            logger.error(f"[PDF] Generation error: {e}")
            # Save HTML as fallback
            html_path = output_path.with_suffix(".html")
            html_path.write_text(html_content, encoding="utf-8")
            return str(html_path)
