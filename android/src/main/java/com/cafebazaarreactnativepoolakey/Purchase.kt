package com.cafebazaarreactnativepoolakey

import ir.cafebazaar.poolakey.entity.PurchaseInfo
import org.json.JSONArray

fun List<PurchaseInfo>.toJsonString(): String {
  val originalsJson = map { it.originalJson }
  return "[" + originalsJson.joinToString() + "]"
}
