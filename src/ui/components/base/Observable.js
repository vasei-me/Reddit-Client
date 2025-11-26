export class Observable {
  constructor(value) {
    this._value = value;
    this._listeners = new Set();
    this._isNotifying = false; // Flag برای جلوگیری از حلقه در notify
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this._notify(oldValue, newValue);
    }
  }

  subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error("Listener must be a function");
    }

    this._listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(listener);
    };
  }

  unsubscribe(listener) {
    this._listeners.delete(listener);
  }

  unsubscribeAll() {
    this._listeners.clear();
  }

  _notify(oldValue, newValue) {
    // جلوگیری از حلقه‌های بی‌نهایت در حین notify
    if (this._isNotifying) {
      return;
    }

    this._isNotifying = true;

    try {
      // ایجاد کپی از listeners برای جلوگیری از مشکلات در حین اجرا
      const listeners = Array.from(this._listeners);

      for (const listener of listeners) {
        try {
          listener(newValue, oldValue);
        } catch (error) {
          console.error("Error in observable listener:", error);
          // ادامه اجرای سایر listeners حتی اگر یکی خطا داد
        }
      }
    } finally {
      this._isNotifying = false;
    }
  }

  // Utility methods
  map(transform) {
    const mapped = new Observable(transform(this._value));

    this.subscribe((newValue) => {
      mapped.value = transform(newValue);
    });

    return mapped;
  }

  filter(predicate) {
    const filtered = new Observable(
      predicate(this._value) ? this._value : undefined
    );

    this.subscribe((newValue) => {
      if (predicate(newValue)) {
        filtered.value = newValue;
      } else {
        filtered.value = undefined;
      }
    });

    return filtered;
  }

  // متد جدید برای subscribe کردن فقط یک بار
  once(listener) {
    const onceListener = (newValue, oldValue) => {
      this.unsubscribe(onceListener);
      listener(newValue, oldValue);
    };

    this.subscribe(onceListener);
    return () => this.unsubscribe(onceListener);
  }

  // متد جدید برای دریافت promise از تغییر بعدی
  next() {
    return new Promise((resolve) => {
      this.once(resolve);
    });
  }

  destroy() {
    this._listeners.clear();
    this._value = null;
  }
}
