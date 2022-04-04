package com.android.example.drawhubmobile.models.game

import com.squareup.moshi.Json

const val FREE_FOR_ALL_MAX_PLAYERS = 4
const val BATTLE_ROYALE_MAX_PLAYERS = 8

class Game(
    @Json(name = "gameName") gameName: String,
    @Json(name = "playerCount") playerCount: Int,
    @Json(name = "gameMode") gameMode: String,
    @Json(name = "difficulty") difficulty: String
) : GameEntity(gameName, playerCount, gameMode, difficulty)