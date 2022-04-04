package com.android.example.drawhubmobile.viewholders

import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.utils.AvatarHandler

class ChatMessageSentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val messageTextView = itemView.findViewById<TextView>(R.id.messageText)
    private val timestampTextView = itemView.findViewById<TextView>(R.id.timestampText)
    private val avatarView = itemView.findViewById<ImageView>(R.id.avatarView)

    fun setDetails(message: ChatMessage) {
        messageTextView.text = message.text
        timestampTextView.text = message.timestamp.toLocalTime().toString()
        if (message.avatar == null)
            avatarView.visibility = View.GONE
        else
            avatarView.setImageResource(AvatarHandler.getAvatarResIdFromInt(message.avatar))
    }
}