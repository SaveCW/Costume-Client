document.getElementById("getInfo").addEventListener("click", function() {
    fetch("https://catwar.su/")
    .then(response => response.text())
    .then(text => {
        // Create a new document
        const parser = new DOMParser();
        const htmlDocument = parser.parseFromString(text, "text/html");
        document.getElementById("id").value = htmlDocument.getElementById("id_val").innerText;
        document.getElementById("username").value = htmlDocument.getElementById("pr").querySelector("big").innerText;
    });
});

document.getElementById("submit").addEventListener("click", function() {
    var id = document.getElementById("id").value;
    var username = document.getElementById("username").value;
    var data = { id: id, username: username };

    fetch("http://localhost:1300/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());

    var field = document.getElementById("field");

    field.innerHTML = "";

    var div = document.createElement("div");
    div.className = "form-group"

    var label = document.createElement("label");
    label.innerText = "ID: " + id;
    div.appendChild(label);

    var div_name = document.createElement("div");
    div_name.className = "form-group"

    var label_name = document.createElement("label");
    label_name.innerText = "Username: " + username;
    div_name.appendChild(label_name);

    field.appendChild(div);
    field.appendChild(div_name);
});