package com.android.example.drawhubmobile.models.game

import com.squareup.moshi.Json

class Lobby(
    @Json(name = "gameName") gameName: String,
    @Json(name = "playerCount") playerCount: Int,
    @Json(name = "gameMode") gameMode: String,
    @Json(name = "difficulty") difficulty: String
) : GameEntity(gameName, playerCount, gameMode, difficulty)