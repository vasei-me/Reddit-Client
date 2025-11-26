import { Observable } from "../components/base/Observable.js";

export class LaneState {
  constructor(laneId, subreddit) {
    this.laneId = laneId;
    this.subreddit = subreddit;

    this.posts = new Observable([]);
    this.loading = new Observable(false);
    this.error = new Observable(null);
    this.lastUpdated = new Observable(null);
    this.isExpanded = new Observable(true);
  }

  // Posts management - با مقایسه برای جلوگیری از آپدیت بی‌جهت
  setPosts(posts) {
    // مقایسه عمیق برای جلوگیری از آپدیت‌های تکراری
    if (this._arePostsEqual(this.posts.value, posts)) {
      return;
    }

    this.posts.value = posts;
    this.lastUpdated.value = new Date();
    this.error.value = null;
  }

  addPost(post) {
    const currentPosts = this.posts.value;
    if (!currentPosts.find((p) => p.id === post.id)) {
      this.posts.value = [...currentPosts, post];
    }
  }

  clearPosts() {
    if (this.posts.value.length > 0) {
      this.posts.value = [];
    }
  }

  // Loading state
  setLoading(loading) {
    if (this.loading.value === loading) {
      return;
    }

    this.loading.value = loading;
    if (loading) {
      this.error.value = null;
    }
  }

  // Error state
  setError(error) {
    if (this.error.value === error) {
      return;
    }

    this.error.value = error;
    this.loading.value = false;
  }

  clearError() {
    if (this.error.value !== null) {
      this.error.value = null;
    }
  }

  // UI state
  toggleExpanded() {
    this.isExpanded.value = !this.isExpanded.value;
  }

  setExpanded(expanded) {
    if (this.isExpanded.value !== expanded) {
      this.isExpanded.value = expanded;
    }
  }

  // Utility methods
  getPostCount() {
    return this.posts.value.length;
  }

  hasPosts() {
    return this.posts.value.length > 0;
  }

  isLoading() {
    return this.loading.value;
  }

  hasError() {
    return this.error.value !== null;
  }

  getLastUpdateTime() {
    return this.lastUpdated.value;
  }

  getTimeSinceLastUpdate() {
    if (!this.lastUpdated.value) return null;

    const now = new Date();
    const diff = now - this.lastUpdated.value;
    return Math.floor(diff / 60000); // minutes
  }

  // تابع کمکی برای مقایسه عمیق پست‌ها
  _arePostsEqual(oldPosts, newPosts) {
    if (oldPosts === newPosts) return true;
    if (!oldPosts || !newPosts) return false;
    if (oldPosts.length !== newPosts.length) return false;

    return oldPosts.every((post, index) => {
      const newPost = newPosts[index];
      return (
        post.id === newPost.id &&
        post.title === newPost.title &&
        post.score === newPost.score &&
        post.author === newPost.author
      );
    });
  }

  // Filtering and searching
  filterPosts(filterFn) {
    return this.posts.value.filter(filterFn);
  }

  searchPosts(query) {
    if (!query.trim()) {
      return this.posts.value;
    }

    const searchTerm = query.toLowerCase();
    return this.posts.value.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        (post.author && post.author.toLowerCase().includes(searchTerm)) ||
        post.subreddit.toLowerCase().includes(searchTerm)
    );
  }

  destroy() {
    // پاک کردن تمام listeners قبل از نابودی
    if (this.posts && this.posts.unsubscribeAll) this.posts.unsubscribeAll();
    if (this.loading && this.loading.unsubscribeAll)
      this.loading.unsubscribeAll();
    if (this.error && this.error.unsubscribeAll) this.error.unsubscribeAll();
    if (this.lastUpdated && this.lastUpdated.unsubscribeAll)
      this.lastUpdated.unsubscribeAll();
    if (this.isExpanded && this.isExpanded.unsubscribeAll)
      this.isExpanded.unsubscribeAll();

    this.posts = null;
    this.loading = null;
    this.error = null;
    this.lastUpdated = null;
    this.isExpanded = null;
  }
}
