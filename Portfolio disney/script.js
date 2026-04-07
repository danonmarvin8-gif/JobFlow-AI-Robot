/* =========================================
   DISNEY PORTFOLIO — SCRIPT
   Cinematic + Particles + Typewriter + Menu
   ========================================= */

(function () {
    'use strict';

    // =========================================
    // DOM ELEMENTS
    // =========================================
    const clickScreen = document.getElementById('click-screen');
    const videoScreen = document.getElementById('video-screen');
    const introVideo = document.getElementById('intro-video');
    const mainMenu = document.getElementById('main-menu');
    const skipBtn = document.getElementById('skip-btn');
    const canvas = document.getElementById('magic-canvas');
    if (!canvas) {
        console.warn("[Disney Portfolio] Canvas #magic-canvas not found.");
    }
    const ctx = canvas ? canvas.getContext('2d') : null;

    let particles = [];

    let videoTimer = null;
    let videoPollInterval = null;
    let menuActive = false;

    // =========================================
    // AUDIO MANAGER (persistence & crossfade)
    // =========================================
    class AudioManager {
        constructor() {
            this.menuAudio = document.getElementById('audio-menu');
            this.landAudios = {
                'stark-industries': document.getElementById('audio-stark'),
                'main-street': document.getElementById('audio-mainstreet'),
                'adventureland': document.getElementById('audio-adventure'),
                'fantasyland': document.getElementById('audio-fantasy')
            };
            this.assistantAudios = {}; // Dynamic assistant themes

            this.menuPlaylist = ['assets/audio-menu.mp3'];
            this.currentMenuIndex = 0;
            this.currentActiveAudio = null;

            this.init();
        }

        init() {
            this.menuAudio.src = this.menuPlaylist[this.currentMenuIndex];
            this.menuAudio.addEventListener('ended', () => this.nextMenuTrack());
        }

        nextMenuTrack() {
            this.currentMenuIndex = (this.currentMenuIndex + 1) % this.menuPlaylist.length;
            this.menuAudio.src = this.menuPlaylist[this.currentMenuIndex];
            this.fadeOutIn(this.menuAudio);
        }

        fadeOutIn(newAudio, volume = 0.4) {
            if (this.currentActiveAudio === newAudio) return;

            const fadeTime = 1500;
            const steps = 20;
            const interval = fadeTime / steps;

            if (this.currentActiveAudio) {
                const oldAudio = this.currentActiveAudio;
                let vol = oldAudio.volume;
                const fadeOut = setInterval(() => {
                    vol -= oldAudio.volume / steps;
                    if (vol <= 0) {
                        oldAudio.pause();
                        clearInterval(fadeOut);
                    } else {
                        oldAudio.volume = vol;
                    }
                }, interval);
            }

            this.currentActiveAudio = newAudio;
            newAudio.volume = 0;
            newAudio.play().catch(() => { });

            let newVol = 0;
            const fadeIn = setInterval(() => {
                newVol += volume / steps;
                if (newVol >= volume) {
                    newAudio.volume = volume;
                    clearInterval(fadeIn);
                } else {
                    newAudio.volume = newVol;
                }
            }, interval);
        }

        startMenuMusic() {
            this.fadeOutIn(this.menuAudio, 0.4);
        }

        switchToLand(landClass) {
            const audio = this.landAudios[landClass];
            if (audio) {
                this.fadeOutIn(audio, 0.5);
            }
        }

        switchToAssistantTheme(themeUrl) {
            if (!this.assistantAudios[themeUrl]) {
                const audio = new Audio(themeUrl);
                audio.loop = true;
                this.assistantAudios[themeUrl] = audio;
            }
            this.fadeOutIn(this.assistantAudios[themeUrl], 0.4);
        }

        backToMenu() {
            this.fadeOutIn(this.menuAudio, 0.4);
        }
    }

    const audioManager = new AudioManager();
    window.portfolioAudio = audioManager; // Global access

    // =========================================
    // MOOD MANAGER (The Kingdom Ambience)
    // =========================================
    class MoodManager {
        constructor() {
            this.overlay = document.getElementById('mood-overlay');
            this.container360 = document.getElementById('mood-360-container');
            this.hudContainer = document.getElementById('mood-hud-container');
            this.currentMood = null;
        }

        setMood(charData) {
            this.clearMood();
            this.currentMood = charData.name.toLowerCase();
            this.currentTheme = charData.theme;

            document.body.className = ''; // Reset body classes
            if (this.currentTheme) document.body.classList.add(this.currentTheme);
            document.body.classList.add(`mood-${this.currentMood}`);

            // 1. Atmosphere / Filters
            if (this.currentMood === 'ultron') {
                this.overlay.classList.add('glitch-active');
            } else if (this.currentMood === 'olaf') {
                this.overlay.classList.add('frost-active');
            }

            // 2. 360 Environments (Lazy-loaded images)
            if (charData.bg360) {
                this.container360.style.backgroundImage = `url(${charData.bg360})`;
                this.container360.classList.add('active');
            }

            // 3. HUD Injections
            if (charData.hudType === 'stark') {
                this.hudContainer.innerHTML = `
                    <div class="stark-hud">
                        <div class="hud-scanner"></div>
                        <div class="hud-diagnostics">SYSTEMS: ONLINE</div>
                    </div>
                `;
            }

            // 4. Music
            if (charData.musicUrl) {
                audioManager.switchToAssistantTheme(charData.musicUrl);
            }
        }

        clearMood() {
            this.overlay.className = 'mood-overlay';
            this.container360.className = 'mood-360';
            this.container360.style.backgroundImage = '';
            this.hudContainer.innerHTML = '';
            if (this.currentMood) document.body.classList.remove(`mood-${this.currentMood}`);
            if (this.currentTheme) document.body.classList.remove(this.currentTheme);
        }
    }

    const moodManager = new MoodManager();
    window.moodManager = moodManager;

    // =========================================
    // VIDEO LAZY LOADING (Local Support)
    // =========================================
    function initVideoLazyLoading() {
        const themeBg = document.getElementById('theme-bg');

        document.querySelectorAll('.land-card').forEach(card => {
            const container = card.querySelector('.card-video-container');
            const videoSrc = container ? container.getAttribute('data-video') : null;
            const bgSrc = card.getAttribute('data-bg');
            const gifSrc = card.getAttribute('data-gif');
            const landBg = card.querySelector('.land-bg');

            // Initialize land background with poster
            if (landBg && bgSrc) {
                landBg.style.backgroundImage = `url(${bgSrc})`;
            }

            card.addEventListener('mouseenter', () => {
                // 1. Vitrine Effect: Switch to GIF
                if (landBg && gifSrc) {
                    landBg.style.backgroundImage = `url(${gifSrc})`;
                }

                // 2. Handle Menu Background (Theme)
                if (bgSrc && themeBg) {
                    themeBg.style.backgroundImage = `url(${bgSrc})`;
                    themeBg.classList.add('active');
                }

                // 3. Handle Card Video (if any)
                if (container && videoSrc) {
                    let video = container.querySelector('video');
                    if (!video) {
                        video = document.createElement('video');
                        video.className = 'land-video';
                        video.src = videoSrc;
                        video.autoplay = true;
                        video.muted = true;
                        video.loop = true;
                        video.playsInline = true;
                        container.appendChild(video);
                    } else {
                        video.play().catch(() => { });
                    }
                }
            });

            card.addEventListener('mouseleave', () => {
                // 1. Reset Vitrine to poster if not active
                if (landBg && bgSrc && !card.classList.contains('active')) {
                    landBg.style.backgroundImage = `url(${bgSrc})`;
                }

                // 2. Reset Menu Background
                if (themeBg) {
                    themeBg.classList.remove('active');
                }

                // 3. Pause Card Video
                if (container) {
                    const video = container.querySelector('video');
                    if (video) video.pause();
                }
            });
        });
    }

    // =========================================
    // PARTICLE ENGINE (Optimized)
    // =========================================
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 2 + 1; // Smaller particles
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.speedY = (Math.random() - 0.5) * 1.5;
            this.opacity = 1;
            this.decay = Math.random() * 0.01 + 0.005;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= this.decay;
        }

        draw() {
            if (!ctx) return;
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            // Removed shadowBlur - major performance boost
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function spawnParticle(x, y, color = '#FFF') {
        if (particles.length > 150) return; // Cap particles for performance
        particles.push(new Particle(x, y, color));
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            if (p.opacity <= 0) {
                particles.splice(i, 1);
            } else {
                p.draw();
            }
        }

        requestAnimationFrame(animate);
    }

    // =========================================
    // SKILL TYPEWRITER
    // =========================================
    const activeTypings = new Map();

    function initSkillTypewriter() {
        document.querySelectorAll('.skill-item').forEach(item => {
            const descEl = item.querySelector('.skill-desc');
            if (!descEl) return;
            const fullText = descEl.getAttribute('data-full');
            if (!fullText) return;

            descEl.textContent = '';
            descEl.style.display = 'none';

            item.addEventListener('mouseenter', () => startTyping(descEl, fullText, 'forward'));
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (descEl.textContent.length > 0) startTyping(descEl, fullText, 'backward');
            });
        });
    }

    function startTyping(el, fullText, direction) {
        const existing = activeTypings.get(el);
        if (existing) clearInterval(existing.interval);

        el.style.display = 'block';
        const speed = direction === 'forward' ? 25 : 15;

        if (direction === 'forward') {
            let index = el.textContent.trim().length;
            const interval = setInterval(() => {
                if (index >= fullText.length) {
                    clearInterval(interval);
                    activeTypings.delete(el);
                    return;
                }
                el.textContent = fullText.substring(0, index + 1);
                index++;
            }, speed);
            activeTypings.set(el, { interval, direction });
        } else {
            let index = el.textContent.trim().length;
            const interval = setInterval(() => {
                if (index <= 0) {
                    clearInterval(interval);
                    activeTypings.delete(el);
                    el.textContent = '';
                    el.style.display = 'none';
                    return;
                }
                index--;
                el.textContent = fullText.substring(0, index);
            }, speed);
            activeTypings.set(el, { interval, direction });
        }
    }

    // =========================================
    // LAND INTERACTION
    // =========================================
    window.toggleLand = function (landClass) {
        const cards = document.querySelectorAll('.land-card');
        const clickedCard = document.querySelector('.' + landClass);
        const isOpening = !clickedCard.classList.contains('active');

        cards.forEach(card => {
            card.classList.remove('active');
            // Reset others to poster
            const bg = card.getAttribute('data-bg');
            const landBg = card.querySelector('.land-bg');
            if (landBg && bg) landBg.style.backgroundImage = `url('${bg}')`;
        });

        if (isOpening) {
            clickedCard.classList.add('active');
            const gif = clickedCard.getAttribute('data-gif');
            const landBg = clickedCard.querySelector('.land-bg');
            if (landBg && gif) landBg.style.backgroundImage = `url('${gif}')`;
            audioManager.switchToLand(landClass);
        } else {
            audioManager.backToMenu();
        }
    };

    // =========================================
    // INTRO LOGIC
    // =========================================
    clickScreen.addEventListener('click', () => {
        clickScreen.style.opacity = '0';
        setTimeout(() => {
            clickScreen.style.display = 'none';
            videoScreen.style.display = 'flex';
            setTimeout(() => videoScreen.style.opacity = '1', 50);

            introVideo.play().then(() => {
                videoPollInterval = setInterval(() => {
                    if (introVideo.currentTime >= 28) endCinematic();
                }, 100);
            }).catch(() => endCinematic());
        }, 800);
    });

    skipBtn.addEventListener('click', endCinematic);

    function endCinematic() {
        if (menuActive) return;
        menuActive = true;
        clearInterval(videoPollInterval);
        introVideo.pause();
        videoScreen.style.opacity = '0';
        setTimeout(() => {
            videoScreen.style.display = 'none';
            mainMenu.style.display = 'flex';
            setTimeout(() => {
                mainMenu.classList.add('active');
                mainMenu.style.opacity = '1';
                resizeCanvas();
                animate();
                audioManager.startMenuMusic();
                initSkillTypewriter();
                initVideoLazyLoading();
            }, 50);
        }, 800);
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('load', resizeCanvas);

})();

/* =========================================
   CONTACT MODAL LOGIC
   ========================================= */
window.openContactModal = function () {
    const modal = document.getElementById('contact-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
};

window.closeContactModal = function () {
    const modal = document.getElementById('contact-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 400);
};

window.openInGmail = function () {
    const email = 'danonmarvin8@gmail.com';
    const subject = encodeURIComponent('Contact depuis le Portfolio Disney');
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`, '_blank');
};

// Handle file name display
const fileInput = document.getElementById('contact-file');
const fileNameDisplay = document.getElementById('file-name-display');
if (fileInput && fileNameDisplay) {
    fileInput.addEventListener('change', (e) => {
        fileNameDisplay.textContent = e.target.files.length > 0 ? e.target.files[0].name : 'Aucun fichier choisi';
    });
}

// Handle Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('.send-form-btn');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';
        btn.disabled = true;

        // Simulate sending
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Envoyé avec Magie !';
            btn.style.background = '#28a745';

            // Collect info for mailto fallback
            const name = document.getElementById('contact-name').value;
            const message = document.getElementById('contact-message').value;
            const email = 'danonmarvin8@gmail.com';
            const subject = encodeURIComponent(`Message de ${name}`);
            const body = encodeURIComponent(`Nom: ${name}\nMessage: ${message}`);

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

                // Reset form
                setTimeout(() => {
                    contactForm.reset();
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                    fileNameDisplay.textContent = 'Aucun fichier choisi';
                    closeContactModal();
                }, 1000);
            }, 1000);
        }, 1500);
    });
}
