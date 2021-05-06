import { NativeEventEmitter, NativeModules } from 'react-native';
import { PurchaseResult, parsePurchaseResult } from './PurchaseResult';
import log from './log';

const { ReactNativePoolakey } = NativeModules;
let initRsaKey: string;
let isConnected = false;

const eventEmitter = new NativeEventEmitter(ReactNativePoolakey);
eventEmitter.addListener('disconnected', () => {
  isConnected = false;
  log('disconnected');
});

export default {
  initialize(rsaKey: string) {
    initRsaKey = rsaKey;
  },
  connect(): Promise<void> {
    if (initRsaKey === undefined) {
      throw new Error('Please initialize poolakey!');
    }

    if (isConnected) {
      return Promise.resolve();
    }

    log('connecting');
    return ReactNativePoolakey.connectPayment(initRsaKey).then(() => {
      isConnected = true;
      log('connected');
    });
  },
  disconnect(): Promise<void> {
    // never rejects
    log('disconnecting');
    return ReactNativePoolakey.disconnectPayment();
  },
  purchaseProduct(
    productId: string,
    developerPayload: string | null | undefined = null
  ): Promise<PurchaseResult> {
    return ReactNativePoolakey.purchaseProduct(
      productId,
      developerPayload || null
    ).then(parsePurchaseResult);
  },
  consumePurchase(purchaseToken: string): Promise<void> {
    return ReactNativePoolakey.consumePurchase(purchaseToken);
  },
  subscribeProduct(
    productId: string,
    developerPayload: string | null | undefined = null
  ): Promise<PurchaseResult> {
    return ReactNativePoolakey.subscribeProduct(
      productId,
      developerPayload || null
    ).then(parsePurchaseResult);
  },
  getPurchasedProducts(): Promise<PurchaseResult[]> {
    return ReactNativePoolakey.getPurchasedProducts().then(parsePurchaseResult);
  },
  getSubscribedProducts(): Promise<PurchaseResult[]> {
    return ReactNativePoolakey.getSubscribedProducts().then(
      parsePurchaseResult
    );
  },
  queryPurchaseProduct(productId: string): Promise<PurchaseResult> {
    return ReactNativePoolakey.queryPurchaseProduct(productId).then(
      parsePurchaseResult
    );
  },
  querySubscribeProduct(productId: string): Promise<PurchaseResult> {
    return ReactNativePoolakey.querySubscribeProduct(productId).then(
      parsePurchaseResult
    );
  },
};
