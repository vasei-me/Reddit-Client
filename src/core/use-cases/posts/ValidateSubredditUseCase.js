// core/use-cases/posts/ValidateSubredditUseCase.js
export class ValidateSubredditUseCase {
  constructor(postRepository, validator) {
    this.postRepository = postRepository;
    this.validator = validator;
  }

  async execute(subreddit, existingSubreddits = []) {
    try {
      console.log(`🔍 Validating subreddit: r/${subreddit}`);

      // اعتبارسنجی اولیه نام سابردیت
      const validationResult = this.validator.validate(subreddit);
      if (!validationResult.isValid) {
        console.log(`❌ Validation failed: ${validationResult.error}`);
        return {
          isValid: false,
          error: validationResult.error,
        };
      }

      // بررسی تکراری نبودن
      if (existingSubreddits.includes(subreddit)) {
        console.log(`❌ Subreddit already exists: r/${subreddit}`);
        return {
          isValid: false,
          error: `r/${subreddit} is already added to your dashboard`,
        };
      }

      // تست اتصال به Reddit - گرفتن 1 پست برای تست
      console.log(`📥 Testing connection to r/${subreddit}`);
      const posts = await this.postRepository.fetchPosts(subreddit, 1);

      if (!posts || posts.length === 0) {
        console.log(`❌ No posts found in r/${subreddit}`);
        return {
          isValid: false,
          error: `r/${subreddit} returned no posts or may be private`,
        };
      }

      console.log(
        `✅ Subreddit r/${subreddit} is valid, found ${posts.length} posts`
      );
      return {
        isValid: true,
        subreddit: subreddit,
        samplePost: posts[0],
      };
    } catch (error) {
      console.error(`❌ Validation failed for r/${subreddit}:`, error);

      // پیام خطای کاربرپسند
      let userMessage = `Cannot add r/${subreddit}`;

      if (
        error.message.includes("404") ||
        error.message.includes("Not Found")
      ) {
        userMessage = `r/${subreddit} does not exist or is private`;
      } else if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        userMessage = `r/${subreddit} is private or cannot be accessed`;
      } else if (
        error.message.includes("CORS") ||
        error.message.includes("proxy")
      ) {
        userMessage = `Network error: Cannot access Reddit. Please check your connection.`;
      } else if (
        error.message.includes("rate limit") ||
        error.message.includes("too many requests")
      ) {
        userMessage = `Rate limit exceeded. Please wait a moment and try again.`;
      } else {
        userMessage = `Failed to access r/${subreddit}: ${error.message}`;
      }

      return {
        isValid: false,
        error: userMessage,
      };
    }
  }
}
