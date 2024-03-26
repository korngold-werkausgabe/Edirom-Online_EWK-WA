
console.log("Videoplayer Webcomponent loaded");

fetch("resources/webcomponents/videoplayer/videoplayerElement.html")
    .then(stream => stream.text())
    .then(text => define(text));

function define(html) {
    class videoplayerElement extends HTMLElement {
        constructor() {
            super();
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = html;
            this.video = this.shadow.querySelector("video");
            this.canvas = this.shadow.querySelector('#video-canvas');
            this.ctx = this.canvas.getContext('2d');

            this.canvas.addEventListener("click", () => {
                if (this.state == "play") {
                    this.state = "pause";
                }
                else {
                    this.state = "play";
                }
            });
        }

        static get observedAttributes() {
            return ["src", "tstamp", "state"]
        }

        // Ist dann mit this.testattr abrufbar
        get src() {
            return this.getAttribute("src");
        }
        set src(value) {
            this.setAttribute("src", value);
        }

        get state() {
            return this.getAttribute("state");
        }
        set state(value) {
            this.setAttribute("state", value);
        }

        drawScreen = () => {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Wird ausgeführt, wenn WC dem DOM zur Verfügung steht
        connectedCallback() {
            setInterval(this.drawScreen, 33);
        }

        disconnectedCallback() {
            console.log("Element entfernt");
        }

        // Wird ausgeführt, wenn Attributwert sich ändert und initial
        attributeChangedCallback(name, oldValue, newValue) {
            console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;
            if (name == "src") {
                this.video.src = newValue;
            }
            else if (name == "tstamp") {
                this.video.currentTime = newValue;
            }
            else if (name == "state") {
                if (newValue == "play") {
                    this.video.play();
                }
                else if (newValue == "pause") {
                    this.video.pause();
                }
            }
        }
    }

    customElements.define("edirom-videoplayer", videoplayerElement)
}