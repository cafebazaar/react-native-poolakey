
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativePoolakeySpec.h"

@interface ReactNativePoolakey : NSObject <NativeReactNativePoolakeySpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativePoolakey : NSObject <RCTBridgeModule>
#endif

@end
