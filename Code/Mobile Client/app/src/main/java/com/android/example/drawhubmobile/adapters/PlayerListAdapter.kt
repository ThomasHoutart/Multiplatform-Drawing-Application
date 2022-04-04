package com.android.example.drawhubmobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.InGameUser
import com.android.example.drawhubmobile.models.game.Spectator
import com.android.example.drawhubmobile.viewholders.PlayerItemViewHolder


class PlayerListAdapter(
    private val playersAndSpectators: List<InGameUser>,
    private val onKickPlayerClickCallback: (username: String) -> Unit,
    private val isCreator: Boolean
) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val view: View
        view = LayoutInflater.from(parent.context)
            .inflate(R.layout.player_item_view, parent, false) as ConstraintLayout
        return PlayerItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentPlayer = playersAndSpectators[position]
        val playerHolder = holder as PlayerItemViewHolder
        playerHolder.setOnKickPlayerClickListener { onKickPlayerClickCallback(currentPlayer.username) }
        playerHolder.setDetails(currentPlayer, isCreator, currentPlayer is Spectator)
    }

    override fun getItemCount() = playersAndSpectators.size
}