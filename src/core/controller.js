import PubSub from "./pubsub";
import dom from "../modules/dom";

const events = new PubSub();

/**
 * Bind events to active DOM elements
 * through publish / subscribe
 */
class Controller {
    constructor () {
        this.topics = {};
        this.on = events.on;
        this.emit = events.emit;
    }

    /**
     * Tests whether the node is active in the DOM
     * @param  {String} query query selector
     * @returns {HTMLElement}       DOM Node
     */
    elementIsActive (query) {
        const el = dom(query);

        if (!el) {
            return false;
        }
        return el;
    }

    /**
     * emit event when the DOM element is active
     * @param {Array} array list of nodes
     */
    watch (array) {
        array.forEach((event) => {
            const el = this.elementIsActive(event.el);

            if (el) {
                this.emit(event.name, el);
            }
        });
    }
}

const instance = new Controller();

export default instance;