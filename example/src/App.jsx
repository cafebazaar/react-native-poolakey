/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableNativeFeedback,
  Text,
  TextInput,
  Button,
  Image,
  View,
  ActivityIndicator,
} from 'react-native';

import Poolakey from '@cafebazaar/react-native-poolakey';
import { APP_PRODUCTS, RSA_KEY } from './configs';
import styles from './styles';

const productsBySku = new Map();
APP_PRODUCTS.map((p) => productsBySku.set(p.sku, p));

const icons = {
  free: require('../assets/free.png'),
  gas_inf: require('../assets/gas_inf.png'),
  premiumSkin: require('../assets/premium.png'),
  gas0: require('../assets/gas0.png'),
  gas1: require('../assets/gas1.png'),
  gas2: require('../assets/gas2.png'),
  gas3: require('../assets/gas3.png'),
  gas4: require('../assets/gas4.png'),
  gas5: require('../assets/gas_inf.png'),
};

export default function App() {
  const mounted = useRef(false);
  const logIndex = useRef(1);
  const [waiting, setWaiting] = useState(true);
  const [dynamicPriceToken, setDynamicPriceToken] = useState('');
  const [log, setLog] = useState('');
  const [products, setProducts] = useState([]);

  const [vehicle, setVehicleData] = useState({
    gas: 4,
    gasIcon: icons.gas4,
    skin: icons.free,
  });

  useEffect(() => {
    mounted.current = true;

    Poolakey.connect(RSA_KEY)
      .then(() => {
        console.log('@ SDK Connected');
        fetchProductDetails();
      })
      .catch(recordLog); // bazaar is not installed or what?!

    return () => {
      console.log('@ SDK Disconnected');
      Poolakey.disconnect();
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setVehicleGas(gas) {
    if (gas < 0) {
      recordLog(`Fuel tank is empty !`);
      return;
    }

    setVehicleData({
      ...vehicle,
      gas,
      gasIcon: icons[`gas${gas}`],
    });
  }

  function drive() {
    if (vehicle.gas < 5) {
      setVehicleGas(vehicle.gas - 1);
    }
  }

  function recordLog(message) {
    const messageStr =
      typeof message === 'object' ? JSON.stringify(message) : message;

    console.log(message);

    if (mounted.current) {
      const logSep = log ? '\n\n' : '';
      setLog(`${log}${logSep}${logIndex.current}: \n${messageStr}`);
      logIndex.current = logIndex.current + 1;
    }
  }

  async function fetchProductDetails() {
    try {
      const productIds = APP_PRODUCTS.map((x) => x.sku);
      const skuDetails = await Poolakey.getInAppSkuDetails(productIds);
      const _products = skuDetails.map((p) => {
        // if (!productsBySku[s.sku]) return;
        // const
        // productsBySku[s.sku].title = s.title;
        // productsBySku[s.sku].price = s.price;
        // productsBySku[s.sku].description = s.description;
        return { ...p, icon: productsBySku.get(p.sku)?.icon };
      });
      // console.log('@ skuDetails :>> ', skuDetails);
      setProducts(_products);
      console.log('_products :>> ', _products);
      // Update state based on old purchases and subscriptions
      const purchases = await Poolakey.getPurchasedProducts();
      console.log('@ purchases :>> ', purchases);
      purchases.map((p) => {
        handlePurchase(p);
      });
      let subscribes = await Poolakey.getSubscribedProducts();
      subscribes.map((p) => {
        handlePurchase(p);
      });
    } catch (error) {
      recordLog(`@ fetchProductDetails >> ${error}`);
    } finally {
      setWaiting(false);
    }
  }

  async function purchase(item) {
    if (item.sku === 'gas' || item.sku === 'dynamic_price') {
      if (vehicle.gas >= 4) {
        recordLog(`Fuel tank is full !`);
        return;
      }
    }

    const _dynamicPriceToken =
      item.sku === 'dynamic_price' ? dynamicPriceToken : '';

    const purchaseInfo = await Poolakey.purchaseProduct(
      item.sku,
      '',
      _dynamicPriceToken
    ).catch((e) => {
      recordLog(`Purchase error => ${e.message}.`);
    });

    if (purchaseInfo === null || purchaseInfo.purchaseState !== 0) {
      recordLog(`Purchase failed.`);
      return;
    }
    handlePurchase(purchaseInfo);
  }

  async function handlePurchase(purchaseInfo) {
    recordLog(purchaseInfo);
    // Consume purchase
    if (productsBySku[purchaseInfo.productId]?.consumable) {
      await Poolakey.consumePurchase(purchaseInfo.purchaseToken);
    }

    // Change assets value
    if (
      purchaseInfo.productId === 'gas' ||
      purchaseInfo.productId === 'dynamic_price'
    ) {
      setVehicleGas(vehicle.gas + 1);
    } else if (purchaseInfo.productId === 'infinite_gas_monthly') {
      setVehicleGas(5);
    } else if (purchaseInfo.productId === 'premium') {
      setVehicleData({
        ...vehicle,
        skin: icons.premiumSkin,
      });
    }
  }

  if (waiting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'dimgray' }}>
        <View style={styles.contentCenter}>
          <Text style={styles.largerText}>درحال دریافت اطلاعات</Text>
          <ActivityIndicator size="large" color="#777" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#252B48' }}>
      <View style={{ flexDirection: 'column', flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'column', alignItems: 'center' }}>
            <Image
              resizeMode="contain"
              style={{ width: '100%', height: 56 }}
              source={vehicle.skin}
            />
            <Image
              resizeMode="contain"
              style={{ width: 128 }}
              source={vehicle.gasIcon}
            />
          </View>
          <View style={{ flex: 1, alignItems: 'center', paddingBottom: 22 }}>
            <Button title={'یه دوری بزن'} onPress={drive} />
          </View>
        </View>
        <View style={{ backgroundColor: '#ccc' }}>
          <FlatList
            data={products}
            renderItem={({ item }) => {
              // if (true) return <Text>{JSON.stringify(item)}</Text>;
              return (
                <TouchableNativeFeedback onPress={() => purchase(item)}>
                  <View style={styles.item}>
                    <View style={{ flexDirection: 'column', flex: 0.8 }}>
                      <Text style={styles.text}>{item.title}</Text>
                      {item.sku === 'dynamic_price' ? (
                        <TextInput
                          style={{ borderWidth: 1, height: 36 }}
                          value={dynamicPriceToken}
                          onChangeText={(t) => {
                            setDynamicPriceToken(t);
                          }}
                        />
                      ) : (
                        <Text style={styles.text}>{item.description}</Text>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'column',
                        flex: 0.3,
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        resizeMode={'contain'}
                        style={{ flex: 1 }}
                        source={item.icon}
                      />
                      <View style={{ height: 4 }} />
                      <Text style={styles.text}>{item.price}</Text>
                    </View>
                  </View>
                </TouchableNativeFeedback>
              );
            }}
          />
        </View>

        <ScrollView style={{ padding: 10 }}>
          <Text style={styles.logText}>{log}</Text>
        </ScrollView>

        <View style={{ alignSelf: 'flex-end', right: 8, bottom: 8 }}>
          <Button title="Clear" onPress={() => setLog('')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
