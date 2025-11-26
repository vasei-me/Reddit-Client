export class RefreshLaneUseCase {
  constructor(laneRepository, postRepository) {
    this.laneRepository = laneRepository;
    this.postRepository = postRepository;
  }

  async execute(laneId) {
    if (!laneId || typeof laneId !== "string") {
      throw new Error("Lane ID must be a non-empty string");
    }

    try {
      // Get all lanes and find the one with matching ID
      const allLanes = await this.laneRepository.getAll();
      const lane = allLanes.find((l) => l.id === laneId);

      if (!lane) {
        throw new Error(`Lane with ID "${laneId}" not found`);
      }

      // Set loading state
      lane.isLoading = true;
      await this.laneRepository.save(lane);

      try {
        // Fetch fresh posts
        const freshPosts = await this.postRepository.fetchPosts(
          lane.subreddit,
          25
        );

        // Update lane with new posts
        lane.posts = freshPosts;
        lane.isLoading = false;
        lane.error = null;
        lane.updatedAt = new Date();
        await this.laneRepository.save(lane);

        return {
          lane,
          message: `Refreshed r/${lane.subreddit} successfully`,
        };
      } catch (error) {
        // Update lane with error state
        lane.isLoading = false;
        lane.error = error.message;
        await this.laneRepository.save(lane);

        throw new Error(
          `Failed to refresh r/${lane.subreddit}: ${error.message}`
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
