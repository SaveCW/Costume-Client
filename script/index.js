function addWarning(message, timeout = 15000){
    // Remove any existing warnings
    var existingWarnings = document.getElementsByClassName("warning");
    while (existingWarnings.length > 0) {
        existingWarnings[0].remove();
    }

    // Create and add the new warning
    var warning = document.createElement("p");
    warning.innerHTML = "<img src='./warning.png' width=10> <div class='text'>" + message + "</div>";
    warning.classList.add("warning");
    document.getElementsByClassName("border-box")[0].prepend(warning);

    // Fade out and remove the warning after a timeout
    setTimeout(() => {
        warning.style.opacity = 0;
        setTimeout(() => {
            warning.remove();
        }, 2000);
    }, timeout);
}

async function getCostume(id, size) {
    try {
        const response = await fetch("http://localhost:1300/search?name=" + id);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data["children"].length == 0) return null;

        var costume = document.createElement("div");
        costume.style.backgroundImage = "url('" + "http://localhost:1300/images/" + data["children"][0]["imguuid"] + ".png" + "')";
        costume.className = "cat";
        costume.style.backgroundSize = size;
        return costume;
    } catch (error) {
        addWarning("The Costume Server seems to be down. Costumes will not be displayed. Please try again later");
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

    setTimeout(() => {
        content.style.opacity = 0;
        setTimeout(() => {
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

                getCostume(id, size).then(costume => {
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
            setStatus("Please select a file", "warning");
            return;
        }

        // Create a FileReader to read the file
        var reader = new FileReader();

        reader.onload = function(event) {
            var arrayBuffer = event.target.result;
            var uint8Array = new Uint8Array(arrayBuffer);
            var binaryString = String.fromCharCode.apply(null, uint8Array);
            var base64EncodedString = btoa(binaryString);
            var id = parseInt(result.catId)
            fetch("http://localhost:1300/", {
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
                    setStatus("The costume has been successfully changed!", "success");
                    getCostume(result.catId, result.catImageSize).then(costume => {
                        if (document.querySelector(".cat").querySelector("div") !== null) {
                            document.querySelector(".cat").querySelector("div").remove();
                        }
                        document.getElementById("catImage").appendChild(costume);
                    });
                }
                else {
                    setStatus("There was an error changing the costume. Please try again later", "error");
                }
            })
            .catch(err => {
                setStatus("There was an error changing the costume. Please try again later", "error");
            })
        };
        
        reader.readAsArrayBuffer(file);
    });

});