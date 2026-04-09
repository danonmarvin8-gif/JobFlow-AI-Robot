"""
JobFlow-AI — AI Email Writer
Generates personalized cold emails adapted to each HR contact's profile.
"""

import json
import logging
from typing import Optional

from config import config

logger = logging.getLogger(__name__)


class EmailWriter:
    """
    Generates personalized cold emails using Gemini AI.
    Adapts tone and content based on OSINT profile of the recruiter.
    """

    def __init__(self):
        self.model_name = config.GEMINI_MODEL

    async def generate_email(
        self,
        job_title: str,
        company_name: str,
        offer_type: str,
        hr_name: str,
        hr_role: str,
        hr_email: str,
        osint_profile: dict,
        candidate_strengths: list[str],
        job_description: str = "",
    ) -> dict:
        """
        Generate a personalized cold email.
        Returns: {subject, body_html, body_plain, tone, personalization_data}
        """
        import google.generativeai as genai

        if not config.GEMINI_API_KEY:
            logger.warning("[AI] No Gemini API key — using template email")
            return self._template_email(
                job_title, company_name, offer_type,
                hr_name, hr_role
            )

        genai.configure(api_key=config.GEMINI_API_KEY)
        model = genai.GenerativeModel(self.model_name)

        # Determine tone from OSINT
        tone = self._determine_tone(osint_profile)

        prompt = self._build_email_prompt(
            job_title, company_name, offer_type,
            hr_name, hr_role, hr_email, osint_profile,
            candidate_strengths, tone, job_description
        )

        try:
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.8,
                    max_output_tokens=1500,
                    response_mime_type="application/json",
                ),
            )

            result_text = response.text.strip()

            try:
                email_data = json.loads(result_text)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', result_text)
                if json_match:
                    email_data = json.loads(json_match.group(1))
                else:
                    return self._template_email(
                        job_title, company_name, offer_type,
                        hr_name, hr_role
                    )

            return {
                "subject": email_data.get("subject", f"Candidature {offer_type} — {job_title}"),
                "body_html": self._plain_to_html(email_data.get("body", "")),
                "body_plain": email_data.get("body", ""),
                "tone": tone,
                "personalization_data": {
                    "hr_name": hr_name,
                    "hr_role": hr_role,
                    "osint_used": list(osint_profile.keys()),
                    "tone_chosen": tone,
                },
            }

        except Exception as e:
            logger.error(f"[AI] Email generation error: {e}")
            return self._template_email(
                job_title, company_name, offer_type,
                hr_name, hr_role
            )

    def _build_email_prompt(
        self,
        job_title: str,
        company_name: str,
        offer_type: str,
        hr_name: str,
        hr_role: str,
        hr_email: str,
        osint_profile: dict,
        strengths: list[str],
        tone: str,
        job_description: str,
    ) -> str:
        """Build the email generation prompt."""

        type_label = {
            "alternance": "alternance (rythme 2j CFA / 3j entreprise)",
            "job_etudiant": "job étudiant",
            "stage": "stage",
        }.get(offer_type, "alternance")

        osint_info = ""
        if osint_profile:
            if osint_profile.get("position"):
                osint_info += f"- Poste actuel : {osint_profile['position']}\n"
            if osint_profile.get("interests"):
                osint_info += f"- Centres d'intérêt : {', '.join(osint_profile['interests'])}\n"
            if osint_profile.get("tone_detected"):
                osint_info += f"- Ton détecté dans ses posts : {osint_profile['tone_detected']}\n"
            if osint_profile.get("recent_topics"):
                osint_info += f"- Sujets récents : {', '.join(osint_profile['recent_topics'])}\n"

        tone_instructions = {
            "formel": "Utilise un ton professionnel et respectueux, vouvoiement, phrases bien structurées.",
            "semi-formel": "Utilise un ton professionnel mais chaleureux, vouvoiement, phrases directes et engageantes.",
            "decontracte": "Utilise un ton dynamique et enthousiaste, tout en gardant le vouvoiement. Sois percutant.",
        }

        return f"""Tu es un expert en cold emailing de candidature professionnel en France.

**MISSION** : Rédige un e-mail de candidature spontanée court, percutant et personnalisé.

## CONTEXTE
- **Candidat** : Marvin BOTTI DANON, étudiant en BTS SIO 1ère année (INGETIS Paris)
- **Recherche** : {type_label}
- **Poste visé** : {job_title} chez {company_name}
- **Points forts** : {', '.join(strengths) if strengths else 'Windows, MacOS, Ubuntu, DHCP, DNS, routage, VLan, VM, HTML/CSS/JS, SQL'}

## DESTINATAIRE
- **Nom** : {hr_name if hr_name else 'Responsable du recrutement'}
- **Rôle** : {hr_role}
- **E-mail** : {hr_email}

## PROFIL OSINT DU DESTINATAIRE
{osint_info if osint_info else '- Aucune information OSINT disponible'}

## DESCRIPTION DU POSTE
{job_description[:800] if job_description else 'Non disponible'}

## TON À UTILISER
{tone_instructions.get(tone, tone_instructions['semi-formel'])}

## RÈGLES STRICTES
1. **Maximum 150 mots** pour le corps de l'e-mail
2. **Objet accrocheur** de maximum 60 caractères
3. **Personnalise** avec un élément du profil OSINT si disponible
4. **Montre une valeur ajoutée** concrète (pas de phrases génériques)
5. **Mentionne le rythme** d'alternance si applicable
6. **Inclus un call-to-action** clair (proposition d'entretien, appel)
7. **Ne pas mentionner** que l'info vient d'OSINT (naturel et organique)
8. **Signature** : Marvin BOTTI DANON | BTS SIO — INGETIS Paris | 06 27 23 68 48

## FORMAT DE SORTIE (JSON)
{{
    "subject": "Objet de l'e-mail",
    "body": "Corps de l'e-mail en texte brut avec retours à la ligne"
}}"""

    def _determine_tone(self, osint_profile: dict) -> str:
        """Determine the appropriate email tone based on OSINT data."""
        if not osint_profile:
            return "semi-formel"

        tone = osint_profile.get("tone_detected", "").lower()
        position = osint_profile.get("position", "").lower()

        # Directors/executives → formal
        if any(kw in position for kw in ["directeur", "director", "vp", "président", "drh"]):
            return "formel"

        # Startups, tech companies → casual
        if any(kw in tone for kw in ["décontracté", "casual", "startup", "tech"]):
            return "decontracte"

        # Talent acquisition, young recruiters → semi-formal
        if any(kw in position for kw in ["talent", "chargé", "junior"]):
            return "semi-formel"

        return "semi-formel"

    def _template_email(
        self,
        job_title: str,
        company_name: str,
        offer_type: str,
        hr_name: str,
        hr_role: str,
    ) -> dict:
        """Fallback template email when AI is not available."""
        greeting = f"Bonjour {hr_name}" if hr_name and hr_name != "Service Recrutement" else "Bonjour"

        type_label = {
            "alternance": "un contrat d'alternance",
            "job_etudiant": "un poste étudiant",
            "stage": "un stage",
        }.get(offer_type, "un contrat d'alternance")

        body = f"""{greeting},

Actuellement en première année de BTS SIO à INGETIS Paris, je suis à la recherche de {type_label} en tant que {job_title}.

Votre offre chez {company_name} a retenu toute mon attention. Mes compétences en administration Windows/MacOS, protocoles réseau (DHCP, DNS, routage) et support utilisateur correspondent à vos besoins.

Disponible selon un rythme de 2 jours en CFA et 3 jours en entreprise, je serais ravi d'échanger avec vous lors d'un entretien.

Vous trouverez mon CV en pièce jointe.

Cordialement,

Marvin BOTTI DANON
BTS SIO — INGETIS Paris
06 27 23 68 48"""

        return {
            "subject": f"Candidature {offer_type} — {job_title} | Marvin BOTTI DANON",
            "body_html": self._plain_to_html(body),
            "body_plain": body,
            "tone": "semi-formel",
            "personalization_data": {"template": True},
        }

    def _plain_to_html(self, text: str) -> str:
        """Convert plain text email to simple HTML."""
        import html as html_module

        escaped = html_module.escape(text)
        paragraphs = escaped.split("\n\n")
        html_parts = []

        for p in paragraphs:
            lines = p.split("\n")
            html_parts.append("<p>" + "<br>".join(lines) + "</p>")

        body_html = "\n".join(html_parts)

        return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 600px;">
{body_html}
</body>
</html>"""
