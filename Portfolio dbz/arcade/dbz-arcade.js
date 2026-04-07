/**
 * BUDOKAI SMASH — 2D Arcade Engine (Sparking! Combat Edition)
 * Combos, Parry, Stun, Knockback, and Flight.
 */

/**
 * AnimationController
 * Each fighter has its own instance.
 * It maps game states to sprite images and handles frame timing.
 *
 * Animation States:
 *   idle       – standing stance
 *   punch_r    – right punch / jab
 *   punch_l    – left punch / cross
 *   kick       – front kick (sidekick / roundhouse)
 *   kick_rev   – reverse / spin kick
 *   knockdown  – lying flat on ground after heavy blow
 *   charging   – powering up (glowing pose)
 *   special    – signature energy move pose
 *
 * Sprite files follow the naming convention:
 *   <key>-anim-<state>.png
 * e.g.  goku-anim-idle.png
 *       goku-anim-punch_r.png
 *
 * If a sprite for a given state is missing (Image.onerror / not loaded),
 * the controller gracefully falls back to the idle sprite.
 */

// Per-character override metadata (style, frame durations, etc.)
// The engine auto-builds sprite paths from the key; add overrides here if needed.
const CHAR_ANIM_META = {
    // ── Universe 7 ──────────────────────────────────────
    goku: {
        style: "agile_striker",      // Ki-Burst rushes followed by combos
        states: {
            idle: { hold: 12 },  // frames to display before looping
            punch_r: { hold: 4 },  // fast jab
            punch_l: { hold: 4 },
            kick: { hold: 5 },  // roundhouse
            kick_rev: { hold: 5 },  // spinning side kick
            knockdown: { hold: 30 },  // stays on ground briefly
            charging: { hold: 8 },
            special: { hold: 20 },  // Kamehameha charge pose
        }
    },
    vegeta: {
        style: "power_brawler",       // Aggressive big hits
        states: {
            idle: { hold: 10 },
            punch_r: { hold: 3 },  // explosive jab
            punch_l: { hold: 3 },
            kick: { hold: 6 },  // heavy boot kick
            kick_rev: { hold: 7 },  // heel spin
            knockdown: { hold: 25 },
            charging: { hold: 8 },
            special: { hold: 22 },  // Final Flash pose
        }
    },
    gohan: {
        style: "technical_fighter",
        states: {
            idle: { hold: 12 },
            punch_r: { hold: 4 },
            punch_l: { hold: 4 },
            kick: { hold: 5 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 25 },
            charging: { hold: 10 },
            special: { hold: 18 },  // Masenko pose
        }
    },
    piccolo: {
        style: "reach_fighter",       // Long arms, slow but powerful
        states: {
            idle: { hold: 14 },
            punch_r: { hold: 6 },  // extending-arm jab
            punch_l: { hold: 6 },
            kick: { hold: 7 },
            kick_rev: { hold: 6 },
            knockdown: { hold: 28 },
            charging: { hold: 10 },
            special: { hold: 22 }, // Special Beam Cannon pose
        }
    },
    android17: {
        style: "balanced_fighter",
        states: {
            idle: { hold: 12 },
            punch_r: { hold: 4 },
            punch_l: { hold: 4 },
            kick: { hold: 5 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 22 },
            charging: { hold: 8 },
            special: { hold: 18 },
        }
    },

    // ── Universe 6 ──────────────────────────────────────
    hit: {
        style: "assassin",            // Precise, minimalist, time-skip freezes
        states: {
            idle: { hold: 14 },
            punch_r: { hold: 2 },  // instant jab (very fast)
            punch_l: { hold: 2 },
            kick: { hold: 3 },
            kick_rev: { hold: 3 },
            knockdown: { hold: 20 },
            charging: { hold: 6 },
            special: { hold: 15 },  // Time-Skip stop pose
        }
    },
    caulifla: {
        style: "wild_brawler",        // Reckless power rushes
        states: {
            idle: { hold: 10 },
            punch_r: { hold: 3 },
            punch_l: { hold: 3 },
            kick: { hold: 4 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 20 },
            charging: { hold: 7 },
            special: { hold: 16 },
        }
    },
    kale: {
        style: "berserker",           // Slow wind-up, massive damage
        states: {
            idle: { hold: 14 },
            punch_r: { hold: 8 },  // slow heavy swing
            punch_l: { hold: 8 },
            kick: { hold: 10 },  // stomping kick
            kick_rev: { hold: 9 },
            knockdown: { hold: 30 },
            charging: { hold: 12 },
            special: { hold: 25 },
        }
    },
    frost: {
        style: "cunning_striker",
        states: {
            idle: { hold: 12 },
            punch_r: { hold: 4 },
            punch_l: { hold: 4 },
            kick: { hold: 5 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 22 },
            charging: { hold: 8 },
            special: { hold: 18 },
        }
    },

    // ── Universe 11 ──────────────────────────────────────
    jiren: {
        style: "tank_brawler",        // Immovable, devastating counters
        states: {
            idle: { hold: 16 },  // stoic pose
            punch_r: { hold: 5 },  // massive direct punch
            punch_l: { hold: 5 },
            kick: { hold: 7 },  // powerful stomp
            kick_rev: { hold: 7 },
            knockdown: { hold: 35 },  // rarely goes down
            charging: { hold: 12 },
            special: { hold: 25 },  // Power Impact charge
        }
    },
    toppo: {
        style: "justice_wrestler",    // Grapple-based, Justice Flash
        states: {
            idle: { hold: 12 },
            punch_r: { hold: 5 },
            punch_l: { hold: 5 },
            kick: { hold: 6 },
            kick_rev: { hold: 6 },
            knockdown: { hold: 28 },
            charging: { hold: 10 },
            special: { hold: 22 },
        }
    },
    dyspo: {
        style: "speed_fighter",       // Ultra-fast low-damage hits
        states: {
            idle: { hold: 8 },
            punch_r: { hold: 2 },  // blinding speed
            punch_l: { hold: 2 },
            kick: { hold: 2 },
            kick_rev: { hold: 3 },
            knockdown: { hold: 18 },
            charging: { hold: 5 },
            special: { hold: 12 },
        }
    },

    // ── Universe 9 ──────────────────────────────────────
    u9_bergamo: {
        style: "absorb_fighter",      // Grows stronger as he absorbs damage
        states: {
            idle: { hold: 12 },
            punch_r: { hold: 5 },  // wolf hook
            punch_l: { hold: 5 },
            kick: { hold: 6 },
            kick_rev: { hold: 6 },
            knockdown: { hold: 25 },
            charging: { hold: 8 },
            special: { hold: 20 },
        }
    },
    u9_basil: {
        style: "kickboxer",           // High-intensity kick combos
        states: {
            idle: { hold: 10 },
            punch_r: { hold: 3 },
            punch_l: { hold: 3 },
            kick: { hold: 3 },  // rapid kicks
            kick_rev: { hold: 3 },
            knockdown: { hold: 20 },
            charging: { hold: 6 },
            special: { hold: 15 },  // Shining Blast
        }
    },

    // ── Legendaries / Divine ──────────────────────────────
    beerus: {
        style: "lazy_destroyer",      // Casual but devastating, GoD energy
        states: {
            idle: { hold: 16 },
            punch_r: { hold: 4 },
            punch_l: { hold: 4 },
            kick: { hold: 5 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 20 },
            charging: { hold: 10 },
            special: { hold: 20 },  // Hakai
        }
    },
    whis: {
        style: "graceful_staff",      // Fluid staff-based movements
        states: {
            idle: { hold: 14 },
            punch_r: { hold: 3 },  // light tap
            punch_l: { hold: 3 },
            kick: { hold: 4 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 18 },
            charging: { hold: 8 },
            special: { hold: 18 },  // Angelic Strike
        }
    },
    broly: {
        style: "legendary_berserker", // Unstoppable, wild swings
        states: {
            idle: { hold: 14 },  // trembling with power
            punch_r: { hold: 7 },  // ground-shaking swing
            punch_l: { hold: 7 },
            kick: { hold: 8 },  // stomp / shoulder tackle
            kick_rev: { hold: 8 },
            knockdown: { hold: 35 },
            charging: { hold: 14 },
            special: { hold: 28 },  // Gigantic Roar
        }
    },
    frieza: {
        style: "elegant_ki_fighter",  // Death Beams and precise ki attacks
        states: {
            idle: { hold: 14 },
            punch_r: { hold: 4 },  // tail whip / jab
            punch_l: { hold: 4 },
            kick: { hold: 5 },
            kick_rev: { hold: 5 },
            knockdown: { hold: 22 },
            charging: { hold: 10 },
            special: { hold: 20 },  // Death Beam
        }
    },
};

