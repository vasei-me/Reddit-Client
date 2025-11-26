import { Component } from "../base/Component.js";

export class ModalComponent extends Component {
  constructor({
    title = "",
    content = "",
    showCloseButton = true,
    closeOnBackdrop = true,
    size = "medium",
  } = {}) {
    super();
    this.config = { title, content, showCloseButton, closeOnBackdrop, size };
    this.isOpen = false;
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = this.createElement("div", "modal");
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-container modal-container--${this.config.size}">
        <div class="modal-header">
          <h3 class="modal-title">${this.config.title}</h3>
          ${
            this.config.showCloseButton
              ? '<button class="modal-close-btn">&times;</button>'
              : ""
          }
        </div>
        <div class="modal-content">${this.config.content}</div>
      </div>
    `;

    this.attachEvents();

    // Initially hidden
    this.element.style.display = "none";
  }

  attachEvents() {
    const backdrop = this.element.querySelector(".modal-backdrop");
    const closeBtn = this.element.querySelector(".modal-close-btn");

    if (backdrop && this.config.closeOnBackdrop) {
      backdrop.onclick = () => this.close();
    }

    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    // Close on Escape key
    document.addEventListener("keydown", this.handleEscapeKey.bind(this));
  }

  handleEscapeKey(e) {
    if (e.key === "Escape" && this.isOpen) {
      this.close();
    }
  }

  // Public methods
  open() {
    this.element.style.display = "block";
    this.isOpen = true;
    this.emit("open");

    // Add to body if not already there
    if (!document.body.contains(this.element)) {
      document.body.appendChild(this.element);
    }
  }

  close() {
    this.element.style.display = "none";
    this.isOpen = false;
    this.emit("close");
  }

  setTitle(title) {
    this.config.title = title;
    const titleEl = this.element.querySelector(".modal-title");
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  setContent(content) {
    this.config.content = content;
    const contentEl = this.element.querySelector(".modal-content");
    if (contentEl) {
      contentEl.innerHTML = content;
    }
  }

  setSize(size) {
    this.config.size = size;
    const container = this.element.querySelector(".modal-container");
    if (container) {
      container.className = `modal-container modal-container--${size}`;
    }
  }

  destroy() {
    document.removeEventListener("keydown", this.handleEscapeKey.bind(this));
    super.destroy();
  }
}
