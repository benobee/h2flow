<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [registerAPIControllers][1]
-   [Controller][2]
    -   [elementIsActive][3]
        -   [Parameters][4]
    -   [watch][5]
        -   [Parameters][6]
-   [api][7]
    -   [Examples][8]

## registerAPIControllers

events are bound to the controller when
elements are found within the DOM.

## Controller

Bind events to active DOM elements
through publish / subscribe

### elementIsActive

Tests whether the node is active in the DOM

#### Parameters

-   `query` **[String][9]** query selector

Returns **[HTMLElement][10]** DOM Node

### watch

emit event when the DOM element is active

#### Parameters

-   `array` **[Array][11]** list of nodes

## api

### Examples

```javascript
controller.on("navbar", (el) => {
  navbar.init();
});
```

[1]: #registerapicontrollers

[2]: #controller

[3]: #elementisactive

[4]: #parameters

[5]: #watch

[6]: #parameters-1

[7]: #api

[8]: #examples

[9]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[10]: https://developer.mozilla.org/docs/Web/HTML/Element

[11]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
