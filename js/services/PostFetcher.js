import { HttpClient } from "../utils/HttpClient.js";

// Single Responsibility: دریافت پست‌ها از Reddit API
export class PostFetcher {
  constructor() {
    this.httpClient = new HttpClient();
  }

  async fetchSubredditInfo(subredditName) {
    try {
      const data = await this.httpClient.get(`/r/${subredditName}/about.json`);

      if (data.error) {
        throw new Error(
          data.message || `Subreddit "${subredditName}" not found`
        );
      }

      if (!data.data || !data.data.display_name) {
        throw new Error(`Invalid subreddit data for "${subredditName}"`);
      }

      return data.data;
    } catch (error) {
      throw new Error(`Failed to fetch subreddit info: ${error.message}`);
    }
  }

  async fetchPosts(subredditName, limit = 10, sort = "hot") {
    try {
      const data = await this.httpClient.getWithRetry(
        `/r/${subredditName}/${sort}.json?limit=${limit}`
      );

      if (!data.data || !Array.isArray(data.data.children)) {
        throw new Error("Invalid response format from Reddit API");
      }

      return data.data.children
        .map((item) => item.data)
        .filter((post) => post && post.id && post.title);
    } catch (error) {
      throw new Error(
        `Failed to fetch posts from "${subredditName}": ${error.message}`
      );
    }
  }

  async validateSubreddit(subredditName) {
    try {
      await this.fetchSubredditInfo(subredditName);
      return true;
    } catch {
      return false;
    }
  }
}
