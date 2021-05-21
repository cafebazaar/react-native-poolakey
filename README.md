# @cafebazaar/react-native-poolakey (Under Development)

ReactNative In-App Billing SDK for Cafe Bazaar App Store

## Installation

```sh
yarn add @cafebazaar/react-native-poolakey
```
or
```sh
npm install @cafebazaar/react-native-poolakey
```

## Usage

### Functional Components

```js
import { useBazaar } from '@cafebazaar/react-native-poolakey';

// ...

function MyComponent() {
  const bazaar = useBazaar(myInAppBillingKey);
  // ...
  const someHandler = async () => {
    const purchaseResult = await bazaar.purchaseProduct(productId);
    console.log(purchaseResult.purchaseToken);
  };
  // ...
}
```

### Class Components

```js
import bazaar from '@cafebazaar/react-native-poolakey';

// ...

class MyApp extends React.Component {
  componentDidMount() {
    bazaar
      .connect(myInAppBillingKey)
      .catch(handleError); // bazaar is not installed or what?!
  }

  componentWillUnmount() {
    bazaar.disconnect();
  }

  async someButtonHandler() {
    const purchaseResult = await bazaar.purchaseProduct(productId);
    console.log(purchaseResult.purchaseToken);
  }
}
```

## API Documentation

### connect / disconnect
TLDR: For each `connect` call, you need to call `disconnect` too.

To use bazaar apis, user needs to have Bazaar app installed on his phone.
In all times, there's a single connection from your app to bazaar, each time
you call `connect` we count it internally and you have to call `disconnect`
the same number of times to be disconnected completely.

Once you are connected, you can call other apis, but you don't need to wait
for `connect` promise to be resolved, other apis internally wait for connection
to be established.

Inside functional components, you can use `useBazaar` which automatically calls
`connect`/`disconnect` on mount/unmount hooks.

### purchaseProduct(productId: string): Promise<PurchaseResult>
Surchase a product, bazaar starts payment flow automatically.

### consumeProduct(purchaseToken: string): Promise<void>
If your product is consumable, you can call `consumeProduct` whenever you see fit. To
consume, you need to provide purchaseToken from a previous `purchaseProduct` call result.

### subscribeProduct(productId: string): Promise<PurchaseResult>
Subscribe to a product, bazaar starts payment flow automatically.

### getPurchasedProducts(): Promise<PurchaseResult[]>
Get a list of products purchased by current user (logged in inside his bazaar app).

### getSubscribedProducts(): Promise<PurchaseResult[]>
Get a list of subscriptions purchased by current user (logged in inside his bazaar app).

### queryPurchaseProduct(productId: string): Promise<PurchaseResult>
Get a specific purchase data by productId

### querySubscribeProduct(productId: string): Promise<PurchaseResult>
Get a specific subscription data by productId

### PurchaseResult
```typescript
type PurchaseResult = {
  orderId: string;
  packageName: string;
  productId: string;
  purchaseTime: Date;
  purchaseState: number;
  developerPayload: string;
  purchaseToken: string;
}
```

## License

MIT
