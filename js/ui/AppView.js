import { InputComponent } from "./components/InputComponent.js";
import { LaneView } from "./LaneView.js";
import { Validator } from "../utils/Validator.js";

// Single Responsibility: مدیریت رابط کاربری اصلی برنامه
export class AppView {
  constructor(container, laneManager, onLaneAdded) {
    this.container = container;
    this.laneManager = laneManager;
    this.onLaneAdded = onLaneAdded;
    this.laneViews = new Map();
    this.inputComponent = null;

    this.init();
  }

  init() {
    this.createInputComponent();
    this.setupGlobalEvents();
    this.loadSavedLanes();
  }

  createInputComponent() {
    try {
      this.inputComponent = new InputComponent("subredditInput", "addLaneBtn");

      this.inputComponent.setValidationCallback((isValid, value) => {
        this.handleInputValidation(isValid, value);
      });

      this.inputComponent.setSubmitCallback((value) => {
        this.handleAddLane(value);
      });
    } catch (error) {
      console.error("Error initializing input component:", error);
    }
  }

  setupGlobalEvents() {
    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => this.handleClearAll());
    }

    // مدیریت خطاهای全局
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
    });
  }

  handleInputValidation(isValid, value) {
    // میتوانید برای نمایش وضعیت اعتبارسنجی از این متد استفاده کنید
    if (isValid && this.laneManager.hasLane(value)) {
      this.inputComponent.showError("این subreddit قبلاً اضافه شده است!");
      this.inputComponent.updateValidationState(false);
    }
  }

  async handleAddLane(subredditName) {
    if (this.laneManager.hasLane(subredditName)) {
      alert("این subreddit قبلاً اضافه شده است!");
      return;
    }

    this.inputComponent.setLoading(true);

    try {
      const lane = await this.laneManager.addLane(subredditName);
      this.renderLane(lane);

      this.inputComponent.clear();
      this.onLaneAdded?.(subredditName);

      this.showSuccessMessage(`لاین "r/${subredditName}" با موفقیت اضافه شد`);
    } catch (error) {
      this.handleAddLaneError(error, subredditName);
    } finally {
      this.inputComponent.setLoading(false);
    }
  }

  renderLane(lane) {
    const laneView = new LaneView(
      this.container,
      lane,
      (subredditName) => this.handleLaneDelete(subredditName),
      (subredditName) => this.handleLaneRefresh(subredditName)
    );

    this.laneViews.set(lane.name, laneView);
  }

  async handleLaneRefresh(subredditName) {
    const laneView = this.laneViews.get(subredditName);
    if (!laneView) return;

    laneView.setLoading(true);

    try {
      await this.laneManager.refreshLane(subredditName);
      const updatedLane = this.laneManager.getLane(subredditName);
      laneView.update(updatedLane);

      this.showSuccessMessage(`پست‌های "r/${subredditName}" بروزرسانی شد`);
    } catch (error) {
      this.handleRefreshError(error, subredditName);
    }
  }

  handleLaneDelete(subredditName) {
    const removed = this.laneManager.removeLane(subredditName);
    if (removed) {
      this.laneViews.delete(subredditName);
      this.showSuccessMessage(`لاین "r/${subredditName}" حذف شد`);
    }
  }

  handleClearAll() {
    if (this.laneManager.getLaneCount() === 0) {
      alert("هیچ لاینی برای حذف وجود ندارد!");
      return;
    }

    if (
      confirm("آیا از حذف همه لاین‌ها مطمئن هستید؟ این عمل قابل بازگشت نیست!")
    ) {
      this.laneManager.clearAllLanes();
      this.laneViews.clear();
      this.container.innerHTML = "";
      this.showSuccessMessage("همه لاین‌ها حذف شدند");
    }
  }

  async loadSavedLanes() {
    if (this.laneManager.getLaneCount() > 0) return;

    try {
      await this.laneManager.loadLanesFromStorage();
      const lanes = this.laneManager.getAllLanes();

      lanes.forEach((lane) => {
        this.renderLane(lane);
      });

      if (lanes.length > 0) {
        console.log(`${lanes.length} لاین از ذخیره‌سازی بارگذاری شد`);
      }
    } catch (error) {
      console.error("Error loading saved lanes:", error);
    }
  }

  handleAddLaneError(error, subredditName) {
    let errorMessage = "خطای ناشناخته در اضافه کردن لاین";

    if (error.message.includes("not found") || error.message.includes("404")) {
      errorMessage = `subreddit "r/${subredditName}" یافت نشد!`;
    } else if (
      error.message.includes("private") ||
      error.message.includes("403")
    ) {
      errorMessage = `subreddit "r/${subredditName}" خصوصی است!`;
    } else if (
      error.message.includes("rate limit") ||
      error.message.includes("429")
    ) {
      errorMessage = "محدودیت درخواست! لطفاً چند لحظه صبر کنید.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("fetch")
    ) {
      errorMessage = "خطای شبکه! اتصال اینترنت را بررسی کنید.";
    } else {
      errorMessage = error.message;
    }

    alert(errorMessage);
  }

  handleRefreshError(error, subredditName) {
    let errorMessage = "خطا در بروزرسانی پست‌ها";

    if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage = "خطای شبکه در بروزرسانی!";
    } else {
      errorMessage = error.message;
    }

    alert(errorMessage);
  }

  showSuccessMessage(message) {
    // میتوانید برای نمایش پیام موفقیت از toast استفاده کنید
    console.log("Success:", message);

    // نمایش موقت در console - در نسخه واقعی می‌توانید toast library استفاده کنید
    const successElement = document.createElement("div");
    successElement.className = "success-message";
    successElement.textContent = message;
    successElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
    `;

    document.body.appendChild(successElement);

    setTimeout(() => {
      if (successElement.parentNode) {
        successElement.remove();
      }
    }, 3000);
  }

  getLaneCount() {
    return this.laneViews.size;
  }

  destroy() {
    if (this.inputComponent) {
      this.inputComponent.destroy();
    }

    this.laneViews.forEach((laneView) => {
      laneView.remove();
    });

    this.laneViews.clear();
  }
}
