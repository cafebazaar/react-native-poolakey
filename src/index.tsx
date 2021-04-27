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

function parsePurchaseResult(json: string) {
  const obj = JSON.parse(json);
  return {
    ...obj,
    purchaseTime: new Date(obj.purchaseTime),
  };
}

export default {
  initialize(rsaKey: string) {
    ReactNativePoolakey.initializePayment(rsaKey);
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
  getPurchasedProducts(): Promise<any> {
    return ReactNativePoolakey.getPurchasedProducts().then((arr: string) => {
      // TODO: this is dirty!
      return JSON.parse(arr).map(parsePurchaseResult);
    });
  },
};
