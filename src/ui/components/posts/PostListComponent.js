import { Component } from "../base/Component.js";
import { PostComponent } from "./PostComponent.js";

export class PostListComponent extends Component {
  constructor(posts = [], options = {}) {
    super();
    this.posts = posts;
    this.options = {
      showLoading: false,
      emptyMessage: "No posts available",
      compact: false,
      ...options,
    };
    this.postComponents = new Map();
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = this.createElement("div", "post-list");
  }

  render() {
    if (this.options.showLoading) {
      this.element.innerHTML = `
        <div class="post-list-loading">
          <div class="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      `;
      return;
    }

    if (this.posts.length === 0) {
      this.element.innerHTML = `
        <div class="post-list-empty">
          <p>${this.options.emptyMessage}</p>
        </div>
      `;
      return;
    }

    // Clear existing posts
    this.element.innerHTML = "";
    this.postComponents.clear();

    // Create post components
    this.posts.forEach((post) => {
      const postComponent = new PostComponent(post);

      if (this.options.compact) {
        postComponent.setCompact(true);
      }

      postComponent.on("postClick", (clickedPost) => {
        this.emit("postClick", clickedPost);
      });

      this.postComponents.set(post.id, postComponent);
      this.addChild(postComponent);
    });
  }

  updatePosts(newPosts, options = {}) {
    this.posts = newPosts;
    this.options = { ...this.options, ...options };
    this.render();
  }

  setLoading(loading) {
    this.options.showLoading = loading;
    this.render();
  }

  setEmptyMessage(message) {
    this.options.emptyMessage = message;
    if (this.posts.length === 0) {
      this.render();
    }
  }

  setCompact(compact) {
    this.options.compact = compact;
    this.postComponents.forEach((component) => {
      component.setCompact(compact);
    });
  }

  // Filter and search methods
  filterPosts(filterFn) {
    const filteredPosts = this.posts.filter(filterFn);
    this.updatePosts(filteredPosts);
  }

  searchPosts(query) {
    if (!query.trim()) {
      this.render();
      return;
    }

    const searchTerm = query.toLowerCase();
    const filteredPosts = this.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm) ||
        post.subreddit.toLowerCase().includes(searchTerm)
    );

    this.updatePosts(filteredPosts, {
      emptyMessage: `No posts found for "${query}"`,
    });
  }

  clearFilter() {
    this.render();
  }

  // Utility methods
  getPostCount() {
    return this.posts.length;
  }

  getPostById(postId) {
    return this.postComponents.get(postId);
  }

  highlightPost(postId) {
    const postComponent = this.getPostById(postId);
    if (postComponent) {
      postComponent.highlight();
    }
  }

  destroy() {
    this.postComponents.forEach((component) => component.destroy());
    this.postComponents.clear();
    super.destroy();
  }
}
