const PORTRAITS = {
    mickey: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="55" r="35" fill="black"/>
        <circle cx="20" cy="25" r="22" fill="black"/>
        <circle cx="80" cy="25" r="22" fill="black"/>
    </svg>`,
    minnie: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="55" r="35" fill="black"/>
        <circle cx="20" cy="25" r="22" fill="black"/>
        <circle cx="80" cy="25" r="22" fill="black"/>
        <path d="M35 25 Q50 10 65 25 Q50 40 35 25" fill="#ff4d6d" stroke="white" stroke-width="2"/>
        <circle cx="42" cy="20" r="2" fill="white"/>
        <circle cx="58" cy="20" r="2" fill="white"/>
    </svg>`,
    donald: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="white" stroke="#ccc" stroke-width="1"/>
        <path d="M30 60 Q50 85 70 60" fill="#ffb703" stroke="#e67e22" stroke-width="2"/>
        <path d="M40 30 Q50 5 60 30" fill="#3a86ff"/>
    </svg>`,
    jarvis: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#00d2ff" stroke-width="2" stroke-dasharray="10 5"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#00d2ff" stroke-width="4"/>
        <circle cx="50" cy="50" r="5" fill="#00d2ff">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
    </svg>`,
    ultron: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#ff0000" stroke-width="2" stroke-dasharray="2 2"/>
        <path d="M20 30 L80 30 L70 80 L30 80 Z" fill="none" stroke="#ff0000" stroke-width="4"/>
        <circle cx="35" cy="45" r="5" fill="#ff0000"/>
        <circle cx="65" cy="45" r="5" fill="#ff0000"/>
        <path d="M40 65 Q50 75 60 65" fill="none" stroke="#ff0000" stroke-width="2"/>
    </svg>`,
    genie: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 50 Q50 10 80 50 Q50 90 20 50" fill="#4895ef"/>
        <circle cx="50" cy="30" r="10" fill="#ffb703"/>
    </svg>`,
    zazu: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="#4361ee"/>
        <path d="M40 50 L70 50 L60 70 L45 70 Z" fill="#f72585"/>
    </svg>`,
    tinkerbell: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="35" cy="40" rx="20" ry="30" fill="rgba(255,255,255,0.4)"/>
        <ellipse cx="65" cy="40" rx="20" ry="30" fill="rgba(255,255,255,0.4)"/>
        <circle cx="50" cy="50" r="20" fill="#70e000"/>
    </svg>`,
    olaf: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="40" r="20" fill="white" stroke="#ccc"/>
        <circle cx="50" cy="75" r="25" fill="white" stroke="#ccc"/>
        <path d="M50 40 L65 45 L50 45 Z" fill="#fb8500"/>
    </svg>`
};
