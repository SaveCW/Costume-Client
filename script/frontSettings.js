document.getElementById('settingsButton').addEventListener('click', function() {
    document.getElementById('settingsLayer').style.display = 'block';

    chrome.storage.local.get("costumeServerURL", function(URL) {
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