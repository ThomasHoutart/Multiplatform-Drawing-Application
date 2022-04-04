package com.android.example.drawhubmobile.viewmodels.main

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.GameForExpandableList
import com.android.example.drawhubmobile.models.http.Game
import com.android.example.drawhubmobile.models.http.Games
import com.android.example.drawhubmobile.models.http.ProfileInfo
import com.android.example.drawhubmobile.models.http.ScoresJson
import com.android.example.drawhubmobile.network.ServerApi
import com.android.example.drawhubmobile.utils.JavaScriptDateConverter
import kotlinx.coroutines.launch
import java.time.ZoneId

class ProfileViewModel : ViewModel() {

    val receiveInfo = MutableLiveData<Unit>()
    private var profileInfo: ProfileInfo = ProfileInfo(
        0,
        0,
        0,
        0,
        listOf(),
        Games(listOf(), listOf(), listOf()),
        Games(listOf(), listOf(), listOf())
    )
    var titles = mutableListOf<String>()
    var games = hashMapOf<String, GameForExpandableList>()
    var logins = ""
    var logouts = ""
    var connectionDurations = ""
    var gamesPlayed = 0

    var averageGameTimeInSeconds = 0
    var totalGameTimeInSeconds = 0

    fun getProfileInfo() {
        viewModelScope.launch {
            try {
                profileInfo =
                    ServerApi.retrofitService.getProfileInfo(DrawHubApplication.currentUser.username)
                createGamesFromProfileInfo()
                createConnectionsInfoFromProfileInfo()
                getWinRate()
                receiveInfo.postValue(Unit)
            } catch (e: Exception) {
                println("Could not get profile info : $e")
                debugData()
                receiveInfo.postValue(Unit)
            }
        }
    }

    fun getAverageGameTime(): String {
        var averageGameTimeString = ""
        val agtInSeconds = averageGameTimeInSeconds
        val hour = agtInSeconds / (60 * 60)
        val min = (agtInSeconds / 60) % 60
        val second = agtInSeconds % 60
        if (hour != 0)
            averageGameTimeString += "${hour}h"
        if (min != 0)
            averageGameTimeString += "${min}m"
        if (second != 0)
            averageGameTimeString += "${second}s"
        return if (averageGameTimeString == "") "0s" else averageGameTimeString
    }

    fun getTotalGameTime(): String {
        var totalGameTimeString = ""
        val tgtInSeconds = totalGameTimeInSeconds
        val hour = tgtInSeconds / (60 * 60)
        val min = (tgtInSeconds / 60) % 60
        val second = tgtInSeconds % 60
        if (hour != 0)
            totalGameTimeString += "${hour}h"
        if (min != 0)
            totalGameTimeString += "${min}m"
        if (second != 0)
            totalGameTimeString += "${second}s"
        return if (totalGameTimeString == "") "0s" else totalGameTimeString
    }

    fun getWinRate(): String {
        var winRateString = ""
        var nbOfWins = 0
        for (game in games.values) {
            if (DrawHubApplication.currentUser.username == game.first.username)
                nbOfWins++
        }
        if (gamesPlayed != 0)
            winRateString = (nbOfWins * 100 / if (gamesPlayed != 0) gamesPlayed else 1).toString() + "%"
        return if (winRateString == "") "N/A" else winRateString
    }

    private fun createGamesFromProfileInfo() {
        val games = HashMap<String, GameForExpandableList>()
        titles.clear()
        gamesPlayed = 0
        totalGameTimeInSeconds = 0
        for (game in profileInfo.FFA.easy) {
            games[game.gameName] = GameForExpandableList(game, "FFA", "Easy")
            titles.add(game.gameName)
            gamesPlayed++
            totalGameTimeInSeconds += game.totalTime / 1000
        }
        for (game in profileInfo.FFA.normal) {
            games[game.gameName] = GameForExpandableList(game, "FFA", "Normal")
            titles.add(game.gameName)
            gamesPlayed++
            totalGameTimeInSeconds += game.totalTime / 1000
        }
        for (game in profileInfo.FFA.hard) {
            games[game.gameName] = GameForExpandableList(game, "FFA", "Hard")
            titles.add(game.gameName)
            gamesPlayed++
            totalGameTimeInSeconds += game.totalTime / 1000
        }
        for (game in profileInfo.BR.easy) {
            games[game.gameName] = GameForExpandableList(game, "BR", "Easy")
            titles.add(game.gameName)
            gamesPlayed++
            totalGameTimeInSeconds += game.totalTime / 1000
        }
        for (game in profileInfo.BR.normal) {
            games[game.gameName] = GameForExpandableList(game, "BR", "Normal")
            titles.add(game.gameName)
            gamesPlayed++
            totalGameTimeInSeconds += game.totalTime / 1000
        }
        for (game in profileInfo.BR.hard) {
            games[game.gameName] = GameForExpandableList(game, "BR", "Hard")
            titles.add(game.gameName)
            gamesPlayed++
            totalGameTimeInSeconds += game.totalTime / 1000
        }
        averageGameTimeInSeconds = totalGameTimeInSeconds / if (gamesPlayed != 0) gamesPlayed else 1
        this.games = games
    }

    private fun createConnectionsInfoFromProfileInfo() {
        for ((i, connection) in profileInfo.connections.withIndex()) {
            val on = JavaScriptDateConverter.convert(connection.on)
            val off = JavaScriptDateConverter.convert(connection.off)
            val duration = off.atZone(ZoneId.systemDefault())
                .toEpochSecond() - on.atZone(ZoneId.systemDefault()).toEpochSecond()

            if (i == 0) {
                logins = JavaScriptDateConverter.convertLocalDateTimeToString(on)
                logouts = JavaScriptDateConverter.convertLocalDateTimeToString(off)
                connectionDurations = "${duration / 60}m ${duration % 60}s"
            } else {
                logins += "\n" + JavaScriptDateConverter.convertLocalDateTimeToString(on)
                logouts += "\n" + JavaScriptDateConverter.convertLocalDateTimeToString(off)
                connectionDurations += "\n${duration / 60}m ${duration % 60}s"
            }
        }
    }

    private fun debugData() {
        averageGameTimeInSeconds = 234
        totalGameTimeInSeconds = 2000
        gamesPlayed = 24
        titles.add("Tony's Game")
        titles.add("Bobby's Game")
        titles.add("Jessica's Game")
        titles.add("A Cunt's Game")

        games[titles[0]] = GameForExpandableList(
            Game(
                "Tony's Game",
                "2001.07.04 AD at 10:08:56 PDT",
                234,
                createFakeScore()
            ), "FFA", "Normal"
        )
        games[titles[1]] = GameForExpandableList(
            Game(
                "Bobby's Game",
                "2001.07.04 AD at 16:08:56 PDT",
                400,
                createFakeScore()
            ), "FFA", "Hard"
        )
        games[titles[2]] = GameForExpandableList(
            Game(
                "Jessica's Game",
                "2001.07.04 AD at 12:08:56 PDT",
                241,
                createFakeScore()
            ), "BR", "Easy"
        )
        games[titles[3]] = GameForExpandableList(
            Game(
                "A Cunt's Game",
                "2001.07.04 AD at 17:08:56 PDT",
                170,
                createFakeScore()
            ), "BR", "Normal"
        )

        logins += "10:42 10-10-2020"
        logins += "\n10:42 10-11-2020"
        logins += "\n10:42 12-10-2020"
        logins += "\n10:42 10-13-2020"
        logins += "\n10:42 15-10-2071"

        logouts += "11:45 10-10-2020"
        logouts += "\n11:45 10-11-2020"
        logouts += "\n11:45 12-10-2020"
        logouts += "\n11:45 10-13-2020"
        logouts += "\n11:45 15-10-2071"

        connectionDurations += "1h 5m"
        connectionDurations += "\n1h 5m"
        connectionDurations += "\n1h 5m"
        connectionDurations += "\n1h 5m"
        connectionDurations += "\n1h 5m"

    }

    private fun createFakeScore(): List<ScoresJson> {
        val scores = mutableListOf<ScoresJson>()
        scores.add(ScoresJson("Tony",375, R.drawable.ic_test_avatar))
        scores.add(ScoresJson("Bobby",200, R.drawable.ic_test_avatar))
        scores.add(ScoresJson("Jessica",40, R.drawable.ic_test_avatar))
        scores.add(ScoresJson("A cunt",400, R.drawable.ic_test_avatar))
        scores.add(ScoresJson("BBC",500, R.drawable.ic_test_avatar))
        return scores
    }
}