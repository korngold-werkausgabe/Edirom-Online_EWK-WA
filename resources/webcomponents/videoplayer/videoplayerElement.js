
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
            this.playerControlsContainer = this.shadow.querySelector('#player-controls-container');
            this.playPauseBtn = this.shadow.querySelector('#play-pause-btn');
            this.timelineContainer = this.shadow.querySelector(".timeline-container");
            this.currentTimeElem = this.shadow.querySelector("#current-time");
            this.totalTimeElem = this.shadow.querySelector(".total-time");
            this.currentMeasureElem = this.shadow.querySelector("#current-measure");
            this.volumeContainer = this.shadow.querySelector("#volume-container");
            this.volumeSlider = this.shadow.querySelector("#volume-slider");
            this.muteBtn = this.shadow.querySelector("#mute-btn");
            this.leadingZeroFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
            this.isScrubbing = false;
            this.volumeBeforeMute = 0.5;

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
                this.updateMeasureForm();
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
                    var newTime = this.hhmmssToSeconds(this.currentTimeElem.value);
                    if (newTime === false) {
                        newTime = this.video.currentTime;
                    }
                    this.video.currentTime = newTime;
                }
            });

            this.currentTimeElem.addEventListener("focus", () => {
                this.state = "pause";
            });

            this.currentMeasureElem.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    var newTime;
                    var newMeasure = this.getMeasureFromLabel(this.currentMeasureElem.value);
                    if (newMeasure === false) {
                        newTime = this.video.currentTime;
                    }
                    else {
                        newTime = newMeasure.begin;
                    }
                    this.video.currentTime = newTime;
                }
            });

            this.currentMeasureElem.addEventListener("focus", () => {
                this.state = "pause";
            });

            this.volumeSlider.addEventListener("input", e => {
                this.video.volume = parseFloat(e.target.value);
            });

            this.muteBtn.addEventListener("click", () => {
                if (this.video.muted) {
                    this.video.muted = false;
                    this.video.volume = this.volumeBeforeMute;
                }
                else {
                    this.video.muted = true;
                    this.volumeBeforeMute = this.video.volume;
                    this.video.volume = 0;
                }
            });

            this.video.addEventListener("volumechange", () => {
                if (this.video.volume === 0) {
                    this.video.muted = true;
                }
                else {
                    this.video.muted = false;
                }

                this.adjustVolumeSlider();
                this.adjustVolumeIcon();
            });

            this.video.addEventListener("pause", () => {
                if (this.state == "play") {
                    this.state = "pause";
                }
            });

        }

        static get observedAttributes() {
            return ["src-data", "src-endpoint", "target-time", "state", "maxsize", "measures-data", "measures-endpoint", "target-measure"];
        }

        // Ist dann mit this.testattr abrufbar
        get srcData() {
            return this.getAttribute("src-data");
        }
        set srcData(value) {
            this.setAttribute("src-data", value);
        }

        get measuresData() {
            return this.getAttribute("measures-data");
        }
        set measuresData(value) {
            this.setAttribute("measures-data", value);
        }

        get state() {
            return this.getAttribute("state");
        }
        set state(value) {
            this.setAttribute("state", value);
        }

        set maxsize(value) {
            this.setAttribute("maxsize", value);
        }

        get maxsize() {
            return this.getAttribute("maxsize");
        }

        // Gets exectuted when the element is added to the DOM
        connectedCallback() {
            setInterval(this.drawScreen, 33); // The 33 is still hard coded!
            this.adjustVolumeIcon();
            this.adjustVolumeSlider();
        }

        disconnectedCallback() {
            console.log("Videoplayer removed from DOM!");
        }

        // Wird ausgeführt, wenn Attributwert sich ändert und initial
        attributeChangedCallback(name, oldValue, newValue) {
            console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;
            if (name == "src-data") {
                this.video.src = newValue;
            }
            else if (name == "src-endpoint") {
                this.requestVideoSource(newValue);
            }
            else if (name == "measures-data") {
                this.measures = JSON.parse(newValue);
                for (var i = 0; i < this.measures.length; i++) {
                    this.measures[i].begin = this.hhmmssToSeconds(this.measures[i].begin);
                    this.measures[i].end = this.hhmmssToSeconds(this.measures[i].end);
                }
                this.updateMeasureForm();
            }
            else if (name == "measures-endpoint") {
                this.requestMeasures(newValue);
            }
            else if (name == "target-measure") {
                var newMeasure = this.getMeasureFromId(newValue);
                if (newMeasure !== false) {
                    console.log("target:", newMeasure.begin);
                    console.log("current:", this.video.currentTime);
                    if (Math.abs(this.video.currentTime - newMeasure.begin) > 0.6) { // here I am working with tolarance because the video.currentTime is not accurate. Is this the best solution? The tolarance is so big because jumping to a time in the video is very slow and then behind the time of the concordance navigator
                        console.log("difference too big, syncing");
                        this.video.currentTime = newMeasure.begin;
                    }
                }
            }
            else if (name == "target-time") {
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

        drawScreen = () => {
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        }

        secondsToHhmmss = (time) => {
            // still ignores milliseconds!!!
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
            // Still ignores milliseconds!!!
            const parts = time.split(":");
            const regex = /^(?!.*::)(?!.*:$)(?!^:)[0-9:.]*$/;
            if (!regex.test(time) || parts.length > 3 || time.length == 0) {
                return false;
            }
            if (parts.length == 1) {
                return parseFloat(parts[0]);
            }
            else if (parts.length == 2) {
                return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
            }
            else if (parts.length == 3) {
                return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
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

        getMeasureFromSeconds = (seconds) => {
            for (var i = 0; i < this.measures.length; i++) {
                if (this.measures[i].begin <= seconds && seconds < this.measures[i].end) {
                    return this.measures[i];
                }
            }
            return false;
        }

        getMeasureFromLabel = (label) => {
            var filteredArray = this.measures.filter((measure) => {
                return measure.measureLabel === label;
            });
            if (filteredArray.length > 0) {
                return filteredArray[0];
            }
            else {
                return false;
            }
        }

        getMeasureFromId = (id) => {
            var filteredArray = this.measures.filter((measure) => {
                return measure.measureId === id;
            });
            if (filteredArray.length > 0) {
                return filteredArray[0];
            }
            else {
                return false;
            }
        }

        updateMeasureForm = () => {
            var currentMeasure = this.getMeasureFromSeconds(this.video.currentTime);
            if (currentMeasure === false) {
                this.currentMeasureElem.value = "";
            }
            else {
                this.currentMeasureElem.value = currentMeasure.measureLabel;
            }
        }

        requestVideoSource = (url) => {
            fetch(url)
                .then(response => response.text())
                .then(data => {
                    this.srcData = data;
                });
        }

        requestMeasures = (url) => {
            fetch(url)
                .then(response => response.text())
                .then(data => {
                    this.measuresData = data;
                });
        }

        adjustVolumeSlider = () => {
            if (this.volumeSlider.value != this.video.volume) {
                this.volumeSlider.value = this.video.volume;
            }
        }

        adjustVolumeIcon = () => {
            let volumeLevel;
            if (this.video.muted || this.video.volume === 0) {
                volumeLevel = "muted";
            } else if (this.video.volume >= 0.5) {
                volumeLevel = "high";
            } else {
                volumeLevel = "low";
            }
            this.volumeContainer.dataset.volumeLevel = volumeLevel;
        }
    }

    customElements.define("edirom-videoplayer", videoplayerElement)
}