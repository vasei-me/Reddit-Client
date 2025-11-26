import { Component } from "../base/Component.js";
import { ButtonComponent } from "../common/ButtonComponent.js";
import { InputComponent } from "../common/InputComponent.js";

export class AddLaneComponent extends Component {
  constructor(options = {}) {
    super();
    this.options = {
      onAddLane: null,
      existingSubreddits: [],
      ...options,
    };

    this.inputComponent = null;
    this.addButton = null;
    this._isCreatingElement = false;

    this.createElement();
    this.render();
    this.setupEventListeners();
  }

  createElement() {
    // جلوگیری از حلقه بی‌نهایت
    if (this._isCreatingElement) {
      return;
    }

    this._isCreatingElement = true;

    try {
      this.element = document.createElement("div");
      this.element.className = "add-lane-component";
    } finally {
      this._isCreatingElement = false;
    }
  }

  render() {
    if (!this.element) {
      this.createElement();
    }

    this.element.innerHTML = `
      <div class="add-lane-header">
        <h3>Add Subreddit</h3>
      </div>
      <div class="add-lane-form">
        <div class="input-group">
          <span class="input-prefix">r/</span>
          <!-- Input will be added here -->
        </div>
        <div class="add-lane-actions">
          <!-- Button will be added here -->
        </div>
      </div>
      <div class="add-lane-help">
        <p>Enter a subreddit name to add it to your dashboard</p>
      </div>
    `;

    this.initializeComponents();
  }

  initializeComponents() {
    const inputContainer = this.element.querySelector(".input-group");
    const buttonContainer = this.element.querySelector(".add-lane-actions");

    // پاک کردن کامپوننت‌های قبلی
    if (this.inputComponent) {
      this.inputComponent.destroy();
    }
    if (this.addButton) {
      this.addButton.destroy();
    }

    // Create input component
    this.inputComponent = new InputComponent({
      placeholder: "subreddit-name",
      type: "text",
      maxLength: 21, // Reddit subreddit max length
      onInput: (value) => this.handleInputChange(value),
      onEnter: () => this.handleAddLane(),
    });

    // Create add button
    this.addButton = new ButtonComponent({
      text: "Add Subreddit",
      variant: "primary",
      disabled: true,
      onClick: () => this.handleAddLane(),
    });

    // Add components to DOM
    if (inputContainer && this.inputComponent) {
      // قرار دادن input بعد از prefix
      const prefix = inputContainer.querySelector(".input-prefix");
      if (prefix && this.inputComponent.element) {
        prefix.insertAdjacentElement("afterend", this.inputComponent.element);
      }
    }

    if (buttonContainer && this.addButton) {
      buttonContainer.appendChild(this.addButton.element);
    }
  }

  setupEventListeners() {
    // Event listeners for form submission
    const form = this.element.querySelector(".add-lane-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddLane();
      });
    }
  }

  handleInputChange(value) {
    const subreddit = value.trim().toLowerCase();

    // Validate input and update button state
    const isValid = this.validateSubreddit(subreddit);
    this.addButton.setDisabled(!isValid);

    // Show validation feedback
    this.showValidationFeedback(subreddit, isValid);
  }

  validateSubreddit(subreddit) {
    if (!subreddit) return false;

    // Basic validation rules
    const rules = [
      // Must not be empty
      subreddit.length > 0,
      // Must only contain letters, numbers, and underscores
      /^[a-z0-9_]+$/.test(subreddit),
      // Must not start or end with underscore
      !subreddit.startsWith("_") && !subreddit.endsWith("_"),
      // Must not be too long
      subreddit.length <= 21,
      // Must not be already added
      !this.options.existingSubreddits.includes(subreddit),
    ];

    return rules.every((rule) => rule);
  }

  showValidationFeedback(subreddit, isValid) {
    const inputGroup = this.element.querySelector(".input-group");
    const helpText = this.element.querySelector(".add-lane-help p");

    if (!inputGroup || !helpText) return;

    // Remove existing validation classes
    inputGroup.classList.remove("valid", "invalid");
    helpText.className = "";

    if (!subreddit) {
      helpText.textContent =
        "Enter a subreddit name to add it to your dashboard";
      helpText.className = "help";
      return;
    }

    if (!isValid) {
      inputGroup.classList.add("invalid");

      if (this.options.existingSubreddits.includes(subreddit)) {
        helpText.textContent = `r/${subreddit} is already in your dashboard`;
        helpText.className = "error";
      } else if (!/^[a-z0-9_]+$/.test(subreddit)) {
        helpText.textContent =
          "Subreddit can only contain letters, numbers, and underscores";
        helpText.className = "error";
      } else if (subreddit.startsWith("_") || subreddit.endsWith("_")) {
        helpText.textContent = "Subreddit cannot start or end with underscore";
        helpText.className = "error";
      } else if (subreddit.length > 21) {
        helpText.textContent = "Subreddit name is too long (max 21 characters)";
        helpText.className = "error";
      } else {
        helpText.textContent = "Invalid subreddit name";
        helpText.className = "error";
      }
    } else {
      inputGroup.classList.add("valid");
      helpText.textContent = `r/${subreddit} is available and valid`;
      helpText.className = "success";
    }
  }

  async handleAddLane() {
    const inputValue = this.inputComponent?.getValue() || "";
    const subreddit = inputValue.trim().toLowerCase();

    if (!this.validateSubreddit(subreddit)) {
      this.showValidationFeedback(subreddit, false);
      return;
    }

    try {
      // Disable form during submission
      this.setFormDisabled(true);
      this.addButton.setLoading(true);

      // Emit add lane event
      if (this.options.onAddLane) {
        await this.options.onAddLane(subreddit);
      }

      this.emit("addLane", subreddit);

      // Reset form
      this.resetForm();
    } catch (error) {
      console.error("Failed to add lane:", error);
      this.showError(error.message);
    } finally {
      this.setFormDisabled(false);
      this.addButton.setLoading(false);
    }
  }

  setFormDisabled(disabled) {
    if (this.inputComponent) {
      this.inputComponent.setDisabled(disabled);
    }
    if (this.addButton) {
      this.addButton.setDisabled(disabled);
    }
  }

  resetForm() {
    if (this.inputComponent) {
      this.inputComponent.setValue("");
    }
    this.addButton.setDisabled(true);

    // Reset validation feedback
    const inputGroup = this.element.querySelector(".input-group");
    const helpText = this.element.querySelector(".add-lane-help p");

    if (inputGroup) {
      inputGroup.classList.remove("valid", "invalid");
    }
    if (helpText) {
      helpText.textContent =
        "Enter a subreddit name to add it to your dashboard";
      helpText.className = "help";
    }
  }

  showError(message) {
    const helpText = this.element.querySelector(".add-lane-help p");
    if (helpText) {
      helpText.textContent = message;
      helpText.className = "error";
    }
  }

  // Public methods
  updateExistingSubreddits(subreddits) {
    this.options.existingSubreddits = subreddits || [];

    // Re-validate current input
    const currentValue = this.inputComponent?.getValue() || "";
    this.handleInputChange(currentValue);
  }

  focus() {
    if (this.inputComponent) {
      this.inputComponent.focus();
    }
  }

  setLoading(loading) {
    if (this.addButton) {
      this.addButton.setLoading(loading);
    }
    this.setFormDisabled(loading);
  }

  destroy() {
    if (this.inputComponent) {
      this.inputComponent.destroy();
    }
    if (this.addButton) {
      this.addButton.destroy();
    }

    super.destroy();
  }
}
