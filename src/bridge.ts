import { NativeEventEmitter, NativeModules } from 'react-native';
const { ReactNativePoolakey } = NativeModules;
import { PurchaseResult, parsePurchaseResult } from './PurchaseResult';

let isInitialized: string;
let isConnected = false;

const eventEmitter = new NativeEventEmitter(ReactNativePoolakey);
eventEmitter.addListener('disconnected', () => {
  isConnected = false;
  console.log('disconnected');
});

export default {
  initialize(rsaKey: string) {
    if (isInitialized) {
      if (isInitialized === rsaKey) return;
      throw new Error('Cannot initialize more than once!');
    }

    isInitialized = rsaKey;
    ReactNativePoolakey.initializePayment(rsaKey);
  },
  connect(): Promise<void> {
    if (isInitialized === undefined) {
      throw new Error('Please initialize poolakey!');
    }

    if (isConnected) {
      return Promise.resolve();
    }

    console.log('connecting');
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
    console.log('geting PurchasedProducts');
    return ReactNativePoolakey.getPurchasedProducts().then(parsePurchaseResult);
  },
  getSubscribedProducts(): Promise<PurchaseResult[]> {
    return ReactNativePoolakey.getSubscribedProducts().then(
      parsePurchaseResult
    );
  },
};
