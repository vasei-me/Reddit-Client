// src/infrastructure/storage/IStorageService.js
export class IStorageService {
  async getItem(key) {
    throw new Error("getItem method must be implemented");
  }

  async setItem(key, value) {
    throw new Error("setItem method must be implemented");
  }

  async removeItem(key) {
    throw new Error("removeItem method must be implemented");
  }

  async clear() {
    throw new Error("clear method must be implemented");
  }

  async getAllKeys() {
    throw new Error("getAllKeys method must be implemented");
  }

  async getSize() {
    throw new Error("getSize method must be implemented");
  }

  isAvailable() {
    throw new Error("isAvailable method must be implemented");
  }
}
