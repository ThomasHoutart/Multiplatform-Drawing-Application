package com.android.example.drawhubmobile.testUtils

import com.android.example.drawhubmobile.utils.JavaScriptDateConverter
import org.json.JSONArray
import org.json.JSONObject
import java.time.ZonedDateTime
import java.util.*

object ChatMessageGenerator {

    fun generateMessages(n: Int, username: String, roomName: String): JSONArray {
        val messages = JSONArray()
        for (i in 0 until n) {
            messages.put(generateMessage(username, roomName))
        }
        return messages
    }

    fun generateMessage(username: String, roomName: String, content: String? = null): JSONObject {
        val msg = JSONObject()
        msg.put("_id", generateRandomId())
        msg.put("author", username)
        msg.put("content", content ?: generateRandomContent())
        msg.put("timestamp", generateRandomTimestamp())
        msg.put("roomName", roomName)
        return msg
    }

    private fun generateRandomTimestamp(): String {
        val now = ZonedDateTime.now()
        return JavaScriptDateConverter.getJsString(now)
    }

    private fun generateRandomId(): String {
        return UUID.randomUUID().toString()
    }

    private fun generateRandomContent(): String {
        return arrayListOf(
            "Hey!",
            "Hello",
            "Sup",
            "How are you?",
            "What's kicking?",
            "a",
            "b",
            "Cat",
            "14",
            "Dog",
            "Cow"
        ).random()
    }
}