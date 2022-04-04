package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class AchievementHttp(
    @Json(name = "trophy") val title: String,
    @Json(name = "hint") val hint: String,
    @Json(name = "isUnlocked") val obtained: Boolean,
    @Json(name = "rank") val rank: String
)