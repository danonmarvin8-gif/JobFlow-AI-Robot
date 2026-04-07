"""
JobFlow-AI — AI CV Generator
Uses Google Gemini Free Tier to tailor CVs for each job offer.
"""

import json
import logging
from pathlib import Path
from typing import Optional

from config import config

logger = logging.getLogger(__name__)


class CVGenerator:
    """
    Generates a tailored CV using Gemini AI (free tier: 15 RPM, 1500 req/day).
    Takes a base CV JSON and adapts it to a specific job offer.
    """

    def __init__(self):
        self.model_name = config.GEMINI_MODEL

    async def generate_tailored_cv(
        self,
        base_cv: dict,
        job_title: str,
        company_name: str,
        job_description: str,
        required_skills: list[str],
        offer_type: str = "alternance",
    ) -> dict:
        """
        Generate a tailored CV JSON adapted to the job offer.
        Returns: {tailored_cv_data, modifications_summary, prompt_used}
        """
        import google.generativeai as genai

        if not config.GEMINI_API_KEY:
            logger.warning("[AI] No Gemini API key — returning base CV unchanged")
            return {
                "tailored_cv_data": base_cv,
                "modifications_summary": "CV non modifié (clé API manquante)",
                "prompt_used": "",
            }

        genai.configure(api_key=config.GEMINI_API_KEY)
        model = genai.GenerativeModel(self.model_name)

        prompt = self._build_cv_prompt(
            base_cv, job_title, company_name,
            job_description, required_skills, offer_type
        )

        try:
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=4000,
                    response_mime_type="application/json",
                ),
            )

            result_text = response.text.strip()

            # Parse JSON response
            try:
                tailored_cv = json.loads(result_text)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                import re
                json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', result_text)
                if json_match:
                    tailored_cv = json.loads(json_match.group(1))
                else:
                    logger.error("[AI] Failed to parse CV response as JSON")
                    tailored_cv = base_cv

            # Generate modifications summary
            summary = self._generate_diff_summary(base_cv, tailored_cv, company_name)

            return {
                "tailored_cv_data": tailored_cv,
                "modifications_summary": summary,
                "prompt_used": prompt[:500] + "...",
            }

        except Exception as e:
            logger.error(f"[AI] CV generation error: {e}")
            return {
                "tailored_cv_data": base_cv,
                "modifications_summary": f"Erreur de génération: {str(e)}",
                "prompt_used": prompt[:500],
            }

    def _build_cv_prompt(
        self,
        base_cv: dict,
        job_title: str,
        company_name: str,
        job_description: str,
        required_skills: list[str],
        offer_type: str,
    ) -> str:
        """Build the prompt for CV tailoring."""

        offer_type_label = {
            "alternance": "une alternance",
            "job_etudiant": "un job étudiant",
            "stage": "un stage",
        }.get(offer_type, "une alternance")

        return f"""Tu es un expert en recrutement IT et en rédaction de CV professionnels en France.

**MISSION** : Adapte ce CV JSON pour qu'il corresponde parfaitement à l'offre d'emploi suivante.

## OFFRE D'EMPLOI
- **Poste** : {job_title}
- **Entreprise** : {company_name}
- **Type** : {offer_type_label}
- **Compétences demandées** : {', '.join(required_skills) if required_skills else 'Non spécifiées'}
- **Description** : {job_description[:1500] if job_description else 'Non disponible'}

## CV DE BASE (JSON)
```json
{json.dumps(base_cv, ensure_ascii=False, indent=2)}
```

## RÈGLES D'ADAPTATION
1. **Titre du CV** : Adapte `personal.title` pour refléter le poste visé chez {company_name}
2. **Profil** : Réécris le profil pour mentionner {company_name} et le poste, en 2-3 phrases maximum
3. **Compétences** : Réorganise et mets en avant les compétences techniques qui correspondent aux `required_skills` de l'offre
4. **Projets** : Mets en premier les projets les plus pertinents pour le poste
5. **Format** : Conserve EXACTEMENT la même structure JSON
6. **Authenticité** : Ne rajoute PAS de compétences ou expériences que le candidat n'a pas
7. **Mots-clés** : Intègre naturellement les mots-clés de l'offre dans le profil et les compétences
8. **Cohérence** : Le CV doit rester crédible pour un étudiant en BTS SIO 1ère année

## FORMAT DE SORTIE
Retourne uniquement le JSON du CV adapté, sans explication ni commentaire.
La structure doit être identique au CV de base."""

    def _generate_diff_summary(self, base: dict, tailored: dict, company: str) -> str:
        """Generate a human-readable summary of what changed."""
        changes = []

        # Check title change
        base_title = base.get("personal", {}).get("title", "")
        new_title = tailored.get("personal", {}).get("title", "")
        if base_title != new_title:
            changes.append(f"Titre adapté pour {company}")

        # Check profile change
        base_profile = base.get("profile", "")
        new_profile = tailored.get("profile", "")
        if base_profile != new_profile:
            changes.append("Profil personnalisé")

        # Check skills reordering
        base_skills = base.get("hard_skills", {})
        new_skills = tailored.get("hard_skills", {})
        if base_skills != new_skills:
            changes.append("Compétences réorganisées")

        # Check projects reordering
        base_projects = base.get("projects", {})
        new_projects = tailored.get("projects", {})
        if base_projects != new_projects:
            changes.append("Projets réordonnés par pertinence")

        if not changes:
            changes.append("Aucune modification significative")

        return " | ".join(changes)
