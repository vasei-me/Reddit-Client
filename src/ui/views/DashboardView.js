// ui/views/DashboardView.js
export class DashboardView {
  constructor(appState, handlers = {}) {
    this.appState = appState;
    this.handlers = handlers;
    this.element = this.createView();
  }

  createView() {
    const container = document.createElement("div");
    container.className = "app";
    container.innerHTML = this.getTemplate();
    return container;
  }

  getTemplate() {
    return `
      <div class="dashboard">
        <div class="dashboard-header">
          <h1 class="dashboard-title">🔥 Reddit Dashboard</h1>
          <p style="margin: 0; color: var(--text-muted); font-size: var(--font-size-sm);">Monitor multiple subreddits in one place</p>
        </div>
        <div class="dashboard-content">
          <div class="lanes-container" id="lanesContainer">
            ${this.getEmptyStateHTML()}
          </div>
          <div class="sidebar">
            <div class="add-lane-section">
              <h3>🚀 Add Subreddit</h3>
              <div class="input-group">
                <input 
                  type="text" 
                  id="subredditInput" 
                  placeholder="e.g. javascript" 
                  class="subreddit-input"
                  autocomplete="off"
                >
                <button onclick="redditApp.handleAddLaneFromInput()" class="add-btn">
                  Add
                </button>
              </div>
              <div class="suggested-subreddits">
                <p>📌 <strong>Popular:</strong></p>
                <div class="suggested-buttons">
                  <button class="suggested-btn quick-add-btn" data-subreddit="programming">
                    programming
                  </button>
                  <button class="suggested-btn quick-add-btn" data-subreddit="javascript">
                    javascript
                  </button>
                  <button class="suggested-btn quick-add-btn" data-subreddit="reactjs">
                    reactjs
                  </button>
                  <button class="suggested-btn quick-add-btn" data-subreddit="webdev">
                    webdev
                  </button>
                  <button class="suggested-btn quick-add-btn" data-subreddit="python">
                    python
                  </button>
                </div>
              </div>
              
              <div class="lane-controls">
                <h3>🎛️ Controls</h3>
                <label class="checkbox-control">
                  <input type="checkbox" id="darkModeToggle" onchange="redditApp.toggleDarkMode()">
                  <span>🌙 Night Mode</span>
                </label>
                <label class="checkbox-control">
                  <input type="checkbox" id="showThumbnails" onchange="redditApp.toggleThumbnails()" checked>
                  <span>🖼️ Show Images</span>
                </label>
              </div>
              
              <div class="search-section">
                <h3>🔍 Search Posts</h3>
                <input 
                  type="text" 
                  id="postSearch" 
                  placeholder="Search all posts..." 
                  class="search-input"
                  onkeyup="redditApp.searchPosts(this.value)"
                >
              </div>
              
              <div class="sort-section">
                <h3>📊 Sort Posts</h3>
                <select id="sortSelect" onchange="redditApp.setSortOrder(this.value)" class="sort-select">
                  <option value="hot">🔥 Hot</option>
                  <option value="new">✨ New</option>
                  <option value="top">👑 Top</option>
                  <option value="comments">💬 Most Comments</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <footer class="dashboard-footer">
          <p>📊 Reddit Dashboard v2.0 | Enhanced with Search, Sort & More</p>
        </footer>
      </div>
    `;
  }

  updateLanes(lanes) {
    try {
      const lanesContainer = document.getElementById("lanesContainer");
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
          <div class="lane ${isLoading ? "lane--loading" : ""} ${
          error ? "lane--error" : ""
        }" data-lane-id="${lane.id}">
            <div class="lane-header">
              <div class="lane-info">
                <h3 class="lane-title">
                  r/${this.escapeHtml(lane.subreddit)}
                  ${
                    isLoading
                      ? '<span style="display: inline-block; margin-left: 8px; width: 16px; height: 16px; border: 2px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 0.8s linear infinite;"></span>'
                      : ""
                  }
                </h3>
                <div class="lane-meta">
                  <span>📬 ${posts.length} posts</span>
                  <span class="last-updated">Last updated: ${this.formatDate(
                    lane.updatedAt
                  )}</span>
                </div>
              </div>
              <div class="lane-actions">
                <button class="button button--small button--secondary" 
                        onclick="redditApp.handleRefreshLane('${lane.id}')" 
                        title="Refresh" 
                        ${isLoading ? "disabled" : ""}>
                  🔄
                </button>
                <button class="button button--small button--danger" 
                        onclick="redditApp.handleRemoveLane('${lane.id}')"
                        title="Remove">
                  ❌
                </button>
              </div>
            </div>
            
            ${
              error
                ? `<div class="lane-error"><span class="error-icon">⚠️</span> ${this.escapeHtml(
                    error
                  )}</div>`
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
      return `<div class="no-posts">📭 No posts available</div>`;
    }

    return posts
      .map(
        (post) => `
          <div class="post" data-post-id="${
            post.id
          }" onclick="redditApp.handlePostClick(${JSON.stringify(post).replace(
          /"/g,
          "&quot;"
        )})">
            ${
              post.thumbnail && post.thumbnail.startsWith("http")
                ? `<div class="post-thumbnail"><img src="${post.thumbnail}" alt="Post preview" onerror="this.style.display='none'"></div>`
                : ""
            }
            <div class="post-content">
              <div class="post-header">
                <a href="${post.url}" target="_blank" class="post-title">
                  ${this.escapeHtml(post.title)}
                </a>
                <div class="post-badges">
                  ${
                    post.isVideo
                      ? '<span class="badge badge-video">🎬</span>'
                      : ""
                  }
                  ${
                    post.over_18
                      ? '<span class="badge badge-nsfw">⚠️</span>'
                      : ""
                  }
                </div>
              </div>
              <div class="post-meta">
                <span class="meta-item">👍 ${this.formatNumber(
                  post.score
                )}</span>
                <span class="meta-item">💬 ${this.formatNumber(
                  post.comments
                )}</span>
                <span class="meta-item">👤 u/${this.escapeHtml(
                  post.author || "unknown"
                )}</span>
                <span class="meta-item">🕐 ${this.formatDate(
                  post.created
                )}</span>
              </div>
              <div class="post-actions">
                <button class="post-action-btn" title="Favorite" onclick="event.stopPropagation(); redditApp.toggleFavorite('${
                  post.id
                }')">⭐</button>
                <button class="post-action-btn" title="Share" onclick="event.stopPropagation(); redditApp.sharePost('${
                  post.id
                }')">🔗</button>
                <button class="post-action-btn" title="Bookmark" onclick="event.stopPropagation(); redditApp.toggleBookmark('${
                  post.id
                }')">📌</button>
              </div>
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
        <h2>No Subreddits Added Yet</h2>
        <p>Add your first subreddit from the sidebar to get started!</p>
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
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatNumber(num) {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }

  formatDate(date) {
    if (!date) return "Never";
    try {
      const postDate = new Date(date);
      const now = new Date();
      const diffTime = Math.abs(now - postDate);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return "now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

      // For older posts, show full date with time
      const dateStr = postDate.toLocaleDateString();
      const timeStr = postDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${dateStr} ${timeStr}`;
    } catch (e) {
      return "unknown";
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
