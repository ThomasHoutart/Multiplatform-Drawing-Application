package com.android.example.drawhubmobile.viewholders

import android.content.res.ColorStateList
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.utils.AvatarHandler

class ScoreItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val backgroundLayout = itemView.findViewById<ConstraintLayout>(R.id.backgroundLayout)
    private val usernameText = itemView.findViewById<TextView>(R.id.usernameText)
    private val scoreText = itemView.findViewById<TextView>(R.id.scoreText)

    private val avatarPortrait = itemView.findViewById<ImageView>(R.id.avatarPortrait)
    private val usernameAvatar = itemView.findViewById<ImageView>(R.id.usernameAvatar)

    fun setDetails(player: Player, position: Int) {
        usernameText.text = player.username
        scoreText.text = player.score.toString()
        if (DrawHubApplication.currentUser.username == player.username) {
            val highlightedColor = itemView.context.getColor(R.color.colorPrimaryLight)
            backgroundLayout.backgroundTintList = ColorStateList.valueOf(highlightedColor)
        }
        usernameAvatar.setImageResource(AvatarHandler.getAvatarResIdFromInt(player.avatar))
        when (position) {
            0 -> avatarPortrait.setImageResource(R.drawable.gold_portrait)
            1 -> avatarPortrait.setImageResource(R.drawable.silver_portrait)
            2 -> avatarPortrait.setImageResource(R.drawable.bronze_portrait)
            else -> avatarPortrait.visibility = View.GONE
        }
    }
}