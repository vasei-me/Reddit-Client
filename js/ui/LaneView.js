import { PostComponent } from "./components/PostComponent.js";

// Single Responsibility: مدیریت نمایش و تعاملات یک لاین
export class LaneView {
  constructor(container, lane, onDelete, onRefresh) {
    this.container = container;
    this.lane = lane;
    this.onDelete = onDelete;
    this.onRefresh = onRefresh;
    this.postComponent = new PostComponent();
    this.element = null;

    this.render();
  }

  render() {
    this.element = document.createElement("div");
    this.element.className = "lane";
    this.element.setAttribute("data-subreddit", this.lane.name);

    this.updateElement();
    this.container.appendChild(this.element);

    this.setupEventListeners();
  }

  updateElement() {
    if (!this.element) return;

    this.element.innerHTML = `
      <div class="lane-header">
        <div class="lane-title">
          <h3>r/${this.lane.name}</h3>
          <span class="post-count">${this.lane.getPostCount()} پست</span>
        </div>
        <div class="lane-actions">
          <button class="refresh-btn" title="بروزرسانی" ${
            this.lane.isLoading ? "disabled" : ""
          }>
            ${this.lane.isLoading ? "⏳" : "🔄"}
          </button>
          <button class="delete-btn" title="حذف">❌</button>
        </div>
      </div>
      <div class="lane-content">
        ${this.renderContent()}
      </div>
    `;
  }

  renderContent() {
    if (this.lane.isLoading) {
      return `
        <div class="lane-loading">
          <div class="loading-spinner"></div>
          <p>در حال دریافت پست‌ها...</p>
        </div>
      `;
    }

    if (this.lane.getPostCount() === 0) {
      return `
        <div class="lane-empty">
          <p>هیچ پستی در این subreddit یافت نشد</p>
          <button class="retry-btn">تلاش مجدد</button>
        </div>
      `;
    }

    return `
      <div class="posts-container">
        ${this.postComponent.renderMultiple(this.lane.posts)}
      </div>
    `;
  }

  setupEventListeners() {
    if (!this.element) return;

    const deleteBtn = this.element.querySelector(".delete-btn");
    const refreshBtn = this.element.querySelector(".refresh-btn");
    const retryBtn = this.element.querySelector(".retry-btn");

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => this.handleDelete());
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.handleRefresh());
    }

    if (retryBtn) {
      retryBtn.addEventListener("click", () => this.handleRefresh());
    }

    // کلیک روی پست‌ها
    this.element.addEventListener("click", (e) => {
      const postCard = e.target.closest(".post-card");
      if (postCard) {
        this.handlePostClick(postCard.dataset.postId);
      }
    });
  }

  handleDelete() {
    if (confirm(`آیا از حذف لاین "r/${this.lane.name}" مطمئن هستید؟`)) {
      this.remove();
      this.onDelete(this.lane.name);
    }
  }

  async handleRefresh() {
    if (this.lane.isLoading) return;

    try {
      this.onRefresh(this.lane.name);
    } catch (error) {
      console.error("Error refreshing lane:", error);
    }
  }

  handlePostClick(postId) {
    const post = this.lane.posts.find((p) => p.id === postId);
    if (post) {
      window.open(`https://reddit.com${post.permalink}`, "_blank");
    }
  }

  update(lane) {
    this.lane = lane;
    this.updateElement();
  }

  setLoading(loading) {
    this.lane.setLoading(loading);
    this.updateElement();
  }

  remove() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.element = null;
  }

  getSubredditName() {
    return this.lane.name;
  }

  isVisible() {
    return this.element && this.element.parentNode;
  }

  scrollIntoView() {
    if (this.element) {
      this.element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}
