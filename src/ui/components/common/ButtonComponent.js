import { Component } from "../base/Component.js";

export class ButtonComponent extends Component {
  constructor(options = {}) {
    super();
    this.options = {
      text: "Button",
      variant: "primary", // primary, secondary, danger, success, warning
      size: "medium", // small, medium, large
      disabled: false,
      loading: false,
      type: "button",
      onClick: null,
      ...options,
    };

    this._isCreatingElement = false;
    this._buttonElement = null;

    this.createElement();
    this.render();
    this.setupEventListeners();
  }

  createElement() {
    // جلوگیری از حلقه بی‌نهایت
    if (this._isCreatingElement) {
      return;
    }

    this._isCreatingElement = true;

    try {
      this.element = document.createElement("div");
      this.element.className = "button-component";
    } finally {
      this._isCreatingElement = false;
    }
  }

  render() {
    if (!this.element) {
      this.createElement();
    }

    const loadingClass = this.options.loading ? "button--loading" : "";
    const disabledClass = this.options.disabled ? "button--disabled" : "";

    this.element.innerHTML = `
      <button
        class="button button--${this.options.variant} button--${
      this.options.size
    } ${loadingClass} ${disabledClass}"
        type="${this.options.type}"
        ${this.options.disabled ? "disabled" : ""}
      >
        ${this.options.loading ? this._createLoadingSpinner() : ""}
        <span class="button-text">${this.options.text}</span>
      </button>
    `;

    this._buttonElement = this.element.querySelector(".button");
  }

  _createLoadingSpinner() {
    return `
      <span class="button-spinner">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16a7.5 7.5 0 0 0 7.5-7.5A7.5 7.5 0 0 0 8 1a7.5 7.5 0 0 0-7.5 7.5A7.5 7.5 0 0 0 8 16zm0-2a5.5 5.5 0 0 1-5.5-5.5A5.5 5.5 0 0 1 8 3a5.5 5.5 0 0 1 5.5 5.5A5.5 5.5 0 0 1 8 14z"/>
        </svg>
      </span>
    `;
  }

  setupEventListeners() {
    if (!this._buttonElement) return;

    this._buttonElement.addEventListener("click", (e) => {
      if (this.options.disabled || this.options.loading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (this.options.onClick) {
        this.options.onClick();
      }

      this.emit("click");
    });

    // Keyboard accessibility
    this._buttonElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (this.options.disabled || this.options.loading) {
          e.preventDefault();
          return;
        }

        if (this.options.onClick) {
          this.options.onClick();
        }

        this.emit("click");

        if (e.key === " ") {
          e.preventDefault(); // Prevent page scroll
        }
      }
    });
  }

  // Public methods
  setText(text) {
    this.options.text = text;
    const textElement = this._buttonElement?.querySelector(".button-text");
    if (textElement) {
      textElement.textContent = text;
    }
  }

  setVariant(variant) {
    this.options.variant = variant;
    this._updateButtonClasses();
  }

  setSize(size) {
    this.options.size = size;
    this._updateButtonClasses();
  }

  setDisabled(disabled) {
    this.options.disabled = disabled;

    if (this._buttonElement) {
      if (disabled) {
        this._buttonElement.disabled = true;
        this._buttonElement.classList.add("button--disabled");
      } else {
        this._buttonElement.disabled = false;
        this._buttonElement.classList.remove("button--disabled");
      }
    }
  }

  setLoading(loading) {
    this.options.loading = loading;

    if (this._buttonElement) {
      if (loading) {
        this._buttonElement.classList.add("button--loading");
        this._buttonElement.disabled = true;

        // Add spinner if not already present
        if (!this._buttonElement.querySelector(".button-spinner")) {
          this._buttonElement.insertAdjacentHTML(
            "afterbegin",
            this._createLoadingSpinner()
          );
        }
      } else {
        this._buttonElement.classList.remove("button--loading");
        this._buttonElement.disabled = this.options.disabled;

        // Remove spinner
        const spinner = this._buttonElement.querySelector(".button-spinner");
        if (spinner) {
          spinner.remove();
        }
      }
    }
  }

  setType(type) {
    this.options.type = type;
    if (this._buttonElement) {
      this._buttonElement.type = type;
    }
  }

  focus() {
    if (this._buttonElement) {
      this._buttonElement.focus();
    }
  }

  blur() {
    if (this._buttonElement) {
      this._buttonElement.blur();
    }
  }

  click() {
    if (
      this._buttonElement &&
      !this.options.disabled &&
      !this.options.loading
    ) {
      this._buttonElement.click();
    }
  }

  // Private methods
  _updateButtonClasses() {
    if (!this._buttonElement) return;

    // Remove existing variant and size classes
    const classesToRemove = [
      "button--primary",
      "button--secondary",
      "button--danger",
      "button--success",
      "button--warning",
      "button--small",
      "button--medium",
      "button--large",
    ];

    this._buttonElement.classList.remove(...classesToRemove);

    // Add new classes
    this._buttonElement.classList.add(`button--${this.options.variant}`);
    this._buttonElement.classList.add(`button--${this.options.size}`);
  }

  // Utility methods
  isLoading() {
    return this.options.loading;
  }

  isDisabled() {
    return this.options.disabled;
  }

  getText() {
    return this.options.text;
  }

  getVariant() {
    return this.options.variant;
  }

  destroy() {
    if (this._buttonElement) {
      // Remove all event listeners
      this._buttonElement.replaceWith(this._buttonElement.cloneNode(true));
      this._buttonElement = null;
    }

    super.destroy();
  }
}
