import * as React from 'react';

import ReactNativePoolakey, {
  PURCHASE_REQUEST_CODE,
  SUBSCRIBE_REQUEST_CODE,
} from '@cafebazaar/react-native-poolakey';
import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';
import { inAppBillingKey } from './constants';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  const onPressLearnMore = async () => {
    await ReactNativePoolakey.initializePayment(inAppBillingKey);
    await ReactNativePoolakey.connectPayment();

    try {
      setResult(
        await ReactNativePoolakey.purchaseProduct(
          'developerTest',
          null,
          PURCHASE_REQUEST_CODE
        )
      );
    } catch (e) {
      // setResult(e.toString());
      setResult(e);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text>{JSON.stringify(result, null, 2)}</Text>
      </ScrollView>
      <Button onPress={onPressLearnMore} title="Learn More" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
