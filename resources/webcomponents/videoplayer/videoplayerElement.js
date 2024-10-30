
console.log("Videoplayer Webcomponent loaded");

const template = document.createElement("template");
template.innerHTML = `
    <div>
        <style>
            video {
                display: none;
            }

            #player-container {
                display: flex;
                align-items: center;
                flex-direction: column;
            }


            #player-controls-container {
                z-index: 100;
                margin: 0;
                width: 100%;
            }

            .timeline-container {
                margin-top: 10px;
                height: 15px;
                margin-inline: 0.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
            }

            #main-timeline-container.scrubbing .timeline::before,
            #main-timeline-container:hover .timeline::before {
                display: block;
            }

            #main-timeline-container.scrubbing .timeline,
            #main-timeline-container:hover .timeline {
                height: 100%;
            }

            .timeline {
                background-color: rgba(100, 100, 100, 0.5);
                height: 9px;
                width: 100%;
                position: relative;
            }

            .timeline::before {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                right: calc(100% - var(--preview-position) * 100%);
                background-color: rgb(150, 150, 150);
                display: none;
            }

            .timeline::after {
                content: "";
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                right: calc(100% - var(--progress-position) * 100%);
                background-color: #1c274c;
            }

            .timeline .position-indicator-arrow {
                z-index: 100;
                --scale: 1;
                position: absolute;
                transform: translateX(-50%) scale(var(--scale));
                top: -101%;
                left: calc(var(--progress-position) * 100%);
                /* transition: transform 150ms ease-in-out; */
                width: 0; 
                height: 0; 
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-top: 8px solid #f00;
            }

            .timeline .position-indicator-line {
                z-index: 100;
                --scale: 1;
                position: absolute;
                transform: translateX(-50%) scale(var(--scale));
                height: 200%;
                top: -50%;
                left: calc(var(--progress-position) * 100%);
                background-color: red;
                transition: transform 150ms ease-in-out;
                width: 2px;
            }

            #player-controls-container #controls {
                display: flex;
                gap: .5rem;
                padding: .25rem;
                align-items: center;
            }

            #player-controls-container #controls button {
                cursor: pointer;
            }

            :host([state="play"]) #play-icon {
                display: none;
            }

            :host([state="pause"]) #pause-icon {
                display: none;
            }

            #duration-container {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            #current-time, #current-measure {
                text-align: center;
            }

            #volume-high-icon,
            #volume-low-icon,
            #volume-muted-icon {
                display: none;
            }

            #volume-container[data-volume-level="high"] #volume-high-icon {
                display: block;
            }

            #volume-container[data-volume-level="low"] #volume-low-icon {
                display: block;
            }

            #volume-container[data-volume-level="muted"] #volume-muted-icon {
                display: block;
            }

            #volume-container {
                display: flex;
                align-items: center;
            }

            #volume-slider {
                width: 0;
                transform-origin: left;
                transform: scaleX(0);
                transition: width 150ms ease-in-out, transform 150ms ease-in-out;
            }

            #volume-container:hover #volume-slider{
                width: 90px;
                transform: scaleX(1);
            }
        </style>
        <div id="player-container">
            <video></video>
            <canvas id="video-canvas" width="640" height="480"></canvas>
            <div id="player-controls-container">
                <div id="timelines">
                    <div id="main-timeline-container" class="timeline-container">
                        <div id="main-timeline" class="timeline">
                            <div class="position-indicator-arrow"></div>
                            <div class="position-indicator-line"></div>
                        </div>
                    </div>
                </div>
                <div id="controls">
                    <button id="play-pause-btn">
                        <img id="play-icon" src="https://www.svgrepo.com/download/522226/play.svg" height="20px" width="20px"></img>
                        <img id="pause-icon" src="https://www.svgrepo.com/download/522219/pauze.svg" height="20px" width="20px"></img>
                    </button>
                    <div id="volume-container" data-volume-level="high">
                        <button id="mute-btn">
                            <svg id="volume-high-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000">
                                <path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z"></path>
                            </svg>
                            <svg id="volume-low-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000">
                                <path d="M200-360v-240h160l200-200v640L360-360H200Zm440 40v-322q45 21 72.5 65t27.5 97q0 53-27.5 96T640-320ZM480-606l-86 86H280v80h114l86 86v-252ZM380-480Z"></path>
                            </svg>
                            <svg id="volume-muted-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000">
                                <path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z"></path>
                            </svg>
                        </button>
                        <input id="volume-slider" type="range" min="0" max="1" step="any"></input>
                    </div>
                    <div id="duration-container">
                        <input type="text" id="current-time" value="0:00" size="5"></input>
                        /
                        <div class="total-time"></div>
                    </div>
                    <input type="text" id="current-measure" value="0" size="2"></input>
                </div>
            </div>
        </div>
    </div>
`;

class videoplayerElement extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(template.content.cloneNode(true))
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
