// Single Responsibility: مدیریت ذخیره‌سازی و بازیابی داده‌ها از localStorage
export class StorageService {
  constructor(storageKey = "reddit-client-lanes") {
    this.storageKey = storageKey;
  }

  saveLanes(lanes) {
    try {
      const lanesData = lanes.map((lane) =>
        lane.toJSON ? lane.toJSON() : lane
      );
      localStorage.setItem(this.storageKey, JSON.stringify(lanesData));
      return true;
    } catch (error) {
      console.error("Error saving lanes to storage:", error);
      return false;
    }
  }

  loadLanes() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return [];

      const lanesData = JSON.parse(saved);
      return lanesData.map((laneData) => ({
        name: laneData.name,
        posts: laneData.posts || [],
      }));
    } catch (error) {
      console.error("Error loading lanes from storage:", error);
      return [];
    }
  }

  clearLanes() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("Error clearing lanes from storage:", error);
      return false;
    }
  }

  saveSetting(key, value) {
    try {
      const settingKey = `reddit-client-${key}`;
      localStorage.setItem(settingKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error saving setting:", error);
      return false;
    }
  }

  loadSetting(key, defaultValue = null) {
    try {
      const settingKey = `reddit-client-${key}`;
      const saved = localStorage.getItem(settingKey);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error("Error loading setting:", error);
      return defaultValue;
    }
  }
}
