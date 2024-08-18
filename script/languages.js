
document.addEventListener('DOMContentLoaded', function() {
    /* When the user clicks on the button,
    toggle between hiding and showing the dropdown content */
    function myFunction() {
        document.getElementById("myDropdown").classList.toggle("show");
        document.getElementsByClassName('dropbtn')[0].classList.toggle("dropdown-open")
    }

    document.getElementsByClassName("dropbtn")[0].addEventListener("click", myFunction);
    
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            const dropBtn = document.getElementsByClassName('dropbtn')[0];
            var i;
            // This removal solves a bug with the window resizing idk why
            if (document.getElementById("status") != null)
                document.getElementById("status").remove();
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                    dropBtn.classList.remove("dropdown-open")
                }
            }
        }
    }

    document.getElementById("russian").addEventListener("click", function() {
        chrome.storage.local.set({"language": "ru"});
        location.reload();
    });

    document.getElementById("english").addEventListener("click", function() {
        chrome.storage.local.set({"language": "en"});
        location.reload();
    });

    function elementIDExists(element) {
        return document.getElementById(element) != null;
    }
    
    function changeText(data) {
        for (let key in data) {
            if (key == "placeholders") {
                for (let text in data[key]) {
                    if (elementIDExists(text))
                        document.getElementById(text).placeholder = data[key][text];
                }
            } else if (elementIDExists(key)) {
                // Check if it has any html tags or entities and if so use innerHTML
                if (data[key].includes("<") && data[key].includes(">")) {
                    document.getElementById(key).innerHTML = data[key];
                }
                // Check if it has any special characters and if so use innerText
                else if (data[key].includes("&")) {
                    document.getElementById(key).innerHTML = data[key];
                }
                // If it doesn't have any special characters or html tags use innerText
                else {
                    document.getElementById(key).innerText = data[key];
                }
            }
        }
    }

    function translateText(lang) {
        fetch("./lang/" + lang + ".json")
        .then(response => response.json())
        .then(data => {
            changeText(data);
            // Save on localstorage
            chrome.storage.local.set({"langdata": data});
        });
        
        // Send request to contentScript to change the text
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0].status === "complete" && tabs[0].url){
                chrome.tabs.sendMessage(tabs[0].id, {message:"languageChange", language:lang}, function(response) {
                });
            }
        });
    }


    // Get current language picked
    chrome.storage.local.get("language", function(result) {
        var language = result.language;
        switch (language) {
            case "ru":
                document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./images/russian.png";
                translateText("ru");
                break;
            case "en":
                document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./images/english.png";
                translateText("en");
                break;
            default:
                // Check default language
                const defaultLanguage = navigator.language;
                if (defaultLanguage.includes("ru")) {
                    document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./images/russian.png";
                    translateText("ru");
                    chrome.storage.local.set({"language": "ru"});
                } else {
                    document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./images/english.png";
                    translateText("en");
                    chrome.storage.local.set({"language": "en"});
                }
                break;
        }
    });
});

