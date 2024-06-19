document.getElementById("getID").addEventListener("click", function() {
    fetch("https://catwar.su/")
    .then(response => response.text())
    .then(text => {
        // Create a new document
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(text, "text/html");
        document.getElementById("catID").innerText = "ID: " + htmlDocument.getElementById("id_val").innerText;
    })
    .then(() => {
        // Get data from content script
        const id = document.getElementById("catID").innerText.replace("ID: ", "");
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (catId) => {
                    // Get character image
                    var img = document.getElementById("cages").querySelectorAll("a[href='/cat" + catId + "']")[0].closest(".cat").querySelector(".first")
                    return {src: img.style.backgroundImage.slice(5, -2), size: img.style.backgroundSize};
                },
                args: [id]
            }).then(result => {
                var catImage = document.getElementById("catImage");
                var src = "https://catwar.su" + result[0].result.src;
                var size = result[0].result.size;

                catImage.style.backgroundImage = "url('" + src + "')";
                catImage.style.backgroundSize = size;

                // Store the fetched data
                chrome.storage.local.set({
                    "catId": id,
                    "catImageSrc": src,
                    "catImageSize": size
                });
            });
        });
    });
});

function loadInfo(){
    chrome.storage.local.get(["catId", "catImageSrc", "catImageSize"], function(result){
        if (result.catId === undefined) return;
        document.getElementById("catID").innerText = "ID: " + result.catId;
        document.getElementById("catImage").style.backgroundImage = "url('" + result.catImageSrc + "')";
        document.getElementById("catImage").style.backgroundSize = result.catImageSize;
    });
}

loadInfo();