console.log("WebSocket Webcomponent loaded");

fetch("resources/webcomponents/webSocket/webSocketElement.html")
    .then(stream => stream.text())
    .then(text => define(text));


function define(html) {
    class webSocketElement extends HTMLElement {
        constructor() {
            super();
            let me = this;
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = html;
            this.webSocket = new WebSocket("http://localhost:3000/1234");
            this.sendBtn = this.shadow.querySelector("#send-btn");
            this.sessionIdSpan = this.shadow.querySelector("#session-id");
            this.sessionId = null;


            // Elements

            // Event listeners
            this.webSocket.onopen = (event) => {
                console.log("Connection opened!");
            };
            this.webSocket.onclose = (event) => {
                console.log("Connection closed!");
            };
            this.webSocket.onmessage = (event) => {
                console.log("Received data!");
                console.log(event.data);
                const dataJson = JSON.parse(event.data);
                if (dataJson.sessionId && this.sessionId === null) {
                    this.setSessionId(dataJson.sessionId);
                }

            };


            console.log(this.sendBtn);

            this.sendBtn.addEventListener("click", (event) => {
                console.log("Sending data!");
                this.webSocket.send("Data from button!");
            });
        }

        static get observedAttributes() {
            return [];
        }

        connectedCallback() {
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
        }



    }

    customElements.define("edirom-web-socket", webSocketElement);
}
