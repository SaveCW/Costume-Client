console.log("contentScript.js loaded");

function setLobbyCostumes(){
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
    document.getElementsByClassName("cat_tooltip").forEach(function (element) {
        var catId = element.querySelector("a").getAttribute("href").replace("/cat", "");
        var cat = element.closest(".cat")
        var catPos = cat.querySelector(".d");
        if (catPos == null) {
            return;
        }
        var catSize = cat.getElementsByClassName("first")[0].style.backgroundSize;
        fetch("http://localhost:1300/search?name=" + catId)
        .then(response => response.json())
        .then(data => {
            if (data["children"].length == 0) return;
            var costumeURL = "http://localhost:1300/images/" + data["children"][0]["imguuid"] + ".png";
            console.log("URL: " + costumeURL)
            var costume = document.createElement("div");
            costume.setAttribute("data-v-59afe5e8", "");
            costume.style.backgroundSize = catSize;
            costume.style.backgroundImage = "url('"+ costumeURL +"')"
            costume.style.position = "absolute";
            catPos.appendChild(costume);
        })
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
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
                // console.log(node)
                if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("catWithArrow")){
                    // A cat has been added
                    var catId = node.querySelector("a").getAttribute("href").replace("/cat", "");
                    var catPos = node.querySelector(".d");
                    var catsize = node.getElementsByClassName("first")[0].style.backgroundSize;
                    fetch("http://localhost:1300/search?name=" + catId)
                    .then(response => response.json())
                    .then(data => {
                        if (data["children"].length == 0) return;
                        var costumeURL = "http://localhost:1300/images/" + data["children"][0]["imguuid"] + ".png";
                        console.log("URL: " + costumeURL)
                        var costume = document.createElement("div");
                        costume.setAttribute("data-v-59afe5e8", "");
                        costume.style.backgroundSize = catsize;
                        costume.style.backgroundImage = "url('"+ costumeURL +"')"
                        costume.style.position = "absolute";
                        catPos.appendChild(costume);
                    })
                }
                else if (node.nodeType === Node.ELEMENT_NODE && node.id === "cages_div") {
                    // Scenary Change
                    console.log("Scenary Change")
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