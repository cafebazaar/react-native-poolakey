package ir.cafebazaar.poolakey.rn

import ir.cafebazaar.poolakey.entity.SkuDetails
import org.json.JSONArray
import org.json.JSONObject

fun List<SkuDetails>.toJsonString(): String {
  val originalsJson = map { it.toJson() }
  return "[" + originalsJson.joinToString() + "]"
}

fun SkuDetails.toJson(): String {
  val res = JSONObject()
  res.put("sku", this.sku)
  res.put("title", this.title)
  res.put("type", this.type)
  res.put("price", this.price)
  res.put("description", this.description)
  return res.toString()
}

fun parseProductIds(productIdsJson: String): List<String> {
  val ja = JSONArray(productIdsJson);
  val result = mutableListOf<String>()
  for (i in 0 until ja.length()) {
    result.add(ja.getString(i))
  }
  return result
}
