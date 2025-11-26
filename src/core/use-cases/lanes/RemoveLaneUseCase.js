export class RemoveLaneUseCase {
  constructor(laneRepository) {
    this.laneRepository = laneRepository;
  }

  async execute(laneId) {
    if (!laneId || typeof laneId !== "string") {
      throw new Error("Lane ID must be a non-empty string");
    }

    try {
      // Get all lanes to check if lane exists
      const allLanes = await this.laneRepository.getAll();
      const laneExists = allLanes.some((lane) => lane.id === laneId);

      if (!laneExists) {
        throw new Error(`Lane with ID "${laneId}" not found`);
      }

      // Remove lane
      await this.laneRepository.delete(laneId);

      return {
        success: true,
        message: "Lane removed successfully",
      };
    } catch (error) {
      throw error;
    }
  }
}
