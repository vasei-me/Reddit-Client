import { IHttpClient } from "./IHttpClient.js";

export class FetchHttpClient extends IHttpClient {
  constructor(baseURL = "") {
    super();
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  async get(url, options = {}) {
    return this._fetch(url, { method: "GET", ...options });
  }

  async post(url, data, options = {}) {
    return this._fetch(url, { method: "POST", body: data, ...options });
  }

  async put(url, data, options = {}) {
    return this._fetch(url, { method: "PUT", body: data, ...options });
  }

  async delete(url, options = {}) {
    return this._fetch(url, { method: "DELETE", ...options });
  }

  setBaseURL(baseURL) {
    this.baseURL = baseURL;
  }

  setDefaultHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  async _fetch(url, options = {}) {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(fullUrl, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      console.error(`HTTP Request failed for ${url}:`, error);
      throw error;
    }
  }
}
