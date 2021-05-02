package com.cafebazaarreactnativepoolakey

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule;
import ir.cafebazaar.poolakey.Connection
import ir.cafebazaar.poolakey.Payment
import ir.cafebazaar.poolakey.config.PaymentConfiguration
import ir.cafebazaar.poolakey.config.SecurityCheck
import ir.cafebazaar.poolakey.exception.DisconnectException
import ir.cafebazaar.poolakey.request.PurchaseRequest

class ReactNativePoolakeyModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  override fun getName(): String {
    return "ReactNativePoolakey"
  }

  private var purchasePromise: Promise? = null
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
          purchasePromise?.reject(DisconnectException())
          purchasePromise = null
          reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("disconnected", null);
        }
      }
    }

    reactContext.addActivityEventListener(this)
  }

  @ReactMethod
  fun disconnectPayment(promise: Promise) {
    paymentConnection?.disconnect()
    reactContext.removeActivityEventListener(this)
    purchasePromise?.reject(DisconnectException())
    purchasePromise = null
    promise.resolve(null)
  }

  @ReactMethod
  fun purchaseProduct(
    productId: String,
    developerPayload: String?,
    promise: Promise
  ) {

    check(currentActivity != null) {
      "currentActivity is null"
    }

    check(purchasePromise == null) {
      "another purchase is in process"
    }

    runIfPaymentInitialized(promise) {
      val purchaseRequest = PurchaseRequest(
        productId,
        REQUEST_CODE,
        developerPayload
      )

      payment.purchaseProduct(
        requireNotNull(currentActivity),
        purchaseRequest
      ) {
        purchaseFlowBegan { purchasePromise = promise }
        failedToBeginFlow { promise.reject(it) }
      }
    }
  }

  @ReactMethod
  fun subscribeProduct(
    productId: String,
    developerPayload: String?,
    promise: Promise
  ) {

    check(currentActivity != null) {
      "currentActivity is null"
    }

    check(purchasePromise == null) {
      "another purchase is in process"
    }

    runIfPaymentInitialized(promise) {
      val purchaseRequest = PurchaseRequest(
        productId,
        REQUEST_CODE,
        developerPayload
      )

      payment.subscribeProduct(
        requireNotNull(currentActivity),
        purchaseRequest
      ) {
        purchaseFlowBegan { purchasePromise = promise }
        failedToBeginFlow { promise.reject(it) }
      }
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
            it.packageName == productId
          }

          if (product == null) {
            promise.reject(NotFoundException)
          } else {
            promise.resolve(product)
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
            it.packageName == productId
          }

          if (product == null) {
            promise.reject(NotFoundException)
          } else {
            promise.resolve(product)
          }
        }
      }
    }
  }

  override fun onNewIntent(intent: Intent?) {
    // no need to handle this method
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    runIfPaymentInitialized(purchasePromise) {
      payment.onActivityResult(requestCode, resultCode, data) {
        purchaseSucceed { purchaseEntity ->
          purchasePromise?.resolve(purchaseEntity.originalJson)
          purchasePromise = null
        }
        purchaseCanceled {
          purchasePromise?.resolve(null)
          purchasePromise = null
        }
        purchaseFailed { throwable ->
          purchasePromise?.reject(throwable)
          purchasePromise = null
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

  companion object {
    private const val REQUEST_CODE = 1000
  }
}
