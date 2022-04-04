package com.android.example.drawhubmobile.models.http

import com.squareup.moshi.Json

data class LeaderboardInfo(
    @Json(name = "FFA") val FFA: GameMode,
    @Json(name = "BR") val BR: GameMode,
)

data class GameMode(
    @Json(name = "Easy") val easy: Difficulty,
    @Json(name = "Normal") val normal: Difficulty,
    @Json(name = "Hard") val hard: Difficulty,
)

data class Difficulty(
    @Json(name = "Day") val day: List<PlayerLeaderboard>,
    @Json(name = "Week") val week: List<PlayerLeaderboard>,
    @Json(name = "Total") val total: List<PlayerLeaderboard>,
)

class PlayerLeaderboard(
    @Json(name = "avatar") val avatar: Int,
    @Json(name = "username") val username: String,
    @Json(name = "nWins") val nWins: Int,
    var position: Int = 0
) : Comparable<Any> {
    override fun compareTo(other: Any): Int {
        val pl = other as PlayerLeaderboard
        return if (nWins > pl.nWins) {
            -1
        } else if (pl.nWins > nWins) {
            1
        } else
            0
    }
}