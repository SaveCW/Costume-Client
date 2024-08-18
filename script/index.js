function addWarning(message, timeout = 15000){
    // Remove any existing warnings
    var existingWarnings = document.getElementsByClassName("warning");
    while (existingWarnings.length > 0) {
        existingWarnings[0].remove();
    }

    // Create and add the new warning
    var warning = document.createElement("p");
    warning.innerHTML = "<img src='.//images/warning.png' width=10> <div class='text'>" + message + "</div>";
    warning.classList.add("warning");
    document.getElementsByClassName("border-box")[0].prepend(warning);

    warning.addEventListener("click", function() {
        warning.style.opacity = 0;
        setTimeout(() => {
            warning.remove();
            // Remove listener
            warning.removeEventListener("click", function() {});
        }, 2000);
    });



    // Fade out and remove the warning after a timeout
    setTimeout(() => {
        warning.style.opacity = 0;
        logout.style.bottom = "0px";
        setTimeout(() => {
            warning.remove();
            warning.removeEventListener("click", function() {});
        }, 2000);
    }, timeout);
}

async function getCostume(id, size) {
    try {
        const response = await fetch("https://cat.arisamiga.rocks/search?name=" + id);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data["children"].length == 0) return null;

        var costume = document.createElement("div");
        costume.style.backgroundImage = "url('" + "https://cat.arisamiga.rocks/images/" + data["children"][0]["imguuid"] + ".png" + "')";
        costume.className = "cat";
        costume.style.backgroundSize = size;
        return costume;
    } catch (error) {
        chrome.storage.local.get("langdata", function(result) {
            addWarning(result["langdata"]["costumeServerDown"]);
        });
        return null; // Return null or appropriate error handling
    }
}


function setStatus(statusText, option) {
    var status = document.getElementById("uploadstatus");

    // Check if an element with class 'content' exists within 'status'
    var existingContent = status.querySelector('.content');
    if (existingContent) {
        status.removeChild(existingContent); // Remove existing 'content' to cancel any ongoing operations
    }

    // Create a new 'content' element
    var content = document.createElement("div");
    content.className = "content";
    status.appendChild(content); // Append 'content' to 'status'

    content.innerHTML = "";
    status.style.opacity = 1; // Apply opacity transition to 'status' if needed

    switch (option) {
        case "success":
            content.style.backgroundColor = "green";
            content.style.color = "white";
            break;
        case "warning":
            content.style.backgroundColor = "orange";
            content.style.color = "black";
            break;
        case "error":
            content.style.backgroundColor = "red";
            content.style.color = "white";
            break;
    }

    content.innerText = statusText;

    var logout = document.getElementById("logout");
    logout.style.bottom = -content.offsetHeight;

    setTimeout(() => {
        content.style.opacity = 0;
        setTimeout(() => {
            logout.style.bottom = "0px";
            content.style.backgroundColor = "transparent";
            content.innerHTML = "";
        }, 2000);
    }, 5000);
}



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
                func: (catId) => {
                    // Get character image
                    var img = document.getElementById("cages").querySelectorAll("a[href='/cat" + catId + "']")[0].closest(".cat").querySelector(".first");
                    return { src: img.style.backgroundImage.slice(5, -2), size: img.style.backgroundSize };
                },
                args: [id]
            }).then(result => {
                // Clear previous content
                document.getElementById("catImage").innerHTML = ""
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

                getCostume(id, size).then(costume => {
                    if (costume !== null)
                        document.getElementById("catImage").appendChild(costume);
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

        getCostume(result.catId, result.catImageSize).then(costume => {
            if (costume !== null)
                document.getElementById("catImage").appendChild(costume);
        });
    });
}

loadInfo();


// ##############


document.getElementsByClassName("changeCostume")[0].addEventListener("click", function() {
    chrome.storage.local.get(["catId", "catImageSrc", "catImageSize"], function(result){

        var file = document.getElementById("file").files[0];
        var formData = new FormData();
        formData.append("file", file);

        if (!file) {
            chrome.storage.local.get("langdata", function(result) {
                setStatus(result["langdata"]["selectFile"], "warning");
            });
            return;
        }

        // Create a FileReader to read the file
        var reader = new FileReader();

        reader.onload = function(event) {
            var arrayBuffer = event.target.result;
            var uint8Array = new Uint8Array(arrayBuffer);
            chrome.storage.local.get("langdata", function(translation) {
            // Define the maximum limit for the length of the uint8Array
            const MAX_UINT8ARRAY_LENGTH = 0x8000; // 32,768
            // Check if the length of the uint8Array exceeds the limit
            if (uint8Array.length > MAX_UINT8ARRAY_LENGTH) {
                setStatus(translation["langdata"]["sizeError"], "error");
                return;
            }
            var binaryString = String.fromCharCode.apply(null, uint8Array);
            var base64EncodedString = btoa(binaryString);
            var id = parseInt(result.catId)
                fetch("https://cat.arisamiga.rocks/", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json', // Ensure this header is set
                    },
                    body: JSON.stringify({ // Ensure the body is a string
                        name: id,
                        imgdata: base64EncodedString
                    })
                })
                .then(response => {
                    if (response.ok) {
                        setStatus(translation["langdata"]["costumeSuccesfullyChanged"], "success");
                        getCostume(result.catId, result.catImageSize).then(costume => {
                            if (document.querySelector(".cat").querySelector("div") !== null) {
                                document.querySelector(".cat").querySelector("div").remove();
                            }
                            document.getElementById("catImage").appendChild(costume);
                            // Send request to contentScript to update the costume
                            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                                const queryTabId = tabs[0].id;
                                const tab = tabs[0];
                            
                                // Check if the tab is already loaded
                                if (tab.status === 'complete') {
                                    chrome.tabs.sendMessage(queryTabId, { message: "updateCostume" }, function(response) {
                                        // console.log(response);
                                    });
                                }
                            
                                // Add listener for future updates
                                const updatedListener = function(tabId, changeInfo, tab) {
                                    // console.log(changeInfo);
                                    if (queryTabId === tab.id && changeInfo.status === 'complete') {
                                        chrome.tabs.sendMessage(queryTabId, { message: "updateCostume" }, function(response) {
                                            // console.log(response);
                                        });
                                        chrome.tabs.onUpdated.removeListener(updatedListener); // Remove listener to avoid multiple injections
                                    }
                                };
                            
                                chrome.tabs.onUpdated.addListener(updatedListener);
                            });
                        });
                    }
                    else {
                        setStatus(translation["langdata"]["costumeError"], "error");
                    }
                })
                .catch(err => {
                    setStatus(translation["langdata"]["costumeError"], "error");
                })
            });
        };
        
        reader.readAsArrayBuffer(file);
    });

});