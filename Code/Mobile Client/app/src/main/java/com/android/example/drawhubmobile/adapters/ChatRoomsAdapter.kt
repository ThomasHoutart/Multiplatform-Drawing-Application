package com.android.example.drawhubmobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.viewholders.ChatRoomViewHolder


class ChatRoomsAdapter(
    private val rooms: List<ChatRoom>,
    private val onItemClickCallback: (room: ChatRoom) -> Unit,
    private val onRoomDeleteCallback: (room: ChatRoom) -> Unit,
    private val onRoomLeaveCallback: (room: ChatRoom) -> Unit
) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val view: View
        view = LayoutInflater.from(parent.context)
            .inflate(R.layout.chat_room_view, parent, false) as ConstraintLayout
        return ChatRoomViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentRoom = rooms[position]
        val roomHolder = holder as ChatRoomViewHolder
        roomHolder.setOnClickListener { onItemClickCallback(currentRoom) }
        if (currentRoom.creator == DrawHubApplication.currentUser.username) {
            roomHolder.setOnLeaveClickListener { onRoomDeleteCallback(currentRoom) }
        } else {
            roomHolder.setOnLeaveClickListener { onRoomLeaveCallback(currentRoom) }
        }
        roomHolder.setDetails(currentRoom)
    }

    override fun getItemCount() = rooms.size
}