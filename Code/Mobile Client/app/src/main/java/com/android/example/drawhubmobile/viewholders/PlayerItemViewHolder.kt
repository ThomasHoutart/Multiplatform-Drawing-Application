package com.android.example.drawhubmobile.viewholders

import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.InGameUser
import com.android.example.drawhubmobile.utils.AvatarHandler

class PlayerItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val usernameText = itemView.findViewById<TextView>(R.id.usernameText)
    private val spectatorText = itemView.findViewById<TextView>(R.id.spectatorIndicator)
    private val kickPlayerIcon = itemView.findViewById<ImageView>(R.id.kickPlayer)
    private val avatarView = itemView.findViewById<ImageView>(R.id.avatarView)

    fun setDetails(player: InGameUser, isCreator: Boolean, isSpectator: Boolean) {
        usernameText.text = player.username
        spectatorText.visibility = if (isSpectator) View.VISIBLE else View.GONE
        kickPlayerIcon.visibility = View.GONE
        if (isCreator && player.username != DrawHubApplication.currentUser.username && !isSpectator)
            kickPlayerIcon.visibility = View.VISIBLE
        avatarView.setImageResource(AvatarHandler.getAvatarResIdFromInt(player.avatar))
    }

    fun setOnKickPlayerClickListener(callback: () -> Unit) {
        kickPlayerIcon.setOnClickListener { callback() }
    }
}