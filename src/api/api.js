import controller from "../core/controller";
import nav from "../modules/nav";

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
        instance.dropdown.init();
    });
};

export default api;