export class FetchPostsUseCase {
  constructor(postRepository) {
    this.postRepository = postRepository;
  }

  async execute(subreddit, options = {}) {
    // Validate input
    if (!subreddit || typeof subreddit !== "string") {
      throw new Error("Subreddit name must be a non-empty string");
    }

    const trimmedSubreddit = subreddit.trim().toLowerCase();

    if (trimmedSubreddit.length === 0) {
      throw new Error("Subreddit name cannot be empty");
    }

    // Validate subreddit format
    const subredditRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,20}$/;
    if (!subredditRegex.test(trimmedSubreddit)) {
      throw new Error("Invalid subreddit name format");
    }

    const { limit = 25, sort = "hot", time = "day" } = options;

    // Validate options
    if (limit < 1 || limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const validSortOptions = ["hot", "new", "top", "rising", "controversial"];
    if (!validSortOptions.includes(sort)) {
      throw new Error(
        `Invalid sort option. Must be one of: ${validSortOptions.join(", ")}`
      );
    }

    const validTimeOptions = ["hour", "day", "week", "month", "year", "all"];
    if (!validTimeOptions.includes(time)) {
      throw new Error(
        `Invalid time option. Must be one of: ${validTimeOptions.join(", ")}`
      );
    }

    try {
      // For different sort options, we need to adjust the API URL
      let apiUrl = `/r/${trimmedSubreddit}`;

      if (sort !== "hot") {
        apiUrl += `/${sort}`;
      }

      apiUrl += `.json?limit=${limit}`;

      if (sort === "top" || sort === "controversial") {
        apiUrl += `&t=${time}`;
      }

      // Use the post repository to fetch posts
      // Note: We'll need to extend the PostRepository to handle different sort options
      const posts = await this.postRepository.fetchPosts(
        trimmedSubreddit,
        limit
      );

      // Additional sorting/filtering if needed
      const processedPosts = this._processPosts(posts, sort, options);

      return {
        posts: processedPosts,
        subreddit: trimmedSubreddit,
        sort,
        time,
        count: processedPosts.length,
        fetchedAt: new Date(),
      };
    } catch (error) {
      console.error(`Error fetching posts from r/${trimmedSubreddit}:`, error);

      // Enhance error messages for better user experience
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        throw new Error(
          `Subreddit "r/${trimmedSubreddit}" not found or is private`
        );
      } else if (error.message.includes("403")) {
        throw new Error(`Access to "r/${trimmedSubreddit}" is forbidden`);
      } else if (error.message.includes("429")) {
        throw new Error(
          "Rate limit exceeded. Please wait a few minutes before trying again."
        );
      } else if (error.message.includes("Network error")) {
        throw new Error(
          "Network connection failed. Please check your internet connection."
        );
      } else {
        throw new Error(
          `Failed to fetch posts from r/${trimmedSubreddit}: ${error.message}`
        );
      }
    }
  }

  _processPosts(posts, sort, options) {
    let processedPosts = [...posts];

    // Apply additional sorting if needed
    switch (sort) {
      case "top":
        processedPosts.sort((a, b) => b.score - a.score);
        break;
      case "new":
        processedPosts.sort((a, b) => b.created_utc - a.created_utc);
        break;
      case "controversial":
        // Simple controversy score: score / number of comments
        processedPosts.forEach((post) => {
          post.controversyScore =
            post.num_comments > 0
              ? Math.abs(post.score) / post.num_comments
              : 0;
        });
        processedPosts.sort((a, b) => b.controversyScore - a.controversyScore);
        break;
      default:
        // 'hot' and 'rising' use Reddit's algorithm, so we keep the original order
        break;
    }

    // Apply filters if specified
    if (options.filterNSFW) {
      processedPosts = processedPosts.filter((post) => !this._isNSFW(post));
    }

    if (options.minScore) {
      processedPosts = processedPosts.filter(
        (post) => post.score >= options.minScore
      );
    }

    if (options.maxScore) {
      processedPosts = processedPosts.filter(
        (post) => post.score <= options.maxScore
      );
    }

    return processedPosts;
  }

  _isNSFW(post) {
    // Check multiple indicators of NSFW content
    return (
      post.over_18 ||
      (post.title &&
        (post.title.toLowerCase().includes("[nsfw]") ||
          post.title.toLowerCase().includes("nsfw") ||
          post.title.toLowerCase().includes("spoiler")))
    );
  }

  // Batch operations for multiple subreddits
  async executeBatch(subreddits, options = {}) {
    if (!Array.isArray(subreddits)) {
      throw new Error("Subreddits must be an array");
    }

    if (subreddits.length === 0) {
      throw new Error("At least one subreddit must be provided");
    }

    if (subreddits.length > 10) {
      throw new Error("Maximum 10 subreddits allowed per batch request");
    }

    const results = await Promise.allSettled(
      subreddits.map((subreddit) => this.execute(subreddit, options))
    );

    const successfulResults = [];
    const failedResults = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successfulResults.push(result.value);
      } else {
        failedResults.push({
          subreddit: subreddits[index],
          error: result.reason.message,
        });
      }
    });

    return {
      successful: successfulResults,
      failed: failedResults,
      totalRequested: subreddits.length,
      totalSuccessful: successfulResults.length,
      totalFailed: failedResults.length,
    };
  }

  // Search within a subreddit
  async searchInSubreddit(subreddit, query, options = {}) {
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      throw new Error("Search query must be a non-empty string");
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    try {
      const searchResults = await this.postRepository.searchPosts(
        subreddit,
        trimmedQuery
      );

      // Apply additional processing if needed
      const processedResults = this._processPosts(
        searchResults,
        "relevance",
        options
      );

      return {
        posts: processedResults,
        subreddit,
        query: trimmedQuery,
        count: processedResults.length,
        searchedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Search failed in r/${subreddit}: ${error.message}`);
    }
  }
}