// Default meta for any character not explicitly defined
const CHAR_ANIM_DEFAULT = {
    style: "balanced_fighter",
    states: {
        idle: { hold: 12 },
        punch_r: { hold: 4 },
        punch_l: { hold: 4 },
        kick: { hold: 5 },
        kick_rev: { hold: 5 },
        knockdown: { hold: 25 },
        charging: { hold: 8 },
        special: { hold: 18 },
    }
};

class AnimationController {
    constructor(charKey, fallbackSprite) {
        this.charKey = charKey;
        this.meta = CHAR_ANIM_META[charKey] || CHAR_ANIM_DEFAULT;
        this.state = 'idle';
        this.frameTimer = 0;
        this.fallbackSprite = fallbackSprite; // Image/Canvas from BudokaiGame.sprites

        // Preload a sprite map: state → Image/Canvas (loaded lazily on first access)
        this.spriteMap = {};
        this.loadingMap = {};

        this._preloadAll();
    }

    /** Build path for a given state sprite */
    _path(state) {
        return `${this.charKey}-anim-${state}.png`;
    }

    /** Preload all state sprites; if missing, mark null so fallback is used */
    _preloadAll() {
        const states = Object.keys(this.meta.states);
        states.forEach(state => {
            const img = new Image();
            img.onload = () => {
                // Run white-background removal
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) data[i + 3] = 0;
                }
                ctx.putImageData(imageData, 0, 0);
                this.spriteMap[state] = canvas;
            };
            img.onerror = () => {
                // No sprite for this state – will use fallback
                this.spriteMap[state] = null;
            };
            img.src = this._path(state);
        });
    }

    /**
     * Call every game frame. Returns the canvas/image to render.
     * @param {string} desiredState – the state the Fighter wants to be in
     * @returns {HTMLCanvasElement|HTMLImageElement|null}
     */
    getFrame(desiredState) {
        if (desiredState !== this.state) {
            this.state = desiredState;
            this.frameTimer = 0;
        }
        this.frameTimer++;

        // If the sprite for this state loaded, use it; otherwise use fallback
        const sprite = this.spriteMap[this.state];
        return sprite !== undefined && sprite !== null
            ? sprite
            : this.fallbackSprite;
    }

    /** Convert Fighter game state to animation state name */
    static resolveState(fighter) {
        if (fighter.stunTimer > 0 && fighter.vy === 0 &&
            fighter.y + fighter.h >= fighter.game.groundY - 2) return 'knockdown';
        if (fighter.isCharging) return 'charging';
        if (fighter.isSpecial) return 'special';
        if (fighter.isAttacking) {
            // Determine which type of combo hit this is
            switch (fighter.comboStep % 4) {
                case 0: return 'punch_r';
                case 1: return 'punch_l';
                case 2: return 'kick';
                case 3: return 'kick_rev';
            }
        }
        return 'idle';
    }
}

class SoundManager {
    constructor() {
        this.sounds = {
            hit: 'https://files.catbox.moe/6v6v4o.mp3', // Realistic Punch
            beam: 'https://files.catbox.moe/k9u7u1.mp3', // Realistic Energy Beam
            parry: 'https://files.catbox.moe/parry.mp3', // Placeholder for quick load
            stun: 'https://files.catbox.moe/stun.mp3',
            aura: 'https://www.myinstants.com/media/sounds/aura-sound-effect.mp3',
            vanish: 'https://www.myinstants.com/media/sounds/v-for-vanish.mp3'
        };
    }
    play(key, vol = 0.5) {
        try { const sfx = new Audio(this.sounds[key] || this.sounds.hit); sfx.volume = vol; sfx.play(); }
        catch (e) { console.warn("Audio load failed:", key); }
    }
}

class MapManager {
    constructor() {
        this.maps = {
            budokai: { name: "Championnat du Monde", bg: 'arena-back.png', preview: 'map-budokai.png', platforms: [], gravity: 0.8 },
            namek: { name: "Planète Namek", bg: 'arena-back.png', preview: 'map-namek.png', platforms: [{ x: 100, y: 400, w: 200, h: 20 }, { x: 500, y: 350, w: 250, h: 20 }], gravity: 0.5 },
            top: { name: "Arène du Pouvoir", bg: 'arena-back.png', preview: 'map-top.png', platforms: [{ x: 200, y: 200, w: 100, h: 10 }, { x: 400, y: 250, w: 100, h: 10 }, { x: 600, y: 200, w: 100, h: 10 }], gravity: 0.3 }
        };
    }
}

class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.conn = null;
        this.isHost = false;
        this.role = "local"; // host, guest, local
        this.guestInfo = null; // Stored guest metadata (for admin panel)
        this.connected = false;

        // Callbacks set by the UI
        this.onId = null;        // host: (id) => {}
        this.onConnect = null;   // called when P2P link opens
        this.onGuestReady = null;// host: (data) => {}
        this.onHostStart = null; // guest: (data) => {}
        this.onDisconnect = null;// (reason) => {}
        this.onError = null;     // (err) => {}
        this.onStatus = null;    // (msg, type) => {} — type: 'info'|'success'|'error'
    }

    _status(msg, type = 'info') {
        if (this.onStatus) this.onStatus(msg, type);
    }

    host(onId, onConnect) {
        // Cleanup any previous peer session
        if (this.peer) { this.peer.destroy(); this.peer = null; }

        this.isHost = true;
        this.role = "host";
        this.onId = onId;
        this.onConnect = onConnect;

        this._status("Connexion aux serveurs PeerJS...", 'info');

        try {
            this.peer = new Peer();
        } catch (e) {
            this._status("PeerJS non disponible (vérifiez votre connexion internet)", 'error');
            if (this.onError) this.onError(e);
            return;
        }

        this.peer.on('open', (id) => {
            this._status("Serveur prêt — en attente d'un adversaire...", 'success');
            if (onId) onId(id);
        });

        this.peer.on('connection', (conn) => {
            // Only accept one connection at a time
            if (this.connected) {
                conn.close();
                return;
            }
            this.conn = conn;
            this._setupConnection();
        });

        this.peer.on('error', (err) => {
            const msg = this._friendlyError(err);
            this._status(msg, 'error');
            if (this.onError) this.onError(err);
        });

        this.peer.on('disconnected', () => {
            this._status("Déconnecté des serveurs. Tentative de reconnexion...", 'info');
            this.peer.reconnect();
        });
    }

    join(id, onConnect) {
        if (this.peer) { this.peer.destroy(); this.peer = null; }

        this.isHost = false;
        this.role = "guest";
        this.onConnect = onConnect;

        this._status("Connexion aux serveurs PeerJS...", 'info');

        try {
            this.peer = new Peer();
        } catch (e) {
            this._status("PeerJS non disponible", 'error');
            if (this.onError) this.onError(e);
            return;
        }

        this.peer.on('open', () => {
            this._status(`Connexion à la salle ${id}...`, 'info');
            this.conn = this.peer.connect(id, { reliable: true });
            this._setupConnection();
        });

        this.peer.on('error', (err) => {
            const msg = this._friendlyError(err);
            this._status(msg, 'error');
            if (this.onError) this.onError(err);
        });
    }

    _setupConnection() {
        const conn = this.conn;

        conn.on('open', () => {
            this.connected = true;
            const who = this.isHost ? "Guest" : "Hôte";
            this._status(`Connecté à ${who} !`, 'success');
            if (this.onConnect) this.onConnect(conn.peer);
            conn.on('data', (data) => this._handleData(data));
        });

        conn.on('close', () => {
            this.connected = false;
            const who = this.isHost ? "L'adversaire a quitté" : "L'hôte a fermé la salle";
            this._status(who, 'error');
            if (this.onDisconnect) this.onDisconnect(who);
            // If mid-game, end match
            if (this.game.isPlaying) {
                this.game.matchStatus = this.isHost ? "VICTOIRE — Adversaire déconnecté" : "DÉFAITE — Hôte déconnecté";
                this.game.isPlaying = false;
            }
        });

        conn.on('error', (err) => {
            this._status("Erreur de connexion : " + err.type, 'error');
            if (this.onError) this.onError(err);
        });
    }

    _handleData(data) {
        if (this.isHost) {
            if (data.type === 'HELLO') {
                this.guestInfo = data;
                this.game.opponentName = data.pseudo || "Adversaire";
                if (this.onGuestReady) this.onGuestReady(data);
            } else if (data.type === 'INPUT') {
                this.game.p2InputData = data.keys;
            }
        } else {
            if (data.type === 'START') {
                this.game.opponentName = data.pseudo || "Adversaire";
                if (this.onHostStart) this.onHostStart(data);
            } else if (data.type === 'STATE') {
                this.game.applyState(data.state);
            } else if (data.type === 'KICK') {
                this._status("Tu as été expulsé par l'hôte.", 'error');
                this.disconnect();
                if (this.onDisconnect) this.onDisconnect("kick");
            }
        }
    }

    send(data) {
        if (this.conn && this.conn.open) this.conn.send(data);
    }

    /** HOST ONLY — kick the connected guest */
    kick() {
        if (!this.isHost) return;
        this.send({ type: 'KICK' });
        setTimeout(() => this.disconnect(), 200);
        this._status("Adversaire expulsé.", 'info');
    }

    disconnect() {
        if (this.conn) { this.conn.close(); this.conn = null; }
        this.connected = false;
        this.guestInfo = null;
    }

    _friendlyError(err) {
        switch (err.type) {
            case 'peer-unavailable': return "❌ Salle introuvable. Vérifiez le code.";
            case 'network': return "❌ Problème réseau. Vérifiez votre connexion.";
            case 'server-error': return "❌ Serveur PeerJS indisponible. Réessayez.";
            case 'socket-error': return "❌ Socket fermé. Rechargez la page.";
            default: return `❌ Erreur : ${err.type || err.message}`;
        }
    }
}

