import { NativeModules } from 'react-native';
const { ReactNativePoolakey } = NativeModules;
import { PurchaseResult, parsePurchaseResult } from './PurchaseResult';

let isConnected = false;
function onDisconnect() {
  isConnected = false;
  console.log('disconnected');
}

export default {
  initialize(rsaKey: string) {
    ReactNativePoolakey.initializePayment(rsaKey, onDisconnect);
  },
  connect(): Promise<void> {
    // return ReactNativePoolakey.connectPayment();
    // if (isConnected) {
    //   return Promise.resolve();
    // }

    // console.log('connecting');
    return ReactNativePoolakey.connectPayment().then(() => {
      isConnected = true;
      console.log('connected');
    });
  },
  disconnect(): Promise<void> {
    // never rejects
    console.log('disconnecting');
    return ReactNativePoolakey.disconnectPayment();
  },
  purchaseProduct(
    productId: string,
    developerPayload: string | null | undefined = null
  ): Promise<PurchaseResult> {
    console.log('purchase');
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
};
