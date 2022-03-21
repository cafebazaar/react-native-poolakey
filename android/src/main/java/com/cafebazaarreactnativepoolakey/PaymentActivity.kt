package com.cafebazaarreactnativepoolakey

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import com.facebook.react.bridge.Promise
import ir.cafebazaar.poolakey.Payment
import ir.cafebazaar.poolakey.callback.PurchaseCallback
import ir.cafebazaar.poolakey.request.PurchaseRequest

class PaymentActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val callback: PurchaseCallback.() -> Unit = {
      purchaseSucceed { purchaseEntity ->
        promise.resolve(purchaseEntity.originalJson)
        finish()
      }
      purchaseCanceled {
        promise.reject(IllegalStateException("purchase canceled"))
        finish()
      }
      purchaseFailed { throwable ->
        promise.reject(throwable)
        finish()
      }
      purchaseFlowBegan {
      }
      failedToBeginFlow {
        promise.reject(it)
        finish()
      }
    }
    when (command) {
      Command.Purchase -> purchaseProduct(callback)
      Command.Subscribe -> subscribeProduct(callback)
    }
  }

  private fun purchaseProduct(callback: PurchaseCallback.() -> Unit) {
    payment.purchaseProduct(
      activityResultRegistry,
      PurchaseRequest(productId, payload, dynamicPriceToken),
      callback
    )
  }

  private fun subscribeProduct(callback: PurchaseCallback.() -> Unit) {
    payment.subscribeProduct(
      activityResultRegistry,
      PurchaseRequest(productId, payload, dynamicPriceToken),
      callback
    )
  }

  companion object {

    private lateinit var command: PaymentActivity.Command
    private lateinit var productId: String
    private lateinit var payment: Payment
    private lateinit var promise: Promise
    private var payload: String? = null
    private var dynamicPriceToken: String? = null

    @JvmStatic
    fun start(
      activity: Activity,
      command: Command,
      productId: String,
      payment: Payment,
      promise: Promise,
      payload: String?,
      dynamicPriceToken: String?
    ) {
      PaymentActivity.command = command
      PaymentActivity.productId = productId
      PaymentActivity.payment = payment
      PaymentActivity.promise = promise
      PaymentActivity.payload = payload
      PaymentActivity.dynamicPriceToken = dynamicPriceToken
      val intent = Intent(activity, PaymentActivity::class.java)
      activity.startActivity(intent)
    }
  }

  enum class Command {
    Purchase,
    Subscribe
  }
}