class BudokaiGame {
    constructor() {
        this.canvas = null; this.ctx = null;
        this.entities = []; this.isPlaying = false; this.keys = {};
        this.timer = 99; this.roundActive = false; this.matchStatus = "";
        this.shake = 0; // Screen shake intensity
        this.particles = []; // Impact particles
        this.marks = []; // Ground cracks/scorch marks

        this.roster = {
            // Univers 7
            goku: { name: "Goku", sprite: 'goku-sprite.png', color: "#00BFFF", category: "U7", specialMove: 'kamehameha', basePL: 30000 },
            vegeta: { name: "Vegeta", sprite: 'vegeta-sprite.png', color: "#EE82EE", category: "U7", specialMove: 'final_flash', basePL: 29000 },
            gohan: { name: "Gohan", sprite: 'gohan-sprite.png', color: "#FFFF00", category: "U7", specialMove: 'masenko', basePL: 25000 },
            piccolo: { name: "Piccolo", sprite: 'piccolo-sprite.png', color: "#FF4500", category: "U7", specialMove: 'special_beam_cannon', basePL: 22000 },
            android17: { name: "Android 17", sprite: 'android17-sprite.png', color: "#00FF7F", category: "U7", specialMove: 'barrier_blast', basePL: 28000 },

            // Univers 6
            hit: { name: "Hit", sprite: 'hit-sprite.png', color: "#4B0082", category: "U6", specialMove: 'time_skip', basePL: 85000000 },
            cabba: { name: "Cabba", sprite: 'vegeta-sprite.png', color: "#4682B4", category: "U6", specialMove: 'galick_gun', basePL: 15000 },
            caulifla: { name: "Caulifla", sprite: 'caulifla-sprite.png', color: "#DA70D6", category: "U6", specialMove: 'crush_cannon', basePL: 18000 },
            kale: { name: "Kale", sprite: 'kale-sprite.png', color: "#32CD32", category: "U6", specialMove: 'resist_blast', basePL: 40000 },
            frost: { name: "Frost", sprite: 'frieza-sprite.png', color: "#ADD8E6", category: "U6", specialMove: 'chaos_beam', basePL: 20000 },

            // Univers 11
            jiren: { name: "Jiren", sprite: 'jiren-sprite.png', color: "#FF0000", category: "U11", specialMove: 'power_impact', basePL: 120000000 },
            toppo: { name: "Toppo", sprite: 'toppo_sprite.png', color: "#B22222", category: "U11", specialMove: 'justice_flash', basePL: 95000000 },
            dyspo: { name: "Dyspo", sprite: 'dyspo-sprite.png', color: "#9370DB", category: "U11", specialMove: 'justice_kick', basePL: 75000000 },

            // Univers 9
            u9_bergamo: { name: "Bergamo", sprite: 'goku-sprite.png', color: "#708090", category: "U9", specialMove: 'wolf_drain', basePL: 12000 },
            u9_basil: { name: "Basil", sprite: 'goku-sprite.png', color: "#708090", category: "U9", specialMove: 'shining_blast', basePL: 11000 },
            u9_lavender: { name: "Lavender", sprite: 'goku-sprite.png', color: "#708090", category: "U9", specialMove: 'poison_blow', basePL: 10500 },

            // Univers 2
            u2_ribrianne: { name: "Ribrianne", sprite: 'ribrianne-sprite.png', color: "#FF69B4", category: "U2", specialMove: 'love_maiden', basePL: 45000 },

            // Legends/Divines
            whis: { name: "Whis", sprite: 'whis-sprite.png', color: "#ADD8E6", category: "DIVIN", specialMove: 'angelic_strike', basePL: 999999999 },
            beerus: { name: "Beerus", sprite: 'beerus-sprite.png', color: "#FF1493", category: "DIVIN", specialMove: 'hakai', basePL: 888888888 },
            broly: { name: "Broly", sprite: 'broly-sprite.png', color: "#00FF00", category: "LEGEND", specialMove: 'gigantic_roar', basePL: 150000 },
            frieza: { name: "Frieza", sprite: 'frieza-sprite.png', color: "#800080", category: "LEGEND", specialMove: 'death_beam', basePL: 120000 }
        };
        this.categories = {
            U7: "U7", U6: "U6", U11: "U11", U9: "U9", U2: "U2",
            DIVIN: "Dieux", LEGEND: "Légendes"
        };

        // Preload Roster Sprites with Fail-safes
        this.sprites = {};
        Object.keys(this.roster).forEach(key => {
            const img = new Image();
            img.src = this.roster[key].sprite;
            img.onload = () => { this.sprites[key] = this.processSprite(img); };
            img.onerror = () => {
                console.warn(`Failed to preload sprite for ${key}: ${img.src}. Using silhouette fallback.`);
                // Create a colored silhouette placeholder
                const canvas = document.createElement('canvas');
                canvas.width = 100; canvas.height = 100;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = this.roster[key].color || "#fff";
                ctx.beginPath();
                ctx.arc(50, 50, 40, 0, Math.PI * 2);
                ctx.fill();
                this.sprites[key] = canvas;
            };
        });

        // PERSISTENCE
        this.stats = JSON.parse(localStorage.getItem('dbz_stats')) || { wins: 0, losses: 0, bossWins: 0, totalMatches: 0 };
        this.username = localStorage.getItem('dbz_username') || "Guerrier";
        this.zKeni = parseInt(localStorage.getItem('dbz_zkeni')) || 0;
        this.spins = parseInt(localStorage.getItem('dbz_spins')) || 0;
        this.unlockedChars = JSON.parse(localStorage.getItem('dbz_unlocked')) || ['goku', 'vegeta'];
        this.charProgress = JSON.parse(localStorage.getItem('dbz_char_progress')) || {};
        this.customBinds = JSON.parse(localStorage.getItem('dbz_binds')) || {
            l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', a1: 'KeyZ', a2: 'KeyX', f: 'Space', b: 'KeyC', c: 'ShiftLeft', v: 'KeyV'
        };

        this.sfx = new SoundManager();
        this.mapMgr = new MapManager();
        this.activeMap = this.mapMgr.maps.budokai;
        this.p1TeamSize = parseInt(localStorage.getItem('dbz_p1Size')) || 1;
        this.p2TeamSize = parseInt(localStorage.getItem('dbz_p2Size')) || 1;

        this.multiplayer = new MultiplayerManager(this);
        this.keys = {};
        this.p2Keys = {};

        // Add Event Listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
        window.addEventListener('keyup', (e) => { delete this.keys[e.code]; });
        this.loopStarted = false;
    }

