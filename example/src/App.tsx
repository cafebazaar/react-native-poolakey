import * as React from 'react';

import poolakey from '@cafebazaar/react-native-poolakey';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  TextInput,
} from 'react-native';
import { inAppBillingKey } from './constants';

export default function App() {
  const [sku, setSku] = React.useState<string>('developerTest');
  const [result, setResult] = React.useState<any>();
  poolakey.initialize(inAppBillingKey);

  const onPurchase = async () => {
    try {
      setResult(await poolakey.purchaseProduct(sku));
    } catch (e) {
      setResult(e);
    }
  };

  const onGetPurchases = async () => {
    try {
      setResult(await poolakey.getPurchasedProducts());
    } catch (e) {
      setResult(e);
    }
  };

  const onSubscribe = () => {};
  const onCheckPurchase = () => {};
  const onCheckSubscribed = () => {};

  return (
    <View style={styles.container}>
      <ScrollView style={styles.padded}>
        <Text>{JSON.stringify(result, null, 2)}</Text>
      </ScrollView>
      <View style={[styles.padded, styles.actionsContainer]}>
        <TextInput
          onChangeText={setSku}
          value={sku}
          style={styles.textInput}
          placeholder="sku"
        />
        <Button onPress={onPurchase} title="Purchase" />
        <Button onPress={onGetPurchases} title="Get Purchases" />
        <Button onPress={onSubscribe} title="Subscribe" />
        <Button
          onPress={onCheckPurchase}
          title="Check if user Purchased this Item"
        />
        <Button
          onPress={onCheckSubscribed}
          title="Check if user Subscribed this Item"
        />
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
    height: 230,
  },
  textInput: {
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
  },
  button: {
    paddingTop: 10,
  },
});
