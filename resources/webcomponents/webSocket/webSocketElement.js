console.log("WebSocket Webcomponent loaded");

const template = document.createElement("template");
template.innerHTML = `
    <div>
        <style>
            #small-info-container {
                background-color: yellow;
                /* height: 100%; */
                /* max-height: 100%; */
                justify-content: center;
                padding: 4px;
            }

            #small-info-container:hover {
                cursor: pointer;
            }

            #small-info-container[class="disconnected"] {
                background-color: red;
            }

            #small-info-container[class="connected"] {
                background-color: #83c702;
            }



            svg {
                transform: translateY(20%);
            }

            #session-members-number {
                font-size: 1.2rem;
                font-weight: bold;
                margin-left: 2px;
            }

            #connection-news-popover {
                position: absolute;
                inset: unset;
                top: 42px;
                left: 50%;
                transform: translate(-50%, 0);
                background-color: transparent;
                max-width: 90%;
                border: none;
            }

            .connection-news-div {
                color: black;
                text-align: center;
                border-radius: 8px;
                border: none;
                box-shadow: 3px 6px 6px hsl(0deg 0% 0% / 0.45);
                font-size: 1.3rem;
                padding: 10px;
                margin: 10px;
            }

            .connection-news-div.connect {
                background-color: #83c702;
            }
            .connection-news-div.disconnect {
                background-color: red;
            }

            .connection-news-div p {
                margin: 0;
            }

            #info-popover {
                width: 600px;
                height: 600px;
                padding: 10px;
                background-color: rgb(221, 221, 221);
                border: 1px solid black;
                box-shadow: 5.0px 10px 10px hsl(0deg 0% 0% / 0.55);
            }

            #session-id-container {
                text-align: center;
            }

            #session-id {
                font-size: 1rem;
            }

            #session-members-list {
                font-size: 1.15rem;
            }
        </style>
        <div id="web-socket-container">
            <div id="small-info-container">
                <span id="session-members"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
                        <path d="M80-160v-120h80v-440q0-33 23.5-56.5T240-800h600v80H240v440h240v120H80Zm520 0q-17 0-28.5-11.5T560-200v-400q0-17 11.5-28.5T600-640h240q17 0 28.5 11.5T880-600v400q0 17-11.5 28.5T840-160H600Zm40-120h160v-280H640v280Zm0 0h160-160Z" />
                    </svg><span id="session-members-number">0</span></span>
            </div>
            <div id="connection-news-popover" popover="manual"></div>
            <div id="info-popover" popover="manual">
                <h1>Sitzungsinformationen</h1>
                <h2>Code</h2>
                <div id="session-id-container">
                    <div id="qr-code-placeholder">QR-CODE HIER</div>
                    <p id="session-id"></p>
                </div>
                <hr />
                <h2>Mitglieder</h2>
                <ul id="session-members-list">
                </ul>
            </div>
        </div>
    </div>
`

// Libraries
let qrCodeJsElement = document.createElement("script");
qrCodeJsElement.setAttribute("defer", "defer");
qrCodeJsElement.setAttribute("src", "resources/webcomponents/webSocket/qrcode.js")
document.querySelector("head").appendChild(qrCodeJsElement);



class webSocketElement extends HTMLElement {
    constructor() {
        super();
        let me = this;
        // Elements
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true))
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
            this.sendUserAgent();
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

    sendUserAgent = () => {
        const userAgent = navigator.userAgent;
        const messageString = JSON.stringify({ message: "userAgent", userAgent: userAgent });
        this.webSocket.send(messageString);
    }


}

customElements.define("edirom-web-socket", webSocketElement);

