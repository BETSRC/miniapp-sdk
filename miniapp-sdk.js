window.MiniAppSDK = (function () {
  const pending = new Map();
  let messageCounter = 0;

  // ดึง origin จาก query string
  function getOriginFromScript() {
    const currentScript =
      document.currentScript ||
      Array.from(document.getElementsByTagName("script")).pop();
    const url = new URL(currentScript.src);
    return url.searchParams.get("origin");
  }

  const TRUSTED_ORIGIN = getOriginFromScript();
  if (!TRUSTED_ORIGIN) {
    console.warn('MiniAppSDK: origin is not specified! Using "*" (not secure)');
  }

  function send(action, payload) {
    const messageId = `miniapp-${Date.now()}-${messageCounter++}`;
    const message = {
      action,
      payload,
      messageId,
    };

    return new Promise((resolve, reject) => {
      pending.set(messageId, { resolve, reject });

      console.log("TRUSTED_ORIGIN", TRUSTED_ORIGIN);
      window.parent.postMessage(message, TRUSTED_ORIGIN || "*");

      // timeout fallback
      setTimeout(() => {
        if (pending.has(messageId)) {
          pending.delete(messageId);
          reject(new Error(`Timeout waiting for response [${action}]`));
        }
      }, 10000); // 10s
    });
  }

  function handleMessage(event) {
    const data = event.data;

    // ป้องกัน origin ปลอม
    if (TRUSTED_ORIGIN && event.origin !== TRUSTED_ORIGIN) {
      console.warn(
        `MiniAppSDK: Rejected message from untrusted origin: ${event.origin}`
      );
      return;
    }

    if (!data || data.type !== "response" || !data.messageId) return;

    const handler = pending.get(data.messageId);
    if (!handler) return;

    pending.delete(data.messageId);

    if (data.error) {
      handler.reject(new Error(data.error));
    } else {
      handler.resolve(data.payload);
    }
  }

  window.addEventListener("message", handleMessage);

  async function getCurrentUser() {
    return await send("get-current-user");
  }

  async function getWallet() {
    return await send("get-wallet");
  }

  async function addBalance({ amount }) {
    return await send("add-balance", { amount });
  }

  async function reduceBalance({ amount }) {
    return await send("reduce-balance", { amount });
  }

  async function addFreeCredit({ amount }) {
    return await send("add-free-credit", { amount });
  }

  async function reduceFreeCredit({ amount }) {
    return await send("reduce-free-credit", { amount });
  }

  async function getGameTransaction({ start, limit, order = "desc" }) {
    return await send("get-game-transaction", {
      start,
      limit,
      order,
    });
  }

  async function getPaymentTransaction({ type, start, limit, order = "desc" }) {
    return await send("get-payment-transaction", {
      type,
      start,
      limit,
      order,
    });
  }

  async function getUserPromotions({ start, limit, order = "desc" }) {
    return await send("get-user-promotion", {
      start,
      limit,
      order,
    });
  }

  return {
    getCurrentUser,
    getWallet,
    addBalance,
    reduceBalance,
    addFreeCredit,
    reduceFreeCredit,
    getGameTransaction,
    getPaymentTransaction,
    getUserPromotions,
  };
})();
