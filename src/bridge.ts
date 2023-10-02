import { NativeEventEmitter, NativeModules } from 'react-native';
import { parsePurchaseResult } from './PurchaseResult';
import type { PurchaseResult } from './PurchaseResult';
import { parseSkuDetails } from './SkuDetails';
import type { SkuDetails } from './SkuDetails';

const LINKING_ERROR =
  "The package 'react-native-poolakey' doesn't seem to be linked. Make sure you rebuilt the app after installing the package";

const Poolakey = NativeModules.ReactNativePoolakey
  ? NativeModules.ReactNativePoolakey
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const eventEmitter = new NativeEventEmitter(Poolakey);

export default {
  async connect(rsaKey: string | null): Promise<void> {
    return Poolakey.connectPayment(rsaKey);
  },
  disconnect(): Promise<void> {
    // never rejects
    return Poolakey.disconnectPayment();
  },
  addDisconnectListener(handler: (...args: any[]) => any): () => void {
    const eventListener = eventEmitter.addListener('disconnected', handler);

    return () => {
      eventListener.remove();
    };
  },
  removeAllDisconnectListeners() {
    eventEmitter.removeAllListeners('disconnected');
  },
  purchaseProduct(
    productId: string,
    developerPayload: string | null | undefined = null,
    dynamicPriceToken: string | null | undefined = null
  ): Promise<PurchaseResult> {
    return Poolakey.purchaseProduct(
      productId,
      developerPayload || null,
      dynamicPriceToken || null
    ).then(parsePurchaseResult);
  },
  consumePurchase(purchaseToken: string): Promise<void> {
    return Poolakey.consumePurchase(purchaseToken);
  },
  subscribeProduct(
    productId: string,
    developerPayload: string | null | undefined = null,
    dynamicPriceToken: string | null | undefined = null
  ): Promise<PurchaseResult> {
    return Poolakey.subscribeProduct(
      productId,
      developerPayload || null,
      dynamicPriceToken || null
    ).then(parsePurchaseResult);
  },
  getPurchasedProducts(): Promise<PurchaseResult[]> {
    return Poolakey.getPurchasedProducts().then(parsePurchaseResult);
  },
  getSubscribedProducts(): Promise<PurchaseResult[]> {
    return Poolakey.getSubscribedProducts().then(parsePurchaseResult);
  },
  queryPurchaseProduct(productId: string): Promise<PurchaseResult> {
    return Poolakey.queryPurchaseProduct(productId).then(parsePurchaseResult);
  },
  querySubscribeProduct(productId: string): Promise<PurchaseResult> {
    return Poolakey.querySubscribeProduct(productId).then(parsePurchaseResult);
  },
  getInAppSkuDetails(productIds: string[]): Promise<SkuDetails[]> {
    return Poolakey.getInAppSkuDetails(JSON.stringify(productIds)).then(
      parseSkuDetails
    );
  },
  getSubscriptionSkuDetails(productIds: string[]): Promise<SkuDetails[]> {
    return Poolakey.getSubscriptionSkuDetails(JSON.stringify(productIds)).then(
      parseSkuDetails
    );
  },
};
