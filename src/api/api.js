import controller from "../core/controller";

/**
 * @example
 * controller.on("navbar", (el) => {
 *   navbar.init();
 * });
 */

const api = () => {
    controller.on("navigation", (el) => {
        const megaMenu = document.querySelector(".H2F__mega-menu-wrapper");
        const dropdown = document.querySelector("#products-dropdown");
        const navItems = el.find("#h2-navigation .nav-item");
        const bindNavEvents = (item) => {
            item.addEventListener("mouseenter", handleNavItemInteraction);
        };
        const handleMainMenuInteraction = (e) => {
            console.log(e);
            e.stopPropagation();
            //megaMenu.classList.remove("active");
        };
        const handleNavItemInteraction = (e) => {
            const navItem = e.currentTarget;

            if (!navItem.classList.contains("active")) {
                navItem.classList.add("active");
                megaMenu.classList.add("active");
                dropdown.classList.add("active");
            }
        };

        navItems.forEach((item) => {
            bindNavEvents(item);
        });
        dropdown.addEventListener("mouseout", handleMainMenuInteraction);
    });
};

export default api;