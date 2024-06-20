console.log("contentScript.js loaded");

// Initial Costume Apply
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.id === "cages_div"){
        chrome.storage.local.get(["catId", "catImageSrc", "catImageSize"], function(result){
            if (result.catId === undefined) return;
            var catId = result.catId;
            var catPos = document.getElementById("cages").querySelectorAll("a[href='/cat" + catId + "']")[0].closest(".cat").querySelector(".d")
            fetch("http://localhost:1300/search?name=" + catId)
            .then(response => response.json())
            .then(data => {
                var costumeURL = "http://localhost:1300/images/" + data["children"][0]["imguuid"] + ".png";
                console.log("URL: " + costumeURL)
                var costume = document.createElement("div");
                costume.setAttribute("data-v-59afe5e8", "");
                costume.style.backgroundSize = result.catImageSize;
                costume.style.backgroundImage = "url('"+ costumeURL +"')"
                costume.style.position = "absolute";
                catPos.appendChild(costume);
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
        });
      }
    });
});

observer.observe({ type: "largest-contentful-paint", buffered: true });

// Costume Apply on Cage Change
const observer2 = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("catWithArrow")){
                    // A cat has been added
                    var catId = node.querySelector("a").getAttribute("href").replace("/cat", "");
                    var catPos = node.querySelector(".d");
                    fetch("http://localhost:1300/search?name=" + catId)
                    .then(response => response.json())
                    .then(data => {
                        if (data["children"].length == 0) return;
                        var costumeURL = "http://localhost:1300/images/" + data["children"][0]["imguuid"] + ".png";
                        console.log("URL: " + costumeURL)
                        var costume = document.createElement("div");
                        costume.setAttribute("data-v-59afe5e8", "");
                        costume.style.backgroundSize = "cover";
                        costume.style.backgroundImage = "url('"+ costumeURL +"')"
                        costume.style.position = "absolute";
                        catPos.appendChild(costume);
                    })
                }
            });
        }
    });
});

observer2.observe(document.getElementById("cages"), { childList: true, subtree: true });