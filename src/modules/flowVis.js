import PubSub from "../core/pubsub";
import { toArray } from "../common/util";

const flowVis = (el, stateData, fixedPumpRPMValues) => {
    const data = {
        stateData,
        fixedPumpRPMValues: fixedPumpRPMValues.reverse(),
        poolSizeElementId: "pool-size",
        poolSizeValue: 15,
        additionalFeaturesChecked: false,
        stateValue: null,
        monthValue: null,
        fixedPumpRPM: 1500,
        fixedAnnualCost: null,
        variablePumpRPM: 2500,
        variablePumpRPMElementId: "variable-pump-rpm",
        variablePumpRPMValue: 14,
        variableAnnualCost: null,
        runHoursPerMonth: 720,
        fixedValuePumpSize: 2.2
    };
    const events = new PubSub();
    const calculator = {
        init () {
            this.el = el[ 0 ];
            this.cacheDOM();
            this.registerListeners();
            this.bindEvents();
            this.initializeDropDowns();
            this.setInitialValues();
        },
        cacheDOM () {
            this.formElements = toArray(this.el.querySelectorAll("[data-form-element]"));
            this.renderTargets = toArray(this.el.querySelectorAll("[data-render-target]"));
            this.poolImageElement = this.el.querySelector("img[src*='Water_Drop']").parentNode;
        },
        bindEvents () {
            this.formElements.forEach((item) => {
                if (item.classList.contains("flowvis-slider")) {
                    item.addEventListener("input", () => {
                        events.emit("slider-value-change", {
                            value: item.value,
                            id: item.dataset.formElement
                        });
                    });
                } else if (item.classList.contains("flowvis-checkbox")) {
                    item.addEventListener("change", () => {
                        events.emit("checkbox-value-change", {
                            value: item.checked,
                            id: item.dataset.formElement
                        });
                    });
                } else if (item.classList.contains("flowvis-ui-select")) {
                    item.addEventListener("change", () => {
                        events.emit("dropdown-value-change", {
                            value: item.value,
                            id: item.dataset.formElement
                        });
                    });
                }
            });
        },
        registerListeners () {
            events
                .on("app-update", () => {
                    if (data.stateValue && data.monthValue) {
                        data.fixedPumpRPM = this.getRPMfromSize(Number(data.poolSizeValue));
                        data.fixedAnnualCost = this.calculateAnnualCostByRPM(data.fixedPumpRPM);
                        data.variableAnnualCost = this.calculateAnnualCostByRPM(data.variablePumpRPM);
                        this.render();
                    }
                })
                .on("slider-value-change", (props) => {
                    if (props.id === data.poolSizeElementId) {
                        this.setData({
                            poolSizeValue: props.value
                        });
                        this.changeImageSize(props.value);
                        this.renderSliderValue(props.id, props.value * 1000);
                    } else if (props.id === data.variablePumpRPMElementId) {
                        const variablePumpRPM = data.fixedPumpRPMValues[ props.value ] ? data.fixedPumpRPMValues[ props.value ].RPMSpeed : null;

                        this.setData({
                            variablePumpRPMValue: props.value,
                            variablePumpRPM
                        });
                    }
                })
                .on("checkbox-value-change", (props) => {
                    this.setData({
                        additionalFeaturesChecked: props.value
                    });
                })
                .on("dropdown-value-change", (props) => {
                    switch (props.id) {
                        case "state":
                            this.setData({
                                stateValue: props.value
                            });
                            break;
                        case "months":
                            this.setData({
                                monthValue: props.value
                            });
                            break;
                        default:
                            this.setData({
                                stateValue: null,
                                monthValue: 0
                            });
                    }
                });
        },
        render () {
            const fixedAnnualCostTarget = this.getRenderTargetById("fixed-annual-cost");
            const fixedPumpRPMElement = this.getRenderTargetById("fixed-pump-rpm");
            const variablePumpRPMElement = this.getRenderTargetById("variable-pump-rpm");
            const variableAnnualCostTarget = this.getRenderTargetById("variable-cost");
            const variableSavingsTarget = this.getRenderTargetById("variable-savings");

            fixedPumpRPMElement.innerText = this.formatNumberWithComma(data.fixedPumpRPM);
            fixedAnnualCostTarget.innerText = this.formatDollar(Math.round(data.fixedAnnualCost));
            variablePumpRPMElement.innerText = this.formatNumberWithComma(data.variablePumpRPM);
            variableAnnualCostTarget.innerText = this.formatDollar(Math.round(data.variableAnnualCost));
            variableSavingsTarget.innerText = this.formatDollar(Math.max(0, data.fixedAnnualCost - data.variableAnnualCost));
        },
        setData (props) {
            Object.keys(props).forEach((key) => {
                data[ key ] = props[ key ];
            });
            events.emit("app-update", props);
        },
        setInitialValues () {
            events.emit("slider-value-change", {
                value: data.poolSizeValue,
                id: data.poolSizeElementId
            });
            events.emit("slider-value-change", {
                value: data.variablePumpRPMValue,
                id: data.variablePumpRPMElementId
            });
        },
        initializeDropDowns () {
            const stateDropdown = this.getFormElementById("state");
            const monthDropdown = this.getFormElementById("months");

            data.stateData.forEach((item) => {
                const optionElement = document.createElement("option");

                optionElement.value = item.KWPH.value;
                optionElement.innerText = item.state;
                stateDropdown.append(optionElement);
            });

            for (let i = 0; i < 12; i++) {
                const index = i + 1;
                const optionElement = document.createElement("option");

                optionElement.value = index;
                optionElement.innerText = index;
                monthDropdown.append(optionElement);
            }
        },
        renderSliderValue (id, value) {
            const target = this.getRenderTargetById(id);

            target.innerHTML = this.formatNumberWithComma(value);
        },
        changeImageSize (value) {
            // using value 300 for smoother scaling
            this.poolImageElement.style.transform = `scale(${0.8 + (value / 300)})`;
        },
        getFormElementById (id) {
            return this.formElements.find((item) => item.dataset.formElement === id);
        },
        getRenderTargetById (id) {
            return this.renderTargets.find(((item) => item.dataset.renderTarget === id));
        },
        formatNumberWithComma (num) {
            return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        },
        formatDollar (monetaryValue) {
            return Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumSignificantDigits: 4 }).format(monetaryValue);
        },
        getDataByRPM (rpm) {
            return data.fixedPumpRPMValues.find((item) => item.RPMSpeed === rpm);
        },
        getRPMfromSize (poolSize) {
            let rpm = 0;

            if (poolSize <= 19) {
                rpm = data.additionalFeaturesChecked ? 2400 : 1500;
            } else if (poolSize > 19 && poolSize <= 29) {
                rpm = data.additionalFeaturesChecked ? 3100 : 2400;
            } else if (poolSize > 29) {
                rpm = 3100;
            } else {
                rpm = 1500;
            }
            return rpm;
        },
        calculateAnnualCostByRPM (rpmValue) {
            const rpmData = this.getDataByRPM(rpmValue);

            return data.fixedValuePumpSize * data.stateValue * (data.monthValue * 720) * rpmData.affinityLawValue;
        }
    };

    return calculator;
};

export default flowVis;