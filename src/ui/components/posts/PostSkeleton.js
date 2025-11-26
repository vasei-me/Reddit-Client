import { Component } from "../base/Component.js";

export class PostSkeleton extends Component {
  constructor(count = 1) {
    super();
    this.count = count;
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = this.createElement("div", "post-skeleton-list");
  }

  render() {
    this.element.innerHTML = "";

    for (let i = 0; i < this.count; i++) {
      const skeleton = this.createElement("div", "post-skeleton");
      skeleton.innerHTML = `
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-line--short"></div>
          <div class="skeleton-line skeleton-line--very-short"></div>
        </div>
        <div class="skeleton-title">
          <div class="skeleton-line skeleton-line--medium"></div>
          <div class="skeleton-line skeleton-line--long"></div>
        </div>
        <div class="skeleton-thumbnail">
          <div class="skeleton-image"></div>
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
      `;
      this.element.appendChild(skeleton);
    }
  }

  setCount(count) {
    this.count = count;
    this.render();
  }

  show() {
    this.element.style.display = "block";
  }

  hide() {
    this.element.style.display = "none";
  }
}
