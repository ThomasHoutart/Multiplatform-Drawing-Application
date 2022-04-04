package com.android.example.drawhubmobile.models.game

import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.http.Game
import com.android.example.drawhubmobile.utils.JavaScriptDateConverter

class GameForExpandableList(game: Game, val gameMode: String, val difficulty: String) {
    var date: String
    var startTime: String
    var endTime: String
    var first = Player("", -1, -1)
    var second = Player("", -1, -1)
    var third = Player("", -1, -1)

    init {
        for (player in game.scores) {
            when {
                player.score > first.score -> {
                    third = second
                    second = first
                    first = Player(player.username, player.score, player.avatar)
                }
                player.score > second.score -> {
                    third = second
                    second = Player(player.username, player.score, player.avatar)
                }
                player.score > third.score -> {
                    third = Player(player.username, player.score, player.avatar)
                }
            }
        }
        val gameTime =
            JavaScriptDateConverter.convertToProfileFormat(game.timestamp, game.totalTime / 1000)
        date = gameTime.date
        startTime = gameTime.startTime
        endTime = gameTime.endTime
    }
}