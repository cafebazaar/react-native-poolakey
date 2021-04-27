package com.cafebazaarreactnativepoolakey

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
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

  @ReactMethod
  fun initializePayment(rsaPublicKey: String? = null) {

    val securityCheck = if (rsaPublicKey == null) {
      SecurityCheck.Disable
    } else {
      SecurityCheck.Enable(rsaPublicKey = rsaPublicKey)
    }
    val paymentConfig = PaymentConfiguration(localSecurityCheck = securityCheck)
    payment = Payment(context = reactContext, config = paymentConfig)
  }

  @ReactMethod
  fun connectPayment(promise: Promise) {
    runIfPaymentInitialized(promise) {
      paymentConnection = payment.connect {
        connectionSucceed { promise.resolve(null) }
        connectionFailed { promise.reject(it) }
        disconnected { promise.reject(DisconnectException()) }
      }
    }

    reactContext.addActivityEventListener(this)
  }

  @ReactMethod
  fun disconnectPayment(promise: Promise) {
    paymentConnection?.disconnect()
    reactContext.removeActivityEventListener(this)
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
        failedToBeginFlow { promise.reject(it) }
        purchaseFlowBegan { promise.resolve(null) }
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

  override fun onNewIntent(intent: Intent?) {
    // no need to handle this method
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    runIfPaymentInitialized(purchasePromise) {
      payment.onActivityResult(requestCode, resultCode, data) {
        purchaseSucceed { purchaseEntity ->
          purchasePromise?.resolve(purchaseEntity.originalJson)
        }
        purchaseCanceled {
          purchasePromise?.resolve(null)
        }
        purchaseFailed { throwable ->
          purchasePromise?.reject(throwable)
        }
      }
    }
  }

  companion object {
    private lateinit var payment: Payment
    private const val REQUEST_CODE = 1000

    private fun runIfPaymentInitialized(promise: Promise?, runner: () -> Unit) {
      if (::payment.isInitialized.not()) {
        promise?.reject(IllegalStateException("payment not initialized"))
        return
      }

      runner.invoke()
    }
  }
}