    processSprite(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            // Remove pure white background
            if (r > 250 && g > 250 && b > 250) data[i + 3] = 0;
        }
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    detectKeyboardLayout() {
        const lang = navigator.language || navigator.userLanguage;
        const isFrench = lang.startsWith('fr');
        return isFrench ? 'AZERTY' : 'QWERTY';
    }

    getControlKeys() {
        if (this.kbLayout === 'AZERTY') {
            return { l: 'KeyQ', r: 'KeyD', u: 'KeyZ', a1: 'KeyW', a2: 'KeyX', f: 'Space', b: 'KeyC', c: 'ShiftLeft', v: 'KeyV' };
        }
        return { l: 'KeyA', r: 'KeyD', u: 'KeyW', a1: 'KeyZ', a2: 'KeyX', f: 'Space', b: 'KeyC', c: 'ShiftLeft', v: 'KeyV' };
    }

    init(canvasId, p1Char = 'goku', p2Char = 'vegeta', mapKey = 'budokai', isHost = null) {
        this.canvas = document.getElementById(canvasId); if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resize(); // Ensure canvas has correct dimensions

        // Show Scouter HUD
        const scouter = document.getElementById('scouter-hud');
        if (scouter) scouter.style.display = 'block';

        // Initialize Assets with relative path safety
        this.assets = {
            bg: new Image()
        };
        const mapObj = this.mapMgr.maps[mapKey] || this.mapMgr.maps.budokai;
        this.assets.bg.src = mapObj.bg;
        this.assets.bg.onerror = () => {
            console.warn(`Failed to load map bg: ${mapObj.bg}. Using fallback.`);
            this.assets.bgLoaded = false;
        };
        this.assets.bg.onload = () => { this.assets.bgLoaded = true; };

        this.entities = [];
        this.marks = [];
        this.particles = [];
        this.shake = 0;
        this.timer = 180;
        this.isPlaying = true;
        this.zKeniEarned = 0;

        // Mode Checks
        this.isFFA = (window.BudokaiArcade.currentSetup?.mode === 'battleground');
        this.isTournament = (window.BudokaiArcade.currentSetup?.mode === 'tournament');

        let tournamentInfo = null;
        if (this.isTournament) {
            const progress = JSON.parse(localStorage.getItem('dbz_tourney_progress')) || { step: 0 };
            tournamentInfo = progress;
            const maps = ['budokai', 'namek', 'top', 'top'];
            const mapKey = maps[progress.step] || 'budokai';
            this.activeMap = this.mapMgr.maps[mapKey] || this.activeMap;
        }

        const rosterKeys = Object.keys(this.roster);

        if (this.isFFA) {
            // Mode Battleground: 10 fighters FFA
            const spawns = [
                { x: 100, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 700, y: 300 }, { x: 900, y: 300 },
                { x: 200, y: 100 }, { x: 400, y: 100 }, { x: 600, y: 100 }, { x: 800, y: 100 }, { x: 1000, y: 100 }
            ];

            // P1 (User)
            const p1Key = Array.isArray(p1Char) ? p1Char[0] : p1Char;
            this.p1 = new Fighter(spawns[0].x, spawns[0].y, p1Key, 'P1', this);
            this.p1.initAnim();
            this.entities.push(this.p1);

            // 9 Random AI Fighters
            for (let i = 1; i < 10; i++) {
                const randChar = rosterKeys[Math.floor(Math.random() * rosterKeys.length)];
                const ai = new Fighter(spawns[i].x, spawns[i].y, randChar, `AI_${i}`, this);
                ai.isAI = true;
                ai.initAnim();
                this.entities.push(ai);
            }
        } else {
            // Standard Modes (1v1, Team, Custom)
            const p1Size = window.BudokaiArcade.p1TeamSize || 1;
            const p2Size = window.BudokaiArcade.p2TeamSize || 1;

            // Spawn P1 Team
            const p1Chars = Array.isArray(p1Char) ? p1Char : [p1Char];
            for (let i = 0; i < p1Size; i++) {
                const charKey = p1Chars[i] || p1Chars[0];
                const f = new Fighter(100 + (i * 60), 400, charKey, 'P1', this);
                if (i === 0) this.p1 = f; else f.isAI = true;
                f.initAnim();
                this.entities.push(f);
            }

            // Spawn P2 Team
            let p2CharFinal = p2Char;
            if (this.isTournament) {
                // Pick a challenging opponent based on step
                const tier1 = ['krillin', 'piccolo', 'frieza'];
                const tier2 = ['vegeta', 'perfectcell', 'hit'];
                const tier3 = ['jiren', 'goku_black', 'dyspo'];
                const tier4 = ['jiren', 'whis', 'broly'];
                const tiers = [tier1, tier2, tier3, tier4];
                const pool = tiers[tournamentInfo.step] || tier1;
                p2CharFinal = pool[Math.floor(Math.random() * pool.length)];
            }

            for (let i = 0; i < p2Size; i++) {
                const charVal = (i === 0 ? p2CharFinal : rosterKeys[Math.floor(Math.random() * rosterKeys.length)]);
                const f = new Fighter(800 - (i * 50), 400, charVal, 'P2', this);
                f.isAI = true;
                f.dir = -1;
                if (this.isTournament) {
                    // Increase AI stats based on tournament step
                    f.hp += tournamentInfo.step * 50;
                    f.attackPower *= (1 + tournamentInfo.step * 0.2);
                }
                f.initAnim();
                this.entities.push(f);
            }
            this.p2 = this.entities.find(e => e.id === 'P2');
        }

        this.isPlaying = true;
        this.roundActive = true;
        this.matchStatus = "FIGHT !";
        setTimeout(() => { if (this.matchStatus === "FIGHT !") this.matchStatus = ""; }, 1500);

        this.gameLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.groundY = this.canvas.height - 80;
    }

    startRound() {
        this.matchStatus = "GET READY!";
        setTimeout(() => {
            this.matchStatus = "FIGHT!";
            setTimeout(() => {
                this.matchStatus = "";
                this.roundActive = true;
                this.gameLoop();
            }, 1000);
        }, 1500);
    }

    gameLoop() {
        if (!this.canvas) return;
        if (!this.loopStarted) { this.loopStarted = true; }

        try {
            this.update();
            this.draw();
        } catch (e) {
            console.error("Game loop error:", e);
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (!this.isPlaying) return;

        if (this.multiplayer.role === "guest") {
            this.multiplayer.send({ type: 'INPUT', keys: this.keys });
        } else {
            const p2Input = this.multiplayer.role === "host" ? this.p2InputData || {} : this.keys;

            // Update all entities
            this.entities.forEach(ent => {
                if (ent.id === 'P1') ent.update(this.keys);
                else ent.update(ent.isAI ? {} : p2Input);
            });

            // Combat check
            if (this.isFFA) {
                // FFA: Everyone vs Everyone
                for (let i = 0; i < this.entities.length; i++) {
                    for (let j = 0; j < this.entities.length; j++) {
                        if (i === j) continue;
                        this.checkCombat(this.entities[i], this.entities[j]);
                    }
                }
            } else {
                // Team Mode: Team 1 vs Team 2
                const team1 = this.entities.filter(e => e.id === 'P1');
                const team2 = this.entities.filter(e => e.id === 'P2');
                team1.forEach(t1 => {
                    team2.forEach(t2 => {
                        this.checkCombat(t1, t2);
                        this.checkCombat(t2, t1);
                    });
                });
            }

            // Cleanup dead entities
            this.entities = this.entities.filter(e => e.hp > 0);

            // Win condition
            if (this.isFFA) {
                // FFA Win: Only one survivor
                if (this.entities.length <= 1 || this.timer <= 0) this.endMatch();
            } else {
                // Team Win: One team eliminated
                const t1Alive = this.entities.some(e => e.id === 'P1');
                const t2Alive = this.entities.some(e => e.id === 'P2');
                if (!t1Alive || !t2Alive || this.timer <= 0) this.endMatch();
            }

            if (this.multiplayer.role === "host") {
                this.multiplayer.send({
                    type: 'STATE',
                    state: {
                        entities: this.entities.map(e => ({ id: e.id, charKey: e.charKey, ...e.getState() })),
                        marks: this.marks,
                        shake: this.shake,
                        isPlaying: this.isPlaying,
                        roundActive: this.roundActive,
                        matchStatus: this.matchStatus
                    }
                });
            }
        }

        // Timer Logic
        if (this.roundActive && this.timer > 0) {
            if (Math.random() < 0.016) { // Approx once per second at 60fps
                this.timer--;
            }
        }

        // Update Scouter PL
        const plDisplay = document.getElementById('power-level-display');
        if (plDisplay && this.p1) {
            const basePL = this.roster[this.p1.charKey]?.basePL || 9000;
            const boost = this.p1.isTransformed ? 500000 : 0;
            const currentPL = Math.floor(basePL + boost + (this.p1.ki * 100));
            plDisplay.innerText = `PL: ${currentPL.toLocaleString()}`;
        }
    }

    applyState(state) {
        if (state.entities) {
            // This is complex for multiplayer with dynamic teams
            // For now, let's just sync the first two if they exist
            // TODO: Proper multi-entity sync
        }
        this.marks = state.marks;
        this.shake = state.shake;
        this.isPlaying = state.isPlaying;
        this.roundActive = state.roundActive;
        this.matchStatus = state.matchStatus;
    }

    checkCombat(attacker, target) {
        if (!attacker.isAttacking) return;
        const range = attacker.isSpecial ? 600 : 90;
        const dx = Math.abs((attacker.x + attacker.w / 2) - (target.x + target.w / 2));
        const dy = Math.abs((attacker.y + attacker.h / 2) - (target.y + target.h / 2));

        if (dx < range && dy < 100) {
            // Check if blocked or dodged
            if (target.handleHit(attacker)) {
                if (attacker.id === 'P1') {
                    this.addZKeni(attacker.isSpecial ? 20 : 5);
                    attacker.masteryStats.currentCombo++;
                    attacker.masteryStats.maxCombo = Math.max(attacker.masteryStats.maxCombo, attacker.masteryStats.currentCombo);
                }
                this.sfx.play('hit');
            } else {
                // Dodge / Parry Logic (Rewards Skill)
                if (target.parryWindow > 0 || Math.abs(target.vx) > 5) {
                    target.masteryStats.dodgeCount++;
                }
            }
        } else if (attacker.id === 'P1' && attacker.isAttacking && dx > range + 100) {
            attacker.masteryStats.currentCombo = 0; // Combo broken if way off
        }
    }

    saveData() {
        localStorage.setItem('dbz_zkeni', this.zKeni);
        localStorage.setItem('dbz_spins', this.spins);
        localStorage.setItem('dbz_unlocked', JSON.stringify(this.unlockedChars));
        localStorage.setItem('dbz_char_progress', JSON.stringify(this.charProgress));
        localStorage.setItem('dbz_stats', JSON.stringify(this.stats));
    }

    addZKeni(amt) { this.zKeni += amt; this.saveData(); }

    endMatch() {
        this.roundActive = false;
        this.matchStatus = "K.O.";
        this.isPlaying = false;
        this.stats.totalMatches++;

        const t1Win = this.isFFA ? (this.entities[0]?.id === 'P1') : this.entities.some(e => e.id === 'P1');
        let winnerName = t1Win ? this.username : "Adversaires";
        if (this.isFFA && !t1Win) winnerName = "CPU Winner";

        // Show win screen
        const overlay = document.getElementById('win-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            document.getElementById('winner-name').innerText = winnerName;
            document.getElementById('match-stats').innerText = `${this.timer}s restantes | +${this.zKeniEarned} Z-KENI`;
        }

        const victory = t1Win;

        if (victory) {
            this.stats.wins++;
            let zReward = this.isFFA ? 1000 : 500;

            if (this.isTournament) {
                const progress = JSON.parse(localStorage.getItem('dbz_tourney_progress')) || { step: 0 };
                const rewards = [500, 1000, 1500, 2500];
                const spinRewards = [0, 0, 1, 2];

                zReward = rewards[progress.step] || 500;
                const sReward = spinRewards[progress.step] || 0;

                if (sReward > 0) {
                    this.spins += sReward;
                    this.saveData();
                }

                // Advance tournament
                progress.step++;
                if (progress.step > 3) {
                    // If Divine Step (only 1 step in divine)
                    const isDivine = (window.isAdmin || (progress.isDivine && progress.step === 1));
                    if (isDivine) {
                        const charProgress = this.charProgress[this.p1.charKey];
                        if (!charProgress.mastery) charProgress.mastery = [];
                        if (!charProgress.mastery.includes('god_of_destruction')) {
                            charProgress.mastery.push('god_of_destruction');
                            alert("FÉLICITATIONS ! Tu as obtenu le titre de DIEU DE LA DESTRUCTION.");
                        }
                    }
                    progress.step = 0;
                }
                localStorage.setItem('dbz_tourney_progress', JSON.stringify(progress));
            }

            this.addZKeni(zReward);
            this.zKeniEarned = zReward;
        } else {
            this.stats.losses++;
            this.addZKeni(100);
            this.zKeniEarned = 100;
            if (this.isTournament) {
                // Tournament lost reset
                localStorage.setItem('dbz_tourney_progress', JSON.stringify({ step: 0 }));
            }
        }

        // Update display in overlay if it exists
        const matchStatsEl = document.getElementById('match-stats');
        if (matchStatsEl) matchStatsEl.innerText = `${this.timer}s restantes | +${this.zKeniEarned} Z-KENI`;

        // Character Leveling & Mastery Checks
        if (this.p1) {
            this.addCharExp(this.p1.charKey, victory ? 500 : 200);
            this.checkMasteryUnlocks(this.p1);
        }

        this.saveData();
    }

    checkMasteryUnlocks(p) {
        const s = p.masteryStats;
        const progress = this.charProgress[p.charKey];
        if (!progress.mastery) progress.mastery = [];

        const tryUnlock = (id, name, chance) => {
            if (progress.mastery.includes(id)) return;
            if (Math.random() < chance) {
                progress.mastery.push(id);
                alert(`COMPÉTENCE LÉGENDAIRE DÉBLOQUÉE : ${name} !`);
                this.sfx.play('aura');
            } else {
                console.log(`Mastery ${name} missed (Chance: ${Math.floor(chance * 100)}%)`);
            }
        };

        // 1. Ultra Instinct: 20s flow, 8+ dodges, 0 hits
        if (s.nonDamageTime > 20000 && s.dodgeCount >= 8) {
            const chance = 0.05 + (progress.level * 0.02); // 5% base + 2% per level
            tryUnlock('ultra_instinct', 'ULTRA INSTINCT', chance);
        }

        // 2. Kaioken: Sustain < 20% HP for 15s
        if (p.hp < 20 && p.hp > 0 && s.nonDamageTime > 15000) {
            tryUnlock('kaioken', 'KAIOKEN', 0.15);
        }

        // 3. God Ki: Meditate for 10s under fire
        if (s.meditationTime > 10000) {
            tryUnlock('god_ki', 'KI DIVIN', 0.10);
        }

        // 4. Potential Unleashed: 15-hit combo
        if (s.maxCombo >= 15) {
            tryUnlock('potential_unleashed', 'POTENTIEL ÉVEILLÉ', 0.20);
        }
    }

    addCharExp(charKey, amt) {
        if (!this.charProgress[charKey]) {
            this.charProgress[charKey] = { level: 1, exp: 0, unlockedForms: ['base'] };
        }
        const p = this.charProgress[charKey];
        p.exp += amt;
        const nextReq = p.level * 1000;
        if (p.exp >= nextReq) {
            p.exp -= nextReq;
            p.level++;
            // Visual notification logic could go here
        }
    }

    addImpact(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 20,
                color
            });
        }
        this.shake = 15;
        if (y > this.groundY - 100) {
            this.marks.push({ x: x - 40, y: this.groundY - 5, w: 80, h: 5, life: 300 });
        }
    }

    quitGame() {
        console.log("BudokaiGame.quitGame() executing...");
        this.isPlaying = false;
        this.roundActive = false;
        this.entities = [];
        this.particles = [];
        this.marks = [];
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const menuOverlay = document.getElementById('menu-overlay');
        if (menuOverlay) {
            menuOverlay.classList.remove('hidden');
            menuOverlay.style.display = 'block';
        }

        if (window.nextScreen) window.nextScreen('screen-title');

        const winOverlay = document.getElementById('win-overlay');
        if (winOverlay) winOverlay.style.display = 'none';

        console.log("BudokaiGame.quitGame() finished.");
    }

    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        // Background Fallback
        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.shake > 0) {
            this.ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
            this.shake *= 0.9;
        }

        if (this.assets.bg && this.assets.bg.complete && this.assets.bg.naturalWidth > 0) {
            this.ctx.drawImage(this.assets.bg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            const grad = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width);
            grad.addColorStop(0, "#1a1a1a");
            grad.addColorStop(1, "#000");
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.marks = this.marks.filter(m => m.life > 0);
        this.ctx.fillStyle = "rgba(0,0,0,0.5)";
        this.marks.forEach(m => {
            this.ctx.fillRect(m.x, m.y, m.w, m.h);
            m.life--;
        });

        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, 4, 4);
            p.x += p.vx; p.y += p.vy; p.life--;
        });

        this.entities.forEach(e => e.draw(this.ctx));
        this.ctx.restore();

        this.drawHUD();
        if (this.matchStatus) this.drawOverlay();
    }

    drawHUD() {
        const barW = 350, barH = 25, margin = 40;
        if (!this.p1) return;

        // P1
        this.ctx.fillStyle = "#333"; this.ctx.fillRect(margin, margin, barW, barH);
        this.ctx.fillStyle = this.p1.stunTimer > 0 ? "#555" : "#FFD700";
        this.ctx.fillRect(margin, margin, (this.p1.hp / this.p1.maxHp) * barW, barH);

        // P2 (Dynamic for FFA)
        const p2 = this.isFFA ? (this.entities.find(e => e.id !== 'P1') || null) : this.p2;
        if (p2) {
            this.ctx.fillStyle = "#333"; this.ctx.fillRect(this.canvas.width - barW - margin, margin, barW, barH);
            const p2Ratio = Math.min(1, p2.hp / (p2.maxHp || 100));
            this.ctx.fillStyle = p2.stunTimer > 0 ? "#555" : (p2.hp > 100 ? "#FF4500" : "#FFD700");
            this.ctx.fillRect(this.canvas.width - margin - (p2Ratio * barW), margin, p2Ratio * barW, barH);

            // Ki Bar P2
            this.ctx.fillStyle = "#00BFFF";
            this.ctx.fillRect(this.canvas.width - margin - (p2.ki / p2.maxKi) * (barW * 0.7), margin + barH + 5, (p2.ki / p2.maxKi) * (barW * 0.7), 8);

            // Stamina Bar P2
            this.ctx.fillStyle = "#32CD32";
            this.ctx.fillRect(this.canvas.width - margin - (p2.stamina / p2.maxStamina) * (barW * 0.5), margin + barH + 18, (p2.stamina / p2.maxStamina) * (barW * 0.5), 5);
        }

        // Z-Keni
        const currentZ = parseInt(localStorage.getItem('dbz_zkeni')) || 0;
        this.ctx.fillStyle = "#fff"; this.ctx.font = "bold 24px 'Bangers'"; this.ctx.textAlign = "center";
        this.ctx.fillText(`${currentZ} Z-KENI`, this.canvas.width / 2, margin + 40);

        // Ki Bar P1
        this.ctx.fillStyle = "#00BFFF";
        this.ctx.fillRect(margin, margin + barH + 5, (this.p1.ki / this.p1.maxKi) * (barW * 0.7), 8);

        // Stamina Bar P1
        this.ctx.fillStyle = "#32CD32";
        this.ctx.fillRect(margin, margin + barH + 18, (this.p1.stamina / this.p1.maxStamina) * (barW * 0.5), 5);
    }

    drawOverlay() {
        this.ctx.fillStyle = "#FFD700"; this.ctx.font = "bold 120px 'Bangers'"; this.ctx.textAlign = "center";
        this.ctx.fillText(this.matchStatus, this.canvas.width / 2, this.canvas.height / 2);
    }
}

