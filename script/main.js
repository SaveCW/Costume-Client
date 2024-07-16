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

function setError(message, color){
    var status = document.getElementsByClassName("statusContainer")[0];
    if (status.querySelector("#status") != null) {
        status.removeChild(status.querySelector("#status"));
    }

    var div = document.createElement("div");
    div.id = "status";
    div.style.backgroundColor = color;
    div.innerText = message;
    status.appendChild(div);

    // Resize popup
    document.body.style.height = "fit-content";

    setTimeout(() => {
        div.style.opacity = 0;
        setTimeout(() => {
            div.style.backgroundColor = "transparent";
            div.innerHTML = "";
        }, 2000);
    }, 2000);
}

document.getElementById("submit").addEventListener("click", function() {
    var id = document.getElementById("id").value;
    var username = document.getElementById("username").value;
    var status = document.getElementsByClassName("statusContainer")[0];
    var data = { id: id, username: username };

    if (id == "" || username == "") {
        setError("Please fill in all the fields", "red");
        return;
    }

    // If id is not only numbers
    if (!/^\d+$/.test(id)) {
        setError("ID must be only numbers", "red");
        return;
    }

    if (status.querySelector("#status") != null) {
        status.removeChild(status.querySelector("#status"));
    }

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
    label.innerHTML = "We have send a <a href='https://catwar.su/ls'>PM</a> to your account please enter the 6 digit code below";
    div.appendChild(label);

    var codeContainer = document.createElement("div");
    codeContainer.className = "codeContainer";

    for (var i = 0; i < 6; i++) {
        var input = document.createElement("input");
        input.type = "number";
        input.id = "code" + i;
        input.className = "code";
        input.placeholder = "0";
        // Add an event listener to restrict input length
        input.onpaste = e => e.preventDefault();

        input.addEventListener('input', function() {
            if (this.value.length > 1) {
                this.value = this.value.slice(0, 1); // Keep only the first digit

            }
            // Go to next input
            var next = this.nextElementSibling;
            if (next) {
                next.focus();
                next.select();
            }
            else {
                // Go to start input
                var start = this.parentElement.firstElementChild;
                start.focus();
                start.select();
            }
        });
        codeContainer.appendChild(input);
    }
    div.appendChild(codeContainer);
    field.appendChild(div);

    var button_div = document.createElement("div");
    button_div.className = "form-group";

    var button = document.createElement("button");
    button.innerText = "Submit";
    button.id = "submitCode";

    button_div.appendChild(button);

    field.appendChild(button_div);


    // Listener for code
    document.getElementById("submitCode").addEventListener("click", function() {
        var code = document.getElementById("code").value;
        var data = { id: id, username: username, code: code };

        if (code == "") {
            setError("Please enter the code", "red");
            return;
        }

        fetch("http://localhost:1300/verify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())

    });


});