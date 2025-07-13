document.getElementById('settingsButton').addEventListener('click', function() {
    document.getElementById('settingsLayer').style.display = 'block';

    chrome.storage.local.get("costumeServerURL", function(URL) {
        if (URL["costumeServerURL"] === undefined) {
            URL["costumeServerURL"] = "https://cat.arisamiga.rocks";
            chrome.storage.local.set({"costumeServerURL": URL["costumeServerURL"]});
        }
        document.getElementById("costumeServerURL").value = URL["costumeServerURL"];

        serverStatus(URL["costumeServerURL"]);
    });
});

document.getElementById('closeSettings').addEventListener('click', function() {
    document.getElementById('settingsLayer').style.display = 'none';
});

chrome.storage.local.get("costumeServerURL", function(URL) {
    document.getElementById("costumeServerURL").value = URL["costumeServerURL"];

    serverStatus(URL["costumeServerURL"]);
});