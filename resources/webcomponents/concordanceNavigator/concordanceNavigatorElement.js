console.log("ConcordanceNavigator Webcomponent loaded");

fetch("resources/webcomponents/concordanceNavigator/concordanceNavigatorElement.html")
    .then(stream => stream.text())
    .then(text => define(text));


function define(html) {
    class concordanceNavigatorElement extends HTMLElement {
        constructor() {
            super();
            let me = this;
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = html;
            this.concordances = [];
            this.groups = [];
            this.data = [];
            this.labelField = "";
            this.index = 0;
            this.maxIndex = 0;
            this.timelineBasisData = [];
            this.timelineBasis;
            this.leadingZeroFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
            this.timelineState = "pause";
            this.interval = null;
            this.currentTime = 0;
            this.stopwatch = { elapsedTime: 0 }

            // Elements
            this.concordanceSelector = this.shadow.querySelector("#concordance-selector");
            this.groupSelectorContainer = this.shadow.querySelector("#group-selector-container");
            this.groupSelector = this.shadow.querySelector("#group-selector");
            this.groupSelectorLabel = this.shadow.querySelector("#group-selector-label");
            this.itemSelector = this.shadow.querySelector("#item-selector");
            this.itemSlider = this.shadow.querySelector("#item-slider");
            this.itemSelectorLabel = this.shadow.querySelector("#item-selector-label");
            this.showConnectionButton = this.shadow.querySelector("#show-connection-button");
            this.prevConnectionButton = this.shadow.querySelector("#prev-connection-button");
            this.nextConnectionButton = this.shadow.querySelector("#next-connection-button");
            this.timeContainer = this.shadow.querySelector("#time-container");
            this.timelineBasisSelector = this.shadow.querySelector("#timeline-basis-selector");
            this.currentTimeElem = this.shadow.querySelector("#current-time");
            this.totalTimeElem = this.shadow.querySelector("#total-time");
            this.playButton = this.shadow.querySelector("#play-button");

            // Event listeners
            this.concordanceSelector.addEventListener("change", function () { me.switchConcordance(this.value) });
            this.groupSelector.addEventListener("change", function () { me.switchGroup(this.value) });
            this.timelineBasisSelector.addEventListener("change", function () { me.switchTimelineBasis(this.value) });
            this.itemSlider.addEventListener("input", function () {
                me.updateIndex(this.value);
            });
            this.itemSelector.addEventListener("keypress", function (e) {
                me.specialKeyOnInput(this, e);
            });
            this.showConnectionButton.addEventListener("click", function () {
                me.showConnection();
            });
            this.prevConnectionButton.addEventListener("click", function () {
                me.showPrevConnection();
            });
            this.nextConnectionButton.addEventListener("click", function () {
                me.showNextConnection();
            });
            this.playButton.addEventListener("click", function () {
                if (me.timelineState === "pause") {
                    me.timelinePlay();
                }
                else if (me.timelineState === "play") {
                    me.timelinePause();
                }
            });
            this.currentTimeElem.addEventListener("focus", () => {
                me.timelinePause();
            });
            this.currentTimeElem.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    var newTime = this.hhmmssToSeconds(this.currentTimeElem.value);
                    if (newTime === false) {
                        newTime = this.currentTime;
                    }
                    this.currentTime = newTime;
                    this.timeChanged();
                }
            });

        }

        static get observedAttributes() {
            return ["concordances-data", "show-connection-button-label-data"];
        }

        get concordancesData() {
            return this.getAttribute("concordances-data");
        }
        set concordancesData(value) {
            this.setAttribute("concordances-data", value);
        }

        connectedCallback() {
        }

        disconnectedCallback() {
            console.log("Concordance Navigator disconnected!");
        }

        attributeChangedCallback(name, oldValue, newValue) {
            console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;
            if (name === "concordances-data") {
                this.concordances = JSON.parse(newValue);
                this.setConcordances();
            }
            else if (name === "show-connection-button-label-data") {
                this.showConnectionButton.innerHTML = newValue;
            }

        }

        // Fill the menu with concordances
        setConcordances = () => {
            this.concordanceSelector.innerHTML = ""; // Clear the select
            for (let concordance of this.concordances) {
                let option = document.createElement("option");
                option.value = concordance.name;
                option.text = concordance.name;
                if (concordance == this.concordances[0]) { // Select the first concordance
                    option.selected = true;
                }
                this.concordanceSelector.appendChild(option);
            }

            if (this.concordances.length > 0) { // If there are concordances, switch to the first one
                this.switchConcordance(this.concordanceSelector.value);
            }
        }

        switchConcordance = (concordanceName) => {
            console.log("Concordance switched!");
            var concordance = this.concordances.find(concordance => concordance.name === concordanceName);
            var hasGroups = concordance.groups != null;

            if (hasGroups) {
                this.groupSelectorContainer.classList.remove("hidden");
                this.groupSelectorLabel.innerHTML = concordance.groups.label;
                this.setGroups(concordance.groups.groups);
            } else {
                console.log("No groups!");
                this.groupSelectorContainer.classList.add("hidden");
                this.itemSelectorLabel.innerHTML = concordance.connections.label;
                this.setData(concordance.connections.connections, "name");
                this.itemSelector.value = this.getEnhancedValue();
            }
        }

        setGroups = (groups) => {
            console.log("Groups set!");
            this.groups = groups;
            this.groupSelector.innerHTML = ""; // Clear the select
            for (let group of groups) {
                let option = document.createElement("option");
                option.value = group.name;
                option.text = group.name;
                if (group == groups[0]) { // Select the first concordance
                    option.selected = true;
                }
                this.groupSelector.appendChild(option);

            }
            if (this.groups.length > 0) { // If there are groups, switch to the first one
                this.switchGroup(this.groupSelector.value);
            }
        }

        switchGroup = (groupName) => {
            console.log("Group switched!");
            var group = this.groups.find(group => group.name === groupName);

            this.setData(group.connections.connections, "name");

            this.itemSelectorLabel.innerHTML = group.connections.label;
            this.itemSelector.value = this.getEnhancedValue();
        }

        setData = (data, labelField) => {
            this.data = data;
            this.labelField = labelField;
            this.updateIndex(0);
            this.maxIndex = this.data.length - 1;
            this.itemSlider.max = this.maxIndex;
            this.setTimelineBasis();
        }

        getEnhancedValue = () => {
            return this.data[this.index][this.labelField];
        }

        setEnhancedValue = (value) => {
            var index = this.data.findIndex(item => item[this.labelField] === value);

            if (index === -1) { // findIndex returns -1 if no item was found
                this.itemSelector.value = this.getEnhancedValue();
            }
            else {
                this.updateIndex(index);
            }
        }

        specialKeyOnInput = (t, e) => {
            if (e.key === "Enter") {
                this.setEnhancedValue(t.value);
            }

        }


        setTimelineBasis = async () => {
            this.timelineBasisData = [];
            this.timeContainer.style.display = "none";
            this.timelineBasisSelector.innerHTML = "";
            this.interval = clearInterval(this.interval);
            for (let uri of this.data[0].plist.replace(/\s|;/g, '\uC280').split('\uC280')) {
                if (uri.length === 0) continue;
                const data = await this.makeRequest("data/xql/getMeasuresInRecording.xql?uri=" + uri.split("#")[0]);
                if (data.length > 0) {
                    this.timelineBasisData.push({ uri: uri.split("#")[0], measures: data });
                }
            }
            for (let item of this.timelineBasisData) {
                item.siglum = await this.makeRequest("data/xql/getSiglum.xql?uri=" + item.uri);
                var recordingTimeData = await this.makeRequest("data/xql/getRecordingTime.xql?uri=" + item.uri);
                item.begin = this.hhmmssToSeconds(recordingTimeData.begin);
                item.end = this.hhmmssToSeconds(recordingTimeData.end);
                for (let measure of item.measures) {
                    measure.begin = this.hhmmssToSeconds(measure.begin);
                    measure.end = this.hhmmssToSeconds(measure.end);
                }
            }

            if (this.timelineBasisData.length > 0) {
                // this.interval = setInterval(this.runInterval, 1000);
                this.timeContainer.style.display = "block";
                for (let item of this.timelineBasisData) {
                    let option = document.createElement("option");
                    option.value = item.siglum;
                    option.text = item.siglum;
                    if (item == this.timelineBasisData[0]) {
                        option.selected = true;
                    }
                    this.timelineBasisSelector.appendChild(option);
                }
                this.switchTimelineBasis(this.timelineBasisSelector.value);
            }
        }


        switchTimelineBasis = (timelineBasisSiglum) => {
            console.log("Timeline basis switched!");
            this.timelineBasis = this.timelineBasisData.find(timelineBasis => timelineBasis.siglum === timelineBasisSiglum);
            this.currentTime = this.timelineBasis.begin;
            this.currentTimeElem.value = this.secondsToHhmmss(this.currentTime);
            this.totalTimeElem.innerHTML = this.secondsToHhmmss(this.timelineBasis.end);
        }

        runInterval = () => {
            if (this.timelineState === "play") {
                this.currentTime++;
                this.timeChanged();
            }
            else if (this.timelineState === "pause") {
                console.log("Interval paused!");
            }
        }

        setNewMeasure = () => {
            var newMeasure = this.getMeasureFromSeconds(this.currentTime);
            if (newMeasure !== false && newMeasure.measureLabel !== this.index) { // TODO: change naming of measure to index
                var success = this.updateIndex(newMeasure.measureLabel);
                if (success) {
                    this.showConnection();
                }
            }
        }

        timeChanged = () => {
            if (this.currentTime >= this.timelineBasis.end) {
                this.timelinePause();
                this.currentTime = this.timelineBasis.end;
            }
            this.setNewMeasure();

            this.currentTimeElem.value = this.secondsToHhmmss(this.currentTime);
        }

        startStopwatch = () => {
            console.log("!!!!");
            this.stopwatch.startTime = Date.now();
            this.stopwatch.frozenCurrentTime = this.currentTime;
            this.stopwatch.intervalId = setInterval(() => {
                //calculate elapsed time
                this.stopwatch.elapsedTime = Date.now() - this.stopwatch.startTime;
                this.currentTime = this.stopwatch.frozenCurrentTime + Math.floor(this.stopwatch.elapsedTime / 1000);
                this.timeChanged();
            }, 100);
        }

        timelinePlay = () => {
            this.timelineState = "play";
            this.playButton.innerHTML = "Pause";
            this.startStopwatch();
            this.setNewMeasure();
            // TODO: Fire the LinkController here so that everything starts synchronos.
            const changedPlayPauseStatus = new CustomEvent('changed-play-pause-status', {
                detail: { newStatus: this.timelineState },
                bubbles: true
            });
            this.dispatchEvent(changedPlayPauseStatus);
        }

        timelinePause = () => {
            this.timelineState = "pause";
            this.playButton.innerHTML = "Play";
            clearInterval(this.stopwatch.intervalId);
            const changedPlayPauseStatus = new CustomEvent('changed-play-pause-status', {
                detail: { newStatus: this.timelineState },
                bubbles: true
            });
            this.dispatchEvent(changedPlayPauseStatus);
        }

        getMeasureFromSeconds = (seconds) => {
            for (var measure of this.timelineBasis.measures) {
                if (measure.begin <= seconds && seconds < measure.end) {
                    return measure;
                }
            }
            return false;
        }

        makeRequest = (url) => {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        return "";
                    }
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        return response.json();
                    } else {
                        return response.text();
                    }
                })
                .then(data => {
                    return data;
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        }

        showConnection = () => {
            // Send showConnection event to host
            const showConnectionRequest = new CustomEvent('show-connection-request', {
                detail: { plist: this.data[this.index]["plist"] },
                bubbles: true
            });
            this.dispatchEvent(showConnectionRequest);
        }

        showPrevConnection = () => {
            var success = this.updateIndex(this.index - 1);
            if (success) {
                this.showConnection();
            }
        }

        showNextConnection = () => {
            var success = this.updateIndex(this.index + 1);
            if (success) {
                this.showConnection();
            }
        }

        updateIndex = (newIndex) => {
            var newIndex = parseInt(newIndex);
            if (newIndex < 0 || newIndex > this.maxIndex) return false; // Prevent out of bounds
            this.index = newIndex;
            this.itemSlider.value = this.index;
            this.itemSelector.value = this.getEnhancedValue();
            return true;
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

    }

    customElements.define("edirom-concordance-navigator", concordanceNavigatorElement);
}