class Fighter {
    constructor(x, y, charKey, id, game) {
        this.game = game; this.id = id; this.charKey = charKey;
        this.x = x; this.y = y; this.vx = 0; this.vy = 0;
        this.w = 140; this.h = 140; this.hp = 100;
        this.isJumping = false; this.isAttacking = false; this.isSpecial = false;
        this.isFlying = false; this.isBlocking = false; this.stunTimer = 0;
        this.comboStep = 0; this.lastAttackTime = 0;
        this.isAI = false; this.dir = id === 'P1' ? 1 : -1;
        this.ki = 20; this.maxKi = 100;
        this.stamina = 100; this.maxStamina = 100;
        this.isCharging = false; this.guardBreakTimer = 0;
        this.isTransformed = false;
        this.parryWindow = 0;

        // Load Dojo Upgrades
        this.applyUpgrades();

        // Mastery Tracking
        this.masteryStats = {
            dodgeCount: 0,
            lastHitTime: 0,
            nonDamageTime: 0,
            maxCombo: 0,
            currentCombo: 0,
            kaiokenActiveTime: 0,
            meditationTime: 0
        };

        // Animation system – initialised after sprites are ready
        this.anim = null;
        this._animReady = false;
    }

    applyUpgrades() {
        const allProgress = JSON.parse(localStorage.getItem('dbz_char_progress')) || {};
        const p = allProgress[this.charKey] || { level: 1, exp: 0, upgrades: {} };
        this.level = p.level || 1;
        this.masteries = p.mastery || [];

        // Base Stat Scaling
        const up = p.upgrades || {};
        this.maxHp = 100 + (up.hp || 0) * 40; // Max 300
        this.hp = this.maxHp;

        this.atkMultiplier = 1 + (up.atk || 0) * 0.2; // Max 2.0x
        this.kiRegen = 0.5 + (up.ki || 0) * 0.1; // Max 1.0
        this.maxStamina = 100 + (up.stm || 0) * 10;
        this.stamina = this.maxStamina;
    }
    initAnim() {
        const fallback = this.game.sprites[this.charKey] || null;
        this.anim = new AnimationController(this.charKey, fallback);
        this._animReady = true;
    }

