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
            this.groupSelector = this.shadow.querySelector("#group-selector");
            this.groupSelectorLabel = this.shadow.querySelector("#group-selector-label");
            this.concordances = [];

            this.concordanceSelector.addEventListener("change", function () { me.switchConcordance(this.value) });
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

            // if (this.concordances.length > 0) {
            //     this.switchConcordance();
            // }
        }

        switchConcordance = (concordanceName) => {
            console.log("Concordance switched!");
            var concordance = this.concordances.find(concordance => concordance.name === concordanceName);
            console.log(concordance);
            var hasGroups = concordance.groups != null;
            console.log(hasGroups);

            // hier dann noch groupvisibility

            if (hasGroups) {
                this.groupSelectorLabel.innerHTML = concordance.groups.label;
            } else {
                console.log("No groups");
            }
        }

    }

    customElements.define("edirom-concordance-navigator", concordanceNavigatorElement);
}