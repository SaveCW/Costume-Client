
var loggedin = false;

// Function to update the icon based on the URL
function updateIconForTab(tab) {
    chrome.cookies.get({ url: "https://cat.arisamiga.rocks", name: "connect.sid" }, cookie => {
        if (cookie) {
            // If logged in, decide which popup to use based on the URL
            if (tab.url && tab.url.includes("https://catwar.su/cw3")) {
                chrome.action.setIcon({ path: "./icons/icon.png", tabId: tab.id });
                chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" }); // Assuming "popup.html" is your popup
            } else {
                chrome.action.setIcon({ path: "./icons/grayscale_icon.png", tabId: tab.id });
                chrome.action.setPopup({ tabId: tab.id, popup: "dpopup.html" }); // Setting popup to an empty string disables it
            }
        }
        else {
            // If not logged in, always use main.html as the popup
            chrome.action.setPopup({ tabId: tab.id, popup: "main.html" });
            chrome.action.setIcon({ path: "./icons/icon.png", tabId: tab.id });
        }
    });
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


// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "loggedinreload") {
        // Get active tab
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            console.log("Tab: ", tabs[0]);
            updateIconForTab(tabs[0]);

            // Reload the page
            sendResponse({ success: true });
        });
        return true;
    }
});
