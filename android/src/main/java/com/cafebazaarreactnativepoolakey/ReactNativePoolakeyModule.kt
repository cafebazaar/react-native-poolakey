package com.cafebazaarreactnativepoolakey

import android.app.Activity
import android.content.Intent
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
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "ReactNativePoolakey"
  }

  private lateinit var payment: Payment
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
  }

  @ReactMethod
  fun disconnectPayment(promise: Promise) {
    paymentConnection?.disconnect()
    promise.resolve(null)
  }

  @ReactMethod
  fun purchaseProduct(
    productId: String,
    developerPayload: String?,
    requestCode: Int,
    activity: Activity,
    promise: Promise
  ) {
    runIfPaymentInitialized(promise) {
      val purchaseRequest = PurchaseRequest(
        productId,
        requestCode,
        developerPayload
      )

      payment.purchaseProduct(
        activity,
        purchaseRequest
      ) {
        failedToBeginFlow { promise.reject(it) }
        purchaseFlowBegan { promise.resolve(null) }
      }
    }
  }

  @ReactMethod
  fun subscribeProduct(
    productId: String,
    developerPayload: String?,
    requestCode: Int,
    activity: Activity,
    promise: Promise
  ) {
    runIfPaymentInitialized(promise) {
      val purchaseRequest = PurchaseRequest(
        productId,
        requestCode,
        developerPayload
      )

      payment.subscribeProduct(
        activity,
        purchaseRequest
      ) {
        failedToBeginFlow { promise.reject(it) }
        purchaseFlowBegan { promise.resolve(null) }
      }
    }
  }

  @ReactMethod
  fun onActivityForResult(
    requestCode: Int,
    resultCode: Int,
    data: Intent?,
    promise: Promise
  ) {
    runIfPaymentInitialized(promise) {
      payment.onActivityResult(requestCode, resultCode, data) {
        purchaseSucceed { purchaseEntity ->
          promise.resolve(purchaseEntity.originalJson)
        }
        purchaseCanceled {
          promise.resolve(null)
        }
        purchaseFailed { throwable ->
          promise.reject(throwable)
        }
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
  fun getPurchasedProduct(promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.getPurchasedProducts {
        queryFailed { promise.reject(it) }
        querySucceed {
          // TODO convert list to json object
        }
      }
    }
  }

  @ReactMethod
  fun getSubscribedProduct(promise: Promise) {
    runIfPaymentInitialized(promise) {
      payment.getSubscribedProducts {
        queryFailed { promise.reject(it) }
        querySucceed {
          // TODO convert list to json object
        }
      }
    }
  }

  private fun runIfPaymentInitialized(promise: Promise, runner: () -> Unit) {
    if (::payment.isInitialized) {
      promise.reject(IllegalStateException("payment not initialized"))
      return
    }

    runner.invoke()
  }
}
