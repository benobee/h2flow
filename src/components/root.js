import "./root.less";
import { Component, ComponentLiteral } from "component-literal";

const main = () => {
    const list = new ComponentLiteral({
        data: {
            items: [
                0, 1, 2
            ]
        },
        html () {
            return (
                Component`
                    <ul class="list-component">
                        ${this.data.items.map((item, index) => {
                        return (
                            `<li>${index}</li>`
                        );
                    })}
                    </ul>`
            );
        }
    }).render("#main");

    return list;
};

export default main;