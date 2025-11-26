export class RefreshLaneUseCase {
  constructor(laneRepository, postRepository) {
    this.laneRepository = laneRepository;
    this.postRepository = postRepository;
  }

  async execute(laneId) {
    if (!laneId || typeof laneId !== "string") {
      throw new Error("Lane ID must be a non-empty string");
    }

    // Get existing lane
    const lane = await this.laneRepository.get(laneId);
    if (!lane) {
      throw new Error(`Lane with ID "${laneId}" not found`);
    }

    // Set loading state
    lane.setLoading(true);
    await this.laneRepository.update(lane);

    try {
      // Fetch fresh posts
      const freshPosts = await this.postRepository.fetchPosts(lane.subreddit);

      // Update lane with new posts
      lane.updatePosts(freshPosts);
      await this.laneRepository.update(lane);

      return {
        lane,
        message: `Refreshed r/${lane.subreddit} successfully`,
      };
    } catch (error) {
      // Update lane with error state
      lane.setError(error.message);
      await this.laneRepository.update(lane);

      throw new Error(
        `Failed to refresh r/${lane.subreddit}: ${error.message}`
      );
    }
  }
}
