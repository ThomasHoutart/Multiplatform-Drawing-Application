package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class ProfileInfo(
    @Json(name = "nWins") val nWins: Int,
    @Json(name = "nLosses") val nLosses: Int,
    @Json(name = "totalGameTimeMinutes") val totalGameTimeMinutes: Int,
    @Json(name = "totalTimeMinutes") val totalTimeMinutes: Int,
    @Json(name = "connections") val connections: List<Connection>,
    @Json(name = "FFA") val FFA: Games,
    @Json(name = "BR") val BR: Games,
)

data class Connection(
    @Json(name = "login") val on: String,
    @Json(name = "logout") val off: String,
)

data class Games(
    @Json(name = "Easy") val easy: List<Game>,
    @Json(name = "Normal") val normal: List<Game>,
    @Json(name = "Hard") val hard: List<Game>,
)

data class Game(
    @Json(name = "name") val gameName: String,
    @Json(name = "timestamp") val timestamp: String,
    @Json(name = "totaltime") val totalTime: Int,
    @Json(name = "score") val scores: List<ScoresJson>
)

data class ScoresJson(
    @Json(name = "username") val username: String,
    @Json(name = "score") val score: Int,
    @Json(name = "avatar") val avatar: Int
)