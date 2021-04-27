import { NativeModules } from 'react-native';

const { ReactNativePoolakey } = NativeModules;

export const PURCHASE_REQUEST_CODE = 1000;
export const SUBSCRIBE_REQUEST_CODE = 1001;

// export default ReactNativePoolakey as ReactNativePoolakeyType;

type PurchaseResult = {
  orderId: string;
  packageName: string;
  productId: string;
  purchaseTime: Date;
  purchaseState: number;
  developerPayload: string;
  purchaseToken: string;
};

function parsePurchaseResult(json: any): any {
  const obj = typeof json === 'string' ? JSON.parse(json) : json;
  if (Array.isArray(obj)) {
    return obj.map(parsePurchaseResult);
  }

  return {
    ...obj,
    purchaseTime: new Date(obj.purchaseTime),
  };
}

function disconnect() {
  console.log('disconnected');
}

export default {
  initialize(rsaKey: string) {
    ReactNativePoolakey.initializePayment(rsaKey, disconnect);
  },
  connect(): Promise<void> {
    return ReactNativePoolakey.connectPayment();
  },
  disconnect(): Promise<void> {
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
  getPurchasedProducts(): Promise<PurchaseResult[]> {
    return ReactNativePoolakey.getPurchasedProducts().then(parsePurchaseResult);
  },
};
