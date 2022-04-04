package com.android.example.drawhubmobile.models

data class ChatRoom(
    val name: String,
    val creator: String,
    var unreadMessages: Int,
    val messages: MutableList<ChatMessage>
)