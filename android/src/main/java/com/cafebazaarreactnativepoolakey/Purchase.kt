package com.cafebazaarreactnativepoolakey

import ir.cafebazaar.poolakey.entity.PurchaseInfo
import org.json.JSONArray

fun List<PurchaseInfo>.toJsonString(): String {
  val originalsJson = map { it.originalJson }
  val result = JSONArray().apply {
    originalsJson.forEach {
      put(it)
    }
  }

  return result.toString()
}
