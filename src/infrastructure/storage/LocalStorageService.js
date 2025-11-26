import { IStorageService } from "./IStorageService.js";

export class LocalStorageService extends IStorageService {
  constructor() {
    super();
    this._isAvailable = this._checkLocalStorageAvailability();
  }

  _checkLocalStorageAvailability() {
    try {
      const test = "test";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn("LocalStorage is not available:", e);
      return false;
    }
  }

  // متد getItem باید وجود داشته باشد
  async getItem(key) {
    if (!this._isAvailable) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  }

  async setItem(key, value) {
    if (!this._isAvailable) {
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
      return false;
    }
  }

  async removeItem(key) {
    if (!this._isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
      return false;
    }
  }

  async clear() {
    if (!this._isAvailable) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }

  async getAllKeys() {
    if (!this._isAvailable) {
      return [];
    }

    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return [];
    }
  }

  async getSize() {
    if (!this._isAvailable) {
      return 0;
    }

    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error("Error calculating localStorage size:", error);
      return 0;
    }
  }

  isAvailable() {
    return this._isAvailable;
  }
}
