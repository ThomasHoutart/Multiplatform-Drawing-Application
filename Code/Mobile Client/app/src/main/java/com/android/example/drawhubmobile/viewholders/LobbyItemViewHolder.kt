package com.android.example.drawhubmobile.viewholders

import android.view.View
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.*
import com.google.android.material.card.MaterialCardView

class LobbyItemViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    private val backgroundCard = itemView.findViewById<MaterialCardView>(R.id.backgroundCard)
    private val nameTextView = itemView.findViewById<TextView>(R.id.lobbyName)
    private val participantsTextView = itemView.findViewById<TextView>(R.id.lobbyParticipants)

    fun setDetails(lobby: Lobby, selected: String?) {
        nameTextView.text = lobby.gameName
        val maxPlayers = if (stringToGameMode(lobby.gameMode) == GameMode.FREE_FOR_ALL)
            FREE_FOR_ALL_MAX_PLAYERS
        else
            BATTLE_ROYALE_MAX_PLAYERS
        val participantsStr = "${lobby.playerCount}/$maxPlayers"
        participantsTextView.text = participantsStr
        if (selected == null) return
        if (selected == lobby.gameName) {
            val highlightedColor = itemView.context.getColor(R.color.colorPrimaryLight)
            backgroundCard.setCardBackgroundColor(highlightedColor)
        }
    }

    fun setDetails(game: Game, selected: String?) {
        nameTextView.text = game.gameName
        val maxPlayers = if (stringToGameMode(game.gameMode) == GameMode.FREE_FOR_ALL)
            FREE_FOR_ALL_MAX_PLAYERS
        else
            BATTLE_ROYALE_MAX_PLAYERS
        val participantsStr = "${game.playerCount}/$maxPlayers"
        participantsTextView.text = participantsStr
        if (selected == null) return
        if (selected == game.gameName) {
            val highlightedColor = itemView.context.getColor(R.color.colorPrimaryLight)
            backgroundCard.setCardBackgroundColor(highlightedColor)
        }
        itemView.findViewById<TextView>(R.id.gameInProgress).visibility = View.VISIBLE
    }

    fun setOnClickListener(callback: () -> Unit) {
        backgroundCard.setOnClickListener { callback() }
    }
}