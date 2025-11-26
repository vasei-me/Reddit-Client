// src/core/repositories/ILaneRepository.js
export class ILaneRepository {
  async getAll() {
    throw new Error("getAll method must be implemented");
  }

  async save(lane) {
    throw new Error("save method must be implemented");
  }

  async delete(laneId) {
    throw new Error("delete method must be implemented");
  }

  async clear() {
    throw new Error("clear method must be implemented");
  }

  async getBySubreddit(subreddit) {
    throw new Error("getBySubreddit method must be implemented");
  }

  async exists(subreddit) {
    throw new Error("exists method must be implemented");
  }

  async updateLanePosts(laneId, posts) {
    throw new Error("updateLanePosts method must be implemented");
  }

  async getLaneCount() {
    throw new Error("getLaneCount method must be implemented");
  }
}
