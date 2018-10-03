import controller from "../core/controller";
import root from "../components/root";

/**
 * @example
 * controller.on("navbar", (el) => {
 *   navbar.init();
 * });
 */

const api = () => {
    controller.on("root", (el) => {
        root(el);
    });
};

export default api;