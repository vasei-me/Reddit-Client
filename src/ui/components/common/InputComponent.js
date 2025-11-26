import { Component } from "../base/Component.js";

export class InputComponent extends Component {
  constructor(options = {}) {
    super();
    this.options = {
      type: "text",
      placeholder: "",
      value: "",
      disabled: false,
      maxLength: null,
      onInput: null,
      onChange: null,
      onFocus: null,
      onBlur: null,
      onEnter: null,
      ...options,
    };

    this._isCreatingElement = false;
    this._inputElement = null;

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
      this.element.className = "input-component";
    } finally {
      this._isCreatingElement = false;
    }
  }

  render() {
    if (!this.element) {
      this.createElement();
    }

    this.element.innerHTML = `
      <input
        class="input-field"
        type="${this.options.type}"
        placeholder="${this.options.placeholder}"
        value="${this.options.value}"
        ${this.options.disabled ? "disabled" : ""}
        ${this.options.maxLength ? `maxlength="${this.options.maxLength}"` : ""}
      />
    `;

    this._inputElement = this.element.querySelector(".input-field");
  }

  setupEventListeners() {
    if (!this._inputElement) return;

    // Input event
    this._inputElement.addEventListener("input", (e) => {
      const value = e.target.value;

      if (this.options.onInput) {
        this.options.onInput(value);
      }

      this.emit("input", value);
    });

    // Change event
    this._inputElement.addEventListener("change", (e) => {
      const value = e.target.value;

      if (this.options.onChange) {
        this.options.onChange(value);
      }

      this.emit("change", value);
    });

    // Focus event
    this._inputElement.addEventListener("focus", (e) => {
      if (this.options.onFocus) {
        this.options.onFocus(e.target.value);
      }

      this.emit("focus", e.target.value);
    });

    // Blur event
    this._inputElement.addEventListener("blur", (e) => {
      if (this.options.onBlur) {
        this.options.onBlur(e.target.value);
      }

      this.emit("blur", e.target.value);
    });

    // Enter key event
    this._inputElement.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (this.options.onEnter) {
          this.options.onEnter(e.target.value);
        }

        this.emit("enter", e.target.value);
      }
    });
  }

  // Public methods
  getValue() {
    return this._inputElement ? this._inputElement.value : "";
  }

  setValue(value) {
    if (this._inputElement) {
      this._inputElement.value = value;

      // Trigger input event manually
      const inputEvent = new Event("input", { bubbles: true });
      this._inputElement.dispatchEvent(inputEvent);
    }
  }

  focus() {
    if (this._inputElement) {
      this._inputElement.focus();
    }
  }

  blur() {
    if (this._inputElement) {
      this._inputElement.blur();
    }
  }

  setDisabled(disabled) {
    if (this._inputElement) {
      this._inputElement.disabled = disabled;
    }
    this.options.disabled = disabled;
  }

  setPlaceholder(placeholder) {
    if (this._inputElement) {
      this._inputElement.placeholder = placeholder;
    }
    this.options.placeholder = placeholder;
  }

  setType(type) {
    if (this._inputElement) {
      this._inputElement.type = type;
    }
    this.options.type = type;
  }

  setMaxLength(maxLength) {
    if (this._inputElement) {
      this._inputElement.maxLength = maxLength;
    }
    this.options.maxLength = maxLength;
  }

  clear() {
    this.setValue("");
  }

  isValid() {
    if (!this._inputElement) return false;

    const value = this._inputElement.value.trim();

    if (this._inputElement.required && !value) {
      return false;
    }

    if (this._inputElement.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    }

    return true;
  }

  // Validation methods
  showValidation(valid, message = "") {
    this.element.classList.remove("valid", "invalid");

    if (valid) {
      this.element.classList.add("valid");
    } else {
      this.element.classList.add("invalid");
    }

    // Show validation message if provided
    if (message) {
      this.showValidationMessage(message, valid);
    }
  }

  showValidationMessage(message, isSuccess = false) {
    // Remove existing message
    const existingMessage = this.element.querySelector(".validation-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Add new message
    const messageElement = document.createElement("div");
    messageElement.className = `validation-message ${
      isSuccess ? "success" : "error"
    }`;
    messageElement.textContent = message;

    this.element.appendChild(messageElement);
  }

  clearValidation() {
    this.element.classList.remove("valid", "invalid");

    const existingMessage = this.element.querySelector(".validation-message");
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  destroy() {
    if (this._inputElement) {
      // Remove all event listeners
      this._inputElement.replaceWith(this._inputElement.cloneNode(true));
      this._inputElement = null;
    }

    super.destroy();
  }
}
