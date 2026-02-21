// S.A.F.E. Guardian Content Script
let scanTimeout = null;
let currentSettings = {
    token: '',
    apiUrl: 'http://localhost:3000/api/v1'
};

// Initialize
chrome.storage.local.get(['safeToken', 'guardianEnabled', 'safeApiUrl'], (settings) => {
    if (settings.safeApiUrl) currentSettings.apiUrl = settings.safeApiUrl;
    if (settings.safeToken) currentSettings.token = settings.safeToken;

    if (settings.guardianEnabled && currentSettings.token) {
        startGuardian();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'GUARDIAN_TOGGLE') {
        if (message.enabled) {
            currentSettings.token = message.token || currentSettings.token;
            currentSettings.apiUrl = message.apiUrl || currentSettings.apiUrl;
            startGuardian();
        } else {
            stopGuardian();
        }
    } else if (message.type === 'MANUAL_SCAN') {
        currentSettings.token = message.token;
        currentSettings.apiUrl = message.apiUrl;
        performScan();
    }
});

function startGuardian() {
    performScan();
    if (window._safeObserver) window._safeObserver.disconnect();

    const observer = new MutationObserver(() => {
        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => performScan(), 1500);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window._safeObserver = observer;
}

function stopGuardian() {
    if (window._safeObserver) window._safeObserver.disconnect();
}

async function performScan() {
    if (!currentSettings.token) return;
    const links = Array.from(document.querySelectorAll('a:not(.safe-scanned)'));

    for (let link of links) {
        const href = link.href;
        if (!href.startsWith('http') || href.includes(window.location.hostname)) {
            link.classList.add('safe-scanned');
            continue;
        }

        link.classList.add('safe-scanned');

        try {
            const res = await fetch(`${currentSettings.apiUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSettings.token}`
                },
                body: JSON.stringify({ url: href, fraud_type: 'url' })
            });

            if (res.ok) {
                const data = await res.json();
                injectBadge(link, data);
            }
        } catch (e) {
            console.error("S.A.F.E. Guardian API Error", e);
        }
    }
}

function injectBadge(link, data) {
    if (data.risk_level === 'SAFE') return;

    const badge = document.createElement('span');
    const isFraud = data.risk_level === 'FRAUD' || data.risk_level === 'HIGH';
    const color = isFraud ? "#ef4444" : "#eab308";
    const icon = isFraud ? "🛑" : "⚠️";

    badge.innerHTML = `${icon} S.A.F.E: ${data.risk_level}`;
    badge.style.cssText = `
        color: white; background: ${color}; font-size: 10px; font-weight: bold;
        padding: 2px 6px; border-radius: 4px; margin-left: 8px;
        display: inline-block; font-family: sans-serif;
    `;
    badge.title = data.explanation;
    link.insertAdjacentElement('afterend', badge);
}
