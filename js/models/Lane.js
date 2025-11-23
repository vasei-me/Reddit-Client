// Single Responsibility: مدیریت لاین subreddit
export class Lane {
  constructor(name, posts = []) {
    this.name = name;
    this.posts = posts.map((postData) => new Post(postData));
    this.createdAt = new Date();
    this.isLoading = false;
  }

  addPost(post) {
    if (post instanceof Post && post.isValid()) {
      this.posts.push(post);
    }
  }

  removePost(postId) {
    this.posts = this.posts.filter((post) => post.id !== postId);
  }

  updatePosts(newPostsData) {
    this.posts = newPostsData.map((postData) => new Post(postData));
  }

  clearPosts() {
    this.posts = [];
  }

  getPostCount() {
    return this.posts.length;
  }

  setLoading(loading) {
    this.isLoading = loading;
  }

  toJSON() {
    return {
      name: this.name,
      posts: this.posts.map((post) => post.toJSON()),
      createdAt: this.createdAt.toISOString(),
      postCount: this.getPostCount(),
    };
  }

  static fromJSON(jsonData) {
    const lane = new Lane(jsonData.name, jsonData.posts);
    lane.createdAt = new Date(jsonData.createdAt);
    return lane;
  }
}
