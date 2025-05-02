class MiniAppSDK {
  constructor(options = {}) {
    this.pending = new Map();
    this.messageCounter = 0;
    this.TRUSTED_ORIGIN = options.origin || null;

    if (!this.TRUSTED_ORIGIN) {
      console.warn(
        'MiniAppSDK: origin is not specified! Using "*" (not secure)'
      );
    }

    this.initialize();
  }

  initialize() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage.bind(this));
    }
  }

  send(action, payload) {
    const messageId = `miniapp-${Date.now()}-${this.messageCounter++}`;
    const message = {
      action,
      payload,
      messageId,
    };

    return new Promise((resolve, reject) => {
      this.pending.set(messageId, { resolve, reject });

      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(message, this.TRUSTED_ORIGIN || "*");
      } else {
        reject(new Error("Window context not available"));
      }

      // Timeout fallback
      setTimeout(() => {
        if (this.pending.has(messageId)) {
          this.pending.delete(messageId);
          reject(new Error(`Timeout waiting for response [${action}]`));
        }
      }, 10000); // 10s
    });
  }

  handleMessage(event) {
    const data = event.data;

    // Prevent messages from untrusted origins
    if (this.TRUSTED_ORIGIN && event.origin !== this.TRUSTED_ORIGIN) {
      console.warn(
        `MiniAppSDK: Rejected message from untrusted origin: ${event.origin}`
      );
      return;
    }

    if (!data || data.type !== "response" || !data.messageId) return;

    const handler = this.pending.get(data.messageId);
    if (!handler) return;

    this.pending.delete(data.messageId);

    if (data.error) {
      handler.reject(new Error(data.error));
    } else {
      handler.resolve(data.payload);
    }
  }

  async getCurrentUser() {
    this.currentUser = await this.send("get-current-user");
    return this.currentUser;
  }

  async getWallet() {
    this.wallet = await this.send("get-wallet");
    return this.wallet;
  }

  async addBalance({ amount }) {
    return await this.send("add-balance", { amount });
  }

  async reduceBalance({ amount }) {
    return await this.send("reduce-balance", { amount });
  }

  async addFreeCredit({ amount }) {
    return await this.send("add-free-credit", { amount });
  }

  async reduceFreeCredit({ amount }) {
    return await this.send("reduce-free-credit", { amount });
  }

  async getGameTransaction({ start, limit, order = "desc" }) {
    return await this.send("get-game-transaction", {
      start,
      limit,
      order,
    });
  }

  async getPaymentTransaction({ type, start, limit, order = "desc" }) {
    return await this.send("get-payment-transaction", {
      type,
      start,
      limit,
      order,
    });
  }

  async getUserPromotions({ start, limit, order = "desc" }) {
    return await this.send("get-user-promotion", {
      start,
      limit,
      order,
    });
  }
}

// ไม่ต้อง attach เข้า window
export default MiniAppSDK; // Export แบบ ES Module
