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

    // Replace any spaces with a html space & remove any leading or trailing spaces
    data.username = username.trim().replaceAll(" ", "%20");

    // If id is not only numbers
    if (!/^\d+$/.test(id)) {
        setError("ID must be only numbers", "red");
        return;
    }

    if (status.querySelector("#status") != null) {
        status.removeChild(status.querySelector("#status"));
    }

    
    // Helper function to create and return a new element with optional properties
    function createElement(tag, properties = {}) {
        const element = document.createElement(tag);
        Object.keys(properties).forEach(prop => {
            if (prop === 'className') {
                element.className = properties[prop];
            } else if (prop === 'innerHTML') {
                element.innerHTML = properties[prop];
            } else {
                element.setAttribute(prop, properties[prop]);
            }
        });
        return element;
    }

    function createVerificationInputs(container) {
        for (let i = 0; i < 6; i++) {
            const input = createElement('input', {
                type: 'number',
                id: `code${i}`,
                className: 'code',
                placeholder: '0',
                onpaste: (e) => e.preventDefault()
            });
            input.addEventListener('input', handleInput);
            container.appendChild(input);
        }
    }

    // Handle input event for code inputs
    function handleInput() {
        if (this.value.length > 1) {
            this.value = this.value.slice(0, 1);
        }
        // Go to next input or loop back to start
        const next = this.nextElementSibling || this.parentElement.firstElementChild;
        next.focus();
    }
    
    // Function to handle code submission
    function submitCode() {
        // Assuming 'id' and 'username' are defined elsewhere in your code
        const code = Array.from(document.querySelectorAll('.code')).map(input => input.value).join('');
        const data = { id: id, code: code };

        if (!code) {
            setError("Please enter the code", "red");
            return;
        }

        fetch("http://localhost:1300/verify", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log(response.status)
            if (response.status === 200) {
                // Get session token from the response
            } else if (response.status === 401) {
                setError("Invalid code.", "red");
            } else if (response.status === 400) {
                setError("Code has expired. Please try to relogin.", "red");
            } else if (response.status === 404) {
                setError("User not found.", "red");
            }
            else {
                setError("Failed to send verification code.", "red");
            }
        })
    }

    function initializeForm() {
        const field = document.getElementById("field");
        field.innerHTML = `<div class="form-group">
            <label>We have send a <a href='https://catwar.su/ls'>PM</a> to your account please enter the 6 digit code below</label>
            <div class="codeContainer"></div>
        </div>`;
        const codeContainer = field.querySelector('.codeContainer');
        createVerificationInputs(codeContainer);
    
        const submitButton = createElement('button', {
            innerHTML: 'Submit',
            id: 'submitCode'
        });
        const buttonDiv = createElement('div', { className: 'form-group' });
        buttonDiv.appendChild(submitButton);
        field.appendChild(buttonDiv);
    
        submitButton.addEventListener("click", submitCode);
    }


    fetch("http://localhost:1300/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log(response.status)
        if (response.status === 200) {
            initializeForm();
        } else if (response.status === 400) {
            setError("User not found.", "red");
        }
        else {
            setError("Failed to send verification code.", "red");
        }
    })
});