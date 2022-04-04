package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class Room(
    @Json(name = "roomName") val name: String,
    @Json(name = "creator") val creator: String
)
