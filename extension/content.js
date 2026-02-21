// S.A.F.E. Guardian Content Script
let scanTimeout = null;
const API_URL = 'http://localhost:3000/api/v1/analyze';

// Initialize Guardian
chrome.storage.local.get(['safeToken', 'guardianEnabled'], (settings) => {
    if (settings.guardianEnabled && settings.safeToken) {
        startGuardian(settings.safeToken);
    }
});

// Listen for messages from Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GUARDIAN_TOGGLE') {
        if (message.enabled) {
            chrome.storage.local.get(['safeToken'], (s) => {
                if (s.safeToken) startGuardian(s.safeToken);
            });
        } else {
            stopGuardian();
        }
    } else if (message.type === 'MANUAL_SCAN') {
        performScan(message.token);
    }
});

function startGuardian(token) {
    console.log("🛡️ S.A.F.E. Guardian Enabled");

    // Initial scan
    performScan(token);

    // Watch for dynamic content (new emails opened, infinite scroll)
    const observer = new MutationObserver(() => {
        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => performScan(token), 1000);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window._safeObserver = observer;
}

function stopGuardian() {
    if (window._safeObserver) {
        window._safeObserver.disconnect();
        console.log("🛡️ S.A.F.E. Guardian Disabled");
    }
}

async function performScan(token) {
    const links = Array.from(document.querySelectorAll('a:not(.safe-scanned)'));
    if (links.length === 0) return;

    for (let link of links) {
        const href = link.href;

        // Skip safe/internal domains
        if (!href.startsWith('http') ||
            href.includes('mail.google.com') ||
            href.includes('outlook.live.com') ||
            href.includes('gstatic.com')) {
            link.classList.add('safe-scanned');
            continue;
        }

        link.classList.add('safe-scanned'); // Mark as processed

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    url: href,
                    fraud_type: 'url'
                })
            });

            if (res.ok) {
                const data = await res.json();
                injectBadge(link, data);
            }
        } catch (e) {
            console.error("S.A.F.E. API Connectivity Error", e);
        }
    }
}

function injectBadge(link, data) {
    let badgeText = "SAFE";
    let badgeColor = "#22c55e"; // Emerald
    let icon = "✅";

    if (data.risk_level === 'SUSPICIOUS') {
        badgeText = "SUSPICIOUS";
        badgeColor = "#eab308"; // Amber
        icon = "⚠️";
    } else if (data.risk_level === 'FRAUD' || data.risk_level === 'HIGH') {
        badgeText = "FRAUD DETECTED";
        badgeColor = "#ef4444"; // Red
        icon = "🛑";
    } else {
        // Don't show badges for every safe link to avoid clutter
        return;
    }

    const badge = document.createElement('span');
    badge.innerHTML = `${icon} <b>S.A.F.E: ${badgeText}</b>`;
    badge.style.cssText = `
        color: white;
        background-color: ${badgeColor};
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        display: inline-block;
        vertical-align: middle;
        font-family: sans-serif;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        cursor: help;
    `;
    badge.title = data.explanation || "Analyzed by S.A.F.E. AI Guardian";

    link.insertAdjacentElement('afterend', badge);
}
