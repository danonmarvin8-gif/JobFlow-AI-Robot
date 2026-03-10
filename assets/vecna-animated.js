/**
 *  VECNA ANIMATED PORTRAIT — Canvas Rendering Engine
 *  Animated face with blinking eyes, particle effects, vine tendrils,
 *  mouth sync, and mood-reactive expressions.
 *
 *  Exposed API:
 *    window.VecnaPortrait.init(canvasId)
 *    window.VecnaPortrait.setMood(mood)   // 'neutral','menace','curious','amused','angry'
 *    window.VecnaPortrait.setSpeaking(bool)
 *    window.VecnaPortrait.setIdle()
 */
(function () {
    'use strict';

    /* ── CONFIG ── */
    const CFG = {
        fps: 30,
        eyeBlinkInterval: [3000, 7000],   // ms range between blinks
        eyeBlinkDuration: 150,
        pupilTrack: true,
        particleCount: 35,
        vineCount: 6,
        breathCycleSec: 4,
        mouthSyncSpeed: 80,  // ms per mouth frame
    };

    let canvas, ctx, W, H, cx, cy;
    let animFrame = null;
    let lastTime = 0;
    let portrait = null;       // loaded <img>
    let portraitLoaded = false;

    /* ── STATE ── */
    const state = {
        mood: 'neutral',       // neutral | menace | curious | amused | angry
        speaking: false,
        blinking: false,
        blinkTimer: 0,
        nextBlink: 4000,
        breathPhase: 0,
        mouthOpen: 0,          // 0..1
        mouthDir: 1,
        mouthTimer: 0,
        mouseX: 0.5,           // normalized 0..1
        mouseY: 0.5,
        particles: [],
        vines: [],
        glowPulse: 0,
        time: 0,
    };

    /* ── MOOD COLORS ── */
    const MOOD_COLORS = {
        neutral: { eye: '#ff1744', glow: 'rgba(255,23,68,0.4)', aura: 'rgba(183,28,28,0.15)' },
        menace: { eye: '#ff0000', glow: 'rgba(255,0,0,0.6)', aura: 'rgba(200,0,0,0.25)' },
        curious: { eye: '#ff6b6b', glow: 'rgba(255,107,107,0.4)', aura: 'rgba(183,28,28,0.12)' },
        amused: { eye: '#ff8a65', glow: 'rgba(255,138,101,0.4)', aura: 'rgba(200,80,28,0.15)' },
        angry: { eye: '#d50000', glow: 'rgba(213,0,0,0.7)', aura: 'rgba(213,0,0,0.3)' },
    };

    /* ══════════════════════════════
       PARTICLES (floating spores)
    ══════════════════════════════ */
    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1 + Math.random() * 2.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.2 - Math.random() * 0.5,
            alpha: 0.2 + Math.random() * 0.5,
            life: 0,
            maxLife: 200 + Math.random() * 300,
        };
    }

    function updateParticles(dt) {
        state.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life += dt;
            p.alpha = Math.max(0, 0.5 * (1 - p.life / p.maxLife));
            if (p.life > p.maxLife || p.y < -10 || p.x < -10 || p.x > W + 10) {
                state.particles[i] = createParticle();
                state.particles[i].y = H + 5;
            }
        });
    }

    function drawParticles() {
        const mc = MOOD_COLORS[state.mood];
        state.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = mc.eye;
            ctx.globalAlpha = p.alpha * 0.6;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }

    /* ══════════════════════════════
       VINE TENDRILS
    ══════════════════════════════ */
    function createVine(index) {
        const side = index % 4; // 0=top,1=right,2=bottom,3=left
        let sx, sy, angle;
        switch (side) {
            case 0: sx = Math.random() * W; sy = 0; angle = Math.PI / 2; break;
            case 1: sx = W; sy = Math.random() * H; angle = Math.PI; break;
            case 2: sx = Math.random() * W; sy = H; angle = -Math.PI / 2; break;
            default: sx = 0; sy = Math.random() * H; angle = 0;
        }
        return { sx, sy, angle, length: 20 + Math.random() * 40, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 1.5 };
    }

    function drawVines() {
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        state.vines.forEach(v => {
            const wave = Math.sin(state.time * v.speed + v.phase) * 8;
            const len = v.length + Math.sin(state.time * 0.5 + v.phase) * 10;
            ctx.beginPath();
            ctx.moveTo(v.sx, v.sy);
            const ex = v.sx + Math.cos(v.angle) * len;
            const ey = v.sy + Math.sin(v.angle) * len;
            const cpx = (v.sx + ex) / 2 + wave;
            const cpy = (v.sy + ey) / 2 + wave;
            ctx.quadraticCurveTo(cpx, cpy, ex, ey);
            ctx.strokeStyle = 'rgba(80,0,0,0.35)';
            ctx.stroke();
        });
    }

    /* ══════════════════════════════
       PORTRAIT DRAWING
    ══════════════════════════════ */
    function drawPortrait() {
        if (!portraitLoaded) return;
        const breath = Math.sin(state.breathPhase) * 1.5;
        const scale = 1 + breath * 0.005;
        const imgSize = Math.min(W, H) * 0.88;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // Circular clip
        ctx.beginPath();
        ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(portrait, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

        // Dark overlay for mood
        const mc = MOOD_COLORS[state.mood];
        ctx.fillStyle = mc.aura;
        ctx.fillRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize);

        ctx.restore();
    }

    /* ══════════════════════════════
       EYES OVERLAY
    ══════════════════════════════ */
    function drawEyes() {
        const mc = MOOD_COLORS[state.mood];
        // Eye glow overlay on top of the portrait
        const eyeY = cy - H * 0.08;
        const eyeSpacing = W * 0.13;
        const leftX = cx - eyeSpacing;
        const rightX = cx + eyeSpacing;
        const pupilSize = state.blinking ? 0 : 3.5;
        const glowSize = state.blinking ? 2 : (8 + Math.sin(state.glowPulse) * 3);

        // Pupil tracking
        const trackX = (state.mouseX - 0.5) * 4;
        const trackY = (state.mouseY - 0.5) * 3;

        // Mood-based eye shape
        let eyeH = state.blinking ? 0.5 : 5;
        if (state.mood === 'menace') eyeH = state.blinking ? 0.3 : 3.5;
        if (state.mood === 'angry') eyeH = state.blinking ? 0.3 : 4;
        if (state.mood === 'curious') eyeH = state.blinking ? 0.5 : 6;

        [leftX, rightX].forEach(ex => {
            // Outer glow
            const grd = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, glowSize * 2.5);
            grd.addColorStop(0, mc.glow);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.globalAlpha = 0.5 + Math.sin(state.glowPulse) * 0.2;
            ctx.beginPath();
            ctx.arc(ex, eyeY, glowSize * 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Pupil
            if (!state.blinking) {
                ctx.beginPath();
                ctx.ellipse(ex + trackX, eyeY + trackY, pupilSize, eyeH, 0, 0, Math.PI * 2);
                ctx.fillStyle = mc.eye;
                ctx.globalAlpha = 0.85;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Inner bright dot
                ctx.beginPath();
                ctx.arc(ex + trackX - 1, eyeY + trackY - 1, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.4;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        });
    }

    /* ══════════════════════════════
       MOUTH (speaking animation)
    ══════════════════════════════ */
    function drawMouth() {
        if (!state.speaking && state.mouthOpen <= 0) return;
        const mx = cx;
        const my = cy + H * 0.15;
        const mw = W * 0.08;
        const mh = state.mouthOpen * 4;

        ctx.beginPath();
        ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20,0,0,0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100,0,0,0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    /* ══════════════════════════════
       AURA & BORDER GLOW
    ══════════════════════════════ */
    function drawAura() {
        const mc = MOOD_COLORS[state.mood];
        const radius = Math.min(W, H) * 0.44;
        const pulseR = radius + Math.sin(state.glowPulse) * 3;

        // Outer aura ring
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = mc.eye;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + Math.sin(state.glowPulse * 1.5) * 0.15;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Psychic energy arcs
        if (state.mood === 'menace' || state.mood === 'angry') {
            for (let i = 0; i < 3; i++) {
                const a = state.time * 2 + i * (Math.PI * 2 / 3);
                const ax = cx + Math.cos(a) * pulseR;
                const ay = cy + Math.sin(a) * pulseR;
                ctx.beginPath();
                ctx.arc(ax, ay, 3, 0, Math.PI * 2);
                ctx.fillStyle = mc.eye;
                ctx.globalAlpha = 0.5;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }

    /* ══════════════════════════════
       MAIN LOOP
    ══════════════════════════════ */
    function update(timestamp) {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        if (dt > 0.1) { animFrame = requestAnimationFrame(update); return; }

        state.time += dt;
        state.breathPhase += (Math.PI * 2 / CFG.breathCycleSec) * dt;
        state.glowPulse += dt * 2.5;

        // Blink logic
        state.blinkTimer += dt * 1000;
        if (state.blinking && state.blinkTimer > CFG.eyeBlinkDuration) {
            state.blinking = false;
            state.blinkTimer = 0;
            state.nextBlink = CFG.eyeBlinkInterval[0] + Math.random() * (CFG.eyeBlinkInterval[1] - CFG.eyeBlinkInterval[0]);
        } else if (!state.blinking && state.blinkTimer > state.nextBlink) {
            state.blinking = true;
            state.blinkTimer = 0;
        }

        // Mouth animation
        if (state.speaking) {
            state.mouthTimer += dt * 1000;
            if (state.mouthTimer > CFG.mouthSyncSpeed) {
                state.mouthTimer = 0;
                state.mouthOpen += state.mouthDir * (0.3 + Math.random() * 0.4);
                if (state.mouthOpen >= 1) { state.mouthOpen = 1; state.mouthDir = -1; }
                if (state.mouthOpen <= 0) { state.mouthOpen = 0; state.mouthDir = 1; }
            }
        } else {
            state.mouthOpen = Math.max(0, state.mouthOpen - dt * 5);
        }

        updateParticles(dt);

        // Draw
        ctx.clearRect(0, 0, W, H);
        drawVines();
        drawPortrait();
        drawEyes();
        drawMouth();
        drawAura();
        drawParticles();

        animFrame = requestAnimationFrame(update);
    }

    /* ══════════════════════════════
       INIT
    ══════════════════════════════ */
    function init(canvasId, portraitSrc) {
        canvas = document.getElementById(canvasId);
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height, 50);
            canvas.width = size * 2;  // retina
            canvas.height = size * 2;
            canvas.style.width = size + 'px';
            canvas.style.height = size + 'px';
            W = canvas.width;
            H = canvas.height;
            cx = W / 2;
            cy = H / 2;
        }
        resize();
        window.addEventListener('resize', resize);

        // Load portrait image
        portrait = new Image();
        portrait.crossOrigin = 'anonymous';
        portrait.onload = () => { portraitLoaded = true; };
        portrait.src = portraitSrc || 'assets/vecna-portrait.png';

        // Init particles
        for (let i = 0; i < CFG.particleCount; i++) {
            state.particles.push(createParticle());
        }
        // Init vines
        for (let i = 0; i < CFG.vineCount; i++) {
            state.vines.push(createVine(i));
        }

        // Mouse tracking
        document.addEventListener('mousemove', e => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            state.mouseX = (e.clientX - rect.left) / rect.width;
            state.mouseY = (e.clientY - rect.top) / rect.height;
        });

        lastTime = performance.now();
        animFrame = requestAnimationFrame(update);
    }

    function destroy() {
        if (animFrame) cancelAnimationFrame(animFrame);
    }

    /* ── PUBLIC API ── */
    window.VecnaPortrait = {
        init,
        destroy,
        setMood(mood) {
            if (MOOD_COLORS[mood]) state.mood = mood;
        },
        setSpeaking(val) {
            state.speaking = !!val;
            if (!val) state.mouthOpen = 0;
        },
        setIdle() {
            state.mood = 'neutral';
            state.speaking = false;
        },
        getMood() { return state.mood; },
    };
})();
