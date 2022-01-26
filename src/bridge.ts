import { NativeEventEmitter, NativeModules } from 'react-native';
import { PurchaseResult, parsePurchaseResult } from './PurchaseResult';
import { SkuDetails, parseSkuDetails } from './SkuDetails';

const { ReactNativePoolakey } = NativeModules;
const eventEmitter = new NativeEventEmitter(ReactNativePoolakey);

export default {
  async connect(rsaKey: string | null): Promise<void> {
    return ReactNativePoolakey.connectPayment(rsaKey);
  },
  disconnect(): Promise<void> {
    // never rejects
    return ReactNativePoolakey.disconnectPayment();
  },
  addDisconnectListener(handler: (...args: any[]) => any): () => void {
    eventEmitter.addListener('disconnected', handler);
    return () => {
      eventEmitter.removeListener('disconnected', handler);
    };
  },
  removeAllDisconnectListeners() {
    eventEmitter.removeAllListeners('disconnected');
  },
  purchaseProduct(
    productId: string,
    developerPayload: string | null | undefined = null,
    dynamicPriceToken: string | null | undefined = null,
  ): Promise<PurchaseResult> {
    return ReactNativePoolakey.purchaseProduct(
      productId,
      developerPayload || null,
      dynamicPriceToken|| null,
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
  getInAppSkuDetails(productIds: string[]): Promise<SkuDetails[]> {
    return ReactNativePoolakey.getInAppSkuDetails(
      JSON.stringify(productIds)
    ).then(parseSkuDetails);
  },
  getSubscriptionSkuDetails(productIds: string[]): Promise<SkuDetails[]> {
    return ReactNativePoolakey.getSubscriptionSkuDetails(
      JSON.stringify(productIds)
    ).then(parseSkuDetails);
  },
};
