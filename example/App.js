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

const styles = StyleSheet.create({
const itemList = [
  { id: "gas", icon: require('./assets/buy_gas.png'), consumable: true },
  { id: "dynamic_price", icon: require('./assets/buy_gas.png'), consumable: true },
  { id: "premium", icon: require('./assets/upgrade_app.png'), consumable: false },
  { id: "infinite_gas_monthly", icon: require('./assets/get_infinite_gas.png'), consumable: false }
];

const items = new Map();
itemList.map((x) => items[x.id] = x);

class App extends Component {
});

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "dimgray" }} >
        <View style={{ flexDirection: 'column', flex: 1 }} >
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
      </SafeAreaView>);
  }
}

export default App;