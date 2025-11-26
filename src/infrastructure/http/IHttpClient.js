export class IHttpClient {
  async get(url, options = {}) {
    throw new Error("Method not implemented: get");
  }

  async post(url, data, options = {}) {
    throw new Error("Method not implemented: post");
  }

  async put(url, data, options = {}) {
    throw new Error("Method not implemented: put");
  }

  async delete(url, options = {}) {
    throw new Error("Method not implemented: delete");
  }

  setBaseURL(baseURL) {
    throw new Error("Method not implemented: setBaseURL");
  }

  setDefaultHeaders(headers) {
    throw new Error("Method not implemented: setDefaultHeaders");
  }
}
