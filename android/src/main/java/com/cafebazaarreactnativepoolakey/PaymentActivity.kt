package com.cafebazaarreactnativepoolakey

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
class PaymentActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

  }
  companion object {

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
      val intent = Intent(activity, PaymentActivity::class.java)
      activity.startActivity(intent)
    }
  }

}
