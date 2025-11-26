// ui/views/DashboardView.js
export class DashboardView {
  constructor(appState, handlers = {}) {
    this.appState = appState;
    this.handlers = handlers;
    this.element = this.createView();
  }

  createView() {
    const container = document.createElement("div");
    container.className = "dashboard";
    container.innerHTML = this.getTemplate();
    return container;
  }

  getTemplate() {
    return `
      <div class="dashboard-header">
        <h1>Reddit Dashboard</h1>
        <p>Monitor multiple subreddits in one place</p>
      </div>
      <div class="dashboard-content">
        <div class="lanes-container">
          ${this.getEmptyStateHTML()}
        </div>
        <div class="sidebar">
          <div class="add-lane-section">
            <h3>Add Subreddit</h3>
            <div class="input-group">
              <input 
                type="text" 
                id="subredditInput" 
                placeholder="r/programming" 
                class="subreddit-input"
              >
              <button onclick="redditApp.handleAddLaneFromInput()" class="add-btn">
                Add Subreddit
              </button>
            </div>
            <div class="suggested-subreddits">
              <p><strong>Try these:</strong></p>
              <div class="suggested-buttons">
                <button class="suggested-btn quick-add-btn" data-subreddit="programming">
                  r/programming
                </button>
                <button class="suggested-btn quick-add-btn" data-subreddit="javascript">
                  r/javascript
                </button>
                <button class="suggested-btn quick-add-btn" data-subreddit="reactjs">
                  r/reactjs
                </button>
                <button class="suggested-btn quick-add-btn" data-subreddit="webdev">
                  r/webdev
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateLanes(lanes) {
    try {
      const lanesContainer = this.element.querySelector(".lanes-container");
      if (!lanesContainer) return;

      if (!lanes || lanes.length === 0) {
        lanesContainer.innerHTML = this.getEmptyStateHTML();
        return;
      }

      let lanesHTML = "";

      lanes.forEach((lane) => {
        const posts = lane.posts || [];
        const isLoading = lane.isLoading || false;
        const error = lane.error || null;

        lanesHTML += `
          <div class="lane" data-lane-id="${lane.id}">
            <div class="lane-header">
              <h3 class="lane-title">
                r/${lane.subreddit}
                ${isLoading ? '<span class="loading-spinner"></span>' : ""}
              </h3>
              <div class="lane-actions">
                <button class="btn-refresh" onclick="redditApp.handleRefreshLane('${
                  lane.id
                }')" 
                        ${isLoading ? "disabled" : ""}>
                  🔄
                </button>
                <button class="btn-remove" onclick="redditApp.handleRemoveLane('${
                  lane.id
                }')">
                  ❌
                </button>
              </div>
            </div>
            
            ${
              error
                ? `
              <div class="lane-error">
                <span class="error-icon">⚠️</span>
                ${error}
              </div>
            `
                : ""
            }
            
            <div class="posts-container">
              ${
                isLoading
                  ? this.getLoadingPostsHTML()
                  : this.renderPostsHTML(posts)
              }
            </div>
          </div>
        `;
      });

      lanesContainer.innerHTML = lanesHTML;
    } catch (error) {
      console.error("Error updating lanes:", error);
    }
  }

  renderPostsHTML(posts) {
    if (!posts || posts.length === 0) {
      return `<div class="no-posts">No posts available</div>`;
    }

    return posts
      .map(
        (post) => `
          <div class="post" data-post-id="${post.id}">
            <a href="${post.url}" target="_blank" class="post-title" 
               onclick="redditApp.handlePostClick(${JSON.stringify(
                 post
               ).replace(/"/g, "&quot;")})">
              ${this.escapeHtml(post.title)}
            </a>
            <div class="post-meta">
              <span class="post-score">👍 ${post.score || 0}</span>
              <span class="post-comments">💬 ${post.comments || 0}</span>
              <span class="post-author">by u/${post.author || "unknown"}</span>
              <span class="post-date">${this.formatDate(post.created)}</span>
            </div>
          </div>
        `
      )
      .join("");
  }

  getEmptyStateHTML() {
    return `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h2>No Subreddits Added</h2>
        <p>Add your first subreddit to get started!</p>
        <div class="suggested-subreddits">
          <p><strong>Try these popular subreddits:</strong></p>
          <div class="suggested-buttons">
            <button class="suggested-btn quick-add-btn" data-subreddit="programming">
              r/programming
            </button>
            <button class="suggested-btn quick-add-btn" data-subreddit="javascript">
              r/javascript
            </button>
            <button class="suggested-btn quick-add-btn" data-subreddit="reactjs">
              r/reactjs
            </button>
            <button class="suggested-btn quick-add-btn" data-subreddit="webdev">
              r/webdev
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getLoadingPostsHTML() {
    return `
      <div class="loading-posts">
        <div class="loading-post"></div>
        <div class="loading-post"></div>
        <div class="loading-post"></div>
      </div>
    `;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatDate(date) {
    if (!date) return "";
    const postDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return postDate.toLocaleDateString();
  }

  // متد جدید برای گرفتن مقدار input
  getSubredditInputValue() {
    const input = this.element.querySelector("#subredditInput");
    return input ? input.value.trim() : "";
  }

  // متد جدید برای پاک کردن input
  clearSubredditInput() {
    const input = this.element.querySelector("#subredditInput");
    if (input) {
      input.value = "";
    }
  }

  // متد جدید برای focus روی input
  focusSubredditInput() {
    const input = this.element.querySelector("#subredditInput");
    if (input) {
      input.focus();
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
