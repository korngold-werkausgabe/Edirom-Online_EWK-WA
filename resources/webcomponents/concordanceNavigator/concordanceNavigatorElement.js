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
            this.concordanceSelector = this.shadow.querySelector("#concordance-selector");
            this.groupSelectorContainer = this.shadow.querySelector("#group-selector-container");
            this.groupSelector = this.shadow.querySelector("#group-selector");
            this.groupSelectorLabel = this.shadow.querySelector("#group-selector-label");
            this.itemSelector = this.shadow.querySelector("#item-selector");
            this.itemSlider = this.shadow.querySelector("#item-slider");
            this.itemSelectorLabel = this.shadow.querySelector("#item-selector-label");
            this.showConnectionButton = this.shadow.querySelector("#show-connection-button");
            this.concordances = [];
            this.groups = [];
            this.data = [];
            this.labelField = "";
            this.index = 0;

            this.concordanceSelector.addEventListener("change", function () { me.switchConcordance(this.value) });
            this.groupSelector.addEventListener("change", function () { me.switchGroup(this.value) });
            this.itemSlider.addEventListener("input", function () {
                me.index = this.value;
                me.itemSelector.value = me.getEnhancedValue();
                console.log("Slider value changed to " + me.index);
            });
            this.itemSelector.addEventListener("keypress", function (e) {
                me.specialKeyOnInput(this, e);
            });
            this.showConnectionButton.addEventListener("click", function () {
                me.showConnection()
            });

        }

        static get observedAttributes() {
            return ["data-concordances", "data-show-connection-button-label"];
        }

        // Wird ausgeführt, wenn WC dem DOM zur Verfügung steht
        connectedCallback() {
            console.log("Element hinzugefügt");
        }

        disconnectedCallback() {
            console.log("Element entfernt");
        }

        // Wird ausgeführt, wenn Attributwert sich ändert und initial
        attributeChangedCallback(name, oldValue, newValue) {
            console.log("Attributwert geändert!");
            console.log(name, oldValue, newValue);
            if (oldValue === newValue) return;
            if (name === "data-concordances") {
                this.concordances = JSON.parse(newValue);
                this.setConcordances();
            }
            else if (name === "data-show-connection-button-label") {
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
            this.index = 0;

            this.itemSlider.value = this.index; // Maywe we could to this not here because it's a mixture of frontend and backend
            this.itemSlider.max = this.data.length - 1;
        }

        // getRawValue = () => {
        //     return this.data[this.index];
        // }

        getEnhancedValue = () => {
            return this.data[this.index][this.labelField];
        }

        setEnhancedValue = (value) => {
            var index = this.data.findIndex(item => item[this.labelField] === value);

            if (index === -1) { // findIndex returns -1 if no item was found
                this.itemSelector.value = this.getEnhancedValue();
            }
            else {
                this.index = index;
                this.itemSlider.value = this.index;
            }
        }

        specialKeyOnInput = (t, e) => {
            if (e.key === "Enter") {
                this.setEnhancedValue(t.value);
            }

        }

        showConnection = () => {
            console.log("Show connection!");
            // Send showConnection event to host
            const showConnectionRequest = new CustomEvent('show-connection-request', {
                detail: { plist: this.data[this.index]["plist"] },
                bubbles: true
            });
            console.log(showConnectionRequest);
            this.dispatchEvent(showConnectionRequest);
        }

    }

    customElements.define("edirom-concordance-navigator", concordanceNavigatorElement);
}

// Bei mir anders:
// the "if (!checked) return;" check in some functions