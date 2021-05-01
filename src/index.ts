import bridge from './bridge';
import log from './log';

let activeConnections = 0;
let scheduled: NodeJS.Timeout;
let disconnecting: Promise<void> | null = null;
function scheduleDisconnect() {
  log('scheduling disconnet');

  clearTimeout(scheduled);
  scheduled = setTimeout(() => {
    if (activeConnections) return;

    disconnecting = bridge.disconnect(); // never rejects
    disconnecting.then(() => {
      disconnecting = null;
    });
  }, 3000);
}

function wrapConn<F>(fn: F): F {
  return (async function () {
    clearTimeout(scheduled);
    if (disconnecting) {
      try {
        await disconnecting;
      } catch (e) {}
    }

    try {
      activeConnections++;
      await bridge.connect();
      return await (fn as any).apply(this, arguments);
    } finally {
      activeConnections--;
      if (!activeConnections) {
        scheduleDisconnect();
      }
    }
  } as any) as F;
}

export default {
  initialize: bridge.initialize,
  purchaseProduct: wrapConn(bridge.purchaseProduct),
  consumePurchase: wrapConn(bridge.consumePurchase),
  subscribeProduct: wrapConn(bridge.subscribeProduct),
  getPurchasedProducts: wrapConn(bridge.getPurchasedProducts),
  getSubscribedProducts: wrapConn(bridge.getSubscribedProducts),
};
