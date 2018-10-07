import PubSub from "../core/pubsub";

const nav = (el) => {

	// event bus
	const eventBus = new PubSub();

	// util methods
	const util = {
		toArray (nodeList) {
			return [].slice.call(nodeList);
		}
	};

	// dropdown component
	const dropdown = {
		init () {
			this.construct();
			this.listen();
		},
		listen () {
			eventBus.on("nav-interact-out", (e) => {
				console.log(e, e.toElement.className);
				if (e.toElement.className === "H2F__mega-menu-wrapper active") {
					this.keepOpen = true;
				}
				if (!this.keepOpen) {
					this.megaMenus.forEach((item) => {
						this.fadeOut(item);
					});
				}
			});
			eventBus.on("nav-interact-in", (data) => {
				const target = this.megaMenus[ data.index - 1 ];

				mainNav.megaMenu.classList.add("active");
				target.classList.add("active");
			});
		},
		fadeOut (item) {
			item.classList.add("transition-out");
			mainNav.megaMenu.classList.add("transition-out");
			setTimeout(() => {
				item.classList.remove("active");
				item.classList.remove("transition-out");
				mainNav.megaMenu.classList.remove("active");
				mainNav.megaMenu.classList.remove("transition-out");
			}, 250);
		},
		construct () {
			this.keepOpen = false;
			this.megaMenus = util.toArray(document.querySelectorAll(".H2F__mega-menu"));
		},
		convertToSelector (string) {
			return `${string}-dropdown`;
		}
	};

	//main nav component
	const mainNav = {
		init () {
			this.cacheDOM();
			this.bindEvents();
		},
		cacheDOM () {
			this.megaMenu = document.querySelector(".H2F__mega-menu-wrapper");
			this.dropdown = document.querySelector("#products-dropdown");
			this.navItems = el.find("#h2-navigation .nav-item");
		},
		bindEvents () {
			eventBus.on("reset-menu", () => {
				document.querySelector(".H2F__mega-menu-wrapper").classList.remove("active");
				this.navItems.forEach((item) => {
					item.classList.remove("active");
				});
			});
			this.navItems.forEach((item) => {
				item.addEventListener("mouseenter", (e) => {
					this.handleNavItemInteraction(e);
				});
				item.addEventListener("mouseout", (e) => {
					eventBus.emit("nav-interact-out", e);
				});
			});
			this.megaMenu.addEventListener("mouseout", (e) => {
				console.log(e.toElement.className);
				//eventBus.emit("")
			});
		},
		handleNavItemInteraction (e) {
			const navItem = e.currentTarget;
			const target = navItem.querySelector("a").href.split("#")[ 1 ];
			const index = navItem.dataset.index;

			eventBus.emit("reset-menu");
			navItem.classList.add("active");

			if (target) {
				eventBus.emit("nav-interact-in", { index });
			}
		}
	};

	return {
		dropdown,
		mainNav
	};
};

export default nav;