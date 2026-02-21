document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token');
    const guardianToggle = document.getElementById('guardianToggle');
    const scanBtn = document.getElementById('scanBtn');
    const statusDiv = document.getElementById('status');

    // Load saved settings
    chrome.storage.local.get(['safeToken', 'guardianEnabled'], (result) => {
        if (result.safeToken) {
            tokenInput.value = result.safeToken;
        }
        if (result.guardianEnabled !== undefined) {
            guardianToggle.checked = result.guardianEnabled;
        }
    });

    // Save token on change
    tokenInput.addEventListener('change', () => {
        chrome.storage.local.set({ safeToken: tokenInput.value });
        statusDiv.innerText = "Token saved.";
    });

    // Save toggle on change
    guardianToggle.addEventListener('change', () => {
        const isEnabled = guardianToggle.checked;
        chrome.storage.local.set({ guardianEnabled: isEnabled });
        statusDiv.innerText = isEnabled ? "Guardian Mode Active 🛡️" : "Guardian Mode Offline.";

        // Notify content scripts of the change
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'GUARDIAN_TOGGLE',
                    enabled: isEnabled
                }).catch(() => { }); // Ignore errors for non-matching tabs
            });
        });
    });

    scanBtn.addEventListener('click', async () => {
        const token = tokenInput.value;
        if (!token) {
            statusDiv.innerText = "Error: Token required.";
            return;
        }

        statusDiv.innerText = "Analyzing page content...";

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).then(() => {
            chrome.tabs.sendMessage(tab.id, {
                type: 'MANUAL_SCAN',
                token: token
            });
            statusDiv.innerText = "Scan initiated.";
        }).catch(err => {
            console.error(err);
            statusDiv.innerText = "Error: Cannot scan this page.";
        });
    });
});
