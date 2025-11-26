import { Observable } from "../components/base/Observable.js";

export class PostState {
  constructor() {
    this.selectedPost = new Observable(null);
    this.viewedPosts = new Observable(new Set());
    this.favoritePosts = new Observable(new Set());
    this.bookmarkedPosts = new Observable(new Set());
    this.hiddenPosts = new Observable(new Set());
  }

  // Selected post
  setSelectedPost(post) {
    this.selectedPost.value = post;
    if (post) {
      this.markAsViewed(post.id);
    }
  }

  clearSelectedPost() {
    this.selectedPost.value = null;
  }

  // Viewed posts tracking
  markAsViewed(postId) {
    const viewed = new Set(this.viewedPosts.value);
    viewed.add(postId);
    this.viewedPosts.value = viewed;
  }

  isViewed(postId) {
    return this.viewedPosts.value.has(postId);
  }

  clearViewedPosts() {
    this.viewedPosts.value = new Set();
  }

  // Favorite posts
  toggleFavorite(postId) {
    const favorites = new Set(this.favoritePosts.value);

    if (favorites.has(postId)) {
      favorites.delete(postId);
    } else {
      favorites.add(postId);
    }

    this.favoritePosts.value = favorites;
  }

  addFavorite(postId) {
    const favorites = new Set(this.favoritePosts.value);
    favorites.add(postId);
    this.favoritePosts.value = favorites;
  }

  removeFavorite(postId) {
    const favorites = new Set(this.favoritePosts.value);
    favorites.delete(postId);
    this.favoritePosts.value = favorites;
  }

  isFavorite(postId) {
    return this.favoritePosts.value.has(postId);
  }

  getFavoritePosts() {
    return Array.from(this.favoritePosts.value);
  }

  clearFavorites() {
    this.favoritePosts.value = new Set();
  }

  // Bookmarked posts
  toggleBookmark(postId) {
    const bookmarked = new Set(this.bookmarkedPosts.value);

    if (bookmarked.has(postId)) {
      bookmarked.delete(postId);
    } else {
      bookmarked.add(postId);
    }

    this.bookmarkedPosts.value = bookmarked;
  }

  addBookmark(postId) {
    const bookmarked = new Set(this.bookmarkedPosts.value);
    bookmarked.add(postId);
    this.bookmarkedPosts.value = bookmarked;
  }

  removeBookmark(postId) {
    const bookmarked = new Set(this.bookmarkedPosts.value);
    bookmarked.delete(postId);
    this.bookmarkedPosts.value = bookmarked;
  }

  isBookmarked(postId) {
    return this.bookmarkedPosts.value.has(postId);
  }

  getBookmarkedPosts() {
    return Array.from(this.bookmarkedPosts.value);
  }

  clearBookmarks() {
    this.bookmarkedPosts.value = new Set();
  }

  // Hidden posts
  hidePost(postId) {
    const hidden = new Set(this.hiddenPosts.value);
    hidden.add(postId);
    this.hiddenPosts.value = hidden;
  }

  unhidePost(postId) {
    const hidden = new Set(this.hiddenPosts.value);
    hidden.delete(postId);
    this.hiddenPosts.value = hidden;
  }

  isHidden(postId) {
    return this.hiddenPosts.value.has(postId);
  }

  getHiddenPosts() {
    return Array.from(this.hiddenPosts.value);
  }

  clearHiddenPosts() {
    this.hiddenPosts.value = new Set();
  }

  // Filtering
  filterVisiblePosts(posts) {
    return posts.filter((post) => !this.isHidden(post.id));
  }

  // Persistence
  toJSON() {
    return {
      viewedPosts: Array.from(this.viewedPosts.value),
      favoritePosts: Array.from(this.favoritePosts.value),
      bookmarkedPosts: Array.from(this.bookmarkedPosts.value),
      hiddenPosts: Array.from(this.hiddenPosts.value),
    };
  }

  fromJSON(data) {
    if (data.viewedPosts) {
      this.viewedPosts.value = new Set(data.viewedPosts);
    }
    if (data.favoritePosts) {
      this.favoritePosts.value = new Set(data.favoritePosts);
    }
    if (data.bookmarkedPosts) {
      this.bookmarkedPosts.value = new Set(data.bookmarkedPosts);
    }
    if (data.hiddenPosts) {
      this.hiddenPosts.value = new Set(data.hiddenPosts);
    }
  }

  destroy() {
    this.selectedPost = null;
    this.viewedPosts = null;
    this.favoritePosts = null;
    this.bookmarkedPosts = null;
    this.hiddenPosts = null;
  }
}
