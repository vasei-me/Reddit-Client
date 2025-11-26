// src/ui/components/common/LoadingSpinner.js (اصلاح شده)
import { Component } from "../base/Component.js";

export class LoadingSpinner extends Component {
  constructor(options = {}) {
    super();
    this.options = {
      size: "medium", // small, medium, large
      text: "",
      ...options,
    };

    this._isCreatingElement = false;

    this.createElement();
    this.render();
  }

  createElement() {
    if (this._isCreatingElement) {
      return;
    }

    this._isCreatingElement = true;

    try {
      this.element = document.createElement("div");
      this.element.className = "loading-spinner";
    } finally {
      this._isCreatingElement = false;
    }
  }

  render() {
    if (!this.element) {
      this.createElement();
    }

    this.element.innerHTML = `
      <div class="spinner-container spinner--${this.options.size}">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
        ${
          this.options.text
            ? `<span class="spinner-text">${this.options.text}</span>`
            : ""
        }
      </div>
    `;
  }

  setText(text) {
    this.options.text = text;
    this.render();
  }

  setSize(size) {
    this.options.size = size;
    this.render();
  }

  show() {
    this.element.style.display = "block";
  }

  hide() {
    this.element.style.display = "none";
  }

  destroy() {
    super.destroy();
  }
}
