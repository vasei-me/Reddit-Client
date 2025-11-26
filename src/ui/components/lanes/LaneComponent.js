import { Component } from "../base/Component.js";
import { ButtonComponent } from "../common/ButtonComponent.js";
import { LoadingSpinner } from "../common/LoadingSpinner.js";
import { PostListComponent } from "../posts/PostListComponent.js";

export class LaneComponent extends Component {
  constructor(lane, options = {}) {
    super();
    this.lane = lane;
    this.options = {
      onRefresh: null,
      onRemove: null,
      compact: false,
      ...options,
    };
    this.postListComponent = null;
    this.refreshButton = null;
    this.removeButton = null;
    this.loadingSpinner = null;
    this._isRendering = false; // Flag برای جلوگیری از رندر تکراری
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.className = "lane";
    this.element.setAttribute("data-lane-id", this.lane.id);
  }

  render() {
    // جلوگیری از رندر تکراری
    if (this._isRendering) {
      return;
    }

    this._isRendering = true;

    try {
      const isLoading = this.lane.isLoading;
      const hasError = !!this.lane.error;

      this.element.className = `lane ${isLoading ? "lane--loading" : ""} ${
        hasError ? "lane--error" : ""
      } ${this.options.compact ? "lane--compact" : ""}`;

      this.element.innerHTML = `
        <div class="lane-header">
          <div class="lane-info">
            <h3 class="lane-title">r/${this.lane.subreddit}</h3>
            <div class="lane-meta">
              <span class="post-count">${this.lane.getPostCount()} posts</span>
              ${
                this.lane.lastUpdated
                  ? `<span class="last-updated">• ${this.getTimeAgo(
                      this.lane.lastUpdated
                    )}</span>`
                  : ""
              }
              ${
                this.lane.error
                  ? `<span class="lane-error">• ${this.lane.error}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="lane-actions">
            <!-- Buttons will be added dynamically -->
          </div>
        </div>
        
        <div class="lane-content">
          <!-- Post list will be added here -->
        </div>
      `;

      this.initializeComponents();
      this.attachEvents();
    } finally {
      this._isRendering = false;
    }
  }

  initializeComponents() {
    const actionsContainer = this.element.querySelector(".lane-actions");
    const contentContainer = this.element.querySelector(".lane-content");

    // پاک کردن کامپوننت‌های قبلی
    if (this.refreshButton) {
      this.refreshButton.destroy();
    }
    if (this.removeButton) {
      this.removeButton.destroy();
    }
    if (this.postListComponent) {
      this.postListComponent.destroy();
    }
    if (this.loadingSpinner) {
      this.loadingSpinner.destroy();
    }

    // Create action buttons
    this.refreshButton = new ButtonComponent({
      text: "Refresh",
      variant: "secondary",
      size: "small",
      loading: this.lane.isLoading,
      onClick: () => this.handleRefresh(),
    });

    this.removeButton = new ButtonComponent({
      text: "Remove",
      variant: "danger",
      size: "small",
      onClick: () => this.handleRemove(),
    });

    // Create post list
    this.postListComponent = new PostListComponent(this.lane.posts, {
      showLoading: this.lane.isLoading,
      emptyMessage: this.lane.error
        ? `Failed to load posts: ${this.lane.error}`
        : "No posts available",
      compact: this.options.compact,
    });

    this.postListComponent.on("postClick", (post) => {
      this.emit("postClick", { post, lane: this.lane });
    });

    // Create loading spinner for lane-level loading
    this.loadingSpinner = new LoadingSpinner({
      size: "small",
      text: "Refreshing posts...",
    });

    // Add components to DOM
    actionsContainer.appendChild(this.refreshButton.element);
    actionsContainer.appendChild(this.removeButton.element);
    contentContainer.appendChild(this.postListComponent.element);

    if (this.lane.isLoading) {
      this.loadingSpinner.show();
      contentContainer.appendChild(this.loadingSpinner.element);
    } else {
      this.loadingSpinner.hide();
    }
  }

  attachEvents() {
    // Lane header click to expand/collapse (for future features)
    const header = this.element.querySelector(".lane-header");
    if (header) {
      header.addEventListener("click", (e) => {
        if (!e.target.closest(".lane-actions")) {
          this.emit("laneClick", this.lane);
        }
      });
    }
  }

  handleRefresh() {
    if (this.lane.isLoading) return;

    this.refreshButton.setLoading(true);
    this.loadingSpinner.show();

    if (this.options.onRefresh) {
      this.options.onRefresh(this.lane.id);
    }

    this.emit("refresh", this.lane.id);
  }

  handleRemove() {
    if (this.options.onRemove) {
      this.options.onRemove(this.lane.id);
    }

    this.emit("remove", this.lane.id);
  }

  // Public methods
  updateLane(newLane) {
    // فقط اگر داده‌ها واقعاً تغییر کرده‌اند آپدیت کن
    if (this._hasLaneChanged(this.lane, newLane)) {
      this.lane = newLane;
      this.render();
    } else {
      // فقط وضعیت loading و error را آپدیت کن بدون رندر کامل
      this._updateLaneState(newLane);
    }
  }

  // آپدیت state بدون رندر کامل
  _updateLaneState(newLane) {
    if (this.refreshButton && this.lane.isLoading !== newLane.isLoading) {
      this.refreshButton.setLoading(newLane.isLoading);
    }

    if (this.loadingSpinner) {
      if (newLane.isLoading) {
        this.loadingSpinner.show();
      } else {
        this.loadingSpinner.hide();
      }
    }

    if (this.postListComponent && !newLane.isLoading) {
      this.postListComponent.updatePosts(newLane.posts, {
        showLoading: false,
        emptyMessage: newLane.error
          ? `Failed to load posts: ${newLane.error}`
          : "No posts available",
      });
    }

    // آپدیت ظاهری خطا
    if (this.lane.error !== newLane.error) {
      if (newLane.error) {
        this.element.classList.add("lane--error");
      } else {
        this.element.classList.remove("lane--error");
      }
    }

    this.lane = newLane;
  }

  // بررسی تغییرات lane
  _hasLaneChanged(oldLane, newLane) {
    if (oldLane === newLane) return false;
    if (oldLane.subreddit !== newLane.subreddit) return true;
    if (oldLane.isLoading !== newLane.isLoading) return false; // این باعث رندر کامل نمی‌شود
    if (oldLane.error !== newLane.error) return false; // این هم باعث رندر کامل نمی‌شود

    // مقایسه پست‌ها
    if (oldLane.posts.length !== newLane.posts.length) return true;

    return !oldLane.posts.every((post, index) => {
      const newPost = newLane.posts[index];
      return post.id === newPost.id && post.title === newPost.title;
    });
  }

  setLoading(loading) {
    if (this.lane.isLoading === loading) return;

    this.lane.isLoading = loading;

    if (this.refreshButton) {
      this.refreshButton.setLoading(loading);
    }

    if (this.loadingSpinner) {
      if (loading) {
        this.loadingSpinner.show();
      } else {
        this.loadingSpinner.hide();
      }
    }

    if (this.postListComponent) {
      this.postListComponent.setLoading(loading);
    }
  }

  setCompact(compact) {
    if (this.options.compact === compact) return;

    this.options.compact = compact;
    this.element.classList.toggle("lane--compact", compact);

    if (this.postListComponent) {
      this.postListComponent.setCompact(compact);
    }
  }

  highlight() {
    this.element.classList.add("lane--highlighted");
    setTimeout(() => {
      this.element.classList.remove("lane--highlighted");
    }, 2000);
  }

  // Utility method for time display
  getTimeAgo(date) {
    if (!date) return "";

    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  // Getters
  getLaneId() {
    return this.lane.id;
  }

  getSubreddit() {
    return this.lane.subreddit;
  }

  destroy() {
    this._isRendering = true; // جلوگیری از رندر در حین نابودی

    if (this.refreshButton) this.refreshButton.destroy();
    if (this.removeButton) this.removeButton.destroy();
    if (this.postListComponent) this.postListComponent.destroy();
    if (this.loadingSpinner) this.loadingSpinner.destroy();

    super.destroy();
  }
}
