import { EventEmitter } from "./EventEmitter.js";

export class Component extends EventEmitter {
  constructor(element = null) {
    super();
    this.element = element;
    this.state = {};
    this.children = new Set();
    this.isMounted = false;
  }

  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };

    if (this.shouldUpdate(oldState, this.state)) {
      this.render();
      this.emit("stateChanged", { oldState, newState: this.state });
    }
  }

  shouldUpdate(oldState, newState) {
    return JSON.stringify(oldState) !== JSON.stringify(newState);
  }

  createElement(tag = "div", className = "", attributes = {}) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  render() {
    // To be implemented by child classes
    console.warn("Render method not implemented");
  }

  attachEvents() {
    // To be implemented by child classes
  }

  addChild(component) {
    if (component instanceof Component) {
      this.children.add(component);
      if (this.element && component.element) {
        this.element.appendChild(component.element);
      }
    }
  }

  removeChild(component) {
    if (this.children.has(component)) {
      component.destroy();
      this.children.delete(component);
    }
  }

  mount(container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    if (!container) {
      throw new Error("Container element not found");
    }

    if (!this.element) {
      this.render();
    }

    container.appendChild(this.element);
    this.isMounted = true;
    this.emit("mounted");
  }

  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.isMounted = false;
      this.emit("unmounted");
    }
  }

  destroy() {
    // Destroy all children
    this.children.forEach((child) => child.destroy());
    this.children.clear();

    // Unmount from DOM
    this.unmount();

    // Remove all event listeners
    this.removeAllListeners();

    // Clean up element
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  // Helper methods for common DOM operations
  show() {
    if (this.element) {
      this.element.style.display = "";
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = "none";
    }
  }

  addClass(className) {
    if (this.element) {
      this.element.classList.add(className);
    }
  }

  removeClass(className) {
    if (this.element) {
      this.element.classList.remove(className);
    }
  }

  toggleClass(className) {
    if (this.element) {
      this.element.classList.toggle(className);
    }
  }

  setAttribute(name, value) {
    if (this.element) {
      this.element.setAttribute(name, value);
    }
  }

  removeAttribute(name) {
    if (this.element) {
      this.element.removeAttribute(name);
    }
  }
}
