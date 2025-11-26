// infrastructure/validators/SubredditValidator.js
export class SubredditValidator {
  validate(subreddit) {
    if (!subreddit || typeof subreddit !== "string") {
      return {
        isValid: false,
        error: "Subreddit name must be a string",
      };
    }

    const trimmed = subreddit.trim();

    if (trimmed.length === 0) {
      return {
        isValid: false,
        error: "Subreddit name cannot be empty",
      };
    }

    if (trimmed.length > 21) {
      return {
        isValid: false,
        error: "Subreddit name is too long",
      };
    }

    // الگوی معتبر برای نام سابردیت
    const subredditRegex = /^[a-zA-Z0-9_]+$/;
    if (!subredditRegex.test(trimmed)) {
      return {
        isValid: false,
        error:
          "Subreddit name can only contain letters, numbers, and underscores",
      };
    }

    return {
      isValid: true,
      error: null,
    };
  }
}
