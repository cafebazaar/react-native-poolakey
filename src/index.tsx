import { NativeModules } from 'react-native';

type ReactNativePoolakeyType = {
  multiply(a: number, b: number): Promise<number>;
};

const { ReactNativePoolakey } = NativeModules;

export const PURCHASE_REQUEST_CODE = 1000;
export const SUBSCRIBE_REQUEST_CODE = 1001;

export default ReactNativePoolakey as ReactNativePoolakeyType;
