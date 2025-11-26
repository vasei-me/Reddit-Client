// core/use-cases/posts/ValidateSubredditUseCase.js
export class ValidateSubredditUseCase {
  constructor(postRepository, validator) {
    this.postRepository = postRepository;
    this.validator = validator;
  }

  async execute(subreddit, existingSubreddits = []) {
    try {
      console.log(`🔍 Validating subreddit: r/${subreddit}`);

      const validationResult = this.validator.validate(subreddit);
      if (!validationResult.isValid) {
        return {
          isValid: false,
          error: validationResult.error || "Invalid subreddit name",
        };
      }

      if (existingSubreddits.includes(subreddit)) {
        return {
          isValid: false,
          error: `r/${subreddit} is already added`,
        };
      }

      console.log(`📥 Testing connection to r/${subreddit}`);
      const posts = await this.postRepository.fetchPosts(subreddit, 1);

      if (posts.length === 0) {
        return {
          isValid: false,
          error: `r/${subreddit} returned no posts or may be private`,
        };
      }

      console.log(`✅ Subreddit r/${subreddit} is valid`);
      return {
        isValid: true,
        subreddit: subreddit,
      };
    } catch (error) {
      console.error(`❌ Validation failed for r/${subreddit}:`, error);
      return {
        isValid: false,
        error: `Cannot access r/${subreddit}: ${error.message}`,
      };
    }
  }
}
