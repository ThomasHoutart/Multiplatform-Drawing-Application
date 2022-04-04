package com.android.example.drawhubmobile.models.game

import com.squareup.moshi.Json

data class GamesAndLobbiesList(
    @Json(name = "games") val games: MutableList<Game>,
    @Json(name = "lobbies") val lobbies: MutableList<Lobby>
)