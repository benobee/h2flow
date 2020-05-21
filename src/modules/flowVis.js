import PubSub from "../core/pubsub";
import { toArray } from "../common/util";

const flowVis = (el, stateData, fixedPumpRPMValues) => {
    fixedPumpRPMValues = fixedPumpRPMValues.reverse().map((item, index) => {
        item.index = index;
        return item;
    });
    const FIXED_VALUE_PUMP_SIZE = 2.2;
    const RUN_HOURS_PER_MONTH = 720;
    const VARIABLE_PUMP_ELEMENT_ID = "variable-pump-rpm";
    const POOL_SIZE_ELEMENT_ID = "pool-size";
    const appState = {
        poolSizeValue: 15,
        additionalFeaturesChecked: false,
        stateValue: null,
        monthValue: null,
        fixedPumpRPM: 1500,
        variablePumpRPM: 2500,
        variablePumpRPMValue: 14
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
                    if (appState.stateValue && appState.monthValue) {
                        this.render();
                    }
                })
                .on("slider-value-change", (props) => {
                    if (props.id === POOL_SIZE_ELEMENT_ID) {
                        const fixedPumpRPM = this.getRPMfromSize(Number(appState.poolSizeValue));
                        const pumpData = this.getDataByRPM(fixedPumpRPM);
                        const targetIndex = pumpData.index - 4;

                        this.setAppState({
                            poolSizeValue: props.value,
                            variablePumpRPM: fixedPumpRPMValues[ targetIndex ].RPMSpeed,
                            variablePumpRPMValue: targetIndex
                        });
                        this.changeImageSize(props.value);
                        this.renderSliderValue(props.id, props.value * 1000);
                        this.setSliderValue(VARIABLE_PUMP_ELEMENT_ID, targetIndex);
                    } else if (props.id === VARIABLE_PUMP_ELEMENT_ID) {
                        const variablePumpRPM = this.getDataByIndex(props.value) ?
                            this.getDataByIndex(props.value).RPMSpeed :
                            null;

                        this.setAppState({
                            variablePumpRPMValue: props.value,
                            variablePumpRPM
                        });
                    }
                })
                .on("checkbox-value-change", (props) => {
                    this.setAppState({
                        additionalFeaturesChecked: props.value
                    });
                })
                .on("dropdown-value-change", (props) => {
                    switch (props.id) {
                        case "state":
                            this.setAppState({
                                stateValue: props.value
                            });
                            break;
                        case "months":
                            this.setAppState({
                                monthValue: props.value
                            });
                            break;
                        default:
                            this.setAppState({
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
            const computedValues = this.getComputedValues();

            fixedPumpRPMElement.innerText = this.formatNumberWithComma(computedValues.fixedPumpRPM);
            fixedAnnualCostTarget.innerText = this.formatDollar(computedValues.fixedAnnualCost);
            variablePumpRPMElement.innerText = this.formatNumberWithComma(appState.variablePumpRPM);
            variableAnnualCostTarget.innerText = this.formatDollar(computedValues.variableAnnualCost);
            variableSavingsTarget.innerText = this.formatDollar(Math.max(0, computedValues.fixedAnnualCost - computedValues.variableAnnualCost));
        },
        setAppState (props) {
            Object.keys(props).forEach((key) => {
                appState[ key ] = props[ key ];
            });
            events.emit("app-update", props);
        },
        getComputedValues () {
            if (appState.variablePumpRPM) {
                const fixedPumpRPM = this.getRPMfromSize(Number(appState.poolSizeValue));

                return {
                    fixedAnnualCost: this.calculateAnnualCostByRPM(fixedPumpRPM),
                    variableAnnualCost: this.calculateAnnualCostByRPM(appState.variablePumpRPM),
                    fixedPumpRPM
                };
            }
        },
        setInitialValues () {
            events.emit("slider-value-change", {
                value: appState.poolSizeValue,
                id: POOL_SIZE_ELEMENT_ID
            });
            events.emit("slider-value-change", {
                value: appState.variablePumpRPMValue,
                id: VARIABLE_PUMP_ELEMENT_ID
            });
        },
        initializeDropDowns () {
            const stateDropdown = this.getFormElementById("state");
            const monthDropdown = this.getFormElementById("months");

            stateData.forEach((item) => {
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
        setSliderValue (id, value) {
            this.getFormElementById(id).value = value;
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
            return Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Math.round(monetaryValue));
        },
        getDataByRPM (rpm) {
            return fixedPumpRPMValues.find((item) => item.RPMSpeed === rpm);
        },
        getDataByIndex (index) {
            return fixedPumpRPMValues[ index ];
        },
        getRPMfromSize (poolSize) {
            let rpm = 0;

            if (poolSize <= 19) {
                rpm = appState.additionalFeaturesChecked ? 2400 : 1500;
            } else if (poolSize > 19 && poolSize <= 29) {
                rpm = appState.additionalFeaturesChecked ? 3100 : 2400;
            } else if (poolSize > 29) {
                rpm = 3100;
            } else {
                rpm = 1500;
            }
            return rpm;
        },
        calculateAnnualCostByRPM (rpmValue) {
            const rpmData = this.getDataByRPM(rpmValue);

            return FIXED_VALUE_PUMP_SIZE * appState.stateValue * (appState.monthValue * RUN_HOURS_PER_MONTH) * rpmData.affinityLawValue;
        }
    };

    return calculator;
};

export default flowVis;