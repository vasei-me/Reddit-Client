export class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);
    return this;
  }

  off(event, listener) {
    if (this.events.has(event)) {
      this.events.get(event).delete(listener);
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
    return this;
  }

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
    return this;
  }

  once(event, listener) {
    const onceWrapper = (data) => {
      this.off(event, onceWrapper);
      listener(data);
    };
    return this.on(event, onceWrapper);
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }
}
