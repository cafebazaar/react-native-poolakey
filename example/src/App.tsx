import * as React from 'react';

import { StyleSheet, View, Text, Button, ScrollView } from 'react-native';
import ReactNativePoolakey from '@cafebazaar/react-native-poolakey';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();

  const onPressLearnMore = async () => {
    await ReactNativePoolakey.initializePayment(null);
    await ReactNativePoolakey.connectPayment();

    try {
      setResult(await ReactNativePoolakey.purchaseProduct('xyz', null, 123));
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
