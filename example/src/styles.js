import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentCenter: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 120,
    paddingTop: 22,
    paddingStart: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    padding: 8,
    backgroundColor: '#fff',
    height: 80,
  },
  text: {
    textAlign: 'right',
    color: '#000',
  },
  largerText: {
    color: '#666',
    fontSize: 25,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  logText: {
    color: '#e74c3c',
    lineHeight: 20,
  },
});

export default styles;
