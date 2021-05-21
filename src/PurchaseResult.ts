export type PurchaseResult = {
  orderId: string;
  packageName: string;
  productId: string;
  purchaseTime: Date;
  purchaseState: number;
  developerPayload: string;
  purchaseToken: string;
};

export function parsePurchaseResult(json: any): any {
  if (!json) return json;

  const obj = typeof json === 'string' ? JSON.parse(json) : json;
  if (Array.isArray(obj)) {
    return obj.map(parsePurchaseResult);
  }

  return {
    ...obj,
    purchaseTime: new Date(obj.purchaseTime),
  };
}
