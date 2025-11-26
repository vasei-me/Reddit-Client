// src/ui/views/BaseView.js
import { EventEmitter } from "../components/base/EventEmitter.js";

export class BaseView extends EventEmitter {
  constructor(appState) {
    super();
    this.appState = appState;
    this.element = null;
  }

  createElement() {
    // این متد باید توسط کلاس‌های فرزند override شود
    this.element = document.createElement("div");
  }

  render() {
    // این متد باید توسط کلاس‌های فرزند override شود
  }

  show() {
    if (this.element) {
      this.element.style.display = "block";
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = "none";
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.appState = null;
  }
}
