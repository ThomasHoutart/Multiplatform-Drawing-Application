package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class Salt (
    @Json(name = "tempSalt") val tempSalt: String,
    @Json(name = "permSalt") val permSalt: String
)