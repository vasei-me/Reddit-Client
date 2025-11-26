// infrastructure/http/RedditHttpClient.js
export class RedditHttpClient {
  constructor() {
    this.proxies = [
      "https://corsproxy.io/?",
      "https://api.allorigins.win/raw?url=",
      "https://cors.bridged.cc/",
    ];
    this.currentProxyIndex = 0;
    this.timeout = 10000; // 10 second timeout
  }

  async get(url) {
    console.log(`🔗 Fetching: ${url}`);

    const cleanUrl = url.replace("https://cors-anywhere.herokuapp.com/", "");

    for (let i = 0; i < this.proxies.length; i++) {
      const proxyIndex = (this.currentProxyIndex + i) % this.proxies.length;
      const proxy = this.proxies[proxyIndex];

      try {
        const proxyUrl = proxy + encodeURIComponent(cleanUrl);
        console.log(
          `🔄 Trying proxy ${proxyIndex + 1}/${this.proxies.length}: ${proxy}`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        console.log(`📡 Response status: ${response.status}`);

        if (response.ok) {
          const text = await response.text();
          console.log(`✅ Proxy ${proxyIndex + 1} successful`);

          if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
            try {
              const data = JSON.parse(text);
              this.currentProxyIndex = proxyIndex;
              return data;
            } catch (parseError) {
              console.warn(
                `❌ Invalid JSON from proxy ${proxyIndex + 1}:`,
                parseError.message
              );
              continue;
            }
          } else {
            console.warn(
              `❌ Invalid response format from proxy ${proxyIndex + 1}`
            );
            continue;
          }
        } else if (response.status === 404) {
          throw new Error("404 - Subreddit not found");
        } else if (response.status === 403) {
          throw new Error("403 - Access forbidden");
        } else if (response.status === 429) {
          throw new Error("429 - Rate limited");
        } else {
          console.warn(
            `⚠️ Proxy ${proxyIndex + 1} returned status ${response.status}`
          );
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.warn(`❌ Proxy ${proxyIndex + 1} timeout`);
        } else if (error.message.startsWith("40")) {
          // HTTP error - throw immediately
          throw error;
        } else {
          console.warn(`❌ Proxy ${proxyIndex + 1} failed:`, error.message);
        }
      }
    }

    throw new Error(
      "All proxies failed. Please check your internet connection and try again."
    );
  }
}
