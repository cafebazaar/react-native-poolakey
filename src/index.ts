import { useEffect } from 'react';
import bridge from './bridge';
import {
  praseError,
  DisconnectedError,
  ItemNotFoundError,
  BazaarNotFoundError,
} from './exceptions';

let devConnected = 0;
let isConnected = false;
let isConnecting: Promise<void> | undefined;
let initedRsaKey: string | null;

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
    try {
      await ensureConnected();
      return await (fn as any).apply(this, arguments);
    } catch (e) {
      throw praseError(e);
    }
  } as any) as F;
}

const poolakey = {
  connect(rsaKey: string | null) {
    initedRsaKey = rsaKey || null;
    devConnected++;
    return ensureConnected().catch(praseError);
  },
  async disconnect() {
    devConnected--;
    if (!devConnected) {
      await bridge.disconnect();
    }
  },
  purchaseProduct: wrapConn(bridge.purchaseProduct),
  consumePurchase: wrapConn(bridge.consumePurchase),
  subscribeProduct: wrapConn(bridge.subscribeProduct),
  getPurchasedProducts: wrapConn(bridge.getPurchasedProducts),
  getSubscribedProducts: wrapConn(bridge.getSubscribedProducts),
  queryPurchaseProduct: wrapConn(bridge.queryPurchaseProduct),
  querySubscribeProduct: wrapConn(bridge.querySubscribeProduct),
};

export function useBazaar(rsaKey: string | null) {
  useEffect(() => {
    poolakey.connect(rsaKey);
    return () => {
      poolakey.disconnect();
    };
  }, []);

  return poolakey;
}

export default poolakey;
export { DisconnectedError, ItemNotFoundError, BazaarNotFoundError };
