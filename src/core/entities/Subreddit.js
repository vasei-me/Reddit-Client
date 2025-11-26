export class Subreddit {
  constructor(
    name,
    displayName,
    subscribers = 0,
    description = "",
    isActive = true
  ) {
    this.name = name.toLowerCase().trim();
    this.displayName = displayName || `r/${name}`;
    this.subscribers = subscribers;
    this.description = description;
    this.isActive = isActive;
    this.createdAt = new Date();
  }

  static fromRedditData(data) {
    return new Subreddit(
      data.display_name,
      data.title,
      data.subscribers,
      data.public_description
    );
  }

  isValid() {
    const subredditRegex = /^[a-zA-Z0-9_]{1,21}$/;
    return subredditRegex.test(this.name);
  }

  getDisplayName() {
    return this.displayName.startsWith("r/")
      ? this.displayName
      : `r/${this.displayName}`;
  }

  formatSubscribers() {
    if (this.subscribers >= 1000000) {
      return `${(this.subscribers / 1000000).toFixed(1)}M`;
    } else if (this.subscribers >= 1000) {
      return `${(this.subscribers / 1000).toFixed(1)}k`;
    }
    return this.subscribers.toString();
  }
}
