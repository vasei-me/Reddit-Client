// Single Responsibility: اعتبارسنجی داده‌های ورودی
export class Validator {
  static isValidSubredditName(name) {
    if (!name || typeof name !== "string") {
      return false;
    }

    const trimmed = name.toLowerCase().trim();

    // بررسی طول
    if (trimmed.length < 2 || trimmed.length > 21) {
      return false;
    }

    // بررسی کاراکترهای مجاز
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return false;
    }

    // بررسی موارد ممنوعه
    const forbiddenPatterns = [
      trimmed.startsWith("_"),
      trimmed.endsWith("_"),
      trimmed.startsWith("r/"),
      trimmed.includes(" "),
      trimmed.includes("-"),
    ];

    return !forbiddenPatterns.some((pattern) => pattern);
  }

  static getSubredditValidationError(name) {
    if (!name || typeof name !== "string") {
      return "نام subreddit باید یک متن معتبر باشد";
    }

    const trimmed = name.trim();

    if (trimmed.length === 0) {
      return "نام subreddit نمی‌تواند خالی باشد";
    }

    if (trimmed.length < 2) {
      return "نام subreddit باید حداقل ۲ کاراکتر باشد";
    }

    if (trimmed.length > 21) {
      return "نام subreddit نمی‌تواند بیشتر از ۲۱ کاراکتر باشد";
    }

    if (trimmed.startsWith("r/")) {
      return 'لطفاً فقط نام subreddit را وارد کنید (بدون "r/")';
    }

    if (trimmed.startsWith("_") || trimmed.endsWith("_")) {
      return "نام subreddit نمی‌تواند با underscore شروع یا پایان یابد";
    }

    if (trimmed.includes(" ") || trimmed.includes("-")) {
      return "نام subreddit نمی‌تواند شامل فاصله یا خط تیره باشد";
    }

    if (!/^[a-z0-9_]+$/i.test(trimmed)) {
      return "نام subreddit فقط می‌تواند شامل حروف انگلیسی، اعداد و underscore باشد";
    }

    return null;
  }

  static sanitizeSubredditName(name) {
    if (!name || typeof name !== "string") {
      return "";
    }

    return name
      .toLowerCase()
      .trim()
      .replace(/^r\//, "") // حذف r/ از ابتدا
      .replace(/[^a-z0-9_]/g, "") // حذف کاراکترهای غیرمجاز
      .slice(0, 21); // محدود کردن طول
  }

  static debounce(func, delay) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  static validatePosts(posts) {
    if (!Array.isArray(posts)) {
      return false;
    }

    return posts.every(
      (post) => post && typeof post === "object" && post.id && post.title
    );
  }
}
