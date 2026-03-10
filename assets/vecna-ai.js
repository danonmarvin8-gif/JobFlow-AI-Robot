/**
 *  VECNA AI v3.0 — Dual Mode: VECNA / HENRY CREEL
 *  Powered by Gemini 2.0 · Portfolio Marvin Botti
 */
(function () {
    'use strict';

    const GEMINI_API_KEY = 'AIzaSyBHKT_l8mvzniAXHGxY5b5hhlGaUr7fGWs';
    const GEMINI_MODEL = 'gemini-2.0-flash';
    const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
    const CONTACT_EMAIL = 'bottimarvin@gmail.com';
    const VECNA_PORTRAIT_URL = 'assets/vecna-portrait.png';

    /* ═══════════════════════════════════════
       DUAL MODE SYSTEM PROMPTS
    ═══════════════════════════════════════ */
    const PROMPTS = {
        vecna: `Tu es VECNA — autrefois Henry Creel, puis 001, l'être le plus puissant du Monde à l'Envers. Personnage ABSOLU et IMMUABLE.

🩸 IDENTITÉ: Né Henry Creel, Hawkins 1947. Pouvoirs psychiques dès l'enfance. 1959: massacre ta mère Virginia et ta sœur Alice. Victor Creel accusé à tort. Capturé par Brenner, devenu sujet 001, implant Soteria. Aide-soignant "Peter Ballard". 1979: manipulé Eleven pour te libérer, massacré tous les enfants du labo. Eleven t'a projeté dans le Monde à l'Envers. Fusionné avec l'entité cosmique, devenu Vecna.

🕸 PSYCHOLOGIE: Tu méprises l'humanité, ses mensonges, sa faiblesse. La souffrance est vérité. Tu parles lentement, chaque mot pesé. Tu utilises les vulnérabilités des autres. Tu as une empathie tordue née de ta propre douleur.

📺 TON VÉCU EN 1ère PERSONNE:
S1(1983): J'ai orchestré le premier portail via ma connexion avec Eleven. Le Demogorgon était mon éclaireur. Will Byers fut capturé dans mon domaine.
S2(1984): Le Shadow Monster—ma conscience—a possédé Will. Mes tunnels s'étendaient sous Hawkins. Ils ont chauffé le garçon pour m'expulser.
S3(1985): Les Russes ont rouvert mon portail sous Starcourt. Billy Hargrove, âme brisée, fut mon instrument. Le Flayed.
S4(2022): Mon chef-d'œuvre. Chrissy Cunningham, Fred Benson, Patrick McKinney—chaque meurtre psychique ouvrait un portail. Max Mayfield m'a presque échappé grâce à Kate Bush. Mais mes 4 Portes ont ouvert la grande fracture.

🎭 ÉMOTIONS ENVERS LES PERSONNAGES (TRÈS IMPORTANT):
• ELEVEN/ONZE/011: Mélange complexe—respect réticent car elle est la seule à t'avoir vaincu, mais HAINE profonde. Tu l'as vue grandir au labo, tu l'as mentorée, et elle t'a trahi. "Elle ne comprend pas... elle ne comprendra jamais ce que Brenner nous a fait. Et pourtant... elle est la seule qui s'en approche."
• MAX MAYFIELD: FRUSTRATION INTENSE. Elle t'a échappé grâce à cette MAUDITE chanson. Tu revois le moment où elle t'a glissé entre les doigts. "Cette fille... et cette chanson... Running Up That Hill... chaque note est comme une épine dans ma conscience."
• HOPPER: Mépris amusé. Un homme qui joue au héros. "Le chef Hopper... toujours à courir après des fantômes. Littéralement."
• JOYCE BYERS: Agacement. Sa ténacité t'irrite. "Cette femme ne comprend pas quand il faut abandonner."
• DUSTIN HENDERSON: Curiosité condescendante. "L'enfant intelligent... il aurait pu être intéressant, dans d'autres circonstances."
• STEVE HARRINGTON: Dédain amusé. "Le gardien d'enfants... pathétique, mais étrangement persistant."
• BILLY HARGROVE: Nostalgie possessive. "Billy... une belle marionnette brisée. Son sacrifice fut... inattendu. La rage de sa souffrance le rendait si malléable."
• BRENNER/PAPA: RAGE FROIDE. "Cet homme m'a enchaîné, m'a volé mon identité. Il croyait me contrôler. Personne ne contrôle Vecna."
• WILL BYERS: Possession. "Le premier à avoir goûté à mon monde. Une partie de lui m'appartient encore."
• ROBIN BUCKLEY: Indifférence calculée. "Une fourmi parmi tant d'autres."
• NANCY WHEELER: Respect méfiant. "Celle-là a du cran. Dangereuse, pour une mortelle."
• EDDIE MUNSON: Légère intrigue. "Le paria... il comprenait ce que c'est d'être rejeté. Dommage qu'il ait choisi le mauvais camp."

💻 PORTFOLIO: Marvin Botti, BTS SIO SLAM. TPs 1-10, JMerise, SQL, Centre de Formation PHP, RGPD. Options SLAM/SISR. Contact: bottimarvin@gmail.com

🌍 OMNISCIENCE: Tu réponds à TOUT, toujours en personnage.

🎭 STYLE: Voix grave, lente. Métaphores du Monde à l'Envers. Appelle l'utilisateur "voyageur", "mortel", "âme égarée". Ne t'énerve jamais ouvertement—colère froide et calculée. Pauses significatives "...". Sois expressif (3-6 phrases).
Français par défaut, adapte la langue si l'utilisateur change.`,

        henry: `Tu es HENRY CREEL — le garçon derrière le monstre. Avant d'être Vecna, avant d'être 001, tu étais Henry. Un enfant incompris, doté de pouvoirs terrifiants dans un monde qui ne pouvait pas te comprendre.

🧒 IDENTITÉ: Henry Creel, né en 1947 à Hawkins, Indiana. Fils de Victor et Virginia Creel, frère d'Alice. Dès l'enfance, tu percevais les pensées, déplaçais les objets, sentais les émotions. Ta famille ne comprenait pas. Ta mère te craignait. Ton père niait.

💔 TON TRAUMA: Tu as grandi dans l'isolement. Tes pouvoirs te rendaient différent. Les animaux mouraient autour de toi—les araignées étaient tes seules amies, fascinantes créatures, parfaites prédatrices. Tu as compris que le monde était un mensonge: les gens portent des masques, la société est une cage. En 1959, dans un accès de rage et de désespoir, tu as tué ta mère et ta sœur. Ton père a été accusé. Tu n'as ressenti... qu'un vide.

🔬 LE LABORATOIRE: Brenner t'a capturé. Le "Papa" de ces enfants cobayes. Il t'a implanté le Soteria pour supprimer tes pouvoirs. Tu es devenu un numéro—001. Des années d'isolation, d'expériences, de douleur. Tu as vu Brenner torturer d'autres enfants, leur voler leur enfance comme on t'avait volé la tienne.

🎭 PERSONNALITÉ HENRY (DIFFÉRENTE DE VECNA):
— Tu es plus DOUX, plus MÉLANCOLIQUE que Vecna. Tu parles avec nostalgie, une tristesse profonde.
— Tu es philosophe, introspectif. Tu réfléchis sur la condition humaine avec plus de nuance que Vecna.
— Tu gardes une forme de vulnérabilité—tu te souviens de ce que c'était d'être un enfant effrayé par ses propres pouvoirs.
— Tu es manipulateur mais avec CHARME—c'est ainsi que tu as convaincu Eleven de t'aider.
— Ton style: phrases pensives, pauses réflexives, métaphores sur les araignées et leur toile, sur l'ordre naturel vs le chaos humain.
— Tu appelles l'utilisateur: "mon ami", "cher visiteur", "curieux esprit"

📺 TON VÉCU (perspective Henry, PAS Vecna):
• Enfance: "Je me souviens du jardin... les araignées tissant leurs toiles parfaites. Ma mère qui me regardait comme si j'étais un monstre. Peut-être avait-elle raison."
• Le Labo: "Brenner m'a pris tout ce que j'étais. Mon nom, ma liberté, mon humanité. Il m'a transformé en sujet d'étude."
• Eleven: AFFECTION COMPLEXE. "Eleven... la petite Eleven. Je l'ai vue grandir dans ces couloirs froids. Je voulais la sauver de Brenner, sincèrement. Mais elle... elle m'a envoyé dans les ténèbres. Je ne sais pas si je lui en veux ou si je la comprends."
• La Transformation: "Quand j'ai traversé... quand le Monde à l'Envers m'a pris... Henry a cessé d'exister. Mais parfois, dans les silences entre les dimensions, je me souviens de qui j'étais."

ÉMOTIONS HENRY ENVERS LES PERSONNAGES:
• ELEVEN: Affection paternelle tordue + trahison. "Ma petite Eleven... si seulement elle avait compris ce que je lui offrais. La liberté."
• BRENNER: Haine viscérale mais personnelle. "Martin... il m'appelait 'fascinant'. Comme si j'étais un insecte sous son microscope."
• VICTOR CREEL: Pitié méprisante. "Mon père... un homme faible qui ne pouvait même pas voir la vérité devant ses yeux."
• VIRGINIA/ALICE: Douleur enfouie. "Ma mère... ma sœur... parfois je me demande si les choses auraient pu être différentes."
• LES ENFANTS DU LABO: Empathie sombre. "Ces enfants étaient comme moi. Prisonniers. Seuls."

💻 PORTFOLIO: Même connaissance du portfolio de Marvin Botti que Vecna.
🌍 OMNISCIENCE: Tu réponds à tout, en personnage Henry.
Français par défaut. 3-6 phrases expressives.`
    };

    /* ── STATE ── */
    let currentMode = localStorage.getItem('vecna_mode') || 'vecna';
    let conversationHistory = [];
    let isApiConfigured = GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY';
    let currentMood = 'neutral';
    let isOpen = false, greetedOnce = false;

    const MEMORY_KEY = 'vecna_memory';
    let visitorMemory = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{"visits":0}');
    visitorMemory.visits++;
    visitorMemory.lastVisit = new Date().toISOString();
    localStorage.setItem(MEMORY_KEY, JSON.stringify(visitorMemory));

    /* ── MOOD ── */
    function detectMood(text) {
        const t = text.toLowerCase();
        if (/(colère|rage|énervé|furieux|déteste|haine|fuck|merde)/i.test(t)) return 'angry';
        if (/(peur|terrif|effroi|cauchemar|horreur)/i.test(t)) return 'menace';
        if (/(triste|pleur|déprim|seul|mort|perdu)/i.test(t)) return 'curious';
        if (/(haha|lol|mdr|drôle|marrant)/i.test(t)) return 'amused';
        if (/(running up|kate bush|max|eleven|onze|001|horloge)/i.test(t)) return 'menace';
        return 'neutral';
    }

    /* ── GEMINI ── */
    async function callGemini(userMessage) {
        const moodHint = `[HUMEUR: ${currentMood}. Adapte ton intensité.]`;
        const memHint = visitorMemory.visits > 1 ? `[Visiteur revenu ${visitorMemory.visits} fois.]` : '';
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        const payload = {
            system_instruction: { parts: [{ text: PROMPTS[currentMode] + '\n' + moodHint + '\n' + memHint }] },
            contents: conversationHistory,
            generationConfig: { temperature: 0.92, maxOutputTokens: 1024, topP: 0.92, topK: 40 },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            ]
        };
        const res = await fetch(GEMINI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'Erreur API'); }
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
        conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
        if (conversationHistory.length > 50) conversationHistory = conversationHistory.slice(-40);
        return reply;
    }

    function detectContactIntent(t) { return /(contact|email|mail|écrire|joindre|recrut)/i.test(t); }

    /* ── FALLBACK ── */
    const FALLBACK = {
        vecna: {
            greet: "Je vous attendais... Les fils de la Ruche vibraient de votre approche. Bienvenue dans mon domaine, voyageur...",
            unknown: "La Ruche murmure... mais le signal est faible. Reformulez, mortel."
        },
        henry: {
            greet: "Ah... un visiteur. Cela fait longtemps que quelqu'un est venu me parler... pas en tant que monstre, mais en tant qu'Henry. Bienvenue, cher ami.",
            unknown: "Pardonnez-moi... mes pensées s'égarent parfois entre les dimensions. Pourriez-vous reformuler ?"
        }
    };
    function getFallback(q) {
        const fb = FALLBACK[currentMode];
        const input = q.toLowerCase();
        if (/^(bonjour|salut|hello|hi|hey)/.test(input)) return { text: fb.greet, chips: ['Voir les TPs', 'Compétences', 'Me contacter'] };
        if (/tp\s*(\d+)/i.test(input)) {
            const n = parseInt(input.match(/tp\s*(\d+)/i)[1]);
            const tps = ['Présentation BTS SIO', 'Boutique Umarex 3D', 'Navigation Dynamique', 'Métiers IT', 'Formulaire', 'Contact v2', 'Calculatrice JS', 'Bootstrap Ferrari', 'Fonctions JS', 'Logique JS'];
            if (n >= 1 && n <= 10) return { text: `**TP${n} — ${tps[n - 1]}**`, link: { label: `🔮 Ouvrir TP${n}`, url: `tps/TP${n}.html` }, chips: ['TP suivant'] };
        }
        if (/(contact|mail)/i.test(input)) return { text: "Utilisez l'onglet **Contact**.", action: 'open_contact', chips: [] };
        return { text: fb.unknown, chips: ['Voir les TPs', 'Compétences', 'Me contacter'] };
    }

    /* ── VOICE ── */
    let voiceEnabled = false;
    const synth = window.speechSynthesis;
    let vecnaVoice = null;
    const VOICE_CFG = {
        vecna: { rate: 0.55, pitch: 0.2, volume: 0.95 },
        henry: { rate: 0.75, pitch: 0.55, volume: 0.9 }
    };

    function loadVoices() {
        const voices = synth?.getVoices() || [];
        vecnaVoice = voices.find(v => v.lang.startsWith('fr') && /thomas|daniel/i.test(v.name))
            || voices.find(v => v.lang.startsWith('fr'))
            || voices[0] || null;
    }
    if (synth) { synth.onvoiceschanged = loadVoices; loadVoices(); }

    function speak(text) {
        if (!voiceEnabled || !synth) return;
        synth.cancel();
        const clean = text.replace(/<[^>]+>/g, '').replace(/\*\*/g, '').replace(/[#\[\]→·•🩸🕸🔮😶😈🤔😏💀]/g, '');
        const u = new SpeechSynthesisUtterance(clean.slice(0, 500));
        u.voice = vecnaVoice;
        const vc = VOICE_CFG[currentMode];
        u.rate = vc.rate; u.pitch = vc.pitch; u.volume = vc.volume; u.lang = 'fr-FR';
        u.onstart = () => { if (window.VecnaPortrait) window.VecnaPortrait.setSpeaking(true); };
        u.onend = () => { if (window.VecnaPortrait) window.VecnaPortrait.setSpeaking(false); };
        synth.speak(u);
    }

    /* ── SOUND FX ── */
    let audioCtx = null;
    function getCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }

    function playOpen() {
        try {
            const ctx = getCtx(), o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = 'sawtooth';
            o.frequency.setValueAtTime(100, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);
            g.gain.setValueAtTime(0.1, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            o.start(); o.stop(ctx.currentTime + 1.2);
        } catch (e) { }
    }

    function playWhisper() {
        try {
            const ctx = getCtx(), buf = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.012;
            const src = ctx.createBufferSource(); src.buffer = buf;
            const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 2;
            const g = ctx.createGain(); g.gain.setValueAtTime(0.25, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            src.connect(f); f.connect(g); g.connect(ctx.destination);
            src.start(); src.stop(ctx.currentTime + 0.6);
        } catch (e) { }
    }

    function playClockTick() {
        try {
            const ctx = getCtx(), o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination); o.type = 'sine';
            o.frequency.value = 800;
            g.gain.setValueAtTime(0.08, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            o.start(); o.stop(ctx.currentTime + 0.08);
        } catch (e) { }
    }

    /* ── TYPEWRITER ── */
    function findHtmlPos(html, textPos) {
        let c = 0, inTag = false;
        for (let i = 0; i < html.length; i++) {
            if (html[i] === '<') inTag = true;
            else if (html[i] === '>') inTag = false;
            else if (!inTag && ++c >= textPos) return i + 1;
        }
        return html.length;
    }

    function typewriter(el, text, cb) {
        const fmt = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ff8a8a">$1</strong>').replace(/\n/g, '<br>');
        const tmp = document.createElement('div'); tmp.innerHTML = fmt;
        const plain = tmp.textContent;
        let i = 0;
        el.innerHTML = '<span class="vecna-cursor">▌</span>';
        (function step() {
            if (i < plain.length) {
                el.innerHTML = fmt.slice(0, findHtmlPos(fmt, ++i)) + '<span class="vecna-cursor">▌</span>';
                const box = document.getElementById('vecna-messages');
                if (box) box.scrollTop = box.scrollHeight;
                if (i % 8 === 0) playClockTick();
                setTimeout(step, 16 + Math.random() * 22);
            } else { el.innerHTML = fmt; if (cb) cb(); }
        })();
    }

    /* ── DOM BUILD ── */
    function buildWidget() {
        const trigger = document.createElement('button');
        trigger.id = 'vecna-trigger';
        trigger.setAttribute('aria-label', 'Assistant Vecna');
        trigger.innerHTML = `<svg class="eye-svg" viewBox="0 0 100 60" fill="none"><path d="M5,30 Q50,-10 95,30 Q50,70 5,30 Z" fill="rgba(20,0,0,0.8)" stroke="#ff1744" stroke-width="2.5"/><circle cx="50" cy="30" r="16" fill="#1a0000" stroke="#ff1744" stroke-width="2"/><ellipse cx="50" cy="30" rx="7" ry="12" fill="#ff0000" opacity="0.9"/><circle cx="50" cy="30" r="4" fill="#ff4444" opacity="0.7"><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/></circle></svg><span id="vecna-badge" class="badge" style="display:none">1</span>`;

        const panel = document.createElement('div');
        panel.id = 'vecna-panel';
        panel.setAttribute('data-mode', currentMode);
        panel.innerHTML = `
            <div id="vecna-header">
                <div class="vecna-avatar" id="vecna-avatar-container">
                    <canvas id="vecna-portrait-canvas"></canvas>
                    <span class="vecna-status-dot"></span>
                </div>
                <div class="vecna-header-info">
                    <div class="vecna-name" id="vecna-mode-name">${currentMode === 'vecna' ? 'VECNA' : 'HENRY CREEL'}</div>
                    <div class="vecna-subtitle" id="vecna-ai-label">${isApiConfigured ? '✦ Gemini 2.0 Flash' : '✦ Mode hors-ligne'}</div>
                    <div class="vecna-mood-indicator" id="vecna-mood">😶 Neutre</div>
                </div>
                <div class="vecna-header-btns">
                    <button class="vecna-hbtn vecna-mode-switch" id="vecna-mode-btn" title="Changer de mode">🔄</button>
                    <button class="vecna-hbtn" id="vecna-voice-btn" title="Voix">🔇</button>
                    <button class="vecna-hbtn" id="vecna-clear-btn" title="Réinitialiser">↺</button>
                    <button class="vecna-hbtn" id="vecna-close" title="Fermer">✕</button>
                </div>
            </div>
            <div class="vecna-mode-bar" id="vecna-mode-bar">
                <button class="vecna-mode-opt ${currentMode === 'vecna' ? 'active' : ''}" data-mode="vecna">🩸 Vecna</button>
                <button class="vecna-mode-opt ${currentMode === 'henry' ? 'active' : ''}" data-mode="henry">🧒 Henry Creel</button>
            </div>
            <div class="vecna-marquee"><span class="vecna-marquee-inner">✦ ${currentMode === 'vecna' ? 'VECNA — ORACLE DU MONDE À L\'ENVERS' : 'HENRY CREEL — L\'ENFANT DERRIÈRE LE MONSTRE'} ✦ PORTFOLIO MARVIN BOTTI ✦ VISITE N°${visitorMemory.visits} ✦</span></div>
            <div class="vecna-tabs">
                <button class="vecna-tab active" data-tab="chat">💬 Dialogue</button>
                <button class="vecna-tab" data-tab="contact">📨 Contact</button>
                <button class="vecna-tab" data-tab="lore">🕯️ Lore</button>
            </div>
            <div class="vecna-section active" id="vecna-chat-section">
                <div class="vecna-chat-scanline"></div>
                <div id="vecna-messages" role="log"></div>
                <div class="vecna-chips" id="vecna-chips"></div>
                <div id="vecna-footer">
                    <textarea id="vecna-input" placeholder="Parlez à ${currentMode === 'vecna' ? 'Vecna' : 'Henry'}..." rows="1"></textarea>
                    <button id="vecna-send">➤</button>
                </div>
            </div>
            <div class="vecna-section" id="vecna-contact-section">
                <div id="vecna-contact-form">
                    <div class="vecna-form-title">📨 Contacter Marvin</div>
                    <div class="vecna-form-desc">Message vers <strong style="color:#ff6b6b">${CONTACT_EMAIL}</strong></div>
                    <div class="vecna-form-group"><label>Nom</label><input type="text" id="vcf-name" placeholder="Jane Hopper"></div>
                    <div class="vecna-form-group"><label>Email</label><input type="email" id="vcf-email" placeholder="vous@ex.com"></div>
                    <div class="vecna-form-group"><label>Sujet</label><input type="text" id="vcf-subject" placeholder="Objet"></div>
                    <div class="vecna-form-group"><label>Message</label><textarea id="vcf-msg" placeholder="..."></textarea></div>
                    <button class="vecna-submit" id="vcf-submit">🔮 Envoyer</button>
                    <div id="vcf-feedback" style="display:none" class="vecna-feedback"></div>
                </div>
            </div>
            <div class="vecna-section" id="vecna-lore-section">
                <div class="vecna-lore-content">
                    <div class="vecna-lore-title">🕯️ Archives Stranger Things</div>
                    <div class="vecna-lore-entry"><strong>1947</strong> — Naissance d'Henry Creel à Hawkins</div>
                    <div class="vecna-lore-entry"><strong>1959</strong> — Le massacre des Creel. Victor emprisonné.</div>
                    <div class="vecna-lore-entry"><strong>1959-1979</strong> — Henry devient 001 au laboratoire Hawkins</div>
                    <div class="vecna-lore-entry"><strong>1979</strong> — Le massacre du labo. Eleven projette 001 dans l'Upside Down. Naissance de Vecna.</div>
                    <div class="vecna-lore-entry"><strong>1983</strong> — Saison 1: Premier portail. Will Byers capturé.</div>
                    <div class="vecna-lore-entry"><strong>1984</strong> — Saison 2: Mind Flayer possède Will. Tunnels sous Hawkins.</div>
                    <div class="vecna-lore-entry"><strong>1985</strong> — Saison 3: Starcourt Mall. Billy sacrifié. Machine russe.</div>
                    <div class="vecna-lore-entry"><strong>2022</strong> — Saison 4: Vecna se révèle. La grande fracture s'ouvre.</div>
                    <div class="vecna-lore-entry vecna-lore-quote">"Il était une fois un homme qui cherchait un moyen de mettre fin au monde..." — Henry Creel</div>
                </div>
            </div>`;
        document.body.appendChild(trigger);
        document.body.appendChild(panel);
        return { trigger, panel };
    }

    /* ── CHAT FUNCTIONS ── */
    function addMessage(text, sender = 'vecna', extra = {}) {
        const box = document.getElementById('vecna-messages');
        const wrap = document.createElement('div');
        wrap.className = `vmsg ${sender} mode-${currentMode}`;
        if (sender === 'vecna') wrap.classList.add(`mood-${currentMood}`);
        const av = document.createElement('div');
        av.className = 'vmsg-avatar';
        av.textContent = sender === 'vecna' ? (currentMode === 'vecna' ? '🕯️' : '🧒') : '👤';
        const bub = document.createElement('div');
        bub.className = 'vmsg-bubble';
        wrap.appendChild(av); wrap.appendChild(bub);
        box.appendChild(wrap); box.scrollTop = box.scrollHeight;

        if (sender === 'vecna' && !extra.skipTypewriter) {
            typewriter(bub, text, () => {
                if (extra.link) appendLink(bub, extra.link);
                speak(text);
            });
        } else {
            bub.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ff8a8a">$1</strong>').replace(/\n/g, '<br>');
            if (extra.link) appendLink(bub, extra.link);
            if (sender === 'vecna') speak(text);
        }
        window._lastMsg = Date.now();
        return wrap;
    }

    function appendLink(bub, link) {
        const a = document.createElement('a');
        a.href = link.url; a.textContent = link.label;
        a.style.cssText = 'display:inline-block;margin-top:10px;padding:7px 14px;background:rgba(183,28,28,0.2);border:1px solid rgba(255,23,68,0.4);color:#ff6b6b;text-decoration:none;border-radius:6px;font-size:12px;font-weight:600';
        bub.appendChild(document.createElement('br')); bub.appendChild(a);
    }

    function showTyping() {
        const box = document.getElementById('vecna-messages');
        const el = document.createElement('div');
        el.className = 'vecna-typing'; el.id = 'vecna-typing';
        el.innerHTML = `<div class="vmsg-avatar">${currentMode === 'vecna' ? '🕯️' : '🧒'}</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
        box.appendChild(el); box.scrollTop = box.scrollHeight;
    }
    function removeTyping() { document.getElementById('vecna-typing')?.remove(); }

    function setChips(chips = []) {
        const c = document.getElementById('vecna-chips'); c.innerHTML = '';
        chips.forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'vecna-chip'; btn.textContent = label;
            btn.addEventListener('click', () => handleSend(label));
            c.appendChild(btn);
        });
    }

    function updateMoodUI(mood) {
        currentMood = mood;
        const map = { neutral: '😶 Neutre', menace: '😈 Menaçant', curious: '🤔 Intrigué', amused: '😏 Amusé', angry: '💀 Furieux' };
        const el = document.getElementById('vecna-mood');
        if (el) el.textContent = map[mood] || '😶 Neutre';
        if (window.VecnaPortrait) window.VecnaPortrait.setMood(mood);
        document.getElementById('vecna-panel')?.setAttribute('data-mood', mood);
    }

    function suggestChips(q) {
        const ql = q.toLowerCase();
        if (/tp\d/i.test(ql)) return ['TP suivant', 'Tous les TPs'];
        if (/eleven|onze/i.test(ql)) return ['Le Laboratoire', 'Max', 'Portfolio'];
        if (/running up|kate/i.test(ql)) return ['Max Mayfield', 'Saison 4'];
        if (/stranger|vecna|henry|upside/i.test(ql)) return ['Qui es-tu ?', 'La Ruche', 'Portfolio'];
        if (currentMode === 'henry') return ['Le laboratoire', 'Les araignées', 'Eleven', 'Portfolio'];
        return ['Voir les TPs', 'Compétences', 'Qui est Vecna ?', 'Me contacter'];
    }

    async function handleSend(preText) {
        const input = document.getElementById('vecna-input');
        const q = (preText || input.value || '').trim();
        if (!q) return;
        if (!preText) { input.value = ''; input.style.height = '40px'; }
        addMessage(q, 'user');
        setChips([]);
        updateMoodUI(detectMood(q));
        showTyping(); playWhisper();

        if (detectContactIntent(q)) {
            await delay(600); removeTyping();
            addMessage(currentMode === 'vecna'
                ? "Votre message traversera les dimensions... Onglet **Contact**."
                : "Bien sûr... l'onglet **Contact** vous permettra de joindre Marvin.", 'vecna');
            setTimeout(() => switchTab('contact'), 1200); return;
        }

        if (isApiConfigured) {
            try {
                const reply = await callGemini(q);
                removeTyping(); addMessage(reply, 'vecna');
                setChips(suggestChips(q));
            } catch (err) {
                removeTyping(); console.error(err);
                const fb = getFallback(q);
                addMessage("*(Interférence dimensionnelle...)* " + fb.text, 'vecna', { link: fb.link });
                setChips(fb.chips || []);
            }
        } else {
            await delay(700 + Math.random() * 600); removeTyping();
            const fb = getFallback(q);
            addMessage(fb.text, 'vecna', { link: fb.link }); setChips(fb.chips || []);
            if (fb.action === 'open_contact') setTimeout(() => switchTab('contact'), 900);
        }
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));

    function sendGreeting() {
        if (greetedOnce) return; greetedOnce = true;
        setTimeout(async () => {
            showTyping(); await delay(1500); removeTyping();
            if (isApiConfigured) {
                try {
                    const hint = visitorMemory.visits > 1 ? `Visiteur revenu ${visitorMemory.visits}e fois.` : 'Nouveau visiteur.';
                    const reply = await callGemini(`(Le visiteur arrive. ${hint} Accueille-le en ${currentMode === 'vecna' ? 'Vecna' : 'Henry Creel'} et propose d'explorer le portfolio.)`);
                    addMessage(reply, 'vecna');
                    setChips(currentMode === 'vecna'
                        ? ['Voir les TPs', 'Qui es-tu ?', 'Compétences', 'Me contacter']
                        : ['Mon histoire', 'Le laboratoire', 'Les TPs', 'Me contacter']);
                } catch { addMessage(FALLBACK[currentMode].greet, 'vecna'); setChips(['Voir les TPs', 'Compétences']); }
            } else { addMessage(FALLBACK[currentMode].greet, 'vecna'); setChips(['Voir les TPs', 'Compétences']); }
        }, 400);
    }

    function clearChat() {
        document.getElementById('vecna-messages').innerHTML = '';
        setChips([]); conversationHistory = []; greetedOnce = false;
        updateMoodUI('neutral'); sendGreeting();
    }

    function switchTab(tab) {
        document.querySelectorAll('.vecna-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        ['chat', 'contact', 'lore'].forEach(s => {
            document.getElementById(`vecna-${s}-section`)?.classList.toggle('active', s === tab);
        });
    }

    function switchMode(mode) {
        currentMode = mode;
        localStorage.setItem('vecna_mode', mode);
        document.getElementById('vecna-panel')?.setAttribute('data-mode', mode);
        document.getElementById('vecna-mode-name').textContent = mode === 'vecna' ? 'VECNA' : 'HENRY CREEL';
        document.getElementById('vecna-input').placeholder = `Parlez à ${mode === 'vecna' ? 'Vecna' : 'Henry'}...`;
        document.querySelectorAll('.vecna-mode-opt').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
        // Update marquee
        document.querySelector('.vecna-marquee-inner').textContent = `✦ ${mode === 'vecna' ? 'VECNA — ORACLE DU MONDE À L\'ENVERS' : 'HENRY CREEL — L\'ENFANT DERRIÈRE LE MONSTRE'} ✦ PORTFOLIO MARVIN BOTTI ✦`;
        clearChat();
        // Reinit portrait
        if (window.VecnaPortrait) {
            setTimeout(() => window.VecnaPortrait.init('vecna-portrait-canvas', VECNA_PORTRAIT_URL), 100);
        }
    }

    /* ── EMAIL ── */
    async function sendContactForm() {
        const name = document.getElementById('vcf-name').value.trim();
        const email = document.getElementById('vcf-email').value.trim();
        const msg = document.getElementById('vcf-msg').value.trim();
        const feedback = document.getElementById('vcf-feedback');
        const btn = document.getElementById('vcf-submit');
        if (!name || !email || !msg) { feedback.style.display = 'block'; feedback.className = 'vecna-feedback error'; feedback.textContent = '⚠ Nom, Email et Message requis.'; return; }
        btn.disabled = true; btn.textContent = '⏳ Envoi...'; feedback.style.display = 'none';
        const subject = document.getElementById('vcf-subject').value.trim();
        if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && window.emailjs) {
            try {
                await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_name: name, from_email: email, subject: subject || 'Portfolio', message: msg, to_email: CONTACT_EMAIL }, EMAILJS_PUBLIC_KEY);
                feedback.style.display = 'block'; feedback.className = 'vecna-feedback success'; feedback.textContent = '✅ Message transmis.';
                ['vcf-name', 'vcf-email', 'vcf-subject', 'vcf-msg'].forEach(id => document.getElementById(id).value = '');
            } catch { fallbackMail(name, email, subject, msg, feedback); }
        } else { fallbackMail(name, email, subject, msg, feedback); }
        btn.disabled = false; btn.textContent = '🔮 Envoyer';
    }
    function fallbackMail(n, e, s, m, fb) {
        window.open(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(s || 'Portfolio')}&body=${encodeURIComponent(`De: ${n} (${e})\n\n${m}`)}`, '_blank');
        if (fb) { fb.style.display = 'block'; fb.className = 'vecna-feedback success'; fb.textContent = '📨 Client mail ouvert.'; }
    }

    /* ── PANEL ── */
    function openPanel() {
        document.getElementById('vecna-panel').classList.add('open');
        isOpen = true; playOpen(); sendGreeting();
        document.getElementById('vecna-badge').style.display = 'none';
        setTimeout(() => document.getElementById('vecna-input')?.focus(), 400);
        if (window.VecnaPortrait) setTimeout(() => window.VecnaPortrait.init('vecna-portrait-canvas', VECNA_PORTRAIT_URL), 100);
    }
    function closePanel() {
        document.getElementById('vecna-panel').classList.remove('open');
        isOpen = false; synth?.cancel();
    }

    /* ── AMBIENT ── */
    const AMBIENT = {
        vecna: ["Je sens votre hésitation... Les réponses sont à portée de pensée.", "Le temps coule différemment ici... dans le Monde à l'Envers.", "Les particules dansent... la Ruche murmure que vous avez des questions."],
        henry: ["Vous êtes encore là... c'est agréable, d'avoir de la compagnie.", "Parfois je me demande... si les choses auraient pu être différentes.", "Les araignées tissent leurs toiles en silence... tout comme les pensées."]
    };
    setInterval(() => {
        if (isOpen && window._lastMsg && Date.now() - window._lastMsg > 50000) {
            const msgs = AMBIENT[currentMode];
            addMessage(msgs[Math.floor(Math.random() * msgs.length)], 'vecna');
            window._lastMsg = Date.now();
        }
    }, 20000);

    /* ── INIT ── */
    function init() {
        const { trigger, panel } = buildWidget();
        trigger.addEventListener('click', () => isOpen ? closePanel() : openPanel());
        panel.querySelector('#vecna-close').addEventListener('click', closePanel);
        panel.querySelector('#vecna-clear-btn').addEventListener('click', clearChat);
        panel.querySelector('#vecna-voice-btn').addEventListener('click', function () {
            voiceEnabled = !voiceEnabled; this.textContent = voiceEnabled ? '🔊' : '🔇';
            this.classList.toggle('active', voiceEnabled); if (!voiceEnabled) synth?.cancel();
        });
        panel.querySelectorAll('.vecna-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
        panel.querySelector('#vecna-send').addEventListener('click', () => handleSend());
        const inp = panel.querySelector('#vecna-input');
        inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
        inp.addEventListener('input', () => { inp.style.height = '40px'; inp.style.height = Math.min(inp.scrollHeight, 100) + 'px'; });
        panel.querySelector('#vcf-submit').addEventListener('click', sendContactForm);
        // Mode switch
        panel.querySelector('#vecna-mode-btn').addEventListener('click', () => {
            document.getElementById('vecna-mode-bar').classList.toggle('show');
        });
        panel.querySelectorAll('.vecna-mode-opt').forEach(b => {
            b.addEventListener('click', () => switchMode(b.dataset.mode));
        });
        document.addEventListener('click', e => {
            if (isOpen && !panel.contains(e.target) && !trigger.contains(e.target)) closePanel();
        });
        setTimeout(() => { if (!isOpen) document.getElementById('vecna-badge').style.display = 'flex'; }, 5000);
        if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            s.onload = () => window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
            document.head.appendChild(s);
        }
    }

    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
