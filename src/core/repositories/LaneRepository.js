import { ILaneRepository } from "./ILaneRepository.js";

export class LaneRepository extends ILaneRepository {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.storageKey = "reddit_lanes";
  }

  async getAll() {
    try {
      // استفاده از getItem به جای get
      const data = await this.storageService.getItem(this.storageKey);

      if (!data) {
        return [];
      }

      const lanesData = JSON.parse(data);

      if (!Array.isArray(lanesData)) {
        console.warn("Invalid lanes data in storage, returning empty array");
        return [];
      }

      // تبدیل داده‌های ذخیره شده به Lane objects
      const lanes = lanesData
        .map((laneData) => {
          try {
            // اینجا باید Lane class را import کنید
            // برای حالا، object ساده برمی‌گردانیم
            return {
              id: laneData.id,
              subreddit: laneData.subreddit,
              posts: laneData.posts || [],
              isLoading: laneData.isLoading || false,
              error: laneData.error || null,
              createdAt: laneData.createdAt
                ? new Date(laneData.createdAt)
                : new Date(),
              lastUpdated: laneData.lastUpdated
                ? new Date(laneData.lastUpdated)
                : new Date(),
            };
          } catch (error) {
            console.error("Error parsing lane data:", error, laneData);
            return null;
          }
        })
        .filter((lane) => lane !== null);

      console.log(`Loaded ${lanes.length} lanes from storage`);
      return lanes;
    } catch (error) {
      console.error("Error loading lanes from storage:", error);
      return [];
    }
  }

  async save(lane) {
    try {
      const existingLanes = await this.getAll();

      // بررسی وجود lane با همان id
      const existingIndex = existingLanes.findIndex((l) => l.id === lane.id);

      if (existingIndex !== -1) {
        // آپدیت lane موجود
        existingLanes[existingIndex] = lane;
      } else {
        // اضافه کردن lane جدید
        existingLanes.push(lane);
      }

      // ذخیره کردن با استفاده از setItem
      await this.storageService.setItem(
        this.storageKey,
        JSON.stringify(existingLanes)
      );
      console.log(`Saved lane ${lane.subreddit} to storage`);

      return lane;
    } catch (error) {
      console.error("Error saving lane to storage:", error);
      throw error;
    }
  }

  async delete(laneId) {
    try {
      const existingLanes = await this.getAll();
      const filteredLanes = existingLanes.filter((lane) => lane.id !== laneId);

      await this.storageService.setItem(
        this.storageKey,
        JSON.stringify(filteredLanes)
      );
      console.log(`Deleted lane ${laneId} from storage`);

      return true;
    } catch (error) {
      console.error("Error deleting lane from storage:", error);
      throw error;
    }
  }

  async clear() {
    try {
      await this.storageService.removeItem(this.storageKey);
      console.log("Cleared all lanes from storage");
      return true;
    } catch (error) {
      console.error("Error clearing lanes from storage:", error);
      throw error;
    }
  }

  async getBySubreddit(subreddit) {
    try {
      const lanes = await this.getAll();
      return lanes.find(
        (lane) => lane.subreddit.toLowerCase() === subreddit.toLowerCase()
      );
    } catch (error) {
      console.error("Error getting lane by subreddit:", error);
      return null;
    }
  }

  async exists(subreddit) {
    try {
      const lane = await this.getBySubreddit(subreddit);
      return lane !== undefined;
    } catch (error) {
      console.error("Error checking if lane exists:", error);
      return false;
    }
  }

  async updateLanePosts(laneId, posts) {
    try {
      const lanes = await this.getAll();
      const laneIndex = lanes.findIndex((lane) => lane.id === laneId);

      if (laneIndex !== -1) {
        lanes[laneIndex].posts = posts;
        lanes[laneIndex].lastUpdated = new Date();
        await this.storageService.setItem(
          this.storageKey,
          JSON.stringify(lanes)
        );
        console.log(`Updated posts for lane ${laneId}`);
        return lanes[laneIndex];
      }

      throw new Error(`Lane with id ${laneId} not found`);
    } catch (error) {
      console.error("Error updating lane posts:", error);
      throw error;
    }
  }

  async getLaneCount() {
    try {
      const lanes = await this.getAll();
      return lanes.length;
    } catch (error) {
      console.error("Error getting lane count:", error);
      return 0;
    }
  }

  async getById(laneId) {
    try {
      const lanes = await this.getAll();
      return lanes.find((lane) => lane.id === laneId);
    } catch (error) {
      console.error("Error getting lane by ID:", error);
      return null;
    }
  }
}
