package com.android.example.drawhubmobile.viewholders

import android.view.View
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.models.ServerMessageStatus

class ChatMessageServerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val messageTextView = itemView.findViewById<TextView>(R.id.messageText)

    fun setDetails(message: ChatMessage) {
        messageTextView.text = message.text
    }

    // Do not call this method if you want the default gray color
    fun setStatus(status: ServerMessageStatus?) {
        if (status == null) return
        val colorBad = itemView.context.getColor(R.color.colorTextError)
        val colorGood = itemView.context.getColor(R.color.colorTextPositive)
        val colorImportant = itemView.context.getColor(R.color.colorTextImportant)
        when (status) {
            ServerMessageStatus.GOOD -> messageTextView.setTextColor(colorGood)
            ServerMessageStatus.BAD -> messageTextView.setTextColor(colorBad)
            ServerMessageStatus.IMPORTANT -> messageTextView.setTextColor(colorImportant)
        }
    }
}