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
		keepOpen: false,
		el: el.find(".H2F__mega-menu-wrapper")[ 0 ],
		menus: util.toArray(document.querySelectorAll(".H2F__mega-menu")),
		toggleActive (index) {
			this.resetMenus();
			this.menus[ index ].classList.add("active");
		},
		transitionIn (index) {
			this.currentIndex = index;
			this.el.classList.add("active");
		},
		resetMenus () {
			this.menus.forEach((item) => {
				item.classList.remove("active");
			});
		},
		transitionOut () {
			if (this.menus[ this.currentIndex ]) {
				this.menus[ this.currentIndex ].classList.remove("active");
				this.el.classList.remove("active");
			}
		}
	};

	//main nav component
	const mainNav = {
		init () {
			this.dropdown = dropdown;
			this.cacheDOM();
			this.registerListeners();
			this.bindEvents();
			console.log(this);
		},
		cacheDOM () {
			this.upperNavItems = document.querySelectorAll("#h2-navigation-upper .nav-item");
			this.navItems = document.querySelectorAll("#h2-navigation .nav-item");
			this.search = document.querySelector("a[href=\"/#search\"]");
			this.searchBox = document.querySelector(".H2F__search-wrapper");
			this.close = document.querySelector(".H2F__search-wrapper .close");
			this.searchMask = document.querySelector(".H2F__search-mask");
			this.searchInput = document.querySelector(".H2F__search-wrapper .search-input");
		},
		registerListeners () {
			eventBus.on("nav-interact-in", (data) => {
				this.dropdown.transitionIn(data.index);
			});
			eventBus.on("nav-interact-out", () => {
				this.dropdown.transitionOut();
				this.resetNavItems(this.navItems);
			});
		},
		resetNavItems (array) {
			array.forEach((item) => {
				item.classList.remove("active");
			});
		},
		bindEvents () {
			this.navItems.forEach((item, i) => {
				// target only the first two items
				if (i === 0 || i === 1) {
					item.addEventListener("mouseenter", (e) => {
						const navItem = e.currentTarget;
						const target = navItem.querySelector("a").href.split("#")[ 1 ];
						const index = navItem.dataset.index - 1;

						if (target) {
							this.dropdown.toggleActive(index);
							this.resetNavItems(this.navItems);
							navItem.classList.add("active");
							eventBus.emit("nav-interact-in", { index });
						}
					});
				}

				item.addEventListener("mouseout", (e) => {
					if (e.toElement && !e.toElement.dataset.target) {
						eventBus.emit("nav-interact-out", e);
					}
				});
			});
			this.dropdown.el.addEventListener("mouseout", (e) => {
				if (e.toElement && !e.toElement.dataset.target) {
					eventBus.emit("nav-interact-out", e);
				}
			});
			this.search.addEventListener("click", (e) => {
				e.preventDefault();
				this.searchMask.classList.add("active");
				this.searchBox.classList.add("active");
				document.body.classList.remove("search-closed");
				this.searchInput.focus();
			});
			this.close.addEventListener("click", () => {
				this.searchBox.classList.add("transition-out");
				this.searchMask.classList.add("transition-out");
				document.body.classList.add("search-closed");
				setTimeout(() => {
					this.searchBox.classList.remove("transition-out");
					this.searchMask.classList.remove("transition-out");
					this.searchBox.classList.remove("active");
					this.searchMask.classList.remove("active");
				}, 200);
			});
		}
	};

	return {
		mainNav
	};
};

export default nav;