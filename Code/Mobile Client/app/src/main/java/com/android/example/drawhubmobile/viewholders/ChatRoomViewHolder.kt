package com.android.example.drawhubmobile.viewholders

import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.network.SYSTEM_CREATOR_NAME

class ChatRoomViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val layout = itemView.findViewById<ConstraintLayout>(R.id.roomLayout)
    private val roomNameTextView = itemView.findViewById<TextView>(R.id.roomName)
    private val unreadMessagesTextView = itemView.findViewById<TextView>(R.id.unreadMessages)
    private val leaveChatImageView = itemView.findViewById<ImageView>(R.id.leaveChat)

    fun setDetails(room: ChatRoom) {
        roomNameTextView.text = room.name
        unreadMessagesTextView.text = room.unreadMessages.toString()
        if (room.unreadMessages < 1) {
            unreadMessagesTextView.visibility = View.INVISIBLE
        }
        if (room.creator == SYSTEM_CREATOR_NAME) {
            leaveChatImageView.visibility = View.INVISIBLE
        }
    }

    fun setOnClickListener(callback: () -> Unit) {
        layout.setOnClickListener { callback() }
    }

    fun setOnLeaveClickListener(callback: () -> Unit) {
        leaveChatImageView.setOnClickListener { callback() }
    }
}