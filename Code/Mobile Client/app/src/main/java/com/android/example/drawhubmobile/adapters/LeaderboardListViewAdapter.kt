package com.android.example.drawhubmobile.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.ImageView
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.http.PlayerLeaderboard
import com.android.example.drawhubmobile.utils.AvatarHandler


class LeaderboardListViewAdapter(
    context: Context,
    private val users: List<PlayerLeaderboard>
) : BaseAdapter() {

    private val inflater: LayoutInflater =
        context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater

    override fun getCount(): Int {
        // We only want the top 10 in our leaderboard
        return users.size
    }

    override fun getItem(position: Int): PlayerLeaderboard {
        return users[position]
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View? {
        val retView = inflater.inflate(R.layout.leaderboard_list_view_item, null)
        val player = getItem(position)

        retView.findViewById<ImageView>(R.id.usernameAvatar)
            .setImageResource(AvatarHandler.getAvatarResIdFromInt(player.avatar))
        val usernameText = retView.findViewById<TextView>(R.id.usernameText)
        usernameText.text = player.username
        val scoreText = retView.findViewById<TextView>(R.id.scoreText)
        scoreText.text = player.nWins.toString()
        val positionText = retView.findViewById<TextView>(R.id.playerPosition)
        if (player.username == DrawHubApplication.currentUser.username) {
            retView.findViewById<ConstraintLayout>(R.id.backgroundLayout)
                .setBackgroundColor(retView.resources.getColor(R.color.colorAccent))
            positionText.text = retView.resources.getString(
                R.string.leaderboard_position,
                player.position.toString()
            )
            scoreText.setTextColor(retView.resources.getColor(R.color.colorPrimary))
            positionText.setTextColor(retView.resources.getColor(R.color.colorPrimary))
            usernameText.setTextColor(retView.resources.getColor(R.color.colorPrimary))
        } else {
            positionText.text = retView.resources.getString(
                R.string.leaderboard_position,
                (position + 1).toString()
            )
        }
        return retView
    }
}