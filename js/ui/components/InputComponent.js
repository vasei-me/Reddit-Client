import { Validator } from "../../utils/Validator.js";

// Single Responsibility: مدیریت کامپوننت ورودی
export class InputComponent {
  constructor(inputId, buttonId) {
    this.inputElement = document.getElementById(inputId);
    this.buttonElement = document.getElementById(buttonId);
    this.validationCallback = null;
    this.submitCallback = null;

    this.init();
  }

  init() {
    if (!this.inputElement || !this.buttonElement) {
      throw new Error("Input or button element not found");
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    // اعتبارسنجی real-time با debounce
    const debouncedValidate = Validator.debounce((value) => {
      this.validateInput(value);
    }, 300);

    this.inputElement.addEventListener("input", (e) => {
      debouncedValidate(e.target.value);
    });

    // پشتیبانی از کلید Enter
    this.inputElement.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !this.buttonElement.disabled) {
        this.handleSubmit();
      }
    });

    this.buttonElement.addEventListener("click", () => {
      this.handleSubmit();
    });
  }

  validateInput(value) {
    const trimmedValue = value.trim();
    const isValid = Validator.isValidSubredditName(trimmedValue);

    this.updateValidationState(isValid);

    if (this.validationCallback) {
      this.validationCallback(isValid, trimmedValue);
    }

    return isValid;
  }

  updateValidationState(isValid) {
    // پاک کردن استایل‌های قبلی
    this.inputElement.classList.remove("valid", "invalid");

    if (this.inputElement.value.trim() === "") {
      this.buttonElement.disabled = true;
      return;
    }

    if (isValid) {
      this.inputElement.classList.add("valid");
      this.buttonElement.disabled = false;
    } else {
      this.inputElement.classList.add("invalid");
      this.buttonElement.disabled = true;
    }
  }

  handleSubmit() {
    const value = this.inputElement.value.trim();

    if (!this.validateInput(value)) {
      const errorMsg = Validator.getSubredditValidationError(value);
      this.showError(errorMsg);
      return;
    }

    if (this.submitCallback) {
      this.submitCallback(value);
    }
  }

  setValidationCallback(callback) {
    this.validationCallback = callback;
  }

  setSubmitCallback(callback) {
    this.submitCallback = callback;
  }

  setLoading(loading) {
    if (loading) {
      this.buttonElement.disabled = true;
      this.inputElement.disabled = true;
      this.buttonElement.textContent = "در حال بررسی...";
      this.buttonElement.classList.add("loading");
    } else {
      this.inputElement.disabled = false;
      this.buttonElement.textContent = "اضافه کردن لاین";
      this.buttonElement.classList.remove("loading");
      this.validateInput(this.inputElement.value);
    }
  }

  clear() {
    this.inputElement.value = "";
    this.inputElement.classList.remove("valid", "invalid");
    this.buttonElement.disabled = true;
  }

  focus() {
    this.inputElement.focus();
  }

  showError(message) {
    // ایجاد یا به‌روزرسانی عنصر خطا
    let errorElement =
      this.inputElement.parentNode.querySelector(".error-message");

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      this.inputElement.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = "block";

    // پنهان کردن خودکار خطا بعد از 5 ثانیه
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }

  getValue() {
    return this.inputElement.value.trim();
  }

  setValue(value) {
    this.inputElement.value = value;
    this.validateInput(value);
  }

  destroy() {
    this.inputElement.removeEventListener("input", this.debouncedValidate);
    this.inputElement.removeEventListener("keypress", this.handleKeypress);
    this.buttonElement.removeEventListener("click", this.handleSubmit);

    this.validationCallback = null;
    this.submitCallback = null;
  }
}
