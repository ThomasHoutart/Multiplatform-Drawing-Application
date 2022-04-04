package com.android.example.drawhubmobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.Game
import com.android.example.drawhubmobile.models.game.GameEntity
import com.android.example.drawhubmobile.models.game.GamesAndLobbiesList
import com.android.example.drawhubmobile.models.game.Lobby
import com.android.example.drawhubmobile.viewholders.LobbyItemViewHolder
import com.google.android.material.card.MaterialCardView


class LobbyListAdapter(
    private val gamesAndLobbiesList: GamesAndLobbiesList,
    private val selected: String?,
    private val onItemClickCallback: (lobbyName: String) -> Unit
) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val allGamesAndLobbies = mutableListOf<GameEntity>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val view: View
        view = LayoutInflater.from(parent.context)
            .inflate(R.layout.lobby_item_view, parent, false) as MaterialCardView
        return LobbyItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        fillGameEntityList()
        val current = allGamesAndLobbies[position]
        val lobbyHolder = holder as LobbyItemViewHolder
        lobbyHolder.setOnClickListener { onItemClickCallback(current.gameName) }
        if (current is Game) {
            lobbyHolder.setDetails(current, selected)
        } else {
            lobbyHolder.setDetails(current as Lobby, selected)
        }
    }

    override fun getItemCount() = gamesAndLobbiesList.lobbies.size + gamesAndLobbiesList.games.size


    private fun fillGameEntityList() {
        allGamesAndLobbies.clear()
        allGamesAndLobbies.addAll(gamesAndLobbiesList.games)
        allGamesAndLobbies.addAll(gamesAndLobbiesList.lobbies)
        allGamesAndLobbies.sortBy { entity -> entity.gameName }
    }
}