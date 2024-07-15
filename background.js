
var loggedin = false

// Function to update the icon based on the URL
function updateIconForTab(tab) {
    if (!loggedin) {
        // If not logged in, always use main.html as the popup
        chrome.action.setPopup({ tabId: tab.id, popup: "main.html" });
    } else {
        // If logged in, decide which popup to use based on the URL
        if (tab.url && tab.url.includes("https://catwar.su/cw3")) {
            chrome.action.setIcon({ path: "./icons/icon.png", tabId: tab.id });
            chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" }); // Assuming "popup.html" is your popup
        } else {
            chrome.action.setIcon({ path: "./icons/grayscale_icon.png", tabId: tab.id });
            chrome.action.setPopup({ tabId: tab.id, popup: "dpopup.html" }); // Setting popup to an empty string disables it
        }
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



