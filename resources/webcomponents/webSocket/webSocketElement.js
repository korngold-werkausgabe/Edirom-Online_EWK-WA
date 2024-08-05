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
            this.webSocketContainer = this.shadow.querySelector("#web-socket-container");
            this.sessionIdSpan = this.shadow.querySelector("#session-id");
            this.sessionId = null;


            // Elements

            // Event listeners
            this.webSocket.onopen = (event) => {
                console.log("Connection opened!");
                this.webSocketContainer.classList.remove("disconnected");
                this.webSocketContainer.classList.add("connected");

                this.webSocket.send(JSON.stringify({ "request": "giveSessionId" }));
            };
            this.webSocket.onclose = (event) => {
                console.log("Connection closed!");
                this.webSocketContainer.classList.remove("connected");
                this.webSocketContainer.classList.add("disconnected");
            };
            this.webSocket.onmessage = (event) => {
                console.log("Received data!");
                console.log(event.data);
                const dataJson = JSON.parse(event.data);
                if (dataJson.sessionId && this.sessionId === null) {
                    this.setSessionId(dataJson.sessionId);
                }

            };
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
