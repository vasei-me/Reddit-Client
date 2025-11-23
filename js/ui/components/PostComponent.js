import { Post } from "../../models/Post.js";

// Single Responsibility: رندر کردن پست‌ها
export class PostComponent {
  constructor() {
    this.template = this.createTemplate();
  }

  createTemplate() {
    return `
      <div class="post-card" data-post-id="{{id}}">
        <div class="post-header">
          <span class="post-author">u/{{author}}</span>
          <span class="post-score">👍 {{score}}</span>
        </div>
        <h4 class="post-title">{{title}}</h4>
        {{#if hasThumbnail}}
        <img class="post-thumbnail" src="{{thumbnail}}" alt="{{title}}" loading="lazy">
        {{/if}}
        <div class="post-footer">
          <span class="post-comments">💬 {{numComments}}</span>
          <span class="post-date">{{formattedDate}}</span>
          <a href="https://reddit.com{{permalink}}" target="_blank" class="post-link">مشاهده</a>
        </div>
      </div>
    `;
  }

  render(postData) {
    const post = postData instanceof Post ? postData : new Post(postData);

    if (!post.isValid()) {
      return '<div class="post-error">پست نامعتبر</div>';
    }

    return this.template
      .replace("{{id}}", post.id)
      .replace("{{author}}", this.escapeHtml(post.author))
      .replace("{{score}}", this.formatNumber(post.score))
      .replace("{{title}}", this.escapeHtml(post.title))
      .replace("{{hasThumbnail}}", post.hasThumbnail() ? "true" : "")
      .replace("{{thumbnail}}", post.thumbnail)
      .replace("{{numComments}}", this.formatNumber(post.numComments))
      .replace("{{formattedDate}}", post.getFormattedDate())
      .replace("{{permalink}}", post.permalink);
  }

  renderMultiple(posts) {
    if (!posts || posts.length === 0) {
      return '<div class="no-posts">هیچ پستی یافت نشد</div>';
    }

    return posts.map((post) => this.render(post)).join("");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  }

  createLoadingSkeleton(count = 3) {
    return Array.from(
      { length: count },
      () => `
      <div class="post-card post-skeleton">
        <div class="skeleton-header">
          <div class="skeleton-text short"></div>
          <div class="skeleton-text very-short"></div>
        </div>
        <div class="skeleton-title">
          <div class="skeleton-text medium"></div>
          <div class="skeleton-text long"></div>
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-text very-short"></div>
          <div class="skeleton-text very-short"></div>
        </div>
      </div>
    `
    ).join("");
  }
}
