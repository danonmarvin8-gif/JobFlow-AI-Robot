/**
 * DIVINE WHIS PORTRAIT — Canvas Rendering Engine
 */
const WhisPortrait = {
    canvas: null,
    ctx: null,
    radius: 70,
    auraPulse: 0,
    particles: [],
    mouse: { x: 0.5, y: 0.5 },
    basePath: window.location.pathname.includes('/arcade/') ? '../' : '',
    dialogues: [
        "L'entraînement est la clé de la maîtrise, n'est-ce pas ?",
        "Beerus-sama dort encore. Nous avons tout le temps pour coder.",
        "Avez-vous remarqué l'élégance de ces lignes de code ?",
        "Oh, un bug ? C'est une anomalie dans le continuum spatio-temporel.",
        "Votre puissance de développement dépasse les 9000 !"
    ],

    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 140;
        this.canvas.height = 140;

        for (let i = 0; i < 20; i++) this.particles.push(this.createParticle());

        document.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / rect.width;
            this.mouse.y = (e.clientY - rect.top) / rect.height;
        });

        this.animate();
        console.log("Divine Whis Engine Loaded");
    },

    createParticle() {
        return {
            a: Math.random() * Math.PI * 2,
            r: 50 + Math.random() * 20,
            s: 0.02 + Math.random() * 0.03,
            size: 1 + Math.random() * 2
        };
    },

    drawAura() {
        this.auraPulse += 0.05;
        const glow = 5 + Math.sin(this.auraPulse) * 5;

        this.ctx.save();
        this.ctx.translate(70, 70);

        // Divine Ring
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 65, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#48D1CC';
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = glow * 2;
        this.ctx.shadowColor = '#48D1CC';
        this.ctx.stroke();

        // Halo particles
        this.ctx.fillStyle = '#fff';
        this.particles.forEach(p => {
            p.a += p.s;
            const x = Math.cos(p.a) * p.r;
            const y = Math.sin(p.a) * p.r;
            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    },

    drawWhis() {
        // Simple representation or clipped image
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(70, 70, 60, 0, Math.PI * 2);
        this.ctx.clip();

        // Load image once or use placeholder
        if (!this.img) {
            this.img = new Image();
            this.img.src = this.basePath + 'whis-sprite.png';
        }
        if (this.img.complete && this.img.width > 0) {
            this.ctx.drawImage(this.img, 10, 10, 120, 120);
        } else {
            this.drawFallbackWhis();
        }

        // Eyes tracking (minimalistic)
        const ex = 70 + (this.mouse.x - 0.5) * 10;
        const ey = 70 + (this.mouse.y - 0.5) * 10;
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(60 + (this.mouse.x - 0.5) * 5, 60 + (this.mouse.y - 0.5) * 5, 2, 0, Math.PI * 2);
        this.ctx.arc(80 + (this.mouse.x - 0.5) * 5, 60 + (this.mouse.y - 0.5) * 5, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    },

    animate() {
        this.ctx.clearRect(0, 0, 140, 140);
        this.drawAura();
        this.drawWhis();
        requestAnimationFrame(() => this.animate());
    },

    greet() {
        this.speak("Oh, bonjour ! Je suis Whis. Ravi de voir votre potentiel s'éveiller.");
    },

    speak(text) {
        const bubble = document.getElementById('whis-bubble');
        if (!bubble) return;
        bubble.innerText = text;
        bubble.classList.add('visible');
        setTimeout(() => bubble.classList.remove('visible'), 5000);
    },

    drawFallbackWhis() {
        this.ctx.fillStyle = '#ADD8E6'; // Celestial Blue
        this.ctx.beginPath();
        this.ctx.arc(70, 70, 40, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
};

window.WhisPortrait = WhisPortrait;
document.addEventListener('DOMContentLoaded', () => WhisPortrait.init('whis-canvas'));
