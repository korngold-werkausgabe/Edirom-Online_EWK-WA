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
            this.concordances = [];
            this.groups = [];
            this.data = [];
            this.labelField = "";
            this.index = 0;

            this.concordanceSelector.addEventListener("change", function () { me.switchConcordance(this.value) });
            this.groupSelector.addEventListener("change", function () { me.switchGroup(this.value) });
        }

        static get observedAttributes() {
            return ["concordances"];
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
            if (name === "concordances") {
                this.concordances = JSON.parse(newValue);
                this.setConcordances();
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

                // Just for testing, delete later
                let option2 = document.createElement("option");
                option2.value = "Test1";
                option2.text = "Test1";
                this.concordanceSelector.appendChild(option2);

            }

            if (this.concordances.length > 0) { // If there are concordances, switch to the first one
                this.switchConcordance(this.concordanceSelector.value);
            }
        }

        switchConcordance = (concordanceName) => {
            console.log("Concordance switched!");
            var concordance = this.concordances.find(concordance => concordance.name === concordanceName);
            console.log(concordance);
            var hasGroups = concordance.groups != null;
            console.log(hasGroups);

            // if (hasGroups) {
            //     // this.groupSelectorContainer.style.display = "block";
            // } else {
            //     this.groupSelectorContainer.style.display = "none";
            // }

            if (hasGroups) {
                this.groupSelectorContainer.classList.remove("hidden");
                this.groupSelectorLabel.innerHTML = concordance.groups.label;
                this.setGroups(concordance.groups.groups);
            } else {
                this.groupSelectorContainer.classList.add("hidden");
                this.itemSelectorLabel.innerHTML = concordance.connections.label;
                this.setData(concordance.connections.connections, "name");
                this.itemSelector.setAttribute("value", this.getEnhancedValue());
            }
        }

        setGroups = (groups) => {
            console.log("Groups set!");
            console.log(groups);
            this.groups = groups;
            this.groupSelector.innerHTML = ""; // Clear the select
            console.log(this.groupSelector);
            for (let group of groups) {
                let option = document.createElement("option");
                option.value = group.name;
                option.text = group.name;
                if (group == groups[0]) { // Select the first concordance
                    option.selected = true;
                }
                this.groupSelector.appendChild(option);

                // Just for testing, delete later
                let option2 = document.createElement("option");
                option2.value = "Test1";
                option2.text = "Test1";
                this.groupSelector.appendChild(option2);

            }
            if (this.groups.length > 0) { // If there are groups, switch to the first one
                this.switchGroup(this.groupSelector.value);
            }
        }

        switchGroup = (groupName) => {
            console.log("Group switched!");
            console.log(groupName);
            var group = this.groups.find(group => group.name === groupName);
            console.log(group);

            this.setData(group.connections.connections, "name");

            this.itemSelectorLabel.innerHTML = group.connections.label;
            this.itemSelector.setAttribute("value", this.getEnhancedValue());
        }

        setData = (data, labelField) => {
            this.data = data;
            this.labelField = labelField;
            this.index = 0;

            this.itemSlider.setAttribute("value", this.index); // Maywe we could to this not here because it's a mixture of frontend and backend
            this.itemSlider.setAttribute("max", this.data.length - 1);
        }

        // getRawValue = () => {
        //     return this.data[this.index];
        // }

        getEnhancedValue = () => {
            return this.data[this.index][this.labelField];
        }

    }

    customElements.define("edirom-concordance-navigator", concordanceNavigatorElement);
}

// Bei mir anders:
// the "if (!checked) return;" check in some functions