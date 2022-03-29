import React, { Component } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableNativeFeedback,
  Text,
  TextInput,
  Button,
  Image,
  View,
} from 'react-native';

import bazaar from '@cafebazaar/react-native-poolakey';

const styles = StyleSheet.create({
  header: {
    height: 120,
    paddingTop: 22,
    paddingStart: 22,
    flexDirection: 'row',
    alignItems: 'center'
  },
  item: {
    flexDirection: 'row-reverse',
    marginTop: 1,
    padding: 8,
    backgroundColor: "gray",
    height: 80
  },
  text: {
    textAlign: "right"
  }
});


var dynamicPriceToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwcmljZSI6MTAwLCJwYWNrYWdlX25hbWUiOiJjb20uc2FtcGxlLmFuZHJvaWQudHJpdmlhbGRyaXZlc2FtcGxlIiwic2t1IjoiZHluYW1pY19wcmljZSIsImV4cCI6MTY3MTYwMDY2OCwibm9uY2UiOiI8ZnVuY3Rpb24gdXVpZDQgYXQgMHgwMDAwMDE4MENBN0I3RjQwPiJ9.OgyrUqYCBlBzvLyItcBsY67WU1JVwZAk0yE3GtS1uoA";
const base64RSA = "MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwDbY/p0EgtJZHE6t9nVZ6QyzcR7e2O5RalVJx6Y+6Dc7n40FqdxAjHBYlptyZsdTg9r77JCS7UjEPXNuCHG5NCBLq/u7DWQQmh8otzMK6/P6nzsJUYvCqyNEu7cecaXmh5DgKlfRFpzNXBzBd4K3Xon8hBJjez/qdzvMtmHVFpdCSApUC0WTmT/kq1tDKLU1lDAEt10K83xZbi6lJWcAK20VUn+9KSVFxsr5WuXuWcCAwEAAQ==";
const itemList = [
  { id: "gas", icon: require('./assets/buy_gas.png'), consumable: true },
  { id: "dynamic_price", icon: require('./assets/buy_gas.png'), consumable: true },
  { id: "premium", icon: require('./assets/upgrade_app.png'), consumable: false },
  { id: "infinite_gas_monthly", icon: require('./assets/get_infinite_gas.png'), consumable: false }
];

const items = new Map();
itemList.map((x) => items[x.id] = x);

class App extends Component {
  didMount = false;

  componentDidMount() {
    this.didMount = true;
    bazaar
      .connect(base64RSA)
      .catch(() => this.log).then(this.reteriverProducts); // bazaar is not installed or what?!
  }

  componentWillUnmount() {
    bazaar.disconnect();
  }

  state = {
    log: "",
    waiting: true,
    vehicle: { gas: 4, gasIcon: require("./assets/gas4.png"), skin: require("./assets/free.png") }
  };

  seGas = (gas) => {
    if (gas < 0) {
      this.log(`Fuel tank is empty !`);
      return;
    }

    var icon = require("./assets/gas0.png");
    switch (gas) {
      case 1:
        icon = require("./assets/gas1.png");
        break;
      case 2:
        icon = require("./assets/gas2.png");
        break;
      case 3:
        icon = require("./assets/gas3.png");
        break;
      case 4:
        icon = require("./assets/gas4.png");
        break;
      case 5:
        icon = require("./assets/gas_inf.png");
        break;
    }
    this.setState({
      vehicle: Object.assign(this.state.vehicle, { gas: gas, gasIcon: icon }),
    });
  }

  drive = () => {
    if (this.state.vehicle.gas < 5) {
      this.seGas(this.state.vehicle.gas - 1)
    }
  }

  log = (text) => {
    console.log(text);
    if (this.didMount) {
      this.setState({
        log: this.state.log + "\n" + text
      });
    }
  }

  reteriverProducts = async () => {
    let productIds = itemList.map(x => x.id);
    let skuDetails = await bazaar.getInAppSkuDetails(productIds);
    skuDetails.map(s => {
      items[s.sku].title = s.title;
      items[s.sku].price = s.price;
      items[s.sku].description = s.description;
    });

    // Update state based on old purchases and subscriptions
    let purchases = await bazaar.getPurchasedProducts();
    purchases.map(p => {
      this.handlePurchase(p);
    });
    let subscribes = await bazaar.getSubscribedProducts();
    subscribes.map(p => {
      this.handlePurchase(p);
    });

    this.setState({
      waiting: false
    });
  }

});

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "dimgray" }} >
        <View style={{ flexDirection: 'column', flex: 1 }} >
          <View style={styles.header} >
            <View style={{ flexDirection: "column", alignItems: 'center' }}  >
              <Image resizeMode={'contain'} style={{ width: "100%", height: 56 }} source={this.state.vehicle.skin} />
              <Image resizeMode={'contain'} style={{ width: 128 }} source={this.state.vehicle.gasIcon} />
            </View>
            <View style={{ flex: 1, alignItems: 'center', paddingBottom: 22 }}>
              <Button title={"یه دوری بزن!"} onPress={() => this.drive()} />
            </View>
          </View>
          <View>
            <FlatList
              data={itemList}
              renderItem={({ item }) => {
                return <TouchableNativeFeedback onPress={() => this.purchase(item)}>
                  <View style={styles.item} >
                    <View style={{ flexDirection: 'column', flex: 0.8 }}>
                      <Text style={styles.text}>{item.title}</Text>
                      {item.id == "dynamic_price"
                        ? <TextInput style={{ borderWidth: 1, height: 36 }} value={dynamicPriceToken} onChangeText={(t) => { dynamicPriceToken = t }} />
                        : <Text style={styles.text}>{item.description}</Text>}
                    </View>
                    <View style={{ flexDirection: 'column', flex: 0.3, alignItems: 'center' }}>
                      <Image resizeMode={'contain'} style={{ flex: 1 }} source={item.icon} />
                      <View style={{ height: 4 }} />
                      <Text style={styles.text}>{item.price}</Text>
                    </View>
                  </View>
                </TouchableNativeFeedback>
              }}
            />
          </View>
          <ScrollView style={{ margin: 8 }} >
            <Text>{this.state.log}</Text>
          </ScrollView>
          <View style={{ alignSelf: 'flex-end', right: 8, bottom: 8 }}>
            <Button title='Clear' onPress={() => this.setState({ log: "" })} />
          </View>
        </View>
        {
          this.state.waiting ? (
            <View style={{ backgroundColor: 0xe2e2e2b2, position: 'absolute', right: 0, left: 0, top: 0, bottom: 0, justifyContent: 'center' }}>
              <Text style={{ alignSelf: 'center', color: 'black' }}>Please wait ...</Text>
            </View>) : null
        }
      </SafeAreaView>);
  }
}

export default App;