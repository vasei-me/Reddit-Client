import { Component } from "../base/Component.js";
import { LaneComponent } from "./LaneComponent.js";

export class LaneListComponent extends Component {
  constructor(lanes = [], options = {}) {
    super();
    this.lanes = lanes;
    this.options = {
      onRefreshLane: null,
      onRemoveLane: null,
      compact: false,
      ...options,
    };
    this.laneComponents = new Map();
    this._isRendering = false; // Flag برای جلوگیری از رندر تکراری
    this.createElement();
    this.render();
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.className = "lane-list";
  }

  render() {
    // جلوگیری از رندر تکراری
    if (this._isRendering) {
      return;
    }

    this._isRendering = true;

    try {
      this.element.innerHTML = "";
      this.laneComponents.clear();

      if (this.lanes.length === 0) {
        this.element.innerHTML = `
          <div class="lane-list-empty">
            <p>No lanes yet. Add a subreddit to get started!</p>
          </div>
        `;
        return;
      }

      // Create lane components for each lane
      this.lanes.forEach((lane) => {
        const laneComponent = new LaneComponent(lane, {
          onRefresh: this.options.onRefreshLane,
          onRemove: this.options.onRemoveLane,
          compact: this.options.compact,
        });

        laneComponent.on("refresh", (laneId) => {
          this.emit("refreshLane", laneId);
        });

        laneComponent.on("remove", (laneId) => {
          this.emit("removeLane", laneId);
        });

        laneComponent.on("postClick", (data) => {
          this.emit("postClick", data);
        });

        this.laneComponents.set(lane.id, laneComponent);
        this.addChild(laneComponent);
      });
    } finally {
      this._isRendering = false;
    }
  }

  updateLanes(newLanes, options = {}) {
    // مقایسه برای جلوگیری از آپدیت بی‌جهت
    if (this._areLanesEqual(this.lanes, newLanes)) {
      return;
    }

    this.lanes = newLanes;
    this.options = { ...this.options, ...options };
    this.render();
  }

  addLane(lane) {
    // بررسی وجود لین تکراری
    if (
      this.lanes.find((l) => l.id === lane.id || l.subreddit === lane.subreddit)
    ) {
      return;
    }

    this.lanes.push(lane);
    this.render();
    this.scrollToLastLane();
  }

  removeLane(laneId) {
    this.lanes = this.lanes.filter((lane) => lane.id !== laneId);

    const laneComponent = this.laneComponents.get(laneId);
    if (laneComponent) {
      laneComponent.destroy();
      this.laneComponents.delete(laneId);
    }

    this.render();
  }

  updateLane(updatedLane) {
    const index = this.lanes.findIndex((lane) => lane.id === updatedLane.id);
    if (index !== -1) {
      // فقط اگر واقعاً تغییر کرده باشد آپدیت کن
      if (!this.lanes[index].equals(updatedLane)) {
        this.lanes[index] = updatedLane;

        const laneComponent = this.laneComponents.get(updatedLane.id);
        if (laneComponent) {
          laneComponent.updateLane(updatedLane);
        }
      }
    }
  }

  scrollToLastLane() {
    setTimeout(() => {
      if (this.element) {
        this.element.scrollLeft = this.element.scrollWidth;
      }
    }, 100);
  }

  // تابع کمکی برای مقایسه عمیق آرایه‌های Lane
  _areLanesEqual(oldLanes, newLanes) {
    if (oldLanes === newLanes) return true;
    if (!oldLanes || !newLanes) return false;
    if (oldLanes.length !== newLanes.length) return false;

    return oldLanes.every((lane, index) => {
      const newLane = newLanes[index];
      return lane.equals(newLane);
    });
  }

  // Filter and search methods
  filterBySubreddit(subreddit) {
    const filteredLanes = this.lanes.filter((lane) =>
      lane.subreddit.toLowerCase().includes(subreddit.toLowerCase())
    );
    this.updateLanes(filteredLanes);
  }

  searchPostsInAllLanes(query) {
    this.laneComponents.forEach((laneComponent) => {
      const postList = laneComponent.postListComponent;
      if (postList) {
        postList.searchPosts(query);
      }
    });
  }

  clearSearch() {
    this.laneComponents.forEach((laneComponent) => {
      const postList = laneComponent.postListComponent;
      if (postList) {
        postList.clearFilter();
      }
    });
  }

  // Utility methods
  getLaneCount() {
    return this.lanes.length;
  }

  getLaneComponent(laneId) {
    return this.laneComponents.get(laneId);
  }

  highlightLane(laneId) {
    const laneComponent = this.getLaneComponent(laneId);
    if (laneComponent) {
      laneComponent.highlight();
    }
  }

  setCompact(compact) {
    this.options.compact = compact;
    this.laneComponents.forEach((component) => {
      component.setCompact(compact);
    });
  }

  destroy() {
    this.laneComponents.forEach((component) => component.destroy());
    this.laneComponents.clear();
    super.destroy();
  }
}
