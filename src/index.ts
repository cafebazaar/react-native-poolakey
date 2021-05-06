import bridge from './bridge';

let devConnected = false;
let isConnected = false;
let isConnecting: Promise<void> | undefined;
let initedRsaKey: string;

bridge.addDisconnectListener(() => {
  isConnected = false;
});

function ensureConnected(): Promise<void> {
  if (!devConnected) {
    return Promise.reject('SDK is not connected to bazaar!');
  }

  if (isConnected) {
    return Promise.resolve();
  }

  if (!isConnecting) {
    isConnecting = bridge.connect(initedRsaKey).then(() => {
      isConnected = true;
      isConnecting = undefined;
    });
  }

  return isConnecting;
}

function wrapConn<F>(fn: F): F {
  return (async function () {
    await ensureConnected();
    return await (fn as any).apply(this, arguments);
  } as any) as F;
}

export default {
  connect(rsaKey: string) {
    initedRsaKey = rsaKey;
    devConnected = true;
    return ensureConnected();
  },
  disconnect() {
    devConnected = false;
    return bridge.disconnect();
  },
  purchaseProduct: wrapConn(bridge.purchaseProduct),
  consumePurchase: wrapConn(bridge.consumePurchase),
  subscribeProduct: wrapConn(bridge.subscribeProduct),
  getPurchasedProducts: wrapConn(bridge.getPurchasedProducts),
  getSubscribedProducts: wrapConn(bridge.getSubscribedProducts),
  queryPurchaseProduct: wrapConn(bridge.queryPurchaseProduct),
  querySubscribeProduct: wrapConn(bridge.querySubscribeProduct),
};
