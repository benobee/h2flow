class Element {
    constructor (query) {
        const nodeList = document.querySelectorAll(query);

        this.nodeListToArray(nodeList);

        return this;
    }
    nodeListToArray (nodeList) {
        const nodeArray = [].slice.call(nodeList);

        this.length = nodeArray.length;
        nodeArray.forEach((item, index) => {
            this[ index ] = item;
        });
    }
    forEach (callback) {
        for (const i in this) {
            if (typeof this[ i ] === "object") {
                callback(this[ i ], i);
            }
        }
    }
    toArray () {
        const array = [];

        this.forEach((item) => {
            array.push(item);
        });

        return array;
    }
    find (query) {
        const nodeList = this[ 0 ].querySelectorAll(query);

        this.nodeListToArray(nodeList);

        return this;
    }
    on (type, callback) {
        if (this.isNodeList) {
            for (const i in this.root) {
                if ((typeof this.root[ i ] === "object") && this.root[ i ]) {
                    this.root[ i ].addEventListener(type, (e) => {
                        callback(e);
                    });
                }
            }
        } else {
            this.root.addEventListener(type, (e) => {
                callback(e);
            });
        }
    }
    toggleClass (className) {
        this.root.classList.toggle(className);

        return this;
    }
    addClass (className) {
        this.root.classList.add(className);

        return this;
    }
    removeClass (className) {
        this.root.classList.remove(className);

        return this;
    }
}

const dom = (query) => {
    const el = new Element(query);

    return el;
};

export default dom;