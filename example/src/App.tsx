import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  TextInput,
} from 'react-native';
import { useBazaar } from '@cafebazaar/react-native-poolakey';
import { inAppBillingKey } from './constants';

const MyButton = ({ onPress, title }: any) => {
  return (
    <View style={styles.button}>
      <Button onPress={onPress} title={title} />
    </View>
  );
};

export default function App() {
  const bazaar = useBazaar(inAppBillingKey);

  const [sku, setSku] = React.useState<string>('developerTest');
  const [result, setResultText] = React.useState<any>();
  async function setResult(p: Promise<any>) {
    try {
      setResultText(JSON.stringify(await p, null, 2));
    } catch (e) {
      setResultText(e.message);
    }
  }

  const onPurchase = () => setResult(bazaar.purchaseProduct(sku));
  const onQueryPurchases = () => setResult(bazaar.queryPurchaseProduct(sku));
  const onGetPurchases = () => setResult(bazaar.getPurchasedProducts());

  // -------------------------------------------------------

  const onSubscribe = () => setResult(bazaar.subscribeProduct(sku));
  const onQuerySubscribe = () => setResult(bazaar.querySubscribeProduct(sku));
  const onGetSubscriptions = () => setResult(bazaar.getSubscribedProducts());

  return (
    <View style={styles.container}>
      <ScrollView style={styles.padded}>
        <Text>{result}</Text>
      </ScrollView>
      <View style={[styles.padded, styles.actionsContainer]}>
        <TextInput
          onChangeText={setSku}
          value={sku}
          style={styles.textInput}
          placeholder="sku"
        />
        <View style={styles.actionLine}>
          <View>
            <MyButton onPress={onPurchase} title="Purchase" />
            <MyButton onPress={onQueryPurchases} title="Query Purchase" />
            <MyButton onPress={onGetPurchases} title="Get Purchases" />
          </View>
          <View>
            <MyButton onPress={onSubscribe} title="Subscribe" />
            <MyButton onPress={onQuerySubscribe} title="Query Subscribe" />
            <MyButton onPress={onGetSubscriptions} title="Get Subscriptions" />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  padded: {
    padding: 10,
  },
  actionsContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  textInput: {
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
  },
  button: {
    marginTop: 5,
  },
});
