package com.cafebazaarreactnativepoolakey

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule;
import ir.cafebazaar.poolakey.Connection
import ir.cafebazaar.poolakey.ConnectionState
import ir.cafebazaar.poolakey.Payment
import ir.cafebazaar.poolakey.config.PaymentConfiguration
import ir.cafebazaar.poolakey.config.SecurityCheck
import ir.cafebazaar.poolakey.exception.DisconnectException
import ir.cafebazaar.poolakey.request.PurchaseRequest

class ReactNativePoolakeyModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "ReactNativePoolakey"
  }

  private var paymentConnection: Connection? = null
  private lateinit var payment: Payment

  @ReactMethod
  fun connectPayment(rsaPublicKey: String? = null, promise: Promise) {
    val securityCheck = if (rsaPublicKey == null) {
      SecurityCheck.Disable
    } else {
      SecurityCheck.Enable(rsaPublicKey = rsaPublicKey)
    }
    val paymentConfig = PaymentConfiguration(localSecurityCheck = securityCheck)
    payment = Payment(context = reactContext, config = paymentConfig)

    runIfPaymentInitialized(promise) {
      paymentConnection = payment.connect {
        connectionSucceed { promise.resolve(null) }
        connectionFailed { promise.reject(it) }
        disconnected {
          // reactContext.removeActivityEventListener(this)
          promise.reject(DisconnectException())
          reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("disconnected", null);
        }
      }
    }
  }

  @ReactMethod
  fun disconnectPayment(promise: Promise) {
    paymentConnection?.disconnect()
    promise.resolve(null)
  }

  fun startActivity(
    command: PaymentActivity.Command,
    productId: String,
    promise: Promise,
    payload: String?,
    dynamicPriceToken: String?
  ) {

    if (paymentConnection?.getState() != ConnectionState.Connected) {
      promise.reject(IllegalStateException("payment not connected"))
      return
    }
    val activity = getCurrentActivity();
    if (activity == null) {
      promise.reject(IllegalStateException("activity not found"))
      return
    }
    
    PaymentActivity.start(
      activity,
      command,
      productId,
      payment,
      promise,
      payload,
      dynamicPriceToken
    )
  }

  @ReactMethod
  fun purchaseProduct(
    productId: String,
    developerPayload: String?,
    dynamicPriceToken: String?,
    promise: Promise
  ) {

    check(currentActivity != null) {
      "currentActivity is null"
    }

    runIfPaymentInitialized(promise) {
      startActivity(
        command = PaymentActivity.Command.Purchase,
        productId = productId,
        promise = promise,
        payload = developerPayload,
        dynamicPriceToken = dynamicPriceToken,
      )

    }
  }

  @ReactMethod
  fun subscribeProduct(
    productId: String,
    developerPayload: String?,
    dynamicPriceToken: String?,
    promise: Promise
  ) {

    check(currentActivity != null) {
      "currentActivity is null"
    }

    runIfPaymentInitialized(promise) {
      startActivity(
        command = PaymentActivity.Command.Subscribe,
        productId = productId,
        promise = promise,
        payload = developerPayload,
        dynamicPriceToken = dynamicPriceToken,
      )
    }
  }

  @ReactMethod
  fun consumePurchase(purchaseToken: String, promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.consumeProduct(purchaseToken) {
        consumeFailed { promise.reject(it) }
        consumeSucceed { promise.resolve(null) }
      }
    }
  }

  @ReactMethod
  fun getPurchasedProducts(promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.getPurchasedProducts {
        queryFailed { promise.reject(it) }
        querySucceed {
          promise.resolve(it.toJsonString())
        }
      }
    }
  }

  @ReactMethod
  fun getSubscribedProducts(promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.getSubscribedProducts {
        queryFailed { promise.reject(it) }
        querySucceed {
          promise.resolve(it.toJsonString())
        }
      }
    }
  }

  @ReactMethod
  fun queryPurchaseProduct(productId: String, promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.getPurchasedProducts {
        queryFailed { promise.reject(it) }
        querySucceed { purchaseList ->
          val product = purchaseList.firstOrNull {
            it.productId == productId
          }

          if (product == null) {
            promise.reject(NotFoundException)
          } else {
            promise.resolve(product.originalJson)
          }
        }
      }
    }
  }

  @ReactMethod
  fun querySubscribeProduct(productId: String, promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.getSubscribedProducts {
        queryFailed { promise.reject(it) }
        querySucceed { purchaseList ->
          val product = purchaseList.firstOrNull {
            it.productId == productId
          }

          if (product == null) {
            promise.reject(NotFoundException)
          } else {
            promise.resolve(product.originalJson)
          }
        }
      }
    }
  }

  @ReactMethod
  fun getInAppSkuDetails(productIdsJson: String, promise: Promise) {
    val productIds = parseProductIds(productIdsJson)
    runIfPaymentInitialized(promise) {
      payment.getInAppSkuDetails(productIds) {
        getSkuDetailsFailed { promise.reject(it) }
        getSkuDetailsSucceed {
          promise.resolve(it.toJsonString())
        }
      }
    }
  }

  @ReactMethod
  fun getSubscriptionSkuDetails(productIdsJson: String, promise: Promise) {
    val productIds = parseProductIds(productIdsJson)
    runIfPaymentInitialized(promise) {
      payment.getSubscriptionSkuDetails(productIds) {
        getSkuDetailsFailed { promise.reject(it) }
        getSkuDetailsSucceed {
          promise.resolve(it.toJsonString())
        }
      }
    }
  }

  private fun runIfPaymentInitialized(promise: Promise?, runner: () -> Unit) {
    if (::payment.isInitialized.not()) {
      promise?.reject(IllegalStateException("payment not initialized"))
      return
    }

    runner.invoke()
  }

  // companion object {
  //   private const val REQUEST_CODE = 1000
  // }
}
