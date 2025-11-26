import { LaneRepository } from "./core/repositories/LaneRepository.js";
import { PostRepository } from "./core/repositories/PostRepository.js";
import { AddLaneUseCase } from "./core/use-cases/lanes/AddLaneUseCase.js";
import { RefreshLaneUseCase } from "./core/use-cases/lanes/RefreshLaneUseCase.js";
import { RemoveLaneUseCase } from "./core/use-cases/lanes/RemoveLaneUseCase.js";
import { FetchPostsUseCase } from "./core/use-cases/posts/FetchPostsUseCase.js";
import { ValidateSubredditUseCase } from "./core/use-cases/posts/ValidateSubredditUseCase.js";
import { RedditHttpClient } from "./infrastructure/http/RedditHttpClient.js";
import { LocalStorageService } from "./infrastructure/storage/LocalStorageService.js";
import { SubredditValidator } from "./infrastructure/validators/SubredditValidator.js";
import { AppState } from "./ui/state/AppState.js";
import { PostState } from "./ui/state/PostState.js";
import { DashboardView } from "./ui/views/DashboardView.js";

class RedditClientApp {
  constructor() {
    console.log("🚀 RedditClientApp initializing...");

    try {
      this.appState = new AppState();
      this.postState = new PostState();
      this.currentView = null;
      this.autoRefreshTimer = null;

      this.initializeDependencies();
      this.initializeApp();
    } catch (error) {
      console.error("❌ Failed to construct RedditClientApp:", error);
      this.showFatalError(error);
    }
  }

  initializeDependencies() {
    try {
      console.log("📦 Initializing dependencies...");

      this.storageService = new LocalStorageService();
      this.httpClient = new RedditHttpClient();
      this.validator = new SubredditValidator();

      this.laneRepository = new LaneRepository(this.storageService);
      this.postRepository = new PostRepository(this.httpClient);

      this.addLaneUseCase = new AddLaneUseCase(
        this.laneRepository,
        this.postRepository,
        this.validator
      );

      this.removeLaneUseCase = new RemoveLaneUseCase(this.laneRepository);
      this.refreshLaneUseCase = new RefreshLaneUseCase(
        this.laneRepository,
        this.postRepository
      );

      this.fetchPostsUseCase = new FetchPostsUseCase(this.postRepository);
      this.validateSubredditUseCase = new ValidateSubredditUseCase(
        this.postRepository,
        this.validator
      );

      console.log("✅ Dependencies initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize dependencies:", error);
      this.showFatalError(error);
    }
  }

  async initializeApp() {
    try {
      console.log("🎯 Starting app initialization...");

      await this.loadInitialState();
      this.initializeUI();
      this.setupAutoRefresh();
      this.setupErrorHandling();
      this.setupGlobalEventHandlers();

      console.log("🎉 Reddit Client App initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize app:", error);
      this.showFatalError(error);
    }
  }

  async loadInitialState() {
    try {
      console.log("💾 Loading initial state from storage...");

      const lanes = await this.laneRepository.getAll();
      if (lanes && Array.isArray(lanes)) {
        this.appState.setLanes(lanes);
        console.log(`✅ Loaded ${lanes.length} lanes from storage`);
      } else {
        this.appState.setLanes([]);
        console.log("✅ No lanes found, starting with empty state");
      }

      try {
        const preferences = await this.storageService.getItem(
          "app_preferences"
        );
        if (preferences) {
          this.appState.fromJSON(preferences);
        }
      } catch (prefError) {
        console.warn("⚠️ Could not load preferences:", prefError);
      }

      try {
        const postStateData = await this.storageService.getItem("post_state");
        if (postStateData) {
          this.postState.fromJSON(postStateData);
        }
      } catch (postError) {
        console.warn("⚠️ Could not load post state:", postError);
      }
    } catch (error) {
      console.error("⚠️ Failed to load initial state:", error);
      this.appState.setLanes([]);
    }
  }

