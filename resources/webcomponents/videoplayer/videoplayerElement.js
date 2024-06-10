
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
            this.playerContainer = this.shadow.querySelector('#player-container');
            this.playerControlsContainer = this.shadow.querySelector('.player-controls-container');
            this.playPauseBtn = this.shadow.querySelector('.play-pause-btn');
            this.timelineContainer = this.shadow.querySelector(".timeline-container");
            this.currentTimeElem = this.shadow.querySelector("#current-time");
            this.totalTimeElem = this.shadow.querySelector(".total-time");
            this.leadingZeroFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
            this.isScrubbing = false;

            this.canvas.addEventListener("click", () => {
                if (this.state == "play") {
                    this.state = "pause";
                }
                else {
                    this.state = "play";
                }
            });

            this.playPauseBtn.addEventListener("click", () => {
                if (this.state == "play") {
                    this.state = "pause";
                }
                else {
                    this.state = "play";
                }
            });


            this.video.addEventListener("timeupdate", () => {
                this.currentTimeElem.value = this.secondsToHhmmss(this.video.currentTime);
                const percent = this.video.currentTime / this.video.duration;
                this.timelineContainer.style.setProperty("--progress-position", percent);

                // Send timeupdate event to host
                const communicateTimeupdateEvent = new CustomEvent('communicate-time-update', {
                    detail: { time: this.video.currentTime },
                    bubbles: true
                });
                this.dispatchEvent(communicateTimeupdateEvent);
            });

            this.video.addEventListener("loadedmetadata", () => { // when metadata is loaded we can access the time data
                this.totalTimeElem.textContent = this.secondsToHhmmss(this.video.duration);
                this.adjustPlayerSize();
            });



            this.timelineContainer.addEventListener("mousemove", this.handleTimelineUpdate);

            this.timelineContainer.addEventListener("mousedown", this.toggleScrubbing);

            document.addEventListener("mouseup", e => {
                if (this.isScrubbing) this.toggleScrubbing(e);
            });
            document.addEventListener("mousemove", e => {
                if (this.isScrubbing) this.handleTimelineUpdate(e);
            });

            this.currentTimeElem.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    this.video.currentTime = this.hhmmssToSeconds(this.currentTimeElem.value);
                }
            });

            this.currentTimeElem.addEventListener("focus", () => {
                this.state = "pause";
            });

        }

        static get observedAttributes() {
            return ["src", "tstamp", "state", "maxsize"];
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

        set tstamp(value) {
            this.setAttribute("tstamp", value);
        }

        set maxsize(value) {
            this.setAttribute("maxsize", value);
        }

        get maxsize() {
            return this.getAttribute("maxsize");
        }


        drawScreen = () => {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        }

        secondsToHhmmss = (time) => {
            const seconds = Math.floor(time % 60);
            const minutes = Math.floor(time / 60) % 60;
            const hours = Math.floor(time / 3600);
            if (hours === 0) {
                return `${minutes}:${this.leadingZeroFormatter.format(seconds)}`;
            } else {
                return `${hours}:${this.leadingZeroFormatter.format(minutes)}:${this.leadingZeroFormatter.format(seconds)}`;
            }
        }

        hhmmssToSeconds = (time) => {
            const parts = time.split(":");
            const regex = /^(?!.*::)(?!.*:$)(?!^:)[0-9:]*$/;
            if (!regex.test(time) || parts.length > 3 || time.length == 0) {
                return this.video.currentTime;
            }
            if (parts.length == 1) {
                return parseInt(parts[0]);
            }
            else if (parts.length == 2) {
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
            else if (parts.length == 3) {
                return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
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
                if (this.video.currentTime != newValue) {
                    this.video.currentTime = newValue;
                }
            }
            else if (name == "state") {
                if (newValue == "play") {
                    this.video.play();
                }
                else if (newValue == "pause") {
                    this.video.pause();
                }
            }
            else if (name == "maxsize") {
                this.adjustPlayerSize();
            }
        }

        handleTimelineUpdate = (e) => {
            const rect = this.timelineContainer.getBoundingClientRect();
            const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
            this.timelineContainer.style.setProperty("--preview-position", percent);

            if (this.isScrubbing) {
                e.preventDefault();
                this.timelineContainer.style.setProperty("--progress-position", percent);
                this.video.currentTime = percent * this.video.duration;
            }
        }

        toggleScrubbing = (e) => {
            this.isScrubbing = (e.buttons & 1) === 1;
            this.handleTimelineUpdate(e);
        }

        toggleScrubbing = (e) => {
            this.isScrubbing = (e.buttons & 1) === 1;
            this.handleTimelineUpdate(e);
        }

        // Adjusts the size of the player to fit the video aspect ratio within the maxsize
        adjustPlayerSize = () => {
            if (this.video.videoWidth && this.video.videoHeight) { // check if metadata is loaded yet
                const aspectRatio = this.video.videoWidth / this.video.videoHeight;
                var maxWidth = this.maxsize.split("x")[0];
                var maxHeight = this.maxsize.split("x")[1] - this.playerControlsContainer.clientHeight;

                if (maxWidth / aspectRatio < maxHeight) {
                    var newWidth = maxWidth;
                    var newHeight = newWidth / aspectRatio;
                }
                else {
                    var newHeight = maxHeight;
                    var newWidth = newHeight * aspectRatio;
                }
                this.canvas.width = newWidth;
                this.canvas.height = newHeight;
            }
            else {
                return;
            }
        }
    }

    customElements.define("edirom-videoplayer", videoplayerElement)
}