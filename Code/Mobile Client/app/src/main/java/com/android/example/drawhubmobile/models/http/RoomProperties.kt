package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class RoomProperties(
    @Json(name = "rooms") val rooms: List<Room>
)