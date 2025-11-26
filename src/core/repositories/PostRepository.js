// core/repositories/PostRepository.js
export class PostRepository {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async fetchPosts(subreddit, limit = 10) {
    try {
      console.log(`📥 Fetching ${limit} posts from r/${subreddit}`);

      const url = `https://www.reddit.com/r/${subreddit}.json?limit=${limit}&raw_json=1`;
      const data = await this.httpClient.get(url);

      if (!data || !data.data || !data.data.children) {
        console.warn(`⚠️ No posts found in r/${subreddit}`);
        return [];
      }

      const posts = data.data.children
        .filter((child) => child && child.data)
        .slice(0, limit)
        .map((child) => this._mapPostData(child.data));

      console.log(`✅ Found ${posts.length} posts from r/${subreddit}`);
      return posts;
    } catch (error) {
      console.error(`❌ Error fetching from r/${subreddit}:`, error.message);
      // به جای throw کردن خطا، آرایه خالی برگردانید
      return [];
    }
  }

  _mapPostData(postData) {
    return {
      id: postData.id,
      title: postData.title,
      author: postData.author,
      score: postData.score || 0,
      comments: postData.num_comments || 0,
      url: `https://reddit.com${postData.permalink}`,
      created: new Date(postData.created_utc * 1000),
      subreddit: postData.subreddit,
      thumbnail: postData.thumbnail,
      selftext: postData.selftext,
      isVideo: postData.is_video || false,
      media: postData.media,
      preview: postData.preview,
    };
  }
}
