// core/repositories/PostRepository.js
export class PostRepository {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async fetchPosts(subreddit, limit = 10) {
    try {
      console.log(`📥 Fetching ${limit} posts from r/${subreddit}`);

      const url = `https://www.reddit.com/r/${subreddit}.json?limit=${limit}&raw_json=1`;
      console.log(`🔗 URL: ${url}`);

      const data = await this.httpClient.get(url);

      if (!data || !data.data || !data.data.children) {
        console.error(`❌ Invalid response format from r/${subreddit}`);
        throw new Error("Invalid response format from Reddit API");
      }

      const posts = data.data.children
        .filter((child) => child && child.data)
        .map((child) => this._mapPostData(child.data));

      console.log(
        `✅ Successfully fetched ${posts.length} posts from r/${subreddit}`
      );

      return posts;
    } catch (error) {
      console.error(`❌ Error fetching posts from r/${subreddit}:`, error);
      throw new Error(
        `Failed to fetch posts from r/${subreddit}: ${error.message}`
      );
    }
  }

  _mapPostData(postData) {
    return {
      id: postData.id,
      title: postData.title,
      author: postData.author,
      score: postData.score,
      comments: postData.num_comments,
      url: `https://reddit.com${postData.permalink}`,
      created: new Date(postData.created_utc * 1000),
      subreddit: postData.subreddit,
      thumbnail: postData.thumbnail,
      selftext: postData.selftext,
      isVideo: postData.is_video,
      media: postData.media,
      preview: postData.preview,
    };
  }
}
