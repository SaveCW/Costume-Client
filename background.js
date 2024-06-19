// Function to update the icon based on the URL
function updateIconForTab(tab) {
    if (tab.url && tab.url.includes("https://catwar.su/cw3")) {
        chrome.action.setIcon({ path: "icon.png", tabId: tab.id });
    } else {
        chrome.action.setIcon({ path: "grayscale_icon.png", tabId: tab.id });
    }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab is completed loading to avoid multiple triggers
    if (changeInfo.status === 'complete') {
        updateIconForTab(tab);
    }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, updateIconForTab);
});