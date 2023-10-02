import React from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native';

export default function Product({
  title,
  description,
  price,
  consumable,
  onPurchase,
}) {
  return (
    <View style={styles.productWrapper}>
      <View styles={styles.child}>
        <Text style={styles.productTitle}>{title}</Text>
      </View>
      <TouchableNativeFeedback style={styles.button} onPress={onPurchase}>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{price}</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  productWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    elevation: 2,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  productTitle: {
    fontSize: 16,
  },
  child: {
    flex: 1,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1B9C85',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
});
