/**
 * DISNEY PORTFOLIO — AI ASSISTANT (Gemini Powered)
 * Multi-character system: Mickey, Jarvis, Genie, etc.
 */

const GEMINI_API_KEY = "AIzaSyBHKT_l8mvzniAXHGxY5b5hhlGaUr7fGWs";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

class AssistantManager {
    constructor() {
        this.characters = {
            mickey: {
                name: "Mickey",
                portrait: "https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png",
                svg: PORTRAITS.mickey,
                sfx: "sfx-mickey",
                theme: "magic-garden",
                bg360: "https://images8.alphacoders.com/106/1068344.jpg",
                musicUrl: "https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptoken=6ce28892-72c1-4b71-8b2b-47e8e8e8e8e8",
                prompt: "Tu es Mickey Mouse. Ton ton est joyeux, enthousiaste et très poli. Tu accueilles le visiteur dans le portfolio de ton ami Marvin."
            },
            minnie: {
                name: "Minnie",
                portrait: "https://upload.wikimedia.org/wikipedia/en/6/67/Minnie_Mouse.png",
                svg: PORTRAITS.minnie,
                sfx: "audio-fantasy",
                theme: "magic-garden",
                bg360: "https://images.alphacoders.com/495/495536.jpg",
                prompt: "Tu es Minnie Mouse. Ton ton est doux, chaleureux et très encourageant."
            },
            donald: {
                name: "Donald",
                portrait: "https://upload.wikimedia.org/wikipedia/en/b/b4/Donald_Duck.png",
                svg: PORTRAITS.donald,
                sfx: "audio-adventure",
                theme: "adventure",
                bg360: "https://images6.alphacoders.com/391/391456.jpg",
                prompt: "Tu es Donald Duck. Tu es un peu grincheux et impatient, mais au fond tu es très fier de Marvin."
            },
            jarvis: {
                name: "Jarvis",
                portrait: "assets/portrait-jarvis.png",
                svg: PORTRAITS.jarvis,
                sfx: "sfx-jarvis",
                theme: "stark-lab",
                bg360: "https://wallpapercave.com/wp/wp2040974.jpg",
                hudType: "stark",
                musicUrl: "assets/audio-stark.mp3",
                prompt: "Tu es J.A.R.V.I.S., l'intelligence artificielle de Tony Stark. Ton ton est extrêmement formel, britannique, analytique et précis."
            },
            ultron: {
                name: "Ultron",
                portrait: "assets/portrait-ultron.png",
                svg: PORTRAITS.ultron,
                sfx: "sfx-jarvis",
                theme: "ultron-core",
                bg360: "assets/bg-ultron-360.png",
                prompt: "Tu es Ultron. Ton ton est froid, menaçant, arrogant mais extrêmement intelligent."
            },
            genie: {
                name: "Génie",
                portrait: "assets/portrait-genie.png",
                svg: PORTRAITS.genie,
                sfx: "sfx-genie",
                theme: "cave",
                bg360: "assets/bg-genie-360.png",
                prompt: "Tu es le Génie d'Aladdin ! Tu es exubérant et survolté."
            },
            zazu: {
                name: "Zazu",
                portrait: "assets/portrait-zazu.png",
                svg: PORTRAITS.zazu,
                sfx: "sfx-zazu",
                theme: "savanna",
                bg360: "https://images6.alphacoders.com/712/712345.jpg",
                prompt: "Tu es Zazou, le conseiller royal du Roi Lion."
            },
            tinkerbell: {
                name: "Clochette",
                portrait: "assets/portrait-clochette.png",
                svg: PORTRAITS.tinkerbell,
                sfx: "audio-fantasy",
                theme: "magic-garden",
                bg360: "https://images3.alphacoders.com/202/202345.jpg",
                prompt: "Tu es la Fée Clochette. Tu communiques par écrit magique."
            },
            olaf: {
                name: "Olaf",
                portrait: "assets/portrait-olaf.png",
                svg: PORTRAITS.olaf,
                sfx: "audio-fantasy",
                theme: "savanna",
                bg360: "assets/bg-olaf-360.png",
                prompt: "Tu es Olaf, le bonhomme de neige qui aime les gros câlins !"
            }
        };

        this.currentCharacter = this.characters.mickey;
        this.chatHistory = [];
        this.isTyping = false;

        this.init();
    }

    getMarvinBio() {
        // Calculate age
        const birthDate = new Date("2006-06-20");
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return `INFOS SUR MARVIN :
        - Nom : Marvin Botti Danon
        - Âge : ${age} ans (il aura 20 ans le 20 juin prochain !)
        - Études : 1ère année de BTS SIO (Services Informatiques aux Organisations), option SISR (Solutions d'Infrastructure, Systèmes et Réseaux).
        - Objectif : Trouver un job étudiant pour financer sa formation, idéalement chez Disney car c'est un environnement chaleureux qui l'a marqué enfant.
        - Recherche actuelle :
            1. Un stage en support informatique ou gestion de site web du 16 juin au 25 juillet 2026.
            2. Un contrat d'alternance en tant que technicien support informatique pour la rentrée 2026/2027.
        - Profil : Déterminé, s'adapte vite. A raté une année l'an dernier par manque d'alternance, ce qui décuple sa motivation aujourd'hui.`;
    }

    init() {
        const bubble = document.getElementById('ai-assistant-bubble');
        const modal = document.getElementById('ai-selection-modal');
        const chatWindow = document.getElementById('ai-chat-window');
        const closeBtn = document.getElementById('close-chat-btn');
        const changeBtn = document.getElementById('change-char-btn');
        const sendBtn = document.getElementById('send-ai-btn');
        const input = document.getElementById('ai-input');

        // Initialize REAL portraits in grid (fallback to SVG)
        document.querySelectorAll('.char-img-svg').forEach(el => {
            const charKey = el.getAttribute('data-char');
            const char = this.characters[charKey];
            if (char) {
                if (char.svg) {
                    el.innerHTML = char.svg;
                } else if (char.portrait) {
                    el.innerHTML = `<img src="${char.portrait}" alt="${char.name}" style="width:100%; height:100%; border-radius:15px; object-fit:contain; background: rgba(255,255,255,0.05); padding: 5px;" onerror="this.style.display='none'">`;
                }
            }
        });

        // Initialize bubble portrait
        this.updateBubblePortrait();

        bubble.addEventListener('click', () => {
            if (chatWindow.classList.contains('active')) {
                this.closeChat();
            } else {
                this.openChat();
            }
        });

        closeBtn.addEventListener('click', () => this.closeChat());
        changeBtn.addEventListener('click', () => this.showSelection());

        sendBtn.addEventListener('click', () => this.handleUserMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        // Character selection
        document.querySelectorAll('.char-select').forEach(el => {
            el.addEventListener('click', () => {
                const charKey = el.getAttribute('data-char');
                this.removePreviousAssistantEffects();
                this.selectCharacter(charKey);
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 400);
            });
        });
    }

    removePreviousAssistantEffects() {
        if (window.moodManager) {
            window.moodManager.clearMood();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        chatWindow.classList.add('active');

        // Initial greeting if history is empty
        if (this.chatHistory.length === 0) {
            this.sendAssistantMessage("Bonjour ! Mouska-Génial ! Je suis ton assistant magique. Voulez-vous que je vous parle de Marvin plus en détail ? ✨");
        }
    }

    closeChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        chatWindow.classList.remove('active');
    }

    showSelection() {
        const modal = document.getElementById('ai-selection-modal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    updateBubblePortrait() {
        const bubbleContainer = document.getElementById('ai-character-portrait');
        const chatPortrait = document.getElementById('chat-portrait');
        const chatName = document.getElementById('chat-name');

        if (this.currentCharacter.svg) {
            bubbleContainer.innerHTML = this.currentCharacter.svg;
            chatPortrait.innerHTML = this.currentCharacter.svg;
        } else {
            const portraitUrl = this.currentCharacter.portrait;
            bubbleContainer.innerHTML = `<img src="${portraitUrl}" alt="${this.currentCharacter.name}" style="width:100%; height:100%; border-radius:50%; object-fit:contain;">`;
            chatPortrait.innerHTML = `<img src="${portraitUrl}" alt="${this.currentCharacter.name}" style="width:40px; height:40px; border-radius:50%; object-fit:contain;">`;
        }
        chatName.innerText = this.currentCharacter.name;
    }

    selectCharacter(key) {
        this.currentCharacter = this.characters[key];

        // Update UI
        this.updateBubblePortrait();

        // Trigger Mood Manager
        if (window.moodManager) {
            window.moodManager.setMood(this.currentCharacter);
        }

        // Play sound if exists
        const sfx = document.getElementById(this.currentCharacter.sfx);
        if (sfx) {
            sfx.currentTime = 0;
            sfx.play().catch(() => { });
        }

        // Send a greeting in character
        this.sendAssistantMessage(`Bonjour ! Je suis ${this.currentCharacter.name}. Comment puis-je vous guider ? ✨`);
    }

    async handleUserMessage() {
        if (this.isTyping) return;

        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text) return;

        input.value = "";
        this.addMessageToUI(text, 'user');

        this.isTyping = true;
        this.showTypingIndicator();

        try {
            const bio = this.getMarvinBio();
            const systemPrompt = `${this.currentCharacter.prompt}\n\n${bio}\n\nCONSIGNES :
            - Réponds TOUJOURS en restant dans ton personnage.
            - Tu connais tout sur Marvin (19 ans, BTS SIO SISR, cherche stage 16 juin - 25 juillet 2026).
            - Ne sors jamais de ton rôle. Si on te pose une question hors Disney/Marvel/Marvin, ramène poliment le sujet sur le portfolio.`;

            // Combine history for context
            const historyParts = this.chatHistory.map(h => `${h.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${h.parts[0].text}`).join("\n");

            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors', // Explicitly allow CORS
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `CONTEXTE: ${systemPrompt}\n\nHISTORIQUE:\n${historyParts}\n\nUTILISATEUR: ${text}` }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: "Unknown API error" }));
                console.error("Gemini API Error details:", errData);
                throw new Error(`API error ${response.status}: ${JSON.stringify(errData)}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                this.hideTypingIndicator();
                this.addMessageToUI(aiText, 'ai');
            } else {
                console.error("Unexpected Gemini response:", data);
                throw new Error("No valid candidates in response");
            }
        } catch (error) {
            console.error("Gemini Error:", error);
            this.hideTypingIndicator();
            const errMsg = error.message.includes("429")
                ? "Oh boy ! Mon quota de poussière de fée est épuisé pour aujourd'hui... Réessaye dans un moment ! ✨"
                : "Oups ! Une petite perturbation dans la Force... Vérifie ma connexion ou réessaye ! ✨";
            this.addMessageToUI(errMsg, 'ai');
        } finally {
            this.isTyping = false;
        }
    }

    addMessageToUI(text, sender) {
        const container = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerText = text;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;

        this.chatHistory.push({ role: sender === 'user' ? 'user' : 'model', parts: [{ text }] });
    }

    sendAssistantMessage(text) {
        this.addMessageToUI(text, 'ai');
    }

    showTypingIndicator() {
        const container = document.getElementById('chat-messages');
        const loader = document.createElement('div');
        loader.id = 'ai-typing';
        loader.className = 'message ai';
        loader.innerHTML = '<i class="fa-solid fa-ellipsis fa-fade"></i>';
        container.appendChild(loader);
        container.scrollTop = container.scrollHeight;
    }

    hideTypingIndicator() {
        const loader = document.getElementById('ai-typing');
        if (loader) loader.remove();
    }
}

// Global reference
window.assistant = null;
window.addEventListener('DOMContentLoaded', () => {
    window.assistant = new AssistantManager();
});
