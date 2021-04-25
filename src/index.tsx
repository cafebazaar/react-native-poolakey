import { NativeModules } from 'react-native';

type ReactNativePoolakeyType = {
  multiply(a: number, b: number): Promise<number>;
};

const { ReactNativePoolakey } = NativeModules;

export default ReactNativePoolakey as ReactNativePoolakeyType;
