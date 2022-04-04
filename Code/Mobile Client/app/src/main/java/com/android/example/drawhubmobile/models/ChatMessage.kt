package com.android.example.drawhubmobile.models

import java.time.LocalDateTime

data class ChatMessage(
    val id: String,
    val username: String,
    val text: String,
    val timestamp: LocalDateTime,
    val status: ServerMessageStatus? = null,
    val avatar: Int?
)
