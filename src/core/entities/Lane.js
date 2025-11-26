export class Lane {
  constructor(id, subreddit, posts = [], isLoading = false, error = null) {
    this.id = id;
    this.subreddit = subreddit.toLowerCase().trim();
    this.posts = posts;
    this.isLoading = isLoading;
    this.error = error;
    this.createdAt = new Date();
    this.lastUpdated = new Date();
  }

  addPost(post) {
    if (!this.posts.find((p) => p.id === post.id)) {
      this.posts.push(post);
    }
  }

  clearPosts() {
    this.posts = [];
  }

  setLoading(loading) {
    this.isLoading = loading;
    if (!loading) {
      this.lastUpdated = new Date();
    }
  }

  setError(error) {
    this.error = error;
    this.isLoading = false;
  }

  clearError() {
    this.error = null;
  }

  isValid() {
    return this.subreddit && this.subreddit.trim().length > 0;
  }

  updatePosts(newPosts) {
    // اضافه کردن مقایسه برای جلوگیری از آپدیت بی‌جهت
    if (this._arePostsEqual(this.posts, newPosts)) {
      return false; // تغییر نکرده
    }

    this.posts = newPosts;
    this.clearError();
    this.setLoading(false);
    return true; // تغییر کرده
  }

  getPostCount() {
    return this.posts.length;
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
        post.score === newPost.score
      );
    });
  }

  // تابع برای مقایسه دو Lane
  equals(otherLane) {
    if (!otherLane) return false;
    return (
      this.id === otherLane.id &&
      this.subreddit === otherLane.subreddit &&
      this._arePostsEqual(this.posts, otherLane.posts) &&
      this.isLoading === otherLane.isLoading &&
      this.error === otherLane.error
    );
  }
}
