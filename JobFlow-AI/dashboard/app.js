/* ============================================================
   JobFlow-AI — Dashboard Application Logic
   ============================================================ */

// ─── State ───
const state = {
    currentPage: 'dashboard',
    campaignActive: false,
    offers: [],
    applications: [],
    settings: loadSettings(),
    stats: { scraped: 0, sent: 0, opened: 0, replies: 0, errors: 0, pending: 0 }
};

const API_BASE = ''; // Using relative paths as frontend is served by backend

// ─── Navigation ───
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        navigateTo(page);
    });
});

document.querySelectorAll('.btn-link[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.page);
    });
});

function navigateTo(page) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        // Re-trigger animation
        targetPage.style.animation = 'none';
        targetPage.offsetHeight;
        targetPage.style.animation = '';
    }

    // Update header
    const titles = {
        dashboard: ['Dashboard', 'Vue d\'ensemble de tes candidatures automatisées'],
        offers: ['Offres d\'emploi', 'Toutes les offres scrapées en temps réel'],
        applications: ['Candidatures', 'Suivi de toutes tes candidatures envoyées'],
        cv: ['CV Manager', 'Gère tes CV de base pour la génération automatique'],
        settings: ['Paramètres', 'Configure tes clés API et filtres de recherche']
    };

    document.getElementById('page-title').textContent = titles[page][0];
    document.getElementById('page-subtitle').textContent = titles[page][1];
    state.currentPage = page;
}

// ─── Live Clock ───
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('live-clock').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// ─── Sidebar Toggle (Mobile) ───
document.getElementById('btn-sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ─── Campaign Toggle ───
document.getElementById('btn-toggle-campaign').addEventListener('click', toggleCampaign);

async function toggleCampaign() {
    try {
        const response = await fetch(`${API_BASE}/api/campaign/toggle`, { method: 'POST' });
        const data = await response.json();
        
        state.campaignActive = (data.status === 'active');
        updateCampaignUI();
        
        if (state.campaignActive) {
            showToast('Campagne activée ! Le pipeline démarre...', 'success');
            addActivity('Campagne démarrée — Pipeline de scraping et envoi actif', 'green');
            // Trigger a run immediately if starting
            fetch(`${API_BASE}/api/pipeline/run`, { method: 'POST' });
        } else {
            showToast('Campagne mise en pause', 'info');
            addActivity('Campagne mise en pause par l\'utilisateur', 'gold');
        }
        
        refreshData();
    } catch (error) {
        console.error('Error toggling campaign:', error);
        showToast('Erreur lors du changement d\'état de la campagne', 'error');
    }
}

function updateCampaignUI() {
    const indicator = document.querySelector('.status-indicator');
    const stateLabel = document.getElementById('campaign-state');
    const icon = document.getElementById('campaign-icon');

    if (state.campaignActive) {
        indicator.className = 'status-indicator active';
        stateLabel.textContent = 'Active 24/7';
        icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    } else {
        indicator.className = 'status-indicator paused';
        stateLabel.textContent = 'En pause';
        icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    }
}

// ─── Demo Mode (simulates data for visual demo) ───
// ─── Data Fetching ───
async function refreshData() {
    try {
        // Fetch Stats
        const statsRes = await fetch(`${API_BASE}/api/stats`);
        const statsData = await statsRes.json();
        updateStats(statsData);

        // Fetch Campaign Status
        const campRes = await fetch(`${API_BASE}/api/campaign/status`);
        const campData = await campRes.json();
        state.campaignActive = campData.active;
        updateCampaignUI();

        // Fetch Offers
        const offersRes = await fetch(`${API_BASE}/api/offers`);
        const offersData = await offersRes.json();
        state.offers = offersData;
        renderOffers(offersData);
        if (document.getElementById('offers-count')) {
            document.getElementById('offers-count').textContent = offersData.length;
        }

        // Fetch Applications
        const appsRes = await fetch(`${API_BASE}/api/applications`);
        const appsData = await appsRes.json();
        state.applications = appsData;
        renderApplications(appsData);
        if (document.getElementById('apps-count')) {
            document.getElementById('apps-count').textContent = appsData.length;
        }

    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

function updateStats(data) {
    // Check if values changed to avoid redundant animations
    if (data.offers_scraped !== state.stats.scraped) {
        animateCounter('stat-scraped', data.offers_scraped, 'Offres scrapées');
        state.stats.scraped = data.offers_scraped;
    }
    if (data.emails_sent !== state.stats.sent) {
        animateCounter('stat-sent', data.emails_sent, 'E-mails envoyés');
        state.stats.sent = data.emails_sent;
    }
    if (data.emails_opened !== state.stats.opened) {
        animateCounter('stat-opened', data.emails_opened, 'E-mails ouverts');
        state.stats.opened = data.emails_opened;
    }
    if (data.replies !== state.stats.replies) {
        animateCounter('stat-replies', data.replies, 'Réponses reçues');
        state.stats.replies = data.replies;
    }

    // Update trend labels with real numbers
    const trends = {
        scraped: document.querySelector('#stat-scraped .stat-trend span'),
        sent: document.querySelector('#stat-sent .stat-trend span'),
        opened: document.querySelector('#stat-opened .stat-trend span'),
        replies: document.querySelector('#stat-replies .stat-trend span')
    };

    if (trends.scraped) trends.scraped.textContent = `${data.pending || 0} en attente`;
    if (trends.sent) trends.sent.textContent = `${data.errors || 0} erreurs d'envoi`;
    
    // Calculate percentages
    const openRate = data.emails_sent > 0 ? (data.emails_opened / data.emails_sent * 100).toFixed(1) : 0;
    const replyRate = data.emails_sent > 0 ? (data.replies / data.emails_sent * 100).toFixed(1) : 0;
    
    if (trends.opened) trends.opened.textContent = `${openRate}% taux d'ouverture`;
    if (trends.replies) trends.replies.textContent = `${replyRate}% taux de réponse`;

    // Update pipeline visual
    updatePipeline([data.pending || 0, 0, 0, data.emails_sent || 0, data.replies || 0]); 
}

// ─── Animate Counter ───
function animateCounter(cardId, target, label) {
    const card = document.getElementById(cardId);
    const valueEl = card.querySelector('.stat-value');
    const duration = 1500;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);
        valueEl.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// ─── Update Pipeline ───
function updatePipeline(values) {
    const total = values.reduce((a, b) => a + b, 0);
    const stages = document.querySelectorAll('.pipeline-stage');

    stages.forEach((stage, i) => {
        const count = values[i] || 0;
        const pct = total > 0 ? (count / total * 100) : 0;
        stage.querySelector('.stage-bar').style.setProperty('--progress', pct + '%');
        stage.querySelector('.stage-count').textContent = count;
    });
}

// ─── Render Offers ───
function renderOffers(offers) {
    const grid = document.getElementById('offers-grid');
    const preview = document.getElementById('offers-preview');

    const cardsHTML = offers.map(offer => {
        const initials = offer.company.split(' ').map(w => w[0]).join('').slice(0, 2);
        const typeLabels = { alternance: 'Alternance', job_etudiant: 'Job étudiant', stage: 'Stage' };

        return `
            <div class="offer-card" data-id="${offer.id}">
                <div class="offer-card-header">
                    <div class="offer-company">
                        <div class="offer-company-logo">${initials}</div>
                        <div class="offer-company-info">
                            <h3>${offer.title}</h3>
                            <span class="offer-company-name">${offer.company}</span>
                        </div>
                    </div>
                    <span class="offer-type-badge ${offer.offer_type}">${typeLabels[offer.offer_type] || offer.offer_type}</span>
                </div>
                <div class="offer-details">
                    <span class="offer-detail">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${offer.location}
                    </span>
                    <span class="offer-detail">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        ${formatDate(offer.posted_at)}
                    </span>
                </div>
                <div class="offer-skills">
                    ${(offer.required_skills || []).slice(0, 4).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
                <div class="offer-card-footer">
                    <span class="offer-source">
                        <span class="source-dot ${offer.source_platform}"></span>
                        ${offer.source_platform.charAt(0).toUpperCase() + offer.source_platform.slice(1)}
                    </span>
                    <button class="btn btn-primary btn-sm" onclick="processOffer('${offer.id}')">
                        Postuler
                    </button>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = cardsHTML;

    // Also update preview on dashboard (show first 3)
    if (preview) {
        preview.innerHTML = offers.slice(0, 3).map(offer => {
            const initials = offer.company.split(' ').map(w => w[0]).join('').slice(0, 2);
            return `
                <div class="offer-card" data-id="${offer.id}">
                    <div class="offer-card-header">
                        <div class="offer-company">
                            <div class="offer-company-logo">${initials}</div>
                            <div class="offer-company-info">
                                <h3>${offer.title}</h3>
                                <span class="offer-company-name">${offer.company} · ${offer.location}</span>
                            </div>
                        </div>
                        <span class="offer-type-badge ${offer.offer_type}">${offer.offer_type === 'alternance' ? 'Alternance' : 'Job étudiant'}</span>
                    </div>
                    <div class="offer-skills">
                        ${(offer.required_skills || []).slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ─── Render Applications ───
function renderApplications(apps) {
    const tbody = document.getElementById('applications-tbody');
    const statusLabels = {
        pending: 'En attente',
        email_sent: 'Envoyé',
        delivered: 'Délivré',
        opened: 'Ouvert',
        replied: 'Répondu',
        error: 'Erreur'
    };

    const statusClasses = {
        pending: 'pending',
        email_sent: 'sent',
        delivered: 'delivered',
        opened: 'opened',
        replied: 'replied',
        error: 'error'
    };

    tbody.innerHTML = apps.map(app => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div class="offer-company-logo" style="width:32px;height:32px;font-size:0.7rem;border-radius:6px;">
                        ${app.company.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <strong>${app.company}</strong>
                </div>
            </td>
            <td>${app.title}</td>
            <td>
                <div>
                    <div style="font-size:0.85rem;">${app.contact_name || 'Inconnu'}</div>
                    <div style="font-size:0.7rem;color:var(--text-tertiary);">${app.contact_email || 'Pas d\'email'}</div>
                </div>
            </td>
            <td><span class="status-badge ${statusClasses[app.status]}">${statusLabels[app.status]}</span></td>
            <td style="font-size:0.8rem;color:var(--text-tertiary);">${app.applied_at ? formatDate(app.applied_at) : 'Pas encore'}</td>
            <td>
                <button class="btn btn-ghost btn-sm">Voir CV</button>
            </td>
        </tr>
    `).join('');
}

// ─── Activity Feed ───
function addActivity(text, color = 'blue') {
    const feed = document.getElementById('activity-feed');
    const empty = feed.querySelector('.activity-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.animation = 'fadeIn 0.3s ease';
    item.innerHTML = `
        <div class="activity-dot ${color}"></div>
        <div class="activity-content">
            <p class="activity-text">${text}</p>
            <span class="activity-time">À l'instant</span>
        </div>
    `;

    feed.insertBefore(item, feed.firstChild);

    // Keep only last 20 items
    while (feed.children.length > 20) {
        feed.removeChild(feed.lastChild);
    }
}

// ─── Toast Notifications ───
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span>${icons[type] || 'ℹ️'}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// ─── Process Offer (Manual) ───
async function processOffer(offerId) {
    showToast('Déclenchement du pipeline pour cette offre...', 'info');
    addActivity(`⚙️ Traitement manuel déclenché pour l'offre #${offerId}`, 'purple');
    
    try {
        await fetch(`${API_BASE}/api/pipeline/run`, { method: 'POST' });
        showToast('Pipeline lancé en arrière-plan', 'success');
        refreshData();
    } catch (error) {
        showToast('Erreur lors du lancement du pipeline', 'error');
    }
}

// ─── Settings ───
function loadSettings() {
    try {
        const saved = localStorage.getItem('jobflow-settings');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

function saveSettings() {
    const settings = {
        geminiKey: document.getElementById('setting-gemini-key')?.value || '',
        hunterKey: document.getElementById('setting-hunter-key')?.value || '',
        brevoKey: document.getElementById('setting-brevo-key')?.value || '',
        keywords: document.getElementById('setting-keywords')?.value || '',
        locations: document.getElementById('setting-locations')?.value || '',
        maxEmails: document.getElementById('setting-max-emails')?.value || '30',
        senderEmail: document.getElementById('setting-sender-email')?.value || '',
        senderName: document.getElementById('setting-sender-name')?.value || '',
        domain: document.getElementById('setting-domain')?.value || ''
    };

    localStorage.setItem('jobflow-settings', JSON.stringify(settings));
    state.settings = settings;
    showToast('Paramètres sauvegardés avec succès', 'success');
}

function togglePasswordVisibility(btn) {
    const input = btn.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

// Load saved settings into fields
function restoreSettings() {
    const s = state.settings;
    if (s.geminiKey) document.getElementById('setting-gemini-key').value = s.geminiKey;
    if (s.hunterKey) document.getElementById('setting-hunter-key').value = s.hunterKey;
    if (s.brevoKey) document.getElementById('setting-brevo-key').value = s.brevoKey;
    if (s.keywords) document.getElementById('setting-keywords').value = s.keywords;
    if (s.locations) document.getElementById('setting-locations').value = s.locations;
    if (s.maxEmails) document.getElementById('setting-max-emails').value = s.maxEmails;
    if (s.senderEmail) document.getElementById('setting-sender-email').value = s.senderEmail;
    if (s.senderName) document.getElementById('setting-sender-name').value = s.senderName;
    if (s.domain) document.getElementById('setting-domain').value = s.domain;
}

// ─── CV Upload ───
const uploadZone = document.getElementById('cv-upload-zone');
const fileInput = document.getElementById('cv-file-input');

if (uploadZone) {
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleCVUpload(files[0]);
    });

    uploadZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleCVUpload(e.target.files[0]);
    });
}

async function handleCVUpload(file) {
    if (file.size > 5 * 1024 * 1024) {
        showToast('Fichier trop volumineux (max 5 MB)', 'error');
        return;
    }

    if (!file.name.endsWith('.json')) {
        showToast('Seuls les fichiers JSON sont acceptés pour le moment.', 'error');
        return;
    }

    showToast('Upload en cours...', 'info');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', 'CV Alternance Support IT');
    formData.append('target_type', 'alternance');

    try {
        const response = await fetch(`${API_BASE}/api/cvs/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showToast(`CV "${file.name}" uploadé avec succès !`, 'success');
            addActivity(`📄 Nouveau CV uploadé : ${file.name}`, 'blue');
            refreshData();
        } else {
            showToast('Erreur lors de l\'upload', 'error');
        }
    } catch (error) {
        showToast('Erreur réseau lors de l\'upload', 'error');
    }
}

// ─── Tab Filtering ───
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Filter logic would go here
    });
});

// ─── Utility ───
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    restoreSettings();
    updateClock();
    
    // Initial fetch
    refreshData();
    
    // Polling every 15 seconds
    setInterval(refreshData, 15000);
});
