package com.android.example.drawhubmobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.viewholders.ChatMessageReceivedViewHolder
import com.android.example.drawhubmobile.viewholders.ChatMessageSentViewHolder
import com.android.example.drawhubmobile.viewholders.ChatMessageServerViewHolder


class ChatMessagesAdapter(private val messages: List<ChatMessage>) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private enum class MessageTypes {
        SENT,
        RECEIVED,
        SERVER
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val view: View
        when (viewType) {
            MessageTypes.SENT.ordinal -> {
                view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.chat_message_view_sent, parent, false) as ConstraintLayout
                return ChatMessageSentViewHolder(view)
            }
            MessageTypes.RECEIVED.ordinal -> {
                view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.chat_message_view_received, parent, false) as ConstraintLayout
                return ChatMessageReceivedViewHolder(view)
            }
            else -> {
                view = LayoutInflater.from(parent.context)
                    .inflate(R.layout.chat_message_view_server, parent, false) as LinearLayout
                return ChatMessageServerViewHolder(view)
            }
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentMessage = messages[position]
        when {
            getItemViewType(position) == MessageTypes.SENT.ordinal -> {
                val sentHolder = holder as ChatMessageSentViewHolder
                sentHolder.setDetails(currentMessage)
            }
            getItemViewType(position) == MessageTypes.RECEIVED.ordinal -> {
                val receivedHolder = holder as ChatMessageReceivedViewHolder
                receivedHolder.setDetails(currentMessage)
            }
            else -> {
                val serverHolder = holder as ChatMessageServerViewHolder
                serverHolder.setDetails(currentMessage)
                serverHolder.setStatus(currentMessage.status)
            }
        }
    }

    override fun getItemViewType(position: Int): Int {
        return when (messages[position].username) {
            DrawHubApplication.currentUser.username -> MessageTypes.SENT.ordinal
            SocketMessages.SERVER_MESSAGE_AUTHOR -> MessageTypes.SERVER.ordinal
            else -> MessageTypes.RECEIVED.ordinal
        }
    }

    override fun getItemCount() = messages.size
}