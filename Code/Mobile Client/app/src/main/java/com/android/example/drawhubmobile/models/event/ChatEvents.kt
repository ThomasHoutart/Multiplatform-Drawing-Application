package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.models.ServerMessageStatus
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.utils.JavaScriptDateConverter
import org.json.JSONObject
import java.time.ZonedDateTime

class ChatMessageSentEvent(message: String, roomName: String) : AbstractEvent() {
    var json: JSONObject = JSONObject()

    init {
        json.put("roomName", roomName)
        json.put("content", message)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.CHAT_MESSAGE_SEND, this)
    }
}

class ChatMessageReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var chatMessage: ChatMessage
    var roomName: String

    init {
        val data = args[0] as JSONObject
        val id = data.get("_id") as String
        val content = data.get("content") as String
        val author = data.get("author") as String
        val timestampStr = data.get("timestamp") as String
        val timestamp = JavaScriptDateConverter.convert(timestampStr)
        val status = try {
            data.get("status") as ServerMessageStatus
        } catch (e: Exception) {
            null
        }
        val avatar = try {
            data.get("avatar") as Int
        } catch (e: Exception) {
            null
        }
        roomName = data.get("roomName") as String
        chatMessage = ChatMessage(id, author, content, timestamp, status, avatar)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.CHAT_MESSAGE_RECEIVED, this)
    }

    companion object {
        fun asServerMessage(
            status: ServerMessageStatus?,
            content: String,
            roomName: String
        ): ChatMessageReceivedEvent {
            val data = JSONObject()
            data.put("_id", "")
            data.put("content", content)
            data.put("author", SocketMessages.SERVER_MESSAGE_AUTHOR)
            data.put("timestamp", JavaScriptDateConverter.getJsString(ZonedDateTime.now()))
            data.put("roomName", roomName)
            data.put("status", status)
            return ChatMessageReceivedEvent(arrayOf(data))
        }
    }
}

class ChatBlockedEvent(val isBlocked: Boolean): AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.BLOCK_CHAT, this)
    }
}