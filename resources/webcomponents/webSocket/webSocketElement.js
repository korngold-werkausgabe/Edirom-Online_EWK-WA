console.log("WebSocket Webcomponent loaded");

fetch("resources/webcomponents/webSocket/webSocketElement.html")
    .then(stream => stream.text())
    .then(text => define(text));

// Libraries
let qrCodeJsElement = document.createElement("script");
qrCodeJsElement.setAttribute("defer", "defer");
qrCodeJsElement.setAttribute("src", "resources/webcomponents/webSocket/qrcode.js")
document.querySelector("head").appendChild(qrCodeJsElement);


function define(html) {
    class webSocketElement extends HTMLElement {
        constructor() {
            super();
            let me = this;
            // Elements
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = html;
            this.webSocketContainer = this.shadow.querySelector("#web-socket-container");
            this.smallInfoContainer = this.shadow.querySelector("#small-info-container");
            this.sessionIdSpan = this.shadow.querySelector("#session-id");
            this.connectionNewsPopover = this.shadow.querySelector("#connection-news-popover");
            this.sessionMembersNumberP = this.shadow.querySelector("#session-members-number");
            this.infoPopover = this.shadow.querySelector("#info-popover");
            this.sessionMembersList = this.shadow.querySelector("#session-members-list");

            // Variables
            this.webSocket;
            this.clientId = null;
            this.sessionId = null;
            this.sessionData = []; // TODO: This should also be filled when the edirom first conects to the session

            // Event listeners
            this.smallInfoContainer.addEventListener("click", (event) => {
                console.log("SmallInfoContainer clicked!");
                this.infoPopover.togglePopover();
            });
        }

        static get observedAttributes() {
            return [];
        }

        connectedCallback() {
            this.webSocket = new WebSocket("ws://localhost:3000");
            this.webSocket.onopen = (event) => {
                console.log("Connection opened!");
                this.smallInfoContainer.classList.remove("disconnected");
                this.smallInfoContainer.classList.add("connected");

                this.webSocket.send(JSON.stringify({ "request": "giveClientId" }));
                this.webSocket.send(JSON.stringify({ "request": "giveSessionId" })); // TODO: Can't I just do this with "giveSessionData"?
                this.sendClientMetadata();
                this.webSocket.send(JSON.stringify({ "request": "giveSessionData" }));
            };
            this.webSocket.onclose = (event) => {
                console.log("Connection closed!");
                this.smallInfoContainer.classList.remove("connected");
                this.smallInfoContainer.classList.add("disconnected");
                this.sessionMembersNumberP.textContent = "0";
            };
            this.webSocket.onmessage = (event) => {
                console.log("Received data!");
                console.log(event.data);
                const dataJson = JSON.parse(event.data);
                if (dataJson.sessionId && this.sessionId === null) {
                    this.setSessionId(dataJson.sessionId);
                    this.sessionMembersNumberP.textContent = "1"; // TODO Get the real session data from the server so its not hard coded
                }
                else if (dataJson.clientId && this.clientId === null) {
                    this.clientId = dataJson.clientId;
                }
                else if (dataJson.message) { // TODO: Implmement better filtering of the different types of messages
                    console.log("Received message!");
                    const receivedMessage = new CustomEvent('received-message', {
                        detail: dataJson,
                        bubbles: true
                    });
                    this.dispatchEvent(receivedMessage);
                }
                else if (dataJson.response === "clientConnected") {
                    console.log("Client connected!");
                    this.handleNewDeviceConnection(dataJson);

                }
                else if (dataJson.response === "clientConnected") {
                    console.log("Client connected!");
                    this.handleNewDeviceConnection(dataJson);

                }
                else if (dataJson.response === "clientDisconnected") {
                    console.log("Client disconnected!");
                    this.handleDeviceDisconnection(dataJson);

                } else if (dataJson.sessionData) { // The filtering of messages is getting out of control and depends on the order of the messages at this point. Improving this should be high priority!
                    this.sessionData = dataJson.sessionData;
                    this.handleSessionDataUpdate();
                }

            };
        }

        disconnectedCallback() {
            console.log("WebSocket Webcomponent disconnected!");
        }

        attributeChangedCallback(name, oldValue, newValue) {
            console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;

        }

        setSessionId = (sessionId) => {
            this.sessionId = sessionId;
            this.sessionIdSpan.textContent = sessionId;
            var qr = qrcode(0, "L");
            qr.addData(sessionId.toString());
            qr.make();
            this.shadow.querySelector('#qr-code-placeholder').innerHTML = qr.createImgTag(6);
        }

        handleNewDeviceConnection = (data) => {
            console.log("New device connected!");
            this.sessionData = data.sessionData;
            this.handleSessionDataUpdate();
            this.showConnectionNewsPopover(data.clientData, "connect");
        }

        handleDeviceDisconnection = (data) => {
            console.log("A Device disconnected!");
            this.sessionData = data.sessionData;
            this.handleSessionDataUpdate();
            this.showConnectionNewsPopover(data.clientData, "disconnect");
        }

        handleSessionDataUpdate = () => {
            const numberOfSessionMembers = this.sessionData.sessionMembers.length;
            // small info window
            this.sessionMembersNumberP.textContent = numberOfSessionMembers;
            // member list
            const ownClient = this.sessionData.sessionMembers.find(client => client.id === this.clientId);
            console.log(this.sessionData);
            const otherMembers = this.sessionData.sessionMembers.filter(client => client.id !== this.clientId);
            this.sessionMembersList.innerHTML = "";
            let newMember = document.createElement("li");
            newMember.textContent = `Du: ${ownClient.metadata.deviceType} ${ownClient.metadata.os} ${ownClient.metadata.browser}`;
            this.sessionMembersList.appendChild(newMember);
            for (let member of otherMembers) {
                let newMember = document.createElement("li");
                newMember.textContent = `${member.metadata.deviceType} ${member.metadata.os} ${member.metadata.browser}`;
                this.sessionMembersList.appendChild(newMember);
            }
        }

        showConnectionNewsPopover = (clientData, type) => {
            let newDiv = document.createElement("div");
            newDiv.classList.add("connection-news-div");
            newDiv.classList.add(type);
            let newP = document.createElement("p");
            let deviceDataString = `${clientData.metadata.deviceType} ${clientData.metadata.os} ${clientData.metadata.browser}`;
            if (type === "connect") {
                newP.textContent = `Ein neues Gerät "${deviceDataString}" ist Ihrer Sitzung beigetreten!`;
            }
            else if (type === "disconnect") {
                newP.textContent = `Ein Gerät "${deviceDataString}" hat die Sitzung verlassen!`;
            }
            let newButton = document.createElement("button");
            newButton.classList.add("connection-news-btn");
            newButton.textContent = "Ok";
            newButton.addEventListener("click", (event) => {
                newDiv.remove();
                if (this.shadow.querySelectorAll(".connection-news-div").length === 0) {
                    this.connectionNewsPopover.hidePopover();
                }
            });
            newDiv.appendChild(newP);
            newDiv.appendChild(newButton);
            this.connectionNewsPopover.appendChild(newDiv);
            this.connectionNewsPopover.showPopover();
        }

        getOs = () => {
            const userAgent = navigator.userAgent;
            if (userAgent.includes("Windows")) {
                return "Windows";
            }
            else if (userAgent.includes("Android")) {
                return "Android";
            }
            else if (userAgent.includes("Linux")) {
                return "Linux";
            }
            else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
                return "iOS";
            }
            else if (userAgent.includes("Mac")) {
                return "MacOS";
            } else {
                return "Unknown";
            }
        }

        getDeviceType = () => {
            const deviceType = this.getOs();
            if (deviceType === "Windows" || deviceType === "Linux" || deviceType === "MacOS") {
                return "Desktop";
            }
            else if (deviceType === "Android" || deviceType === "iOS") {
                return "Mobilgerät";
            }
            else {
                return "Unknown";
            }
        }

        getBrowser = () => { // that can be improved
            const userAgent = navigator.userAgent;
            if (userAgent.includes("Firefox")) {
                return "Firefox";
            }
            else if (userAgent.includes("Chrome")) {
                return "Chrome";
            }
            else if (userAgent.includes("Safari")) {
                return "Safari";
            }
            else if (userAgent.includes("Edge")) {
                return "Edge";
            }
            else {
                return "Unknown";
            }
        }

        getDeviceMetadata = () => { // TODO: The clients should only send the userAgent string to the server and the server should parse it. Then I have the weird parsing in one place
            return {
                deviceType: this.getDeviceType(),
                os: this.getOs(),
                browser: this.getBrowser()
            };
        }

        sendClientMetadata = () => {
            const deviceMetadata = this.getDeviceMetadata();
            const messageString = JSON.stringify({ message: "clientMetadata", clientmetadata: deviceMetadata });
            this.webSocket.send(messageString);
        }


    }

    customElements.define("edirom-web-socket", webSocketElement);
}
