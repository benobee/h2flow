import controller from "./core/controller";
import api from "./api/api";

const App = {
    init () {
        this.api = api();
        this.registerAPIControllers();
    },

    /**
     * events are bound to the controller when
     * elements are found within the DOM.
     */
    registerAPIControllers () {
        controller.watch([{
            name: "root",
            el: "#main"
        }]);
    }
};

// on dom content load
document.addEventListener("DOMContentLoaded", () => {
    const root = document.createElement("div");

    root.id = "main";

    document.querySelector("body").appendChild(root);
    App.init();
});