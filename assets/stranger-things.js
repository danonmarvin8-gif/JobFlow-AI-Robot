/* ============================================
   STRANGER THINGS PORTFOLIO — JavaScript
   ============================================ */

(function () {
    'use strict';

    // === AUDIO ===
    const audio = document.getElementById('st-audio');
    const transitionAudio = document.getElementById('transition-audio');
    const vortexSfx = document.getElementById('vortex-sfx');
    const portalAudioContinuation = document.getElementById('portal-audio-continuation');
    const stTitleSequence = document.getElementById('st-title-sequence-hd');
    const kateBushFull = document.getElementById('kate-bush-full');
    const menuBgVideo = document.getElementById('menu-bg-video');
    const musicBtn = document.getElementById('music-toggle');
    let musicPlaying = false;
    let currentPlaylistTrack = null;
    let playlistIndex = 0;

    // === PERSISTENCE CHECK & BFCACHE HANDLING ===
    window.addEventListener('pageshow', (event) => {
        const navEntries = performance.getEntriesByType('navigation');
        const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';

        if (isReload) {
            sessionStorage.removeItem('portal_seen');
            document.documentElement.classList.remove('portal-skipped-active');
            return;
        }

        if (sessionStorage.getItem('portal_seen')) {
            document.body.classList.add('portal-skipped');

            // Check persistence for mute
            if (localStorage.getItem('st_music_muted')) {
                musicPlaying = false;
                if (musicBtn) musicBtn.textContent = '🔇';
            } else {
                musicPlaying = true;
                if (musicBtn) musicBtn.textContent = '🔊';
            }

            // Short delay to ensure browser has re-attached media elements
            setTimeout(() => {
                startMenuPhase();
            }, 150);
        }
    });

    function toggleMusic() {
        if (musicPlaying) {
            audio.pause();
            transitionAudio.pause();
            vortexSfx.pause();
            if (currentPlaylistTrack) currentPlaylistTrack.pause();
            musicBtn.textContent = '🔇';
            localStorage.setItem('st_music_muted', 'true');
        } else {
            // Context dependent play
            if (document.getElementById('main-menu').classList.contains('active')) {
                if (currentPlaylistTrack) currentPlaylistTrack.play().catch(() => { });
                else audio.play().catch(() => { });
            }
            musicBtn.textContent = '🔊';
            localStorage.removeItem('st_music_muted');
        }
        musicPlaying = !musicPlaying;
    }

    if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

    // === PHASE 0: CLICK TO START ===
    const clickScreen = document.getElementById('click-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const portalScreen = document.getElementById('portal-screen');
    const mainMenu = document.getElementById('main-menu');

    clickScreen.addEventListener('click', function () {
        // Start atmospheric hum (full volume)
        audio.volume = 1.0;
        audio.play().catch(() => { });
        musicPlaying = true;
        if (musicBtn) musicBtn.textContent = '🔊';

        // Transition to loading
        clickScreen.classList.add('hidden');
        setTimeout(() => {
            clickScreen.style.display = 'none';
            startLoadingPhase();
        }, 800);
    });

    // === PHASE 1: LOADING SCREEN ===
    function startLoadingPhase() {
        loadingScreen.classList.add('active');
        initLoadingParticles();
        animateTitle();
    }

    function animateTitle() {
        const letters = document.querySelectorAll('.st-letter');
        letters.forEach((letter, i) => {
            letter.style.animationDelay = `${i * 0.12}s`;
        });

        // After all letters appear, start glow pulse
        const totalDelay = letters.length * 0.12 + 1.2;
        setTimeout(() => {
            const container = document.querySelector('.st-title-container');
            if (container) container.classList.add('glow-active');
            startLoadingBar();
        }, totalDelay * 1000);
    }

    function startLoadingBar() {
        const fill = document.querySelector('.loading-bar-fill');
        const percent = document.querySelector('.loading-percent');
        let progress = 0;

        const interval = setInterval(() => {
            const increment = Math.random() * 3 + 0.5;
            progress = Math.min(progress + increment, 100);
            fill.style.width = progress + '%';
            percent.textContent = Math.floor(progress) + '%';

            if (progress >= 100) {
                clearInterval(interval);
                percent.textContent = '100%';
                setTimeout(startPortalPhase, 1000);
            }
        }, 100);
    }

    // Loading screen particles
    function initLoadingParticles() {
        const canvas = document.getElementById('loading-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        for (let i = 0; i < 200; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.5 - 0.1,
                alpha: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2
            });
        }

        let loadingAnimId;
        function drawLoadingParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.02;
                const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

                if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 23, 68, ${alpha * 0.15})`;
                ctx.fill();
            });
            loadingAnimId = requestAnimationFrame(drawLoadingParticles);
        }
        drawLoadingParticles();

        window._stopLoadingParticles = () => {
            cancelAnimationFrame(loadingAnimId);
        };
    }

    // === PHASE 2: PORTAL TRANSITION (Seamless Crossfade) ===
    function startPortalPhase() {
        loadingScreen.classList.add('hidden');
        if (window._stopLoadingParticles) window._stopLoadingParticles();

        // Stop the initial hum
        audio.pause();
        audio.currentTime = 0;

        setTimeout(() => {
            loadingScreen.style.display = 'none';
            portalScreen.classList.add('active');

            const portalVideo = document.getElementById('portal-video');
            const skipBtn = document.getElementById('skip-portal');
            let crossfadeStarted = false;

            // Preload the menu loop video for seamless transition
            if (menuBgVideo) {
                menuBgVideo.load();
                menuBgVideo.volume = 0; // Start silent
            }

            // Preload continuation audio
            if (portalAudioContinuation) {
                portalAudioContinuation.load();
                portalAudioContinuation.volume = 0;
            }

            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    if (portalVideo) { portalVideo.pause(); portalVideo.currentTime = 0; }
                    document.body.classList.add('no-transition');
                    portalScreen.classList.add('hidden');
                    portalScreen.style.display = 'none';
                    document.body.classList.remove('screen-shake');
                    startMenuPhase();
                    setTimeout(() => document.body.classList.remove('no-transition'), 100);
                });
            }

            if (portalVideo) {
                portalVideo.volume = 1.0;
                portalVideo.currentTime = 0;
                portalVideo.play().catch(() => { });

                // CROSSFADE: Start fading 2s before intro ends
                portalVideo.ontimeupdate = () => {
                    if (crossfadeStarted) return;
                    const remaining = portalVideo.duration - portalVideo.currentTime;

                    if (remaining <= 2 && remaining > 0 && portalVideo.duration > 0) {
                        crossfadeStarted = true;

                        // Start the loop video underneath, invisible at first
                        if (menuBgVideo) {
                            menuBgVideo.currentTime = 0;
                            menuBgVideo.play().catch(() => { });
                        }

                        // Start continuation audio silently
                        if (portalAudioContinuation && musicPlaying) {
                            portalAudioContinuation.currentTime = 0;
                            portalAudioContinuation.play().catch(() => { });
                        }

                        // Gradual crossfade over 2 seconds (50ms steps)
                        let fadeStep = 0;
                        const totalSteps = 40; // 40 * 50ms = 2000ms
                        const fadeInterval = setInterval(() => {
                            fadeStep++;
                            const progress = fadeStep / totalSteps;

                            // Fade out intro video audio
                            portalVideo.volume = Math.max(0, 1 - progress);

                            // Fade in continuation audio
                            if (portalAudioContinuation) {
                                portalAudioContinuation.volume = Math.min(1, progress);
                            }

                            // Fade portal screen opacity for visual crossfade
                            portalScreen.style.opacity = Math.max(0, 1 - progress * 0.8);

                            if (fadeStep >= totalSteps) {
                                clearInterval(fadeInterval);
                            }
                        }, 50);
                    }
                };

                // When intro video fully ends, switch cleanly
                portalVideo.onended = () => {
                    portalVideo.ontimeupdate = null;
                    document.body.classList.add('no-transition');
                    portalScreen.classList.add('hidden');
                    portalScreen.style.display = 'none';
                    portalScreen.style.opacity = '1'; // Reset for potential replay
                    document.body.classList.remove('screen-shake');

                    startMenuPhase(true); // true = crossfade already handled

                    setTimeout(() => document.body.classList.remove('no-transition'), 100);
                };
            } else {
                setTimeout(startMenuPhase, 4000);
            }

            document.body.classList.add('screen-shake');
        }, 500);
    }

    // === PHASE 3: MAIN MENU ===
    function startMenuPhase(crossfadeHandled) {
        const playlist = [portalAudioContinuation, stTitleSequence, kateBushFull].filter(el => el !== null);

        function playNextTrack() {
            if (!musicPlaying) return;

            // Stop current if any
            if (currentPlaylistTrack) {
                currentPlaylistTrack.pause();
                currentPlaylistTrack.currentTime = 0;
            }

            currentPlaylistTrack = playlist[playlistIndex];
            if (currentPlaylistTrack) {
                currentPlaylistTrack.volume = 1.0;
                // Don't reload if crossfade already started this track
                if (!(crossfadeHandled && playlistIndex === 0)) {
                    currentPlaylistTrack.load();
                }
                currentPlaylistTrack.play().catch(err => {
                    console.log("Audio play failed:", err);
                });

                currentPlaylistTrack.onended = () => {
                    playlistIndex = (playlistIndex + 1) % playlist.length;
                    playNextTrack();
                };
            }
        }

        // If crossfade was handled, the first track is already playing
        playlistIndex = 0;
        if (crossfadeHandled && portalAudioContinuation) {
            // Track is already playing from crossfade, just set it as current
            currentPlaylistTrack = portalAudioContinuation;
            currentPlaylistTrack.volume = 1.0; // Ensure full volume
            currentPlaylistTrack.onended = () => {
                playlistIndex = 1;
                playNextTrack();
            };
        } else {
            playNextTrack();
        }

        sessionStorage.setItem('portal_seen', 'true');

        // Setup looping video — if crossfade handled, video is already playing
        if (menuBgVideo) {
            menuBgVideo.volume = 1.0;
            if (!crossfadeHandled) {
                menuBgVideo.load();
                menuBgVideo.play().catch(err => {
                    console.log("Video play failed:", err);
                });
            }
        }

        document.body.classList.add('menu-active');
        mainMenu.classList.add('active');
        initMenuParticles();
        initParallax();
        animateCardsIn();
    }

    // Menu particles (Ash / Dust)
    function initMenuParticles() {
        const canvas = document.getElementById('menu-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
        }
        resize();
        window.addEventListener('resize', resize);

        const particles = [];
        const count = 100;
        let mouseX = -1000;
        let mouseY = -1000;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY + window.scrollY;
        });

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: Math.random() * 0.5 + 0.1, // Falling like ash
                alpha: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                // Mouse repulsion
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    p.vx -= (dx / dist) * force * 0.4;
                    p.vy -= (dy / dist) * force * 0.4;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Return to normal speed
                p.vx *= 0.95;
                if (Math.abs(p.vx) < 0.05) p.vx = (Math.random() - 0.5) * 0.5;
                if (p.vy < 0.1) p.vy += 0.05;

                p.pulse += 0.01;
                const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

                if (p.y > canvas.height + 20) p.y = -20;
                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 200, 200, ${alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(draw);
        }
        draw();
    }

    function initParallax() {
        const lair = document.querySelector('.lair-image');
        const header = document.querySelector('.menu-header');
        if (!header) return;
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5);
            const y = (e.clientY / window.innerHeight - 0.5);
            header.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
            if (lair) lair.style.transform = `scale(1.1) translate(${x * -15}px, ${y * -15}px)`;
        });
    }

    function animateCardsIn() {
        const cards = document.querySelectorAll('.episode-card');
        cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.5 + i * 0.08}s`;

            // Subtle hover SFX
            card.addEventListener('mouseenter', () => {
                if (musicPlaying && vortexSfx) {
                    const hoverGhost = vortexSfx.cloneNode();
                    hoverGhost.volume = 0.05; // Very subtle
                    hoverGhost.play().catch(() => { });
                }
            });

            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        });
    }

})();
