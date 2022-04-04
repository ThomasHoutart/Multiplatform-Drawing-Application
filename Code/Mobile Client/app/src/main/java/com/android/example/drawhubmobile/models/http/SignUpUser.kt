package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class SignUpUser(
    @Json(name = "firstName") val firstName: String,
    @Json(name = "lastName") val lastName: String,
    @Json(name = "username") val username: String,
    @Json(name = "email") val email: String,
    @Json(name = "hash") val hash: String,
    @Json(name = "avatar") val avatarId: Int
)