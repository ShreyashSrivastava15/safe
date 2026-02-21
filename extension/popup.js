document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token');
    const apiUrlInput = document.getElementById('apiUrl');
    const guardianToggle = document.getElementById('guardianToggle');
    const scanBtn = document.getElementById('scanBtn');
    const statusDiv = document.getElementById('status');
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    const advancedSection = document.getElementById('advancedSection');

    // Load saved settings
    chrome.storage.local.get(['safeToken', 'guardianEnabled', 'safeApiUrl'], (result) => {
        if (result.safeToken) tokenInput.value = result.safeToken;
        if (result.safeApiUrl) apiUrlInput.value = result.safeApiUrl;
        if (result.guardianEnabled !== undefined) guardianToggle.checked = result.guardianEnabled;
    });

    toggleAdvanced.addEventListener('click', () => {
        advancedSection.style.display = advancedSection.style.display === 'block' ? 'none' : 'block';
    });

    // Save settings on change
    [tokenInput, apiUrlInput].forEach(input => {
        input.addEventListener('change', () => {
            chrome.storage.local.set({
                safeToken: tokenInput.value,
                safeApiUrl: apiUrlInput.value
            });
            statusDiv.innerText = "Settings saved.";
        });
    });

    guardianToggle.addEventListener('change', () => {
        const isEnabled = guardianToggle.checked;
        chrome.storage.local.set({ guardianEnabled: isEnabled });
        statusDiv.innerText = isEnabled ? "Guardian Mode Active 🛡️" : "Guardian Mode Offline.";

        // Notify content scripts
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'GUARDIAN_TOGGLE',
                    enabled: isEnabled,
                    token: tokenInput.value,
                    apiUrl: apiUrlInput.value
                }).catch(() => { });
            });
        });
    });

    scanBtn.addEventListener('click', async () => {
        const token = tokenInput.value;
        const apiUrl = apiUrlInput.value;
        if (!token) { statusDiv.innerText = "Token required."; return; }

        statusDiv.innerText = "Analyzing page...";
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }).then(() => {
            chrome.tabs.sendMessage(tab.id, {
                type: 'MANUAL_SCAN',
                token: token,
                apiUrl: apiUrl
            });
            statusDiv.innerText = "Scan initiated.";
        }).catch(() => {
            statusDiv.innerText = "Scan failed on this page.";
        });
    });
});
