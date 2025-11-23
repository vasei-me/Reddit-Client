// Single Responsibility: مدیریت داده‌های پست
export class Post {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.author = data.author;
    this.score = data.score;
    this.numComments = data.num_comments;
    this.permalink = data.permalink;
    this.thumbnail = data.thumbnail;
    this.url = data.url;
    this.created = data.created_utc;
  }

  isValid() {
    return this.id && this.title && this.author;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      score: this.score,
      numComments: this.numComments,
      permalink: this.permalink,
      thumbnail: this.thumbnail,
      url: this.url,
      created: this.created,
    };
  }

  getFormattedDate() {
    return new Date(this.created * 1000).toLocaleDateString("fa-IR");
  }

  hasThumbnail() {
    return (
      this.thumbnail &&
      this.thumbnail !== "self" &&
      this.thumbnail !== "default" &&
      this.thumbnail.startsWith("http")
    );
  }
}
