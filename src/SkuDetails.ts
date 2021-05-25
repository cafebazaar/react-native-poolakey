export type SkuDetails = {
  sku: string;
  type: string;
  price: string;
  title: Date;
  description: number;
};

export function parseSkuDetails(json: any): any {
  if (!json) return json;

  const obj = typeof json === 'string' ? JSON.parse(json) : json;
  if (Array.isArray(obj)) {
    return obj.map(parseSkuDetails);
  }

  return obj;
}
