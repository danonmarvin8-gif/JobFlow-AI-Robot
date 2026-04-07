/* =========================================
   DISNEY INTRO & TRANSITIONS SCRIPT
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const clickScreen = document.getElementById('click-screen');
    const introScreen = document.getElementById('intro-screen');
    const badgeScreen = document.getElementById('badge-screen');
    const mainMenu = document.getElementById('main-menu');

    const audio = document.getElementById('disney-intro-audio');
    const sfx = document.getElementById('sparkle-sfx');

    const canvas = document.getElementById('magic-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let arcSpark = { x: 0, y: 0, active: false };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // =========================================
    // 1. CLICK TO START -> INTRO CINEMATIC
    // =========================================
    clickScreen.addEventListener('click', () => {
        clickScreen.style.opacity = '0';
        setTimeout(() => {
            clickScreen.style.display = 'none';
            introScreen.style.display = 'flex';
            introScreen.style.opacity = '1';
            
            // Audio check
            if (audio) {
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio play blocked:", e));
            }
            
            startCinematic();
        }, 1000);
    });

    // =========================================
    // 2. CINEMATIC LOGIC (THE ARC)
    // =========================================
    function startCinematic() {
        const castle = document.querySelector('.castle-silhouette');
        if(castle) castle.style.opacity = '0.7';

        arcSpark.active = true;
        arcSpark.progress = 0; // 0 to 1

        const duration = 4000; // 4 seconds
        const startTime = performance.now();

        // Start coordinates (Bottom Left)
        const startX = canvas.width * 0.2;
        const startY = canvas.height * 0.8;
        // Peak coordinates (Above Castle)
        const peakX = canvas.width * 0.5;
        const peakY = canvas.height * 0.3;
        // End coordinates (Bottom Right)
        const endX = canvas.width * 0.8;
        const endY = canvas.height * 0.8;

        function animateArc(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Bézier Quadratic Curve calculation for the arc
            // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
            const t1 = 1 - t;
            arcSpark.x = t1 * t1 * startX + 2 * t1 * t * peakX + t * t * endX;
            arcSpark.y = t1 * t1 * startY + 2 * t1 * t * peakY + t * t * endY;

            // Spawn trail particles
            if (t < 0.99) {
                for (let i = 0; i < 3; i++) {
                    spawnParticle(arcSpark.x, arcSpark.y, '#DAA520');
                }
            }

            if (t >= 1) {
                arcSpark.active = false;
                triggerExplosion(arcSpark.x, arcSpark.y);
                setTimeout(transitionToBadge, 1000);
                return;
            }

            requestAnimationFrame(animateArc);
        }

        requestAnimationFrame(animateArc);
        animateParticles();
    }

    // =========================================
    // 3. EXPLOSION & BADGE TRANSITION
    // =========================================
    function triggerExplosion(x, y) {
        if (sfx) sfx.play().catch(() => {});
        for (let i = 0; i < 100; i++) {
            spawnParticle(x, y, '#FFF', true);
            spawnParticle(x, y, '#00D2FF', true);
        }
    }

    function transitionToBadge() {
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.style.display = 'none';
            badgeScreen.style.display = 'flex';
            badgeScreen.style.opacity = '1';
        }, 1000);
    }

    // =========================================
    // 4. ACTIVATE BADGE -> MAIN MENU
    // =========================================
    const activateBtn = document.getElementById('activate-badge-btn');
    activateBtn.addEventListener('click', () => {
        if (sfx) sfx.play().catch(() => {});
        badgeScreen.style.opacity = '0';
        setTimeout(() => {
            badgeScreen.style.display = 'none';
            mainMenu.style.display = 'flex';
            mainMenu.style.opacity = '1';
            document.body.style.overflow = 'auto'; // Re-enable scroll
        }, 1000);
    });

    // =========================================
    // PARTICLE ENGINE
    // =========================================
    class Particle {
        constructor(x, y, color, isExplosion = false) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 4 + 1;
            
            if (isExplosion) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
            } else {
                this.speedX = (Math.random() - 0.5) * 1;
                this.speedY = Math.random() * 2; // Up/Down drift
            }
            this.opacity = 1;
            this.decay = Math.random() * 0.02 + 0.005;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function spawnParticle(x, y, color, isExplosion) {
        particles.push(new Particle(x, y, color, isExplosion));
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update & Draw Particles
        particles = particles.filter(p => p.opacity > 0);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw active arc spark
        if (arcSpark.active) {
            ctx.save();
            ctx.fillStyle = '#FFF';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFF';
            ctx.beginPath();
            ctx.arc(arcSpark.x, arcSpark.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(animateParticles);
    }

    // =========================================
    // 5. MOUSE GLITCH / FAIRY SPARK
    // =========================================
    const fairy = document.getElementById('fairy-spark');
    document.addEventListener('mousemove', (e) => {
        if (!fairy) return;
        fairy.style.opacity = '1';
        fairy.style.left = e.clientX + 'px';
        fairy.style.top = e.clientY + 'px';

        // Spawn occasional particles on move
        if (Math.random() > 0.8) {
            spawnParticle(e.clientX, e.clientY, '#00D2FF');
        }
    });

});
