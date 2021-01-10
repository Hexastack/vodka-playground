export default class Vodka extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this._vnodes = []; // Array of text nodes references
    this._vbinds = {}; // Array of binded nodes references
    this.events = {}; // {[eventName]: {[querySelector]: eventCallback}}

    this._initState();
  }

  _initState() {
    // Create state proxy to update DOM according to
    // the updated state values
    const self = this;
    self._state = {};
    self.state = new Proxy(self._state, {
      set(target, prop, value) {
        if (target[prop] !== value) {
          const oldVal = target[prop];
          target[prop] = value;
          self._updateComponent(prop, value, oldVal);
        }
        return true;
      },
      get(target, prop, receiver) {
        return Reflect.get(...arguments);
      },
    });
  }

  connectedCallback() {
    // On mount we parse the template and clone it to the shadow dom
    this.template();
    this._shadowRoot.appendChild(this._template.content.cloneNode(true));
    this._shadowRoot.querySelectorAll('vodka').forEach((node) => {
      this._vnodes.push(node);
    });
    this._bindState();
    this._updateComponent();
    this._initEventsListeners();
  }

  _updateComponent(prop, newVal, oldVal) {
    // Update binders
    if (prop in this._vbinds) {
      this._vbinds[prop].forEach((node, idx) => {
        // Update element value on state change
        node.value = newVal;
      });
    }

    // Update text nodes
    this._vnodes.forEach((node, idx) => {
      this._vnodes[idx] = document.createTextNode(
        typeof this._values[idx] === 'function'
          ? this._values[idx]()
          : this._values[idx]
      );
      node.replaceWith(this._vnodes[idx]);
    });
  }

  _bindState() {
    this._shadowRoot.querySelectorAll('[data-bind]').forEach((node) => {
      const prop = node.dataset.bind;
      if (prop) {
        // Store node reference for later updates
        this._vbinds[prop] = this._vbinds[prop] || [];
        this._vbinds[prop].push(node);
        // Update state on node value change
        switch (node.nodeName) {
          case 'INPUT':
            node.addEventListener('keypress', (e) => {
              this.state[prop] = e.target.value;
            });
            break;
        }
      } else {
        throw new Error(
          `Unable to bind element, state prop '${prop}' does not exist`
        );
      }
    });
  }

  _initEventsListeners() {
    Object.entries(this.events).forEach(([event, selectors]) => {
      Object.entries(selectors).forEach(([selector, listener]) => {
        const node = this._shadowRoot.querySelector(selector);
        if (node) {
          node.addEventListener(event, listener.bind(this));
        } else {
          throw new Error(
            `Selector '${selector}' did not return any element to attach the '${event}' event listener to.`
          );
        }
      });
    });
  }

  // _getAllEvents(element) {
  //   return Object.keys(element)
  //     .filter((key) => key.startsWith('on'))
  //     .map((key) => key.slice(2));
  // }

  html(strings, ...values) {
    this._strings = strings;
    // Bind all function values to the component object (this)
    this._values = values.map((v) =>
      typeof v === 'function' ? v.bind(this) : `${v}`
    );

    // Build template DOM with <vodka/> tags as temporary placeholders
    // <vodka/> will be used to store a reference to the node later when mounting
    this._template = document.createElement('template');
    this._template.innerHTML = this._strings.join('<vodka></vodka>');
  }

  // HELPERS

  static mount(component, target) {
    const element = document.createElement(component);
    document.querySelector(target).appendChild(element);
  }

  static define(tagname, classComponent) {
    const customElement = `v-${tagname}`;
    window.customElements.define(customElement, classComponent);
    return customElement;
  }
}
