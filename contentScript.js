console.log("contentScript.js loaded");

if (window.location.href.includes("https://catwar.su/cw3")) {

    function deletePreviousCostumes() {
        const elements = document.querySelectorAll('div[data-v-59afe5e8]:not([id])');
        const filteredElements = Array.from(elements).filter(el => el.className === '')
        filteredElements.forEach((element) => {
            const url = element.style.backgroundImage.replace(/url\("([^"]+)"\)/, '$1');
            if (url.startsWith("https://cat.arisamiga.rocks")) {
                element.remove();
            }
        })
    }

    function costumeCreate(catSize, costumeURL, catPos) {
        var costume = document.createElement("div");
        costume.setAttribute("data-v-59afe5e8", "");
        costume.style.backgroundSize = catSize;
        costume.style.backgroundImage = "url('"+ costumeURL +"')"
        costume.className = ""
        costume.style.position = "absolute";

        // Check if the same costume created already exists
        var selector = `div[data-v-59afe5e8]`;
        var existingElements = catPos.querySelectorAll(selector);

        // Convert NodeList to Array for using array methods like .forEach more efficiently
        Array.from(existingElements).forEach(element => {
            if (element.style.backgroundImage.includes(costumeURL)) {
                element.remove();
            }
        });

        return costume
    }

    function setLobbyCostumes(){
        HTMLCollection.prototype.forEach = Array.prototype.forEach;

        // Clear any previous urls
        deletePreviousCostumes()
        // Get new costumes
        document.getElementsByClassName("cat_tooltip").forEach(function (element) {
            var catId = element.querySelector("a").getAttribute("href").replace("/cat", "");
            var cat = element.closest(".cat")
            var catPos = cat.querySelector(".d");
            if (catPos == null) {
                return;
            }
            var catSize = cat.getElementsByClassName("first")[0].style.backgroundSize;
            fetch("https://cat.arisamiga.rocks/search?name=" + catId)
            .then(response => response.json())
            .then(data => {
                if (data["children"].length == 0) return;
                var costumeURL = "https://cat.arisamiga.rocks/images/" + data["children"][0]["imguuid"] + ".png";
                // console.log("URL: " + costumeURL)
                var costume = costumeCreate(catSize, costumeURL, catPos)
                catPos.appendChild(costume);
            })
            .catch(err => { const mute = err })
        });
    }

    // Initial Costume Apply on lobby
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
        if (entry.id === "cages_div"){
            setLobbyCostumes()
        }
        });
    });

    observer.observe({ type: "largest-contentful-paint", buffered: true });

    // Costume Apply on Cage Change
    const observer2 = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // console.log(mutation)
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("catWithArrow")){
                        // A cat has been added
                        var catId = node.querySelector("a").getAttribute("href").replace("/cat", "");
                        var catPos = node.querySelector(".d");
                        var catsize = node.getElementsByClassName("first")[0].style.backgroundSize;
                        fetch("https://cat.arisamiga.rocks/search?name=" + catId)
                        .then(response => response.json())
                        .then(data => {
                            if (data["children"].length == 0) return;
                            var costumeURL = "https://cat.arisamiga.rocks/images/" + data["children"][0]["imguuid"] + ".png";
                            // console.log("URL: " + costumeURL)
                            var costume = costumeCreate(catsize, costumeURL, catPos)
                            catPos.appendChild(costume);
                        })
                        .catch(err => { const mute = err })
                    }
                    else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("cage_items") && node.querySelector(".d") != null){
                        // A cat has been added after sniff
                        var catId = node.querySelector("a").getAttribute("href").replace("/cat", "");
                        var catPos = node.querySelector(".d");
                        var catsize = node.querySelector(".first").style.backgroundSize;
                        fetch("https://cat.arisamiga.rocks/search?name=" + catId)
                        .then(response => response.json())
                        .then(data => {
                            if (data["children"].length == 0) return;

                            var costumeURL = "https://cat.arisamiga.rocks/images/" + data["children"][0]["imguuid"] + ".png";
                            // console.log("URL: " + costumeURL)
                            var costume = costumeCreate(catsize, costumeURL, catPos)
                            catPos.appendChild(costume);
                        })
                        .catch(err => { const mute = err })
                    }
                });
            }
        });
    });

    observer2.observe(document.getElementById("cages"), { childList: true, subtree: true });


    // Observer to detect the cages_div background Image change
    const observer3 = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "style") {
                // Add a 3 second delay to let the background change
                setTimeout(setLobbyCostumes, 3000)
            }
        });
    });

    observer3.observe(document.getElementById("cages_div"), { attributes: true, attributeFilter: ["style"] });


    // Await for any costume changes
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message === "updateCostume") {
                setLobbyCostumes()
                sendResponse("Successfully changed costumes");
                return true;
            }
            // console.log(request)
            if (request.message === "languageChange") {
                sendResponse("Cannot change In this URL")
                return true;
            }
        }
    );
}

else if (window.location.href.includes("https://cat.arisamiga.rocks/")){
    // We are in our server page
    chrome.storage.local.get(['language'], function(result) {
        localStorage.setItem("language", result["language"]);
    });

    // Listen from popup for language change to change language
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message === "languageChange") {
                localStorage.setItem("language", request.language);
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: request.language } }));
                sendResponse({status: "Language changed successfully"});
                return true;
            }
        }
    );
}