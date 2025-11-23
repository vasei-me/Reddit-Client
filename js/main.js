import { LaneManager } from "./services/LaneManager.js";
import { PostFetcher } from "./services/PostFetcher.js";
import { StorageService } from "./services/StorageService.js";
import { AppView } from "./ui/AppView.js";

// Single Responsibility: راه‌اندازی و هماهنگی کلی برنامه
class RedditClient {
  constructor() {
    this.postFetcher = null;
    this.storageService = null;
    this.laneManager = null;
    this.appView = null;

    this.init();
  }

  async init() {
    try {
      await this.initializeServices();
      this.initializeUI();
      this.setupErrorHandling();

      console.log("Reddit Client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Reddit Client:", error);
      this.showFatalError("خطا در راه‌اندازی برنامه");
    }
  }

  async initializeServices() {
    // مقداردهی سرویس‌ها با ترتیب وابستگی
    this.postFetcher = new PostFetcher();
    this.storageService = new StorageService();
    this.laneManager = new LaneManager(this.storageService, this.postFetcher);
  }

  initializeUI() {
    const container = document.getElementById("lanesContainer");

    if (!container) {
      throw new Error("لاین کانتینر پیدا نشد!");
    }

    this.appView = new AppView(container, this.laneManager, (laneName) =>
      this.handleLaneAdded(laneName)
    );
  }

  setupErrorHandling() {
    // مدیریت خطاهای catch نشده
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      this.showError("خطای غیرمنتظره در برنامه");
    });

    window.addEventListener("error", (event) => {
      console.error("Global Error:", event.error);
    });
  }

  handleLaneAdded(laneName) {
    console.log(`Lane added: ${laneName}`);

    // آمار استفاده را ذخیره کنید
    this.trackUsage("lane_added", { subreddit: laneName });
  }

  trackUsage(event, data = {}) {
    // برای آنالیتیکس یا ذخیره آمار استفاده
    const usageData = {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.log("Usage tracked:", usageData);

    // در نسخه واقعی می‌توانید به سرور ارسال کنید
    // this.storageService.saveSetting('usage_stats', usageData);
  }

  showError(message) {
    // نمایش خطا به کاربر
    alert(`خطا: ${message}`);
  }

  showFatalError(message) {
    // نمایش خطای بحرانی
    const errorHtml = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
        text-align: center;
      ">
        <div>
          <h2>خطا در راه‌اندازی برنامه</h2>
          <p>${message}</p>
          <button onclick="window.location.reload()" style="
            padding: 10px 20px;
            background: #0079d3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
          ">
            بارگذاری مجدد
          </button>
        </div>
      </div>
    `;

    document.body.innerHTML = errorHtml;
  }

  // متدهای utility برای توسعه و دیباگ
  getStats() {
    return {
      laneCount: this.laneManager.getLaneCount(),
      subreddits: this.laneManager.getLaneNames(),
      storageUsage: this.getStorageUsage(),
    };
  }

  getStorageUsage() {
    try {
      const lanesData = localStorage.getItem("reddit-client-lanes");
      return {
        lanesSize: lanesData ? new Blob([lanesData]).size : 0,
        totalSize: JSON.stringify(localStorage).length,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // برای توسعه: ریست برنامه
  reset() {
    if (
      confirm(
        "آیا از ریست کردن کامل برنامه مطمئن هستید؟ تمام داده‌ها پاک خواهند شد!"
      )
    ) {
      this.laneManager.clearAllLanes();
      this.storageService.clearLanes();
      window.location.reload();
    }
  }

  // برای توسعه: اضافه کردن لاین تست
  async addTestLane() {
    const testSubreddits = ["javascript", "reactjs", "webdev"];
    const randomSub =
      testSubreddits[Math.floor(Math.random() * testSubreddits.length)];

    try {
      await this.appView.handleAddLane(randomSub);
    } catch (error) {
      console.error("Test lane failed:", error);
    }
  }
}

// راه‌اندازی برنامه وقتی DOM آماده شد
document.addEventListener("DOMContentLoaded", () => {
  window.redditClient = new RedditClient();

  // در معرض گذاری برای دیباگ (در production حذف شود)
  if (process.env.NODE_ENV === "development") {
    window.RedditClient = RedditClient;
  }
});

// مدیریت رویداد beforeunload برای ذخیره وضعیت
window.addEventListener("beforeunload", () => {
  if (window.redditClient && window.redditClient.laneManager) {
    window.redditClient.laneManager.saveLanesToStorage();
  }
});
