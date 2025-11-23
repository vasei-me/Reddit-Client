// Single Responsibility: مدیریت درخواست‌های HTTP
export class HttpClient {
  constructor(baseURL = "https://www.reddit.com") {
    this.baseURL = baseURL;
  }

  async get(url, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  }

  async getWithRetry(url, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.get(url);
      } catch (error) {
        if (attempt === retries) throw error;
        await this.sleep(delay * attempt);
      }
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
