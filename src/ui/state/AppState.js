import { Observable } from "../components/base/Observable.js";

export class AppState {
  constructor() {
    this.lanes = new Observable([]);
    this.loading = new Observable(false);
    this.error = new Observable(null);
    this.searchQuery = new Observable("");
    this.view = new Observable("dashboard"); // 'dashboard', 'error'

    // UI state
    this.compactView = new Observable(false);
    this.autoRefresh = new Observable(false);
    this.refreshInterval = new Observable(300000); // 5 minutes

    // Flag برای جلوگیری از آپدیت‌های تکراری
    this._isUpdating = false;
  }

  // Lanes management - با مقایسه عمیق
  setLanes(lanes) {
    if (this._areLanesEqual(this.lanes.value, lanes)) {
      return;
    }
    this.lanes.value = lanes;
  }

  addLane(lane) {
    const currentLanes = this.lanes.value;

    // جلوگیری از اضافه کردن لین تکراری
    if (
      currentLanes.some(
        (l) =>
          l.id === lane.id ||
          l.subreddit.toLowerCase() === lane.subreddit.toLowerCase()
      )
    ) {
      return;
    }

    this.lanes.value = [...currentLanes, lane];
  }

  removeLane(laneId) {
    const currentLanes = this.lanes.value;
    const newLanes = currentLanes.filter((lane) => lane.id !== laneId);

    if (newLanes.length !== currentLanes.length) {
      this.lanes.value = newLanes;
    }
  }

  updateLane(updatedLane) {
    // جلوگیری از آپدیت‌های تکراری
    if (this._isUpdating) {
      return;
    }

    this._isUpdating = true;

    try {
      const currentLanes = this.lanes.value;
      const index = currentLanes.findIndex(
        (lane) => lane.id === updatedLane.id
      );

      if (index !== -1) {
        // بررسی آیا lane واقعاً تغییر کرده است
        if (!this._isLaneEqual(currentLanes[index], updatedLane)) {
          const newLanes = [...currentLanes];
          newLanes[index] = updatedLane;
          this.lanes.value = newLanes;
        }
      }
    } finally {
      this._isUpdating = false;
    }
  }

  getLane(laneId) {
    return this.lanes.value.find((lane) => lane.id === laneId);
  }

  laneExists(subreddit) {
    return this.lanes.value.some(
      (lane) => lane.subreddit.toLowerCase() === subreddit.toLowerCase()
    );
  }

  // Loading state
  setLoading(loading) {
    if (this.loading.value !== loading) {
      this.loading.value = loading;
    }
  }

  setLaneLoading(laneId, loading) {
    const lane = this.getLane(laneId);
    if (lane && lane.isLoading !== loading) {
      lane.setLoading(loading);
      this.updateLane(lane);
    }
  }

  // Error state
  setError(error) {
    if (this.error.value !== error) {
      this.error.value = error;
      if (error) {
        this.view.value = "error";
      }
    }
  }

  clearError() {
    if (this.error.value !== null) {
      this.error.value = null;
      this.view.value = "dashboard";
    }
  }

  // Search state
  setSearchQuery(query) {
    if (this.searchQuery.value !== query) {
      this.searchQuery.value = query;
    }
  }

  clearSearch() {
    if (this.searchQuery.value !== "") {
      this.searchQuery.value = "";
    }
  }

  // View state
  setView(view) {
    if (this.view.value !== view) {
      this.view.value = view;
    }
  }

  showDashboard() {
    if (this.view.value !== "dashboard" || this.error.value !== null) {
      this.view.value = "dashboard";
      this.clearError();
    }
  }

  showError(error) {
    if (this.view.value !== "error" || this.error.value !== error) {
      this.error.value = error;
      this.view.value = "error";
    }
  }

  // UI preferences
  toggleCompactView() {
    this.compactView.value = !this.compactView.value;
  }

  setCompactView(compact) {
    if (this.compactView.value !== compact) {
      this.compactView.value = compact;
    }
  }

  toggleAutoRefresh() {
    this.autoRefresh.value = !this.autoRefresh.value;
  }

  setAutoRefresh(autoRefresh) {
    if (this.autoRefresh.value !== autoRefresh) {
      this.autoRefresh.value = autoRefresh;
    }
  }

  setRefreshInterval(interval) {
    if (this.refreshInterval.value !== interval) {
      this.refreshInterval.value = interval;
    }
  }

  // Utility methods
  getLaneCount() {
    return this.lanes.value.length;
  }

  getTotalPostCount() {
    return this.lanes.value.reduce(
      (total, lane) => total + (lane.posts ? lane.posts.length : 0),
      0
    );
  }

  isEmpty() {
    return this.getLaneCount() === 0;
  }

  // توابع کمکی برای مقایسه عمیق
  _areLanesEqual(oldLanes, newLanes) {
    if (oldLanes === newLanes) return true;
    if (!oldLanes || !newLanes) return false;
    if (oldLanes.length !== newLanes.length) return false;

    return oldLanes.every((lane, index) =>
      this._isLaneEqual(lane, newLanes[index])
    );
  }

  _isLaneEqual(lane1, lane2) {
    if (lane1 === lane2) return true;
    if (!lane1 || !lane2) return false;

    return (
      lane1.id === lane2.id &&
      lane1.subreddit === lane2.subreddit &&
      lane1.isLoading === lane2.isLoading &&
      lane1.error === lane2.error &&
      this._arePostsEqual(lane1.posts, lane2.posts)
    );
  }

  _arePostsEqual(oldPosts, newPosts) {
    if (oldPosts === newPosts) return true;
    if (!oldPosts || !newPosts) return false;
    if (oldPosts.length !== newPosts.length) return false;

    return oldPosts.every((post, index) => {
      const newPost = newPosts[index];
      return (
        post.id === newPost.id &&
        post.title === newPost.title &&
        post.score === newPost.score &&
        post.author === newPost.author
      );
    });
  }

  // Persistence
  toJSON() {
    return {
      lanes: this.lanes.value,
      compactView: this.compactView.value,
      autoRefresh: this.autoRefresh.value,
      refreshInterval: this.refreshInterval.value,
    };
  }

  fromJSON(data) {
    if (data.lanes && !this._areLanesEqual(this.lanes.value, data.lanes)) {
      this.lanes.value = data.lanes;
    }
    if (
      data.compactView !== undefined &&
      this.compactView.value !== data.compactView
    ) {
      this.compactView.value = data.compactView;
    }
    if (
      data.autoRefresh !== undefined &&
      this.autoRefresh.value !== data.autoRefresh
    ) {
      this.autoRefresh.value = data.autoRefresh;
    }
    if (
      data.refreshInterval !== undefined &&
      this.refreshInterval.value !== data.refreshInterval
    ) {
      this.refreshInterval.value = data.refreshInterval;
    }
  }

  destroy() {
    // پاک کردن listeners قبل از نابودی
    if (this.lanes && this.lanes.unsubscribeAll) this.lanes.unsubscribeAll();
    if (this.loading && this.loading.unsubscribeAll)
      this.loading.unsubscribeAll();
    if (this.error && this.error.unsubscribeAll) this.error.unsubscribeAll();
    if (this.searchQuery && this.searchQuery.unsubscribeAll)
      this.searchQuery.unsubscribeAll();
    if (this.view && this.view.unsubscribeAll) this.view.unsubscribeAll();
    if (this.compactView && this.compactView.unsubscribeAll)
      this.compactView.unsubscribeAll();
    if (this.autoRefresh && this.autoRefresh.unsubscribeAll)
      this.autoRefresh.unsubscribeAll();
    if (this.refreshInterval && this.refreshInterval.unsubscribeAll)
      this.refreshInterval.unsubscribeAll();

    this.lanes = null;
    this.loading = null;
    this.error = null;
    this.searchQuery = null;
    this.view = null;
    this.compactView = null;
    this.autoRefresh = null;
    this.refreshInterval = null;
  }
}
