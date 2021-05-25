package com.cafebazaarreactnativepoolakey

import ir.cafebazaar.poolakey.entity.SkuDetails

fun List<SkuDetails>.toJsonString(): String {
  val originalsJson = map { it.toJson() }
  return "[" + originalsJson.joinToString() + "]"
}

fun SkuDetails.toJson(): String {
  return "[$sku,$title,$type,$price,$description]"
}
