export class IPostRepository {
  async fetchPosts(subreddit, limit = 25) {
    throw new Error("Method not implemented: fetchPosts");
  }

  async fetchPostById(postId) {
    throw new Error("Method not implemented: fetchPostById");
  }

  async validateSubreddit(subreddit) {
    throw new Error("Method not implemented: validateSubreddit");
  }

  async searchPosts(subreddit, query) {
    throw new Error("Method not implemented: searchPosts");
  }
}
