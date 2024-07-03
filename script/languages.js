/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

document.getElementsByClassName("dropbtn")[0].addEventListener("click", myFunction);
  
// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
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

function changeText(data){
    if (document.getElementById("title") != null) 
        document.getElementById("title").innerHTML = data["title"];
    if (document.getElementById("catTitle") != null)
        document.getElementById("catTitle").innerText = data["catTitle"];
    if (document.getElementById("getID") != null)
        document.getElementById("getID").innerText = data["getID"];
    if (document.getElementById("changeTitle") != null)
        document.getElementById("changeTitle").innerText = data["changeTitle"];
    if (document.getElementById("note") != null)
        document.getElementById("note").innerText = data["note"];
    if (document.getElementById("changeCostume") != null)
        document.getElementById("changeCostume").innerText = data["changeCostume"];
    if (document.getElementById("dpopupContent") != null)
        document.getElementById("dpopupContent").innerText = data["dpopupContent"];  
}

function translateText(lang) {
    fetch("./lang/" + lang + ".json")
    .then(response => response.json())
    .then(data => {
        changeText(data);
        // Save on localstorage
        chrome.storage.local.set({"langdata": data});
    });
}


// Get current language picked
chrome.storage.local.get("language", function(result) {
    var language = result.language;

    switch (language) {
        case "ru":
            document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./russian.png";
            translateText("ru");
            break;
        case "en":
            document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./english.png";
            translateText("en");
            break;
        default:
            // Check default language
            const defaultLanguage = navigator.language;
            if (defaultLanguage.includes("ru")) {
                document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./russian.png";
                translateText("ru");
                chrome.storage.local.set({"language": "ru"});
            } else {
                document.getElementsByClassName("dropbtn")[0].querySelector("img").src = "./english.png";
                translateText("en");
                chrome.storage.local.set({"language": "en"});
            }
            break;
    }
});


