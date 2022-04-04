package com.android.example.drawhubmobile.viewmodels.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.TimePeriod
import com.android.example.drawhubmobile.models.game.GameDifficulty
import com.android.example.drawhubmobile.models.game.GameMode
import com.android.example.drawhubmobile.models.http.LeaderboardInfo
import com.android.example.drawhubmobile.models.http.PlayerLeaderboard
import com.android.example.drawhubmobile.network.ServerApi
import kotlinx.coroutines.launch
import okhttp3.internal.wait
import java.util.*

class LeaderboardViewModel : ViewModel() {

    private lateinit var leaderboardInfo: LeaderboardInfo

    lateinit var gameMode: GameMode
    lateinit var difficulty: GameDifficulty
    lateinit var timePeriod: TimePeriod

    fun getLeaderboardInfo(callback: () -> Unit) {
        viewModelScope.launch {
            try {
                leaderboardInfo = ServerApi.retrofitService.getLeaderboardInfo()
                callback()
            } catch (e: Exception) {
                println("Could not get leaderboard info : $e")
            }
        }
    }

    fun everyOptionsAreSelected(): Boolean {
        return this::gameMode.isInitialized && this::difficulty.isInitialized && this::timePeriod.isInitialized
    }

    fun getPlayerList(): List<PlayerLeaderboard> {
        if (!this::leaderboardInfo.isInitialized)
            return debugData()
        val playersWithGameMode = when (gameMode) {
            GameMode.FREE_FOR_ALL -> leaderboardInfo.FFA
            GameMode.BATTLE_ROYALE -> leaderboardInfo.BR
        }
        val playersWithDifficulty = when (difficulty) {
            GameDifficulty.EASY -> playersWithGameMode.easy
            GameDifficulty.NORMAL -> playersWithGameMode.normal
            GameDifficulty.HARD -> playersWithGameMode.hard
        }
        val playersWithTimePeriod = when (timePeriod) {
            TimePeriod.TODAY -> playersWithDifficulty.day
            TimePeriod.THIS_WEEK -> playersWithDifficulty.week
            TimePeriod.ALL_TIME -> playersWithDifficulty.total
        }
        return filterPlayerList(playersWithTimePeriod)
    }

    private fun filterPlayerList(playerList: List<PlayerLeaderboard>): List<PlayerLeaderboard> {
        playerList.sortedBy { player -> player.nWins }
        Collections.sort(playerList)
        var position = -1
        for((i, player) in playerList.withIndex()) {
            if (player.username == DrawHubApplication.currentUser.username) {
                position = i
                player.position = i + 1
            }
        }
        val playerToShow = mutableListOf<PlayerLeaderboard>()
        for(i in 0 until if (playerList.size < 10) playerList.size else 10)
            playerToShow.add(playerList[i])
        if (position != -1 && position > 9)
            playerToShow[9] = playerList[position]
        return playerToShow
    }

    private fun debugData(): List<PlayerLeaderboard> {
        val playerList = mutableListOf<PlayerLeaderboard>()
        playerList.add(PlayerLeaderboard(1, "Margarita", 3))
        playerList.add(PlayerLeaderboard(2, "asd", 6))
        playerList.add(PlayerLeaderboard(3, "BBC", 9))
        playerList.add(PlayerLeaderboard(2, "asd", 6))
        playerList.add(PlayerLeaderboard(3, "woop", 9))
        playerList.add(PlayerLeaderboard(2, "pelaille", 6))
        playerList.add(PlayerLeaderboard(3, "echappe", 9))
        playerList.add(PlayerLeaderboard(3, "das", 9))
        playerList.add(PlayerLeaderboard(2, "qwe", 6))
        playerList.add(PlayerLeaderboard(3, "rty", 9))
        playerList.add(PlayerLeaderboard(2, "pas", 6))
        playerList.add(PlayerLeaderboard(3, "toute la sauce", 9))
        playerList.add(PlayerLeaderboard(4, "A cunt", 2))
        playerList.add(PlayerLeaderboard(5, "mom?", 9))
        playerList.add(
            PlayerLeaderboard(
                DrawHubApplication.currentUser.avatar,
                DrawHubApplication.currentUser.username,
                3
            )
        )
        return filterPlayerList(playerList)
    }
}