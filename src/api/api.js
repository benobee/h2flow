import controller from "../core/controller";
import nav from "../modules/nav";
import flowVis from "../modules/flowVis";
import axios from "axios";

/**
 * @example
 * controller.on("navbar", (el) => {
 *   navbar.init();
 * });
 */

const api = () => {
    controller.on("navigation", (el) => {
        const instance = nav(el);

        instance.mainNav.init();
    });

    controller.on("flowvis-calculator-page", (el) => {
        axios.all([
            axios.get("/assets/statesData.json"),
            axios.get("/assets/rpmData.json")
        ])
        .then(axios.spread((statesResponse, rpmResponse) => {
            const instance = flowVis(el, statesResponse.data, rpmResponse.data);

            instance.init();
        }))
        .catch((err) => {
            console.error(err);
        });
    });
};

export default api;