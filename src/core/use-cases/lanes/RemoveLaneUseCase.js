export class RemoveLaneUseCase {
  constructor(laneRepository) {
    this.laneRepository = laneRepository;
  }

  async execute(laneId) {
    if (!laneId || typeof laneId !== "string") {
      throw new Error("Lane ID must be a non-empty string");
    }

    // Check if lane exists
    const laneExists = await this.laneRepository.exists(laneId);
    if (!laneExists) {
      throw new Error(`Lane with ID "${laneId}" not found`);
    }

    // Remove lane
    await this.laneRepository.remove(laneId);

    return {
      success: true,
      message: "Lane removed successfully",
    };
  }
}
