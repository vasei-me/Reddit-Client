// infrastructure/http/RedditHttpClient.js
export class RedditHttpClient {
  constructor() {
    this.proxies = [
      "https://api.allorigins.win/raw?url=",
      "https://corsproxy.io/?",
      "https://cors.bridged.cc/",
      "https://jsonp.afeld.me/?url=",
    ];
    this.currentProxyIndex = 0;
  }

  async get(url) {
    console.log(`🔗 Fetching: ${url}`);

    // حذف هرگونه پروکسی قبلی از URL
    const cleanUrl = url.replace("https://cors-anywhere.herokuapp.com/", "");

    for (let i = 0; i < this.proxies.length; i++) {
      try {
        const proxyIndex = (this.currentProxyIndex + i) % this.proxies.length;
        const proxyUrl =
          this.proxies[proxyIndex] + encodeURIComponent(cleanUrl);

        console.log(
          `🔄 Trying proxy ${proxyIndex + 1}: ${this.proxies[proxyIndex]}`
        );

        const response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "RedditDashboard/1.0",
          },
        });

        console.log(`📡 Response status: ${response.status}`);

        if (response.ok) {
          const text = await response.text();
          console.log(
            `✅ Proxy ${proxyIndex + 1} successful, response length: ${
              text.length
            }`
          );

          // بررسی اینکه پاسخ JSON معتبر است
          if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
            const data = JSON.parse(text);
            this.currentProxyIndex = proxyIndex;
            return data;
          } else {
            console.warn(
              `❌ Invalid JSON response from proxy ${proxyIndex + 1}`
            );
            continue;
          }
        } else {
          console.warn(
            `❌ Proxy ${proxyIndex + 1} failed with status: ${response.status}`
          );
        }
      } catch (error) {
        console.warn(`❌ Proxy ${proxyIndex + 1} error:`, error.message);
        continue;
      }
    }

    throw new Error(
      "All CORS proxies failed. Please check your internet connection."
    );
  }

  _handleError(error) {
    console.error("HTTP Client Error:", error);
    throw error;
  }
}