    update(keys) {
        if (!this.game.roundActive) return;
        if (this.stunTimer > 0) {
            this.stunTimer--;
            this.vy += this.game.activeMap.gravity;
            this.y += this.vy;
            if (this.y + this.h > this.game.groundY) { this.y = this.game.groundY - this.h; this.vy = 0; }
            return;
        }

        if (this.isAI) this.handleAI(); else this.handleInput(keys);

        // Update Mastery Tracking
        const now = Date.now();
        if (now - this.masteryStats.lastHitTime > 1000) {
            this.masteryStats.nonDamageTime += 16.6; // approx ms per frame
        } else {
            this.masteryStats.nonDamageTime = 0;
            this.masteryStats.dodgeCount = 0;
        }

        if (this.isCharging && !this.isAttacking) {
            this.masteryStats.meditationTime += 16.6;
        } else {
            this.masteryStats.meditationTime = 0;
        }

        // Dynamic Physics
        this.vy += this.isFlying ? 0.1 : this.game.activeMap.gravity;
        this.vx *= 0.8;
        this.x += this.vx; this.y += this.vy;
        if (this.parryWindow > 0) this.parryWindow--;
        if (this.guardBreakTimer > 0) this.guardBreakTimer--;

        // Stamina Recovery
        if (!this.isBlocking && this.stamina < this.maxStamina) this.stamina += 0.2;
        if (this.isBlocking) {
            this.stamina -= 0.1;
            if (this.stamina <= 0) {
                this.stamina = 0; this.isBlocking = false;
                this.guardBreakTimer = 120;
                this.game.sfx.play('stun');
                this.game.addImpact(this.x + this.w / 2, this.y + this.h / 2, "#f0f");
            }
        }

        // Collisions
        if (this.y + this.h > this.game.groundY) { this.y = this.game.groundY - this.h; this.vy = 0; this.isJumping = false; this.isFlying = false; }
        this.game.activeMap.platforms.forEach(p => {
            if (this.vy >= 0 && this.y + this.h > p.y && this.y + this.h < p.y + p.h + 10 && this.x + this.w > p.x && this.x < p.x + p.w) {
                this.y = p.y - this.h; this.vy = 0; this.isJumping = false; this.isFlying = false;
            }
        });
        if (this.x < 0) this.x = 0; if (this.x + this.w > this.game.canvas.width) this.x = this.game.canvas.width - this.w;
    }

    handleAI() {
        // AI Targeting: Find nearest enemy
        let target = null;
        let minDist = Infinity;

        this.game.entities.forEach(e => {
            if (e === this) return;
            // FFA Mode: Everyone is an enemy
            // Team Mode: Only different team ID is an enemy
            const isEnemy = this.game.isFFA ? true : (e.id !== this.id);
            if (!isEnemy) return;

            const d = Math.abs(this.x - e.x);
            if (d < minDist) {
                minDist = d;
                target = e;
            }
        });

        if (!target) return;

        const dist = target.x - this.x;
        const keys = {};

        // Movement
        if (Math.abs(dist) > 150) {
            if (dist > 0) keys.r = true; else keys.l = true;
        } else {
            // Combat logic
            if (Math.random() < 0.05) keys.a1 = true; // Punch
            if (Math.random() < 0.02) keys.a2 = true; // Kick
            if (Math.random() < 0.01 && this.ki > 20) keys.f = true; // Special
            if (target.isAttacking && Math.random() < 0.3) keys.b = true; // Block
            if (target.isAttacking && Math.random() < 0.1) keys.v = true; // Vanish
        }

        // Recovery
        if (this.ki < 20 && Math.abs(dist) > 400 && Math.random() < 0.1) keys.c = true;

        this.handleInput(keys);
    }

    handleInput(keys) {
        const isP1 = this.id === 'P1';
        // In multiplayer, the remote player (guest) uses P1 controls on their end.
        const useP1Controls = isP1 || this.game.multiplayer.role === "host";

        let controls;
        if (useP1Controls) {
            controls = this.game.customBinds;
        } else {
            // Local P2 controls
            controls = { l: 'KeyA', r: 'KeyD', u: 'KeyW', a1: 'KeyJ', a2: 'KeyK', f: 'ControlRight', b: 'KeyL', c: 'KeyP', v: 'KeyO' };
        }

        if (keys[controls.v] && !this.vPressed) this.vanish();
        this.vPressed = keys[controls.v];

        // Transformation Toggle (G key for P1)
        if (isP1 && keys['KeyG'] && this.ki === this.maxKi && !this.isTransformed) {
            this.isTransformed = true;
            this.game.shake = 30;
            this.game.sfx.play('aura', 1);
            if (window.WhisPortrait) window.WhisPortrait.speak("Impressionnant... Une véritable ascension !");
        }

        this.isCharging = keys[controls.c] && !this.isAttacking && !this.isBlocking;
        if (this.isCharging && !this.isAttacking) {
            this.ki = Math.min(this.maxKi, this.ki + this.kiRegen);
            this.vx *= 0.5;
            return;
        }

        this.isBlocking = keys[controls.b] && this.guardBreakTimer === 0;
        if (this.isBlocking) {
            if (this.parryWindow === 0 && !this.wasBlocking) this.parryWindow = 10; // 10 frames of parry window
            this.wasBlocking = true; return;
        }
        this.wasBlocking = false;

        if (keys[controls.l]) { this.vx = -12; this.dir = -1; }
        if (keys[controls.r]) { this.vx = 12; this.dir = 1; }
        if (keys[controls.u]) {
            if (this.isFlying) this.vy = -10;
            else if (!this.isJumping) { this.vy = -22; this.isJumping = true; this.game.sfx.play('jump'); }
        }
        if (keys[controls.f] && !this.spacePressed) { this.isFlying = !this.isFlying; this.game.sfx.play('aura', 0.1); }
        this.spacePressed = keys[controls.f];

        if (keys[controls.a1]) this.startCombo();
        if (keys[controls.a2] && this.ki >= 30) { this.ki -= 30; this.attack(true); }
    }

    startCombo() {
        const now = Date.now();
        if (this.isAttacking) return;
        if (now - this.lastAttackTime < 400) this.comboStep = (this.comboStep + 1) % 4;
        else this.comboStep = 0;
        this.lastAttackTime = now;
        this.attack(false);
    }

    attack(isSpecial) {
        if (this.isAttacking) return;
        this.isAttacking = true; this.isSpecial = isSpecial;
        let basePower = isSpecial ? 35 : (10 + this.comboStep * 5);
        if (this.isTransformed) basePower *= 1.5;
        this.attackPower = basePower * this.atkMultiplier;
        if (isSpecial) this.game.sfx.play('beam');
        setTimeout(() => { this.isAttacking = false; this.isSpecial = false; }, isSpecial ? 800 : 200);
    }

    vanish() {
        if (this.ki < 20 || this.stunTimer > 0) return;
        this.ki -= 20;
        this.game.sfx.play('vanish');
        this.game.addImpact(this.x + this.w / 2, this.y + this.h / 2, "#fff");

        // Teleport behind opponent
        const enemies = this.game.entities.filter(e => e.id !== this.id);
        if (enemies.length > 0) {
            let target = enemies[0];
            this.x = target.x + (target.dir * -120);
            this.y = target.y;
            this.dir = target.dir;
        }
    }

    handleHit(attacker) {
        // SKILL OVER LEVEL: Parries negate all damage
        if (this.parryWindow > 0) {
            attacker.stunTimer = 60;
            this.game.sfx.play('parry');
            this.game.addImpact(this.x + this.w / 2, this.y + this.h / 2, "#fff");
            return false;
        }

        // DAMAGE SCALING: Prevents one-shots
        // Logic: (BasePower * AttackerMult) / (1 + TargetDefenseBonus)
        const defBonus = (this.maxHp - 100) / 400; // Small defense gain from HP upgrades
        let damage = attacker.attackPower / (1 + defBonus);

        // Anti-One-Shot Cap: Damage limited to 15% of max HP for basic attacks, 35% for special
        const damageLimit = attacker.isSpecial ? 0.35 : 0.15;
        damage = Math.min(damage, this.maxHp * damageLimit);

        if (this.isBlocking) {
            this.hp -= damage * 0.2;
            this.vx = (attacker.dir === 1 ? 5 : -5);
            this.game.addImpact(this.x + this.w / 2, this.y + this.h / 2, "#aaa");
            return true;
        }

        this.hp -= damage;
        this.vx = (attacker.dir === 1 ? 15 : -15);
        this.stunTimer = 20;
        this.masteryStats.lastHitTime = Date.now();
        this.game.addImpact(this.x + this.w / 2, this.y + this.h / 2, "#f00");

        // HIT STOP (Frame freeze effect)
        const originalIsPlaying = this.game.isPlaying;
        if (attacker.comboStep === 3 || attacker.isSpecial) {
            this.game.isPlaying = false;
            setTimeout(() => this.game.isPlaying = originalIsPlaying, 100);
        }

        // PROJECTION
        const isLauncher = attacker.comboStep === 3;
        const force = attacker.isSpecial ? 35 : (isLauncher ? 40 : 15);
        this.vx = (attacker.dir === 1 ? force : -force);
        this.vy = attacker.isSpecial || isLauncher ? -25 : -5;
        this.game.addImpact(this.x + this.w / 2, this.y + this.h / 2, this.game.roster[attacker.charKey].color);
        return true;
    }

