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

function getContrastingTextColor(hexColor) {
    // Remove the hash at the start if it's there
    hexColor = hexColor.replace('#', '');

    // Parse the r, g, b values
    var r = parseInt(hexColor.substring(0, 2), 16);
    var g = parseInt(hexColor.substring(2, 4), 16);
    var b = parseInt(hexColor.substring(4, 6), 16);

    // Calculate the luminance
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light backgrounds and white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

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

    // Pick good hex color for text for color given 
    div.style.color = getContrastingTextColor(color);

    // Resize popup
    // document.body.style.height = "fit-content";

    setTimeout(() => {
        div.style.opacity = 0;
        setTimeout(() => {
            div.style.backgroundColor = "transparent";
            div.innerHTML = "";
        }, 2000);
    }, 2000);
}

chrome.storage.local.get("state", function(result) {
    if (result.state && result.state.status === "verify") {
        document.getElementById("id").value = result.state.id;
        document.getElementById("username").value = result.state.username;
        document.getElementById("submit").click();
    }
});

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
    function handleInput(event) {
        console.log(event)

        if (this.value == null) return;

        // If the input is not a number, clear the input
        if (!/^\d$/.test(event.data)) {
            // Prevent it from being added
            this.value = "";
            return;
        }

        if (this.value.length > 1) {
            this.value = this.value.slice(0, 1);
        }

        // Go to next input or loop back to start
        const next = this.nextElementSibling || null;
        if (!next) return;
        next.focus();
        next.select();
    }
    
    // Function to handle code submission
    function submitCode() {
        // Assuming 'id' and 'username' are defined elsewhere in your code
        const code = Array.from(document.querySelectorAll('.code'))
                    .map(input => input.value === '' ? '0' : input.value)
                    .join('');
        const data = { id: id, code: code };

        if (!code) {
            setError("Please enter the code", "red");
            return;
        }

        // Block more presses
        document.getElementById("submitCode").disabled = "true"

        fetch("http://localhost:1300/verify", {
            method: 'POST',
            credentials: 'include', // Include credentials (cookies) in the request
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        .then(response => {
            console.log(response.status)
            if (response.status === 200) {
                // Verify complete and user is logged in Reload the page
                setError("Verification complete", "green");
                setTimeout(() => {
                    // Run function in backgroundjs 
                    chrome.runtime.sendMessage({ action: "loggedinreload" }, response => {
                        if (response && response.success) {
                            // Delete the state
                            chrome.storage.local.remove("state");

                            // Close the popup
                            window.close();
                        }
                        else {
                            console.log(response)
                            setError("Failed to reload the page. Please close the window.", "red");
                            // Delete the state
                            chrome.storage.local.remove("state");
                        }
                    });
                    // window.close();
                }, 2000);
            } else if (response.status === 400) {
                setError("Code has expired. Please try to relogin.", "red");
            } else if (response.status === 401) {
                setError("Information is Invalid.", "red");
            } else if (response.status === 403) {
                setError("Invalid code.", "red");
            } else if (response.status === 404) {
                setError("User not found.", "red");
            }
            else {
                setError("Failed to send verification code.", "red");
            }

            if (response.status != 200) {
                document.getElementById("submitCode").disabled = ""
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function initializeForm() {
        const field = document.getElementById("field");
        field.innerHTML = `<div class="form-group">
            <label>We have send a <a href='https://catwar.su/ls'>PM</a> to your account please enter the 6 digit code below</label>
            <div class="codeContainer"></div>
            <button id="back">&larr; Back</button>
        </div>`;
        const codeContainer = field.querySelector('.codeContainer');
        const backButton = field.querySelector('#back');
        createVerificationInputs(codeContainer);
    
        const submitButton = createElement('button', {
            innerHTML: 'Submit',
            id: 'submitCode'
        });
        const buttonDiv = createElement('div', { className: 'form-group' });
        buttonDiv.appendChild(submitButton);
        field.appendChild(buttonDiv);
    
        submitButton.addEventListener("click", submitCode);
        backButton.addEventListener("click", () => {
            // Remove the state
            chrome.storage.local.remove("state");
            location.reload();
        });


        // Save state for later use
        chrome.storage.local.set({ state: {status: "verify", id: id, username: username} });
    }

    // Check if we have a state
    chrome.storage.local.get("state", function(result) {
        if (result.state && result.state.status === "verify") {
            // If we have a state, initialize the form
            initializeForm();
        }
        else {
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
                } 
                else if (response.status === 400) {
                    setError("User not found.", "red");
                }
                else if (response.status === 403) {
                    setError("Information is invalid.", "red");
                }
                else {
                    setError("Failed to send verification code.", "red");
                }
            })
        }
    });
});