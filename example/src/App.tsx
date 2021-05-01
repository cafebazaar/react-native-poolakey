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
poolakey.initialize(inAppBillingKey);

const MyButton = ({ onPress, title }: any) => {
  return (
    <View style={styles.button}>
      <Button onPress={onPress} title={title} />
    </View>
  );
};

export default function App() {
  const [sku, setSku] = React.useState<string>('developerTest');
  const [result, setResult] = React.useState<any>();

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

  const onSubscribe = async () => {
    try {
      setResult(await poolakey.subscribeProduct(sku));
    } catch (e) {
      setResult(e);
    }
  };

  const onGetSubscriptions = async () => {
    try {
      setResult(await poolakey.getSubscribedProducts());
    } catch (e) {
      setResult(e);
    }
  };

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
        <View style={styles.actionLine}>
          <View>
            <MyButton onPress={onPurchase} title="Purchase" />
            <MyButton onPress={onGetPurchases} title="Get Purchases" />
          </View>
          <View>
            <MyButton onPress={onSubscribe} title="Subscribe" />
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