    getState() {
        return {
            x: this.x, y: this.y, hp: this.hp, ki: this.ki, stamina: this.stamina,
            isAttacking: this.isAttacking, isSpecial: this.isSpecial, isFlying: this.isFlying,
            isBlocking: this.isBlocking, isTransformed: this.isTransformed,
            dir: this.dir, stunTimer: this.stunTimer, guardBreakTimer: this.guardBreakTimer
        };
    }

    applyState(state) {
        this.x = state.x; this.y = state.y; this.hp = state.hp; this.ki = state.ki;
        this.stamina = state.stamina; this.isAttacking = state.isAttacking;
        this.isSpecial = state.isSpecial; this.isFlying = state.isFlying;
        this.isBlocking = state.isBlocking; this.isTransformed = state.isTransformed;
        this.dir = state.dir; this.stunTimer = state.stunTimer;
        this.guardBreakTimer = state.guardBreakTimer;
    }

    draw(ctx) {
        const animState = this._animReady ? AnimationController.resolveState(this) : 'idle';
        let sprite = this._animReady ? this.anim.getFrame(animState) : (this.game.sprites[this.charKey] || null);
        const char = this.game.roster[this.charKey];
        const cx = this.x + this.w / 2;

        ctx.save();
        if (this.isCharging || this.isTransformed) this.drawAura(ctx, this.isCharging);

        const hasSprite = sprite && (sprite instanceof HTMLCanvasElement || (sprite instanceof HTMLImageElement && sprite.complete && sprite.naturalWidth > 0));

        if (hasSprite) {
            if (this.dir === -1) {
                ctx.translate(this.x + this.w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(sprite, 0, 0, this.w, this.h);
            } else {
                ctx.drawImage(sprite, this.x, this.y, this.w, this.h);
            }
        } else {
            // ── Enhanced Silhouette Fallback ──
            const color = char ? char.color : "#FF0000";
            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, this.y + this.h / 2, 50, 0, Math.PI * 2);
            ctx.fill();

            // Add a stroke to make it pop on black
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.shadowBlur = 0;
            // Name label fallback
            ctx.fillStyle = "#fff";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(char ? char.name : "Fighter", cx, this.y - 12);
        }
        ctx.restore();

        if (this.isFlying) this.drawAura(ctx);
        if (this.isSpecial) this.drawSpecial(ctx);
    }

    drawAura(ctx, isCharging = false) {
        ctx.save();
        const now = Date.now();
        const offset = Math.sin(now / 150) * 8;
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;

        // 1. Base Charge/Flight Aura (Subtle)
        ctx.globalAlpha = isCharging ? 0.3 : 0.15;
        ctx.fillStyle = this.isTransformed ? "#FFD700" : "#fff";
        ctx.beginPath();
        ctx.ellipse(cx, this.y + this.h, 60 + offset, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Mastery Specific Auras (Skill-based)
        ctx.globalAlpha = 0.4;
        this.masteries.forEach(m => {
            if (m === 'ultra_instinct') {
                // White "Heat" Aura
                ctx.shadowBlur = 30; ctx.shadowColor = "#fff";
                ctx.strokeStyle = "rgba(255,255,255,0.6)";
                ctx.lineWidth = 4;
                ctx.strokeRect(this.x + offset, this.y + offset, this.w - offset * 2, this.h - offset * 2);
            } else if (m === 'kaioken') {
                // Red Pulsing Aura
                ctx.shadowBlur = 20; ctx.shadowColor = "#f00";
                ctx.fillStyle = "rgba(255,0,0,0.2)";
                ctx.beginPath();
                ctx.arc(cx, cy, 70 + offset, 0, Math.PI * 2);
                ctx.fill();
            } else if (m === 'god_ki') {
                // Cyan/Magenta Shimmer
                ctx.shadowBlur = 40; ctx.shadowColor = "#00BFFF";
                const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y + this.h);
                grad.addColorStop(0, "rgba(0, 191, 255, 0.3)");
                grad.addColorStop(1, "rgba(128, 0, 128, 0.3)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 80, 100, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (m === 'god_of_destruction') {
                // Deep Purple Particles
                ctx.shadowBlur = 50; ctx.shadowColor = "#800080";
                ctx.fillStyle = "rgba(75, 0, 130, 0.5)";
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 120, 10, 10);
                }
            }
        });

        ctx.restore();
    }

    drawSpecial(ctx) {
        if (!this.isSpecial) return;
        const char = this.game.roster[this.charKey];
        if (!char) return;
        const now = Date.now();
        const special = char.specialMove;
        ctx.save();
        ctx.fillStyle = char.color;
        ctx.shadowBlur = 40;
        ctx.shadowColor = char.color;

        let beamW = this.dir > 0 ? 1000 : -1000;
        let beamH = 35;
        let beamY = this.y + 60;

        if (special === 'final_flash') {
            beamH = 80;
            beamY = this.y + 40;
            ctx.fillStyle = "#ffff00"; // Bright Yellow
            ctx.shadowColor = "#ffff00";
        } else if (this.masteries.includes('god_of_destruction')) {
            // HAKAI OVERRIDE
            beamH = 120;
            ctx.fillStyle = "#800080"; // Destruction Purple
            ctx.shadowColor = "#ff00ff";
            ctx.shadowBlur = 60;
            // Draw sphere of destruction
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2 + (this.dir * 400), beamY + 15, 100, 0, Math.PI * 2);
            ctx.fill();
        } else if (special === 'special_beam_cannon') {
            beamH = 15;
            ctx.fillStyle = "#f00";
            // Draw spiral effect
            const time = Date.now() / 50;
            for (let i = 0; i < Math.abs(beamW); i += 20) {
                const sx = this.x + this.w / 2 + (this.dir > 0 ? i : -i);
                const sy = beamY + 15 + Math.sin(time + i * 0.1) * 20;
                ctx.fillRect(sx, sy, 10, 10);
            }
        } else if (special === 'time_skip') {
            // Hit doesn't use a beam, he freezes time
            ctx.fillStyle = "rgba(75, 0, 130, 0.3)";
            ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
            beamW = 0; // No beam
        } else if (special === 'death_beam') {
            beamH = 8;
            ctx.fillStyle = "#ff00ff";
        }

        if (beamW !== 0) {
            ctx.fillRect(this.x + this.w / 2, beamY, beamW, beamH);
        }

        const expX = this.x + this.w / 2 + beamW - (this.dir > 0 ? 60 : -60);
        if (special !== 'time_skip') {
            const isHakai = this.masteries.includes('god_of_destruction');
            if (isHakai) {
                // Hakai doesn't explode, it dissolves
                ctx.fillStyle = "rgba(128, 0, 128, 0.4)";
                ctx.beginPath();
                ctx.arc(expX + 70, this.y + 70, 80 + Math.sin(now / 100) * 20, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.game.assets.explosion.complete && this.game.assets.explosion.width > 0) {
                ctx.drawImage(this.game.assets.explosion, expX, this.y, 140, 140);
            } else {
                ctx.fillStyle = "rgba(255, 69, 0, 0.8)";
                ctx.beginPath();
                ctx.arc(expX + 70, this.y + 70, 50, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

window.BudokaiArcade = new BudokaiGame();
