package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class MessageHistory(
    @Json(name = "messageHistory") val messages: List<Message>
)

data class Message(
    @Json(name = "_id") val id: String,
    @Json(name = "author") val author: String,
    @Json(name = "content") val content: String,
    @Json(name = "timestamp") val timestamp: String,
    @Json(name = "roomName") val roomName: String,
    @Json(name = "avatar") val avatar: Int?
)