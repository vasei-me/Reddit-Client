import { Lane } from "../models/Lane.js";

// Single Responsibility: مدیریت لاین‌ها و عملیات مربوط به آنها
export class LaneManager {
  constructor(storageService, postFetcher) {
    this.storageService = storageService;
    this.postFetcher = postFetcher;
    this.lanes = new Map();
  }

  async addLane(subredditName) {
    if (this.lanes.has(subredditName)) {
      throw new Error(`Lane for "${subredditName}" already exists`);
    }

    const lane = new Lane(subredditName);
    lane.setLoading(true);
    this.lanes.set(subredditName, lane);

    try {
      const posts = await this.postFetcher.fetchPosts(subredditName);
      lane.updatePosts(posts);
      lane.setLoading(false);

      this.saveLanesToStorage();
      return lane;
    } catch (error) {
      this.lanes.delete(subredditName);
      throw error;
    }
  }

  removeLane(subredditName) {
    const removed = this.lanes.delete(subredditName);
    if (removed) {
      this.saveLanesToStorage();
    }
    return removed;
  }

  getLane(subredditName) {
    return this.lanes.get(subredditName);
  }

  getAllLanes() {
    return Array.from(this.lanes.values());
  }

  getLaneNames() {
    return Array.from(this.lanes.keys());
  }

  hasLane(subredditName) {
    return this.lanes.has(subredditName);
  }

  clearAllLanes() {
    this.lanes.clear();
    this.storageService.clearLanes();
  }

  async refreshLane(subredditName) {
    const lane = this.lanes.get(subredditName);
    if (!lane) {
      throw new Error(`Lane "${subredditName}" not found`);
    }

    lane.setLoading(true);

    try {
      const posts = await this.postFetcher.fetchPosts(subredditName);
      lane.updatePosts(posts);
      lane.setLoading(false);
      this.saveLanesToStorage();
      return lane;
    } catch (error) {
      lane.setLoading(false);
      throw error;
    }
  }

  saveLanesToStorage() {
    const lanesData = this.getAllLanes();
    this.storageService.saveLanes(lanesData);
  }

  async loadLanesFromStorage() {
    const savedLanes = this.storageService.loadLanes();

    for (const laneData of savedLanes) {
      try {
        const lane = new Lane(laneData.name, laneData.posts);
        this.lanes.set(laneData.name, lane);
      } catch (error) {
        console.error(`Error loading lane "${laneData.name}":`, error);
      }
    }
  }

  getLaneCount() {
    return this.lanes.size;
  }
}
