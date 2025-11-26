export class Post {
  constructor({
    id,
    title,
    author,
    score,
    url,
    thumbnail,
    created_utc,
    subreddit,
    permalink,
    num_comments,
  }) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.score = score;
    this.url = url;
    this.thumbnail = thumbnail;
    this.created_utc = created_utc;
    this.subreddit = subreddit;
    this.permalink = permalink;
    this.num_comments = num_comments;
  }

  getCreatedTime() {
    return new Date(this.created_utc * 1000);
  }

  hasThumbnail() {
    return (
      this.thumbnail &&
      this.thumbnail.startsWith("http") &&
      this.thumbnail !== "self" &&
      this.thumbnail !== "default" &&
      this.thumbnail !== "image" &&
      this.thumbnail !== "nsfw"
    );
  }

  getRedditUrl() {
    return `https://www.reddit.com${this.permalink}`;
  }

  formatScore() {
    if (this.score >= 1000) {
      return `${(this.score / 1000).toFixed(1)}k`;
    }
    return this.score.toString();
  }
}
