// core/entities/Lane.js
export class Lane {
  constructor({
    id,
    subreddit,
    posts = [],
    createdAt = new Date(),
    updatedAt = new Date(),
    isLoading = false,
    error = null,
  }) {
    this.id = id;
    this.subreddit = subreddit;
    this.posts = posts;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isLoading = isLoading;
    this.error = error;
  }

  updatePosts(newPosts) {
    this.posts = newPosts;
    this.updatedAt = new Date();
    this.isLoading = false;
    this.error = null;
  }

  setLoading(loading) {
    this.isLoading = loading;
    if (loading) {
      this.error = null;
    }
  }

  setError(errorMessage) {
    this.error = errorMessage;
    this.isLoading = false;
  }

  toJSON() {
    return {
      id: this.id,
      subreddit: this.subreddit,
      posts: this.posts,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  static fromJSON(data) {
    return new Lane({
      id: data.id,
      subreddit: data.subreddit,
      posts: data.posts || [],
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      isLoading: data.isLoading || false,
      error: data.error || null,
    });
  }
}
