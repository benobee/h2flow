import PubSub from "../core/pubsub";
import { toArray, loadAllImages } from "../common/util";

const flowVis = (el, stateData, fixedPumpRPMValues) => {
    fixedPumpRPMValues = fixedPumpRPMValues.reverse().map((item, index) => {
        item.index = index;
        return item;
    });
    const FIXED_VALUE_PUMP_SIZE = 2.2;
    const RUN_HOURS_PER_MONTH = 720;
    const VARIABLE_PUMP_ELEMENT_ID = "variable-pump-rpm";
    const POOL_SIZE_ELEMENT_ID = "pool-size";
    const ADDITIONAL_FEATURES = "additional-features";
    const STATE_DROPDOWN = "state";
    const MONTH_DROPDOWN = "months";
    const appState = {
        poolSizeValue: 15,
        additionalFeaturesChecked: false,
        stateValue: null,
        monthValue: null,
        fixedPumpRPM: 1500,
        variablePumpRPM: 2500,
        variablePumpRPMValue: 14,
        computed: null
    };
    const events = new PubSub();
    const STATE_CHANGE_EVENT = "state-change";
    const UI_INTERACTION_EVENT = "ui-interaction-event";
    const calculator = {
        init () {
            this.el = el[ 0 ];
            this.cacheDOM();
            this.registerListeners();
            this.bindEvents();
            this.injectContentToBanner();
            this.initializeDropDowns();
            this.setInitialValues();
        },
        cacheDOM () {
            this.formElements = toArray(this.el.querySelectorAll("[data-form-element]"));
            this.renderTargets = toArray(this.el.querySelectorAll("[data-render-target]"));
            this.poolImageElement = this.el.querySelector("img[data-image-id='5ebde14e4f31054b8693baad']").parentNode;
        },
        bindEvents () {
            this.formElements.forEach((item) => {
                if (item.classList.contains("flowvis-slider")) {
                    item.addEventListener("input", () => {
                        events.emit(UI_INTERACTION_EVENT, {
                            value: item.value,
                            id: item.dataset.formElement
                        });
                    });
                } else if (item.classList.contains("flowvis-checkbox")) {
                    item.addEventListener("change", () => {
                        events.emit(UI_INTERACTION_EVENT, {
                            value: item.checked,
                            id: item.dataset.formElement
                        });
                    });
                } else if (item.classList.contains("flowvis-ui-select")) {
                    item.addEventListener("change", () => {
                        events.emit(UI_INTERACTION_EVENT, {
                            value: item.value,
                            id: item.dataset.formElement
                        });
                    });
                }
            });
        },
        injectContentToBanner () {
            const banners = this.el.querySelectorAll(".banner-thumbnail-wrapper");

            banners.forEach((banner) => {
                const target = banner.querySelector(".desc-wrapper");
                const content = banner.querySelector(".banner-overlay-content .page-content-wrapper");

                target.append(content);
            });
            loadAllImages();
        },
        registerListeners () {
            events
                .on(UI_INTERACTION_EVENT, (props) => {
                    switch (props.id) {
                        case POOL_SIZE_ELEMENT_ID:
                            this.setAppState({
                                poolSizeValue: Number(props.value),
                            });
                            this.changeImageSize(props.value);
                            this.renderSliderValue(props.id, props.value * 1000);
                            this.setSuggestedVariableRPM();
                            break;
                        case VARIABLE_PUMP_ELEMENT_ID:
                            this.setAppState({
                                variablePumpRPMValue: props.value,
                                variablePumpRPM: this.getDataByIndex(props.value) ?
                                this.getDataByIndex(props.value).RPMSpeed :
                                null
                            });
                            break;
                        case ADDITIONAL_FEATURES:
                            this.setAppState({
                                additionalFeaturesChecked: props.value,
                                id: ADDITIONAL_FEATURES
                            });
                            this.setSuggestedVariableRPM();
                            break;
                        case STATE_DROPDOWN:
                            this.setAppState({
                                stateValue: Number(props.value)
                            });
                            break;
                        case MONTH_DROPDOWN:
                            this.setAppState({
                                monthValue: Number(props.value)
                            });
                            break;
                    }
                })
                .on(STATE_CHANGE_EVENT, () => {
                    const DOMrenderHelper = (target, value) => {
                        const shouldRender = value && appState.monthValue && appState.stateValue;
                        const elementValue = shouldRender ? value : "----";
                        const currentValue = target.innerText;

                        if (elementValue !== currentValue) {
                            target.innerText = value;
                        }
                    };

                    this.renderTargets.forEach((target) => {
                        switch (target.dataset.renderTarget) {
                            case "fixed-annual-cost":
                                DOMrenderHelper(target, this.formatDollar(appState.computed.fixedAnnualCost));
                                break;
                            case "fixed-pump-rpm":
                                DOMrenderHelper(target, this.formatNumberWithComma(appState.computed.fixedPumpRPM));
                                break;
                            case "variable-pump-rpm":
                                DOMrenderHelper(target, this.formatNumberWithComma(appState.variablePumpRPM));
                                break;
                            case "variable-cost":
                                DOMrenderHelper(target, this.formatDollar(appState.computed.variableAnnualCost));
                                break;
                            case "variable-savings":
                                DOMrenderHelper(target, this.formatDollar(Math.max(0, appState.computed.fixedAnnualCost - appState.computed.variableAnnualCost)));
                                break;
                        }
                    });
                });
        },
        setAppState (props) {
            Object.keys(props).forEach((key) => {
                appState[ key ] = props[ key ];
            });
            appState.computed = this.getComputedValues();
            events.emit(STATE_CHANGE_EVENT, props);
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
            events.emit(UI_INTERACTION_EVENT, {
                value: appState.poolSizeValue,
                id: POOL_SIZE_ELEMENT_ID
            });
            events.emit(UI_INTERACTION_EVENT, {
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
        setSuggestedVariableRPM () {
            const fixedPumpRPM = this.getRPMfromSize(Number(appState.poolSizeValue));
            const pumpData = this.getDataByRPM(fixedPumpRPM);
            const targetIndex = pumpData.index - 2;

            this.setSliderValue(VARIABLE_PUMP_ELEMENT_ID, targetIndex);
            this.setAppState({
                variablePumpRPM: fixedPumpRPMValues[ targetIndex ].RPMSpeed,
                variablePumpRPMValue: targetIndex
            });
        },
        renderSliderValue (id, value) {
            const target = this.getRenderTargetById(id);

            target.innerHTML = this.formatNumberWithComma(value);
        },
        setSliderValue (id, value) {
            const target = this.getFormElementById(id);

            if (target) {
                target.value = value;
            }
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