(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');

    // 1. Determine assets path based on current location
    const basePath = window.location.pathname.includes('/tps/') || 
                     window.location.pathname.includes('/projets/') || 
                     window.location.pathname.includes('/modules/') || 
                     window.location.pathname.includes('/options/') || 
                     window.location.pathname.includes('/certificats/') ? '../assets/' : 'assets/';

    function applyTheme() {
        // 2. Clear old theme links
        const links = document.getElementsByTagName('link');
        for (let i = links.length - 1; i >= 0; i--) {
            const href = links[i].getAttribute('href');
            if (href && (href.includes('internal-style.css') || href.includes('dbz-internal.css') || href.includes('basic-internal.css'))) {
                links[i].remove();
            }
        }

        // 3. Add new theme link
        const newStyle = document.createElement('link');
        newStyle.rel = 'stylesheet';
        let styleFile = 'basic-internal.css';
        if (theme === 'dbz') styleFile = '../Portfolio dbz/dbz-internal.css';
        else if (theme === 'st') styleFile = 'internal-style.css';
        
        newStyle.href = basePath + styleFile;
        document.head.appendChild(newStyle);

        // 4. Update Back Button & Other links
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            if (theme === 'dbz') {
                backBtn.href = basePath + '../dbz.html';
                backBtn.innerHTML = '⇠ Retour au Temple';
            } else if (theme === 'st') {
                backBtn.href = basePath + '../index.html';
                backBtn.innerHTML = '⇠ Retour au Portail';
            } else {
                // Basic/Neutral
                backBtn.href = basePath + '../sommaire.html'; // Default overview or index
                backBtn.innerHTML = '⇠ Retour au sommaire';
            }
        }

        // 5. Link Persistence (Propagate theme to all internal links)
        if (theme) {
            const allLinks = document.querySelectorAll('a:not(.back-btn)');
            allLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('.html') && !href.startsWith('http') && !href.includes('theme=')) {
                    const separator = href.includes('?') ? '&' : '?';
                    link.href = href + separator + 'theme=' + theme;
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme);
    } else {
        applyTheme();
    }
})();
