import { Component } from "../base/Component.js";

export class PostComponent extends Component {
  constructor(post) {
    super();
    this.post = post;
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = this.createElement("article", "post");
  }

  render() {
    const timeAgo = this.getTimeAgo(this.post.getCreatedTime());
    const scoreFormatted = this.post.formatScore();

    this.element.innerHTML = `
      <div class="post-header">
        <div class="post-meta">
          <span class="post-subreddit">r/${this.post.subreddit}</span>
          <span class="post-author">• u/${this.post.author}</span>
          <span class="post-time">• ${timeAgo}</span>
        </div>
        <div class="post-score">
          <span class="score-icon">▲</span>
          <span class="score-value">${scoreFormatted}</span>
        </div>
      </div>
      
      <h3 class="post-title">
        <a href="${this.post.getRedditUrl()}" target="_blank" rel="noopener noreferrer">
          ${this.post.title}
        </a>
      </h3>
      
      ${
        this.post.hasThumbnail()
          ? `
        <div class="post-thumbnail">
          <img src="${this.post.thumbnail}" alt="${this.post.title}" loading="lazy">
        </div>
      `
          : ""
      }
      
      <div class="post-footer">
        <div class="post-comments">
          <span class="comments-icon">💬</span>
          <span class="comments-count">${this.post.num_comments} comments</span>
        </div>
        <button class="post-external-link" title="Open in Reddit">
          🔗
        </button>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const externalLinkBtn = this.element.querySelector(".post-external-link");
    const postLink = this.element.querySelector(".post-title a");

    if (externalLinkBtn) {
      externalLinkBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(this.post.getRedditUrl(), "_blank");
      });
    }

    if (postLink) {
      postLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.emit("postClick", this.post);
        window.open(this.post.getRedditUrl(), "_blank");
      });
    }

    // Add hover effects
    this.element.addEventListener("mouseenter", () => {
      this.element.classList.add("post--hover");
    });

    this.element.addEventListener("mouseleave", () => {
      this.element.classList.remove("post--hover");
    });
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  updatePost(newPost) {
    this.post = newPost;
    this.render();
  }

  // Public methods
  highlight() {
    this.element.classList.add("post--highlighted");
    setTimeout(() => {
      this.element.classList.remove("post--highlighted");
    }, 2000);
  }

  setCompact(compact) {
    if (compact) {
      this.element.classList.add("post--compact");
    } else {
      this.element.classList.remove("post--compact");
    }
  }
}
