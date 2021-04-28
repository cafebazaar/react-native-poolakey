import bridge from './bridge';

let activeConnections = 0;
function wrapConn<F>(fn: F): F {
  return (async function () {
    try {
      activeConnections++;
      await bridge.connect();
      return await (fn as any).apply(this, arguments);
    } finally {
      activeConnections--;
      if (!activeConnections) {
        bridge.disconnect(); // never rejects
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
