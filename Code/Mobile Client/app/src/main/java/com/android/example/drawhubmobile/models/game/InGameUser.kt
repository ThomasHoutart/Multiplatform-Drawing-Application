package com.android.example.drawhubmobile.models.game

import com.squareup.moshi.Json

open class InGameUser(
    @Json(name = "username") val username: String,
    @Json(name = "score") val score: Int,
    @Json(name = "avatarId") val avatar: Int
)