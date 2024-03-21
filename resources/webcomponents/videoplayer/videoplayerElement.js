
console.log("SCRIPT LOADED!!!!!!");

fetch("resources/webcomponents/videoplayer/videoplayerElement.html")
    .then(stream => stream.text())
    .then(text => define(text));

function define(html) {
    class videoplayerElement extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = html;
        }

        static get observedAttributes() {
            return ["src"]
        }

        // Ist dann mit this.testattr abrufbar
        get src() {
            return this.getAttribute("src");
        }

        set src(value) {
            this.setAttribute("src", value);
        }

        // Wird ausgeführt, wenn WC dem DOM zur Verfügung steht
        connectedCallback() {
            //pass
        }

        disconnectedCallback() {
            console.log("Element entfernt");
        }

        // Wird ausgeführt, wenn Attributwert sich ändert und initial
        attributeChangedCallback(name, oldValue, newValue) {
            console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;
            if (name == "src") {
                this.shadow.querySelector("source").setAttribute("src", newValue);
            }
        }
    }

    customElements.define("edirom-videoplayer", videoplayerElement)
}