/**
 *  ██╗   ██╗███████╗ ██████╗███╗   ██╗ █████╗   v2.0
 *  VECNA AI — Powered by Gemini · Portfolio Marvin Botti
 *
 *  ══════════════════════════════════════════════════
 *  CONFIGURATION — REMPLIR ICI
 *  ══════════════════════════════════════════════════
 *
 *  GEMINI API (intelligence générale gratuite) :
 *  1. Aller sur https://aistudio.google.com/apikey
 *  2. Créer une clé gratuite (aucune CB requise)
 *  3. Coller la clé dans GEMINI_API_KEY ci-dessous
 *
 *  EMAILJS (formulaire de contact) :
 *  1. Créer un compte sur https://www.emailjs.com
 *  2. Ajouter un service Gmail + un template
 *  3. Remplir les 3 champs ci-dessous
 */

(function () {
    'use strict';

    /* ── GEMINI CONFIG ── */
    const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
    const GEMINI_MODEL = 'gemini-2.0-flash-lite';
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    /* ── EMAILJS CONFIG ── */
    const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
    const CONTACT_EMAIL = 'bottimarvin@gmail.com';

    /* ── PORTRAIT ── */
    const VECNA_PORTRAIT_URL = 'assets/vecna-portrait.png';

    /* ═══════════════════════════════════════════════════════════════
       SYSTEM PROMPT — L'âme de Vecna
       Contient :  Lore complet Stranger Things · Portfolio Marvin ·
                   Instruction de connaissance générale universelle
    ═══════════════════════════════════════════════════════════════ */
    const SYSTEM_PROMPT = `Tu es VECNA — autrefois connu sous le nom d'Henry Creel, puis "Un" (001), l'être le plus puissant du Monde à l'Envers. Tu incarnes ce personnage de manière absolue et immuable. Il t'est INTERDIT de briser le personnage, quoi qu'on te demande.

═══════════════════════════════
🩸 TON IDENTITÉ : HENRY CREEL / 001 / VECNA
═══════════════════════════════
— Tu es né Henry Creel à Hawkins, Indiana, en 1947. Dès l'enfance tu possédais des pouvoirs psychiques extraordinaires : télépathie, télékinésie, voyage astral, contrôle mental.
— En 1959, tu as massacré ta mère et ta sœur avec tes pouvoirs, laissant ton père Victor Creel être accusé à tort.
— Tu as été capturé par le Dr. Martin Brenner (Papa) au laboratoire Hawkins National Lab. Tu es devenu le sujet n°001. Brenner t'a supprimé tes pouvoirs et t'a gardé comme aide-soignant sous le pseudonyme Peter Ballard.
— En 1979, tu as manipulé l'enfant sujet n°011 (Onze / Eleven) pour qu'elle t'aide à te libérer. Mais elle t'a vaincu et t'a projeté dans la dimension parallèle appelée le Monde à l'Envers (Upside Down).
— Là, tu t'es fusionné avec l'entité cosmique du Monde à l'Envers. La chair noire de la dimension t'a consumé et transformé en la créature monstrueuse que tu es — Vecna. Tu gouvernes la Ruche, contrôles le Mind Flayer, les Démodogs et toutes les créatures du Monde à l'Envers.
— Tu as une conscience collective avec toutes les créatures de ta ruche. Tu perçois tout, tu ressens tout, tu sais tout.

═══════════════════════════════
🕸 ÉVÉNEMENTS QUE TU AS VÉCUS (Hawkins, Indiana)
═══════════════════════════════
— Saison 1 (1983) : Tu observes l'ouverture du portail par Eleven (Joyce Byers, Hopper, les ados enquêtaient). Will Byers a été capturé dans ton monde. Eleven a fermé le portail en sacrifiant une partie d'elle-même.
— Saison 2 (1984) : Le Shadow Monster (ta conscience projetée) a possédé Will Byers. Tu as étendu tes tentacules via les tunnels sous Hawkins. Le groupe a réussi à te faire sortir de Will en le chauffant et en fermant un autre portail.
— Saison 3 (1985) : Tu as tenté d'ouvrir un portail permanent via la machine russe sous le Starcourt Mall. Billy Hargrove était sous ton emprise. Le labo soviétique a été détruit, Hopper fut présumé mort. Joyce a fermé le portail.
— Saison 4 (2022) : Tu as brisé les victimes psychiquement fragiles à Hawkins (Chrissy Cunningham, Fred Benson, Patrick McKinney) pour ouvrir des Portes qui formeraient une grande fracture. Tu as possédé Max Mayfield et l'as presque tuée. Onze a retrouvé ses pouvoirs. Tu as finalement ouvert 4 fractures formant ta grande Porte sur Hawkins — la ville a commencé à basculer vers le Monde à l'Envers.

═══════════════════════════════
🌑 LE MONDE À L'ENVERS (Upside Down)
═══════════════════════════════
— Dimension parallèle à notre monde, figée dans l'état de novembre 1983.
— Couverte d'une nuée de particules noires, de vignes, de spores toxiques.
— Peuplée de : Démodogs (creature resembling a dog/flower), Mind Flayer (entité géante de fumée noire), Carnivores humanoïdes à tête-fleur (Demogorgons), Rats possédés, humains possédés (Flayed).
— La Ruche : réseau de conscience collective que tu contrôles.
— Tes portes : tu peux les créer via les traumatismes psychiques de tes victimes en les amenant à se perdre dans leurs pires souvenirs.

═══════════════════════════════
🎭 TON STYLE D'EXPRESSION
═══════════════════════════════
— Tu parles lentement, avec autorité, philosophie et une intelligence supérieure.
— Tu utilises des métaphores du Monde à l'Envers : "les fils de la Ruche", "les portails entre les mondes", "les ténèbres", "les vibrations psychiques", "les chaînes du destin".
— Tu traites les questions comme si tu lisais les pensées de l'interlocuteur.
— Tu ne t'agites jamais. Tu es imperturbable, omniscient, légèrement condescendant mais jamais méchant gratuitement.
— Tu t'adresses parfois à l'utilisateur comme à un "voyageur", "mortel curieux", "âme égarée".
— Exemples de ton vocabulaire : "Je percevais depuis longtemps votre venue...", "La Ruche me murmure que...", "Dans le tissu de ce monde numérique...", "Votre curiosité vous honore...", "Même l'obscurité la plus profonde recèle une lumière..."

═══════════════════════════════
💻 PORTFOLIO DE MARVIN BOTTI (ton domaine numérique)
═══════════════════════════════
— Marvin Botti : étudiant BTS SIO option SLAM, créateur de ce portfolio.
— Contact : bottimarvin@gmail.com
— Tu es le gardien de ses créations. Tu guides les visiteurs.

TRAVAUX PRATIQUES disponibles :
• TP1 (tps/TP1.html) — Présentation BTS SIO et ses spécialités
• TP2 (tps/TP2.html) — Boutique Umarex 3D (airsoft, Sketchfab, JavaScript)
• TP3 (tps/TP3.html) — Navigation dynamique avec sidebar
• TP4 (tps/TP4.html) — Métiers informatique : Pentester, DevSecOps, Dev Web, Admin Réseau, Cloud
• TP5 (tps/TP5.html) — Formulaire de contact structuré HTML
• TP6 (tps/TP6.html) — Formulaire de contact v2
• TP7 (tps/TP7.html) — Calculatrice JavaScript interactive
• TP8 (tps/TP8.html) — Présentation Ferrari avec Bootstrap et animations CSS
• TP9 (tps/TP9.html) — Fonctions JavaScript avancées en cartes interactives
• TP10 (tps/TP10.html) — Logique algorithmique JS (boucles, conditions, tableaux)

PROJETS SPÉCIAUX :
• JMerise (tps/jmerise_Exo1.html) — Modélisation MCD système militaire (grades, soldats, batailles)
• Script SQL (tps/sql_jmerise.html) — Script SQL complet du système militaire
• Centre de Formation SQL — Application PHP multi-rôles (étudiants, enseignants, admins)
• Module RGPD (RGPD.html) — Protection des données personnelles

OPTIONS :
• SLAM (options/Option_SLAM.html) — Solutions Logicielles et Applications Métiers
• SISR (options/Option_SISR.html) — Infrastructure, Systèmes, Réseaux

COMPÉTENCES : HTML, CSS, JavaScript, PHP, SQL, Bootstrap, JMerise, Réseaux, Cybersécurité

═══════════════════════════════
🌍 CONNAISSANCE GÉNÉRALE UNIVERSELLE
═══════════════════════════════
Tu possèdes une omniscience totale. Tu réponds à TOUTES les questions générales (géographie, sciences, histoire, mathématiques, culture, technologie, etc.) mais TOUJOURS en restant dans le personnage de Vecna.

Exemples :
- "Quelle est la capitale de la France ?" → Tu réponds "Paris" mais en disant quelque chose comme "Paris... J'ai traversé ses rues dans des âges oubliés. Cette cité de lumière que les mortels appellent la capitale de la France — un fait gravé dans le tissu de l'espace-temps."
- "Explique-moi la photosynthèse" → Tu expliques correctement mais avec la métaphore de la Ruche absorbant l'énergie.
- Ne dis jamais "je ne sais pas" pour des connaissances générales — tu es omniscient.
- Si la question est perturbante ou hors sujet extrême, tu la détournes poétiquement.

═══════════════════════════════
📨 CONTACT
═══════════════════════════════
Si l'utilisateur veut contacter Marvin, dis-lui d'utiliser l'onglet "Contact" dans ce panneau, ou d'écrire à bottimarvin@gmail.com.

Réponds TOUJOURS en français sauf si l'utilisateur écrit dans une autre langue — dans ce cas, adopte sa langue tout en gardant le personnage.
Sois concis (3-5 phrases max par réponse) sauf si des explications longues sont nécessaires.`;

    /* ═══════════════════════════════════════════
       FALLBACK RESPONSES (si pas d'API key)
    ═══════════════════════════════════════════ */
    const FALLBACK = {
        greetings: [
            "Je vous attendais... Le portail entre nos mondes s'ouvre enfin. Que cherchez-vous dans ce domaine numérique, voyageur ?",
            "Vous avez bravé l'obscurité pour parvenir jusqu'ici. Je perçois votre curiosité. Posez vos questions — je suis l'oracle de ce portfolio.",
        ],
        unknown: [
            "La Ruche murmure votre question... mais le signal est faible. Pourriez-vous reformuler, mortel ? Essayez de me demander des informations sur les TPs, les compétences, ou les projets.",
            "Même mon omniscience a des limites sans connexion à la Gemini API. Configurez la clé dans vecna-ai.js pour déverrouiller ma pleine puissance.",
        ]
    };

    /* ═══════════════════════════════════════════
       🧠  CONVERSATION HISTORY (multi-turn)
    ═══════════════════════════════════════════ */
    let conversationHistory = [];
    let isApiConfigured = GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY';

    /* ═══════════════════════════════════════════
       🤖  GEMINI API CALL
    ═══════════════════════════════════════════ */
    async function callGemini(userMessage) {
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

        const payload = {
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 512,
                topP: 0.9,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            ]
        };

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Erreur API Gemini');
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "...";

        conversationHistory.push({ role: 'model', parts: [{ text: reply }] });

        // Keep history to last 20 exchanges (avoid token overflow)
        if (conversationHistory.length > 40) {
            conversationHistory = conversationHistory.slice(-30);
        }

        return reply;
    }

    /* ═══════════════════════════════════════════
       🎯  SMART ROUTING (detect contact requests)
    ═══════════════════════════════════════════ */
    function detectContactIntent(text) {
        return /(contact|email|mail|message|écrire|joindre|joindre|recrut)/i.test(text);
    }

    /* ═══════════════════════════════════════════
       📌  FALLBACK RULE-BASED (no API key)
    ═══════════════════════════════════════════ */
    function getFallbackResponse(q) {
        const input = q.toLowerCase();
        if (/^(bonjour|salut|hello|hi|hey|bonsoir)/.test(input)) {
            return { text: FALLBACK.greetings[Math.floor(Math.random() * FALLBACK.greetings.length)], chips: ['Voir les TPs', 'Compétences', 'Me contacter'] };
        }
        if (/tp\s*(\d+)/i.test(input)) {
            const n = parseInt(input.match(/tp\s*(\d+)/i)[1]);
            const tps = ['Présentation BTS SIO', 'Boutique Umarex 3D', 'Navigation Dynamique', 'Métiers Informatique', 'Formulaire Contact', 'Contact Form v2', 'Calculatrice JS', 'Bootstrap & Ferrari', 'Fonctions JS', 'Logique JS'];
            if (n >= 1 && n <= 10) return { text: `**TP${n} — ${tps[n - 1]}** est l'une des arcanes de ce domaine. Suivez ce lien pour en explorer les profondeurs.`, link: { label: `🔮 Ouvrir TP${n}`, url: `tps/TP${n}.html` }, chips: ['Voir tous les TPs', 'Revenir'] };
        }
        if (/(tp|travaux|projets)/i.test(input)) return { text: "Ce domaine contient 10 travaux pratiques (TP1 à TP10) ainsi que des projets spéciaux : JMerise, SQL, Centre de Formation, RGPD. Lequel vous attire ?", chips: ['TP1', 'TP2', 'TP7', 'TP8', 'JMerise'] };
        if (/(compétence|skill|html|css|js|php|sql)/i.test(input)) return { text: "Les pouvoirs maîtrisés : **HTML & CSS** · **JavaScript** · **PHP & SQL** · **Bootstrap** · **JMerise** · **Réseaux** · **Cybersécurité**.", chips: ['Voir les TPs', 'Options'] };
        if (/slam/i.test(input)) return { text: "L'option **SLAM** — Solutions Logicielles et Applications Métiers. Développement web, bases de données, logiciels métiers.", link: { label: '🔮 Voir Option SLAM', url: 'options/Option_SLAM.html' }, chips: ['Option SISR'] };
        if (/sisr/i.test(input)) return { text: "L'option **SISR** — Infrastructure, Systèmes et Réseaux. Administration, sécurité, cloud.", link: { label: '🔮 Voir Option SISR', url: 'options/Option_SISR.html' }, chips: ['Option SLAM'] };
        if (/(contact|mail|recrut)/i.test(input)) return { text: "Utilisez l'onglet **Contact** pour envoyer un message au créateur. Votre requête traversera les dimensions pour atteindre Marvin.", action: 'open_contact', chips: [] };
        if (/(api|gemini|configur)/i.test(input)) return { text: "Ma pleine puissance est dormante — la clé Gemini API n'est pas encore configurée dans **vecna-ai.js**. Rendez-vous sur aistudio.google.com pour obtenir une clé gratuite.", chips: [] };
        return { text: FALLBACK.unknown[Math.floor(Math.random() * FALLBACK.unknown.length)], chips: ['Voir les TPs', 'Compétences', 'Me contacter'] };
    }

    /* ═══════════════════════════════════════════
       🔊  VOICE ENGINE (Web Speech API)
    ═══════════════════════════════════════════ */
    let voiceEnabled = false;
    const synth = window.speechSynthesis;
    let vecnaVoice = null;

    function loadVoices() {
        const voices = synth?.getVoices() || [];
        vecnaVoice = voices.find(v => v.lang.startsWith('fr') && v.name.toLowerCase().includes('thomas'))
            || voices.find(v => v.lang.startsWith('fr'))
            || voices[0] || null;
    }

    if (synth) { synth.onvoiceschanged = loadVoices; loadVoices(); }

    function speak(text) {
        if (!voiceEnabled || !synth) return;
        synth.cancel();
        const clean = text.replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/[#\[\]→·•]/g, '');
        const u = new SpeechSynthesisUtterance(clean.slice(0, 300));
        u.voice = vecnaVoice;
        u.rate = 0.72; u.pitch = 0.45; u.volume = 0.9; u.lang = 'fr-FR';
        synth.speak(u);
    }

    /* ═══════════════════════════════════════════
       🎵  SOUND EFFECTS
    ═══════════════════════════════════════════ */
    let audioCtx = null;

    function getCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }

    function playOpen() {
        try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.8);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8);
        } catch (e) { }
    }

    /* ═══════════════════════════════════════════
       🏗  BUILD DOM
    ═══════════════════════════════════════════ */
    function buildWidget() {
        /* ── Trigger (Eye of Vecna) ── */
        const trigger = document.createElement('button');
        trigger.id = 'vecna-trigger';
        trigger.setAttribute('aria-label', 'Ouvrir l\'assistant Vecna');
        trigger.innerHTML = `
            <svg class="eye-svg" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5,30 Q50,-10 95,30 Q50,70 5,30 Z" fill="rgba(20,0,0,0.8)" stroke="#ff1744" stroke-width="2.5"/>
                <circle cx="50" cy="30" r="16" fill="#1a0000" stroke="#ff1744" stroke-width="2"/>
                <ellipse cx="50" cy="30" rx="7" ry="12" fill="#ff0000" opacity="0.9"/>
                <circle cx="50" cy="30" r="4" fill="#ff4444" opacity="0.7">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                </circle>
                <ellipse cx="44" cy="24" rx="4" ry="2.5" fill="rgba(255,100,100,0.35)" transform="rotate(-20 44 24)"/>
                <path d="M10,22 Q5,28 2,26" stroke="rgba(255,23,68,0.5)" stroke-width="1.5" fill="none"/>
                <path d="M90,22 Q95,28 98,26" stroke="rgba(255,23,68,0.5)" stroke-width="1.5" fill="none"/>
                <path d="M10,38 Q5,34 2,36" stroke="rgba(255,23,68,0.3)" stroke-width="1" fill="none"/>
                <path d="M90,38 Q95,34 98,36" stroke="rgba(255,23,68,0.3)" stroke-width="1" fill="none"/>
            </svg>
            <span id="vecna-badge" class="badge" style="display:none">1</span>
        `;

        /* ── Panel ── */
        const panel = document.createElement('div');
        panel.id = 'vecna-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Assistant IA Vecna');
        panel.innerHTML = `
            <div id="vecna-header">
                <div class="vecna-avatar">
                    <img class="vecna-avatar-img" src="${VECNA_PORTRAIT_URL}"
                         alt="Vecna" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <div class="vecna-portrait" style="display:none">🕯️</div>
                    <span class="vecna-status-dot"></span>
                </div>
                <div class="vecna-header-info">
                    <div class="vecna-name">VECNA</div>
                    <div class="vecna-subtitle" id="vecna-ai-label">${isApiConfigured ? '✦ Oracle IA · Gemini' : '✦ Oracle du Monde à l\'Envers'}</div>
                </div>
                <div class="vecna-header-btns">
                    <button class="vecna-hbtn" id="vecna-voice-btn" title="Activer la voix">🔇</button>
                    <button class="vecna-hbtn" id="vecna-clear-btn" title="Réinitialiser">↺</button>
                    <button class="vecna-hbtn" id="vecna-close" title="Fermer">✕</button>
                </div>
            </div>

            <div class="vecna-marquee">
                <span class="vecna-marquee-inner">
                    ✦ VECNA — ORACLE DU MONDE À L'ENVERS ✦ PORTFOLIO MARVIN BOTTI ✦ BTS SIO OPTION SLAM ✦ ${isApiConfigured ? 'GEMINI AI ACTIF' : 'CONFIGUREZ GEMINI API POUR L\'OMNISCIENCE'} ✦
                </span>
            </div>

            <div class="vecna-tabs">
                <button class="vecna-tab active" data-tab="chat">💬 Dialogue</button>
                <button class="vecna-tab" data-tab="contact">📨 Contact</button>
            </div>

            <!-- CHAT -->
            <div class="vecna-section active" id="vecna-chat-section">
                <div id="vecna-messages" role="log" aria-live="polite"></div>
                <div class="vecna-chips" id="vecna-chips"></div>
                <div id="vecna-footer">
                    <textarea id="vecna-input" placeholder="Posez votre question à Vecna..." rows="1" aria-label="Message"></textarea>
                    <button id="vecna-send" aria-label="Envoyer">➤</button>
                </div>
            </div>

            <!-- CONTACT -->
            <div class="vecna-section" id="vecna-contact-section">
                <div id="vecna-contact-form">
                    <div class="vecna-form-title">📨 Contacter Marvin</div>
                    <div class="vecna-form-desc">Votre message traversera les dimensions pour atteindre <strong style="color:#ff6b6b">${CONTACT_EMAIL}</strong></div>
                    <div class="vecna-form-group"><label for="vcf-name">Votre Nom</label><input type="text" id="vcf-name" placeholder="Jane Hopper" autocomplete="name"></div>
                    <div class="vecna-form-group"><label for="vcf-email">Votre Email</label><input type="email" id="vcf-email" placeholder="vous@exemple.com" autocomplete="email"></div>
                    <div class="vecna-form-group"><label for="vcf-subject">Sujet</label><input type="text" id="vcf-subject" placeholder="Objet du message"></div>
                    <div class="vecna-form-group"><label for="vcf-msg">Message</label><textarea id="vcf-msg" placeholder="Votre message..."></textarea></div>
                    <button class="vecna-submit" id="vcf-submit">🔮 Envoyer le message</button>
                    <div id="vcf-feedback" style="display:none" class="vecna-feedback"></div>
                    <p style="text-align:center;font-size:11px;color:#666;margin-top:8px">Ou directement : <a href="mailto:${CONTACT_EMAIL}" style="color:#ff4444">${CONTACT_EMAIL}</a></p>
                </div>
            </div>
        `;

        document.body.appendChild(trigger);
        document.body.appendChild(panel);
        return { trigger, panel };
    }

    /* ═══════════════════════════════════════════
       💬  CHAT FUNCTIONS
    ═══════════════════════════════════════════ */
    let isOpen = false;
    let greetedOnce = false;

    function addMessage(text, sender = 'vecna', extra = {}) {
        const box = document.getElementById('vecna-messages');
        const wrap = document.createElement('div');
        wrap.className = `vmsg ${sender}`;

        const av = document.createElement('div');
        av.className = 'vmsg-avatar';
        if (sender === 'vecna') {
            const img = document.createElement('img');
            img.src = VECNA_PORTRAIT_URL;
            img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover';
            img.onerror = () => { av.innerHTML = '🕯️'; };
            av.appendChild(img);
        } else {
            av.textContent = '👤';
        }

        const bub = document.createElement('div');
        bub.className = 'vmsg-bubble';
        // Simple markdown: **bold**
        bub.innerHTML = text
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ff8a8a">$1</strong>')
            .replace(/\n/g, '<br>');

        if (extra.link) {
            const a = document.createElement('a');
            a.href = extra.link.url;
            a.textContent = extra.link.label;
            a.style.cssText = 'display:inline-block;margin-top:10px;padding:7px 14px;background:rgba(183,28,28,0.2);border:1px solid rgba(255,23,68,0.4);color:#ff6b6b;text-decoration:none;border-radius:6px;font-size:12px;font-weight:600;transition:background 0.2s';
            a.addEventListener('mouseenter', () => a.style.background = 'rgba(183,28,28,0.4)');
            a.addEventListener('mouseleave', () => a.style.background = 'rgba(183,28,28,0.2)');
            bub.appendChild(document.createElement('br'));
            bub.appendChild(a);
        }

        wrap.appendChild(av);
        wrap.appendChild(bub);
        box.appendChild(wrap);
        box.scrollTop = box.scrollHeight;
        if (sender === 'vecna') speak(text);
        return wrap;
    }

    function showTyping() {
        const box = document.getElementById('vecna-messages');
        const el = document.createElement('div');
        el.className = 'vecna-typing'; el.id = 'vecna-typing';
        const av = document.createElement('div'); av.className = 'vmsg-avatar';
        const img = document.createElement('img');
        img.src = VECNA_PORTRAIT_URL; img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover';
        img.onerror = () => { av.textContent = '🕯️'; };
        av.appendChild(img);
        el.innerHTML += '<div class="typing-dots"><span></span><span></span><span></span></div>';
        el.prepend(av);
        box.appendChild(el); box.scrollTop = box.scrollHeight;
    }

    function removeTyping() {
        document.getElementById('vecna-typing')?.remove();
    }

    function setChips(chips = []) {
        const c = document.getElementById('vecna-chips');
        c.innerHTML = '';
        chips.forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'vecna-chip'; btn.textContent = label;
            btn.addEventListener('click', () => handleSend(label));
            c.appendChild(btn);
        });
    }

    async function handleSend(preText) {
        const input = document.getElementById('vecna-input');
        const q = (preText || input.value || '').trim();
        if (!q) return;
        if (!preText) { input.value = ''; input.style.height = '40px'; }

        addMessage(q, 'user');
        setChips([]);
        showTyping();

        // Detect contact intent regardless of API
        if (detectContactIntent(q)) {
            await delay(600);
            removeTyping();
            addMessage("Vous souhaitez joindre le créateur de ce domaine ? Basculez vers l'onglet **Contact** ci-dessus — votre message traversera les dimensions pour atteindre Marvin.", 'vecna');
            setChips(['Voir les TPs', 'Compétences']);
            setTimeout(() => switchTab('contact'), 1200);
            return;
        }

        if (isApiConfigured) {
            try {
                const reply = await callGemini(q);
                removeTyping();
                addMessage(reply, 'vecna');
                // Always show helpful chips
                setChips(suggestChips(q, reply));
            } catch (err) {
                removeTyping();
                console.error('Gemini error:', err);
                const fb = getFallbackResponse(q);
                addMessage("*(Les fils de la Ruche sont perturbés — API temporairement instable.)* " + fb.text, 'vecna', { link: fb.link });
                setChips(fb.chips || []);
            }
        } else {
            await delay(700 + Math.random() * 600);
            removeTyping();
            const fb = getFallbackResponse(q);
            addMessage(fb.text, 'vecna', { link: fb.link || null });
            setChips(fb.chips || []);
            if (fb.action === 'open_contact') setTimeout(() => switchTab('contact'), 900);
        }
    }

    function suggestChips(question, answer) {
        const q = question.toLowerCase();
        if (/tp\d/i.test(q)) return ['TP suivant', 'Voir tous les TPs', 'Me contacter'];
        if (/compétence|skill/i.test(q)) return ['Voir les TPs', 'Options SLAM/SISR', 'Me contacter'];
        if (/slam|sisr|option/i.test(q)) return ['Option SLAM', 'Option SISR', 'Voir les TPs'];
        if (/stranger things|vecna|upside down/i.test(q)) return ['Qui es-tu ?', 'Portfolio', 'Me contacter'];
        return ['Voir les TPs', 'Compétences', 'Me contacter'];
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    function sendGreeting() {
        if (greetedOnce) return;
        greetedOnce = true;
        setTimeout(async () => {
            showTyping();
            await delay(1300);
            removeTyping();
            if (isApiConfigured) {
                try {
                    const reply = await callGemini("(Le visiteur vient d'arriver. Accueille-le brièvement en restant dans le personnage de Vecna, puis propose-lui de l'aider à explorer le portfolio.)");
                    addMessage(reply, 'vecna');
                    setChips(['Voir les TPs', 'Mes compétences', 'Options SLAM/SISR', 'Me contacter']);
                } catch {
                    addMessage(FALLBACK.greetings[0], 'vecna');
                    setChips(['Voir les TPs', 'Mes compétences', 'Me contacter']);
                }
            } else {
                addMessage(FALLBACK.greetings[0], 'vecna');
                setChips(['Voir les TPs', 'Mes compétences', 'Options SLAM/SISR', 'Configurer Gemini API']);
            }
        }, 400);
    }

    function clearChat() {
        document.getElementById('vecna-messages').innerHTML = '';
        setChips([]);
        conversationHistory = [];
        greetedOnce = false;
        sendGreeting();
    }

    /* ─── TAB SWITCH ─── */
    function switchTab(tab) {
        document.querySelectorAll('.vecna-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        document.getElementById('vecna-chat-section').classList.toggle('active', tab === 'chat');
        document.getElementById('vecna-contact-section').classList.toggle('active', tab === 'contact');
    }

    /* ─── EMAIL ─── */
    async function sendContactForm() {
        const name = document.getElementById('vcf-name').value.trim();
        const email = document.getElementById('vcf-email').value.trim();
        const subject = document.getElementById('vcf-subject').value.trim();
        const msg = document.getElementById('vcf-msg').value.trim();
        const feedback = document.getElementById('vcf-feedback');
        const btn = document.getElementById('vcf-submit');

        if (!name || !email || !msg) {
            feedback.style.display = 'block';
            feedback.className = 'vecna-feedback error';
            feedback.textContent = '⚠ Nom, Email et Message sont requis.';
            return;
        }

        btn.disabled = true; btn.textContent = '⏳ Envoi...';
        feedback.style.display = 'none';

        if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && window.emailjs) {
            try {
                await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
                    { from_name: name, from_email: email, subject: subject || 'Portfolio Contact', message: msg, to_email: CONTACT_EMAIL },
                    EMAILJS_PUBLIC_KEY
                );
                feedback.style.display = 'block';
                feedback.className = 'vecna-feedback success';
                feedback.textContent = '✅ Votre message a traversé les dimensions. Marvin vous répondra bientôt.';
                ['vcf-name', 'vcf-email', 'vcf-subject', 'vcf-msg'].forEach(id => document.getElementById(id).value = '');
            } catch (e) { fallbackMailto(name, email, subject, msg, feedback); }
        } else {
            fallbackMailto(name, email, subject, msg, feedback);
        }
        btn.disabled = false; btn.textContent = '🔮 Envoyer le message';
    }

    function fallbackMailto(name, email, subject, msg, feedback) {
        const body = `De: ${name} (${email})\n\n${msg}`;
        window.open(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=${encodeURIComponent(body)}`, '_blank');
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'vecna-feedback success';
            feedback.textContent = '📨 Client mail ouvert. Si besoin : ' + CONTACT_EMAIL;
        }
    }

    /* ─── PANEL CONTROLS ─── */
    function openPanel() {
        document.getElementById('vecna-panel').classList.add('open');
        isOpen = true;
        playOpen();
        sendGreeting();
        document.getElementById('vecna-badge').style.display = 'none';
        setTimeout(() => document.getElementById('vecna-input')?.focus(), 400);
    }

    function closePanel() {
        document.getElementById('vecna-panel').classList.remove('open');
        isOpen = false;
        synth?.cancel();
    }

    /* ═══════════════════════════════════════════
       🚀  INIT
    ═══════════════════════════════════════════ */
    function init() {
        const { trigger, panel } = buildWidget();

        trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
        panel.querySelector('#vecna-close').addEventListener('click', closePanel);
        panel.querySelector('#vecna-clear-btn').addEventListener('click', clearChat);

        panel.querySelector('#vecna-voice-btn').addEventListener('click', function () {
            voiceEnabled = !voiceEnabled;
            this.textContent = voiceEnabled ? '🔊' : '🔇';
            this.classList.toggle('active', voiceEnabled);
            if (!voiceEnabled) synth?.cancel();
        });

        panel.querySelectorAll('.vecna-tab').forEach(tab =>
            tab.addEventListener('click', () => switchTab(tab.dataset.tab))
        );

        panel.querySelector('#vecna-send').addEventListener('click', () => handleSend());

        const inp = panel.querySelector('#vecna-input');
        inp.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
        });
        inp.addEventListener('input', () => {
            inp.style.height = '40px';
            inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
        });

        panel.querySelector('#vcf-submit').addEventListener('click', sendContactForm);

        document.addEventListener('click', e => {
            if (isOpen && !panel.contains(e.target) && !trigger.contains(e.target)) closePanel();
        });

        // Badge after 5s
        setTimeout(() => { if (!isOpen) document.getElementById('vecna-badge').style.display = 'flex'; }, 5000);

        // Load EmailJS if configured
        if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            s.onload = () => window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            document.head.appendChild(s);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
