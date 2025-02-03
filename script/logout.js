document.getElementById("logout").addEventListener("click", function() {
    chrome.storage.local.get("costumeServerURL", function(result) {
        chrome.cookies.get({ url: result["costumeServerURL"], name: "connect.sid" }, cookie => {
            // If it exists delete it
            if (cookie) {
                chrome.cookies.remove({ url: result["costumeServerURL"], name: "connect.sid" }, () => {
                    // After the cookie is deleted, reload the page and close the window
                    chrome.runtime.sendMessage({ action: "loggedinreload" });
                    window.close();
                });
            }
            else {
                // If the cookie does not exist, reload the page and close the window
                chrome.runtime.sendMessage({ action: "loggedinreload" });
                window.close();
            }
        });
    });
});