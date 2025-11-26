import { ButtonComponent } from "../components/common/ButtonComponent.js";
import { BaseView } from "./BaseView.js";

export class ErrorView extends BaseView {
  constructor(error, options = {}) {
    super();
    this.error = error;
    this.options = {
      showRetry: false,
      onRetry: null,
      onGoHome: null,
      ...options,
    };
    this.createElement();
    this.initialize();
  }

  createElement() {
    this.element = this.createElement("div", "error-view");
  }

  initialize() {
    this.element.innerHTML = `
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h1 class="error-title">Something went wrong</h1>
        <div class="error-message">
          ${this.getErrorMessage()}
        </div>
        <div class="error-actions">
          <!-- Actions will be added here -->
        </div>
        <div class="error-details">
          <details>
            <summary>Technical Details</summary>
            <pre class="error-stack">${this.getErrorStack()}</pre>
          </details>
        </div>
      </div>
    `;

    this.initializeActions();
    super.initialize();
  }

  initializeActions() {
    const actionsContainer = this.element.querySelector(".error-actions");

    // Home button
    const homeButton = new ButtonComponent({
      text: "Go Home",
      variant: "primary",
      onClick: () => this.handleGoHome(),
    });

    actionsContainer.appendChild(homeButton.element);

    // Retry button (if applicable)
    if (this.options.showRetry) {
      const retryButton = new ButtonComponent({
        text: "Try Again",
        variant: "secondary",
        onClick: () => this.handleRetry(),
      });
      actionsContainer.appendChild(retryButton.element);
    }

    // Reload button
    const reloadButton = new ButtonComponent({
      text: "Reload Page",
      variant: "outline",
      onClick: () => window.location.reload(),
    });
    actionsContainer.appendChild(reloadButton.element);
  }

  getErrorMessage() {
    if (typeof this.error === "string") {
      return this.error;
    }

    if (this.error.message) {
      return this.error.message;
    }

    return "An unexpected error occurred. Please try again later.";
  }

  getErrorStack() {
    if (typeof this.error === "string") {
      return this.error;
    }

    if (this.error.stack) {
      return this.error.stack;
    }

    return JSON.stringify(this.error, null, 2);
  }

  handleGoHome() {
    if (this.options.onGoHome) {
      this.options.onGoHome();
    }
    this.emit("goHome");
  }

  handleRetry() {
    if (this.options.onRetry) {
      this.options.onRetry();
    }
    this.emit("retry");
  }

  // Public methods
  updateError(newError) {
    this.error = newError;
    this.initialize();
  }

  setRetryEnabled(enabled) {
    this.options.showRetry = enabled;
    this.initialize();
  }

  // Static utility methods
  static showGlobalError(error, container = "body") {
    const errorView = new ErrorView(error, {
      showRetry: true,
      onRetry: () => window.location.reload(),
    });

    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    if (container) {
      container.innerHTML = "";
      errorView.mount(container);
    }

    return errorView;
  }

  destroy() {
    super.destroy();
  }
}