  initializeUI() {
    try {
      const appContainer = document.getElementById("app");
      const loadingElement = document.querySelector(".app-loading");

      if (!appContainer) {
        throw new Error("App container element (#app) not found");
      }

      if (loadingElement) {
        loadingElement.style.display = "none";
      }

      const handlers = {
        onAddLane: (subreddit) => this.handleAddLane(subreddit),
        onRefreshLane: (laneId) => this.handleRefreshLane(laneId),
        onRemoveLane: (laneId) => this.handleRemoveLane(laneId),
        onPostClick: (data) => this.handlePostClick(data),
      };

      this.dashboardView = new DashboardView(this.appState, handlers);

      appContainer.appendChild(this.dashboardView.element);
      this.currentView = this.dashboardView;

      this.setupStateSubscriptions();

      console.log("✅ UI initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize UI:", error);
      throw error;
    }
  }

  setupGlobalEventHandlers() {
    document.addEventListener("keypress", (event) => {
      if (event.target.id === "subredditInput" && event.key === "Enter") {
        this.handleAddLaneFromInput();
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("quick-add-btn")) {
        const subreddit = event.target.dataset.subreddit;
        if (subreddit) {
          this.handleAddLane(subreddit);
        }
      }
    });
  }

  handleAddLaneFromInput() {
    const input = document.getElementById("subredditInput");
    if (input) {
      const subreddit = input.value.trim().replace("r/", "");
      if (subreddit) {
        this.handleAddLane(subreddit);
        input.value = "";
      } else {
        this.showNotification("Please enter a subreddit name", "error");
      }
    }
  }

  setupStateSubscriptions() {
    try {
      if (
        this.appState.lanes &&
        typeof this.appState.lanes.subscribe === "function"
      ) {
        this.appState.lanes.subscribe((lanes) => {
          if (this.dashboardView) {
            this.dashboardView.updateLanes(lanes);
          }
          this.saveAppState();
        });
      }

      if (
        this.appState.compactView &&
        typeof this.appState.compactView.subscribe === "function"
      ) {
        this.appState.compactView.subscribe(() => this.saveAppState());
      }

      if (
        this.appState.autoRefresh &&
        typeof this.appState.autoRefresh.subscribe === "function"
      ) {
        this.appState.autoRefresh.subscribe((autoRefresh) => {
          if (autoRefresh) {
            this.startAutoRefresh();
          } else {
            this.stopAutoRefresh();
          }
          this.saveAppState();
        });
      }

      if (
        this.postState.favoritePosts &&
        typeof this.postState.favoritePosts.subscribe === "function"
      ) {
        this.postState.favoritePosts.subscribe(() => this.savePostState());
      }

      if (
        this.postState.viewedPosts &&
        typeof this.postState.viewedPosts.subscribe === "function"
      ) {
        this.postState.viewedPosts.subscribe(() => this.savePostState());
      }

      if (
        this.postState.hiddenPosts &&
        typeof this.postState.hiddenPosts.subscribe === "function"
      ) {
        this.postState.hiddenPosts.subscribe(() => this.savePostState());
      }

      console.log("✅ State subscriptions set up");
    } catch (error) {
      console.error("❌ Failed to setup state subscriptions:", error);
    }
  }

  async handleAddLane(subreddit) {
    try {
      this.appState.setLoading(true);

      const currentLanes = this.appState.lanes?.value || [];
      const existingSubreddits = currentLanes.map((lane) => lane.subreddit);

      const validationResult = await this.validateSubredditUseCase.execute(
        subreddit,
        existingSubreddits
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.error || "Cannot add this subreddit");
      }

      const result = await this.addLaneUseCase.execute(subreddit);
      this.appState.addLane(result.lane);

      this.appState.setLoading(false);
      this.showNotification(`✅ Added r/${subreddit} successfully!`, "success");
      return result;
    } catch (error) {
      this.appState.setLoading(false);
      this.showNotification(`❌ ${error.message}`, "error");
      throw error;
    }
  }

  async handleRemoveLane(laneId) {
    try {
      await this.removeLaneUseCase.execute(laneId);
      this.appState.removeLane(laneId);
      this.showNotification("🗑️ Lane removed successfully", "success");
    } catch (error) {
      this.showNotification(`❌ ${error.message}`, "error");
    }
  }

  async handleRefreshLane(laneId) {
    try {
      this.appState.setLaneLoading(laneId, true);

      const result = await this.refreshLaneUseCase.execute(laneId);
      this.appState.updateLane(result.lane);

      this.appState.setLaneLoading(laneId, false);
      this.showNotification(
        `🔄 Refreshed r/${result.lane.subreddit}`,
        "success"
      );
    } catch (error) {
      this.appState.setLaneLoading(laneId, false);

      const lane = this.appState.getLane(laneId);
      if (lane) {
        lane.setError(error.message);
        this.appState.updateLane(lane);
      }

      this.showNotification(`❌ Failed to refresh: ${error.message}`, "error");
    }
  }

  async handleRefreshAll() {
    const lanes = this.appState.lanes?.value || [];

    if (lanes.length === 0) {
      this.showNotification("ℹ️ No lanes to refresh", "warning");
      return;
    }

    this.appState.setLoading(true);
    this.showNotification("🔄 Refreshing all lanes...", "info");

    try {
      const refreshPromises = lanes.map((lane) =>
        this.refreshLaneUseCase.execute(lane.id)
      );

      const results = await Promise.allSettled(refreshPromises);

      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          this.appState.updateLane(result.value.lane);
          successCount++;
        } else {
          errorCount++;
          console.error(
            `Failed to refresh lane ${lanes[index].subreddit}:`,
            result.reason
          );
        }
      });

      this.appState.setLoading(false);

      if (errorCount === 0) {
        this.showNotification(
          `✅ Successfully refreshed ${successCount} lanes`,
          "success"
        );
      } else {
        this.showNotification(
          `⚠️ Refreshed ${successCount} lanes, ${errorCount} failed`,
          "warning"
        );
      }
    } catch (error) {
      this.appState.setLoading(false);
      this.showNotification("❌ Failed to refresh lanes", "error");
    }
  }

  async handleClearAll() {
    try {
      await this.laneRepository.clear();
      this.appState.setLanes([]);
      this.showNotification("🗑️ All lanes cleared", "success");
    } catch (error) {
      this.showNotification("❌ Failed to clear lanes", "error");
    }
  }

  handlePostClick(post) {
    if (this.postState) {
      this.postState.setSelectedPost(post);
      this.postState.markAsViewed(post.id);
    }
  }

  setupAutoRefresh() {
    if (this.appState.autoRefresh?.value) {
      this.startAutoRefresh();
    }
  }

  startAutoRefresh() {
    this.stopAutoRefresh();

    const interval = this.appState.refreshInterval?.value || 300000;
    this.autoRefreshTimer = setInterval(() => {
      if (this.appState.getLaneCount() > 0) {
        this.handleRefreshAll();
      }
    }, interval);

    console.log(`🔄 Auto-refresh started with ${interval}ms interval`);
  }

  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }

  async saveAppState() {
    try {
      await this.storageService.setItem(
        "app_preferences",
        this.appState.toJSON()
      );
    } catch (error) {
      console.error("Failed to save app state:", error);
    }
  }

  async savePostState() {
    try {
      await this.storageService.setItem("post_state", this.postState.toJSON());
    } catch (error) {
      console.error("Failed to save post state:", error);
    }
  }

  showNotification(message, type = "info", duration = 3000) {
    try {
      const notification = document.createElement("div");
      notification.className = `notification notification--${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <span class="notification-message">${message}</span>
          <button class="notification-close">&times;</button>
        </div>
      `;

      const closeButton = notification.querySelector(".notification-close");
      if (closeButton) {
        closeButton.onclick = () => {
          if (notification.parentNode) {
            notification.remove();
          }
        };
      }

      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);

      this.ensureNotificationStyles();
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  ensureNotificationStyles() {
    if (document.getElementById("notification-styles")) return;

    const styles = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        max-width: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        border-left: 4px solid #3498db;
        animation: slideInRight 0.3s ease-out;
        border: 1px solid #e1e1e1;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .notification--success { border-left-color: #27ae60; }
      .notification--error { border-left-color: #e74c3c; }
      .notification--warning { border-left-color: #f39c12; }
      .notification--info { border-left-color: #3498db; }
      .notification-content {
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .notification-message {
        flex: 1;
        color: #2c3e50;
        font-size: 14px;
        line-height: 1.4;
      }
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        color: #7f8c8d;
        transition: color 0.2s;
        flex-shrink: 0;
        line-height: 1;
      }
      .notification-close:hover {
        color: #2c3e50;
      }
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .quick-add-buttons {
        display: flex;
        gap: 8px;
        margin: 15px 0;
        flex-wrap: wrap;
      }
      .quick-add-btn {
        background: #ff4500;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      }
      .quick-add-btn:hover {
        background: #e03d00;
      }
      .post-link {
        color: #ff4500;
        text-decoration: none;
      }
      .post-link:hover {
        text-decoration: underline;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.id = "notification-styles";
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  showFatalError(error) {
    console.error("💥 Fatal error:", error);

    const appContainer = document.getElementById("app");
    const loadingElement = document.querySelector(".app-loading");

    if (loadingElement) {
      loadingElement.style.display = "none";
    }

    if (appContainer) {
      appContainer.innerHTML = `
        <div class="error-view" style="display: flex; justify-content: center; align-items: center; min-height: 400px; padding: 40px 20px; background: #f8f9fa;">
          <div class="error-content" style="text-align: center; max-width: 500px; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <div class="error-icon" style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h1 class="error-title" style="color: #2c3e50; margin-bottom: 15px;">Application Error</h1>
            <p class="error-message" style="color: #7f8c8d; margin-bottom: 25px; line-height: 1.5;">${error.message}</p>
            <div class="error-actions">
              <button onclick="window.location.reload()" style="background: #ff4500; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                Reload Page
              </button>
            </div>
            <details class="error-details" style="margin-top: 20px; text-align: left;">
              <summary style="cursor: pointer; color: #7f8c8d; margin-bottom: 10px;">Technical Details</summary>
              <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow: auto; font-size: 12px; color: #2c3e50; border: 1px solid #e1e1e1;">${error.stack}</pre>
            </details>
          </div>
        </div>
      `;
    }
  }

  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this.showNotification("❌ An unexpected error occurred", "error");
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showNotification("❌ An unexpected error occurred", "error");
      event.preventDefault();
    });
  }

  getAppState() {
    return this.appState;
  }

  getPostState() {
    return this.postState;
  }

  getLaneCount() {
    return this.appState.getLaneCount();
  }

  getTotalPostCount() {
    return this.appState.getTotalPostCount();
  }

  async addSuggestedSubreddits() {
    const suggested = [
      "programming",
      "javascript",
      "reactjs",
      "webdev",
      "python",
    ];

    for (const subreddit of suggested) {
      try {
        await this.handleAddLane(subreddit);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to add r/${subreddit}:`, error.message);
      }
    }
  }

  destroy() {
    this.stopAutoRefresh();

    if (this.dashboardView) {
      this.dashboardView.destroy();
    }

    if (this.appState) {
      this.appState.destroy();
    }

    if (this.postState) {
      this.postState.destroy();
    }

    console.log("Reddit Client App destroyed");
  }
}

window.runAppTests = async function () {
  console.group("🧪 Running App Tests");

  try {
    const app = window.redditApp;

    if (!app) {
      console.error("❌ App not initialized");
      return;
    }

    console.log("📊 App State:", app.getAppState());
    console.log("➕ Adding test lane...");

    try {
      await app.handleAddLane("javascript");
      console.log("✅ Test lane added successfully");
    } catch (error) {
      console.warn("⚠️ Could not add test lane:", error.message);
    }

    console.log("📈 Lane count:", app.getLaneCount());
    app.showNotification("✅ Test notification works!", "success");

    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  console.groupEnd();
};

window.addSampleData = async function () {
  const app = window.redditApp;
  if (!app) {
    console.error("App not initialized");
    return;
  }

  await app.addSuggestedSubreddits();
};

function initializeApp() {
  try {
    console.log("📄 DOM loaded, starting app...");
    window.redditApp = new RedditClientApp();
    console.log("🎊 App ready! Use window.redditApp to access app methods.");
    console.log("💡 Try: window.runAppTests() to run basic tests");
    console.log("💡 Try: window.addSampleData() to add sample subreddits");
  } catch (error) {
    console.error("💥 Failed to initialize app:", error);

    const appContainer = document.getElementById("app");
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="error-view" style="display: flex; justify-content: center; align-items: center; min-height: 400px; padding: 40px 20px; background: #f8f9fa;">
          <div class="error-content" style="text-align: center; max-width: 500px; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <div class="error-icon" style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h1 class="error-title" style="color: #2c3e50; margin-bottom: 15px;">Failed to Initialize App</h1>
            <p class="error-message" style="color: #7f8c8d; margin-bottom: 25px; line-height: 1.5;">${error.message}</p>
            <div class="error-actions">
              <button onclick="window.location.reload()" style="background: #ff4500; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                Reload Page
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

window.RedditClientApp = RedditClientApp;

console.log("📝 main.js loaded successfully");
