export class AddLaneUseCase {
  constructor(laneRepository, postRepository, validator) {
    this.laneRepository = laneRepository;
    this.postRepository = postRepository;
    this.validator = validator;
  }

  async execute(subreddit) {
    // Validate input
    if (!subreddit || typeof subreddit !== "string") {
      throw new Error("Subreddit name must be a non-empty string");
    }

    const trimmedSubreddit = subreddit.trim().toLowerCase();

    // Validate subreddit format
    if (!this.validator.validate(trimmedSubreddit)) {
      throw new Error("Invalid subreddit name format");
    }

    // Check if lane already exists
    const existingLanes = await this.laneRepository.getAll();
    const existingLane = existingLanes.find(
      (lane) => lane.subreddit === trimmedSubreddit
    );

    if (existingLane) {
      throw new Error(
        `Subreddit "r/${trimmedSubreddit}" already exists in your lanes`
      );
    }

    // Validate subreddit exists and fetch initial posts
    let posts;
    try {
      posts = await this.postRepository.fetchPosts(trimmedSubreddit);
    } catch (error) {
      throw new Error(
        `Failed to fetch posts from r/${trimmedSubreddit}: ${error.message}`
      );
    }

    // Create new lane
    const laneId = `lane_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const lane = new Lane(laneId, trimmedSubreddit, posts);

    // Save lane
    await this.laneRepository.add(lane);

    return {
      lane,
      message: `Successfully added r/${trimmedSubreddit}`,
    };
  }
}
