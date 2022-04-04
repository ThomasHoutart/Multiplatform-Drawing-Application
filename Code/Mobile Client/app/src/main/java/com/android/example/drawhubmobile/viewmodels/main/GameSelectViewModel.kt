package com.android.example.drawhubmobile.viewmodels.main

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.Event
import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.models.game.*
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.network.ServerApi
import kotlinx.coroutines.launch

class GameSelectViewModel : ViewModel() {

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    val gameList = MutableLiveData<GamesAndLobbiesList>()
    private lateinit var allGames: GamesAndLobbiesList
    val errorStatus = MutableLiveData<Event<EventTypes>>()

    private val mSelectedLobbyOrGameName = MutableLiveData<String>()
    val selectedLobbyOrGameName: LiveData<String>
        get() = mSelectedLobbyOrGameName

    private val mNavigateToLobby = MutableLiveData<JoinLobby>()
    val navigateToLobby: LiveData<JoinLobby>
        get() = mNavigateToLobby

    private val mNavigateToGame = MutableLiveData<JoinLobby>()
    val navigateToGame: LiveData<JoinLobby>
        get() = mNavigateToGame

    val gameMode = MutableLiveData<GameMode>()
    val difficulty = MutableLiveData<GameDifficulty>()

    private var isCreator = false
    //private var lobbyName = ""
    //var players = mutableListOf<String>()
    //var spectators = mutableListOf<String>()

    private val createObserver = EventObserver {
        val event = it as CreateLobbyReceivedEvent

        isCreator = DrawHubApplication.currentUser.username == event.username
        val newLobby = Lobby(event.gameName, 0, event.gameMode, event.difficulty)
        allGames.lobbies.add(newLobby)
        filterLobbiesAndGames()
    }

    private val updateObserver = EventObserver {
        val event = it as UpdateLobbyEvent
        val targetGame = allGames.games.find { game -> game.gameName == event.gameName }
        if (targetGame != null) {
            targetGame.playerCount = event.playerCount
        } else {
            val targetLobby = allGames.lobbies.find { lobby -> lobby.gameName == event.gameName }
            if (targetLobby != null) {
                targetLobby.playerCount = event.playerCount
            }
        }
        filterLobbiesAndGames()
    }

    private val deleteObserver = EventObserver {
        val event = it as DeleteLobbyReceivedEvent
        allGames.games.removeIf { game -> game.gameName == event.gameName }
        allGames.lobbies.removeIf { lobby -> lobby.gameName == event.gameName }
        if (event.gameName == mSelectedLobbyOrGameName.value) {
            mSelectedLobbyOrGameName.postValue("")
        }
        filterLobbiesAndGames()
        resetJoinLobbyEvent()
    }

    private val joinPlayerObserver = EventObserver {
        val event = it as JoinLobbyPlayerReceivedEvent
        if (event.username == DrawHubApplication.currentUser.username) {
            mNavigateToLobby.postValue(
                JoinLobby(
                    mSelectedLobbyOrGameName.value!!,
                    isCreator,
                    isJoining = true,
                    isSpectator = false
                )
            )
        }
    }

    private val joinGameSpectatorObserver = EventObserver {
        val event = it as JoinGameSpectatorReceivedEvent
        if (event.username == DrawHubApplication.currentUser.username) {
            if (gameList.value?.games?.find { game -> game.gameName == mSelectedLobbyOrGameName.value!! } != null) {
                mNavigateToGame.postValue(
                    JoinLobby(
                        mSelectedLobbyOrGameName.value!!,
                        isCreator = false,
                        isJoining = true,
                        isSpectator = true
                    )
                )
            }
        }
    }

    private val joinLobbySpectatorObserver = EventObserver {
        val event = it as JoinLobbySpectatorReceivedEvent
        if (event.username == DrawHubApplication.currentUser.username) {
            if (gameList.value?.lobbies?.find { lobby -> lobby.gameName == mSelectedLobbyOrGameName.value!! } != null) {
                mNavigateToLobby.postValue(
                    JoinLobby(
                        mSelectedLobbyOrGameName.value!!,
                        isCreator = false,
                        isJoining = true,
                        isSpectator = true
                    )
                )
            }
        }
    }

    private val startGameObserver = EventObserver {
        val event = it as StartGameReceivedEvent
        val lobbyStarted = allGames.lobbies.find { lobby -> lobby.gameName == event.gameName }!!
        allGames.games.add(
            Game(
                lobbyStarted.gameName,
                lobbyStarted.playerCount,
                lobbyStarted.gameMode,
                lobbyStarted.difficulty
            )
        )
        allGames.lobbies.removeIf { lobby -> lobby.gameName == event.gameName }
        filterLobbiesAndGames()
        resetJoinLobbyEvent()
    }

    private val endGameObserver = EventObserver {
        val event = it as EndGameEvent
        allGames.games.removeIf { game -> game.gameName == event.gameName }
        filterLobbiesAndGames()
    }

    init {
        allGames = GamesAndLobbiesList(mutableListOf(), mutableListOf())
    }

    fun clearSelectedLobby() {
        mSelectedLobbyOrGameName.postValue("")
    }

    fun getGameList() {
        viewModelScope.launch {
            try {
                allGames = ServerApi.retrofitService.getGamesList()
                filterLobbiesAndGames()
            } catch (e: Exception) {
                System.err.println("Could not retrieve the game list: $e")
            }
        }
    }

    fun filterLobbiesAndGames() {
        val filteredLobbies = allGames.lobbies.filter { lobby ->
            stringToGameDifficulty(lobby.difficulty) == difficulty.value &&
                    stringToGameMode(lobby.gameMode) == gameMode.value
        }.toMutableList()
        val filteredGames = allGames.games.filter { game ->
            stringToGameDifficulty(game.difficulty) == difficulty.value &&
                    stringToGameMode(game.gameMode) == gameMode.value
        }.toMutableList()
        gameList.postValue(GamesAndLobbiesList(filteredGames, filteredLobbies))
    }

    fun selectLobby(name: String) {
        if (mSelectedLobbyOrGameName.value == name) return
        var selected = GameEntity("", 0, "", "")
        for (lobby in gameList.value?.lobbies!!) {
            if (lobby.gameName == name)
                selected = lobby
        }
        for (game in gameList.value?.games!!) {
            if (game.gameName == name)
                selected = game
        }
        mSelectedLobbyOrGameName.postValue(selected.gameName)
    }

    fun createLobby(name: String) {
        val difficulty = gameDifficultyToString(difficulty.value)
        val gameMode = gameModeToString(gameMode.value)
        mEmitterHandler.emit(CreateLobbySendEvent(name, gameMode, difficulty))
        mSelectedLobbyOrGameName.postValue(name)
    }

    fun joinLobby() {
        if (mSelectedLobbyOrGameName.value?.isNotEmpty() != null) {
            mEmitterHandler.emit(JoinLobbyPlayerSendEvent(mSelectedLobbyOrGameName.value!!))
        }
    }

    fun spectateLobbyOrGame() {
        if (mSelectedLobbyOrGameName.value?.isNotEmpty() != null) {
            val gameToJoin =
                gameList.value?.games?.find { game -> game.gameName == mSelectedLobbyOrGameName.value }
            val lobbyToJoin =
                gameList.value?.lobbies?.find { lobby -> lobby.gameName == mSelectedLobbyOrGameName.value }
            if (gameToJoin != null) {
                mEmitterHandler.emit(JoinGameSpectatorSendEvent(gameToJoin.gameName))
            } else if (lobbyToJoin != null) {
                mEmitterHandler.emit(JoinLobbySpectatorSendEvent(lobbyToJoin.gameName))
            }
        }
    }

    fun resetJoinLobbyEvent() {
        mNavigateToLobby.postValue(
            JoinLobby(
                "",
                isCreator = false,
                isJoining = false,
                isSpectator = false
            )
        )
        mNavigateToGame.postValue(
            JoinLobby(
                "",
                isCreator = false,
                isJoining = false,
                isSpectator = false
            )
        )
        isCreator = false
        mSelectedLobbyOrGameName.postValue("")
    }

    fun addSubscribers() {
        mEmitterHandler.subscribe(EventTypes.UPDATE_LOBBY, updateObserver)
        mEmitterHandler.subscribe(EventTypes.CREATE_LOBBY_RECEIVED, createObserver)
        mEmitterHandler.subscribe(EventTypes.JOIN_LOBBY_PLAYER_RECEIVED, joinPlayerObserver)
        mEmitterHandler.subscribe(
            EventTypes.JOIN_LOBBY_SPECTATOR_RECEIVED,
            joinLobbySpectatorObserver
        )
        mEmitterHandler.subscribe(
            EventTypes.JOIN_GAME_SPECTATOR_RECEIVED,
            joinGameSpectatorObserver
        )
        mEmitterHandler.subscribe(EventTypes.DELETE_LOBBY_RECEIVED, deleteObserver)
        mEmitterHandler.subscribe(EventTypes.START_GAME_RECEIVED, startGameObserver)
        mEmitterHandler.subscribe(EventTypes.END_GAME, endGameObserver)
        mEmitterHandler.subscribe(
            EventTypes.LEAVE_LOBBY_PLAYER_RECEIVED,
            EventObserver { resetJoinLobbyEvent() })
        mEmitterHandler.subscribe(
            EventTypes.LEAVE_LOBBY_SPECTATOR_RECEIVED,
            EventObserver { resetJoinLobbyEvent() })
        addErrorSubscribers()
    }

    private fun addErrorSubscribers() {
        // TODO: Lobby Error Handling
        mEmitterHandler.subscribe(EventTypes.LOBBY_DOES_NOT_EXIST_ERROR, EventObserver {
            errorStatus.postValue(Event(EventTypes.LOBBY_DOES_NOT_EXIST_ERROR))
        })
        mEmitterHandler.subscribe(EventTypes.LOBBY_ALREADY_EXISTS_ERROR, EventObserver {
            errorStatus.postValue(Event(EventTypes.LOBBY_ALREADY_EXISTS_ERROR))
        })
        mEmitterHandler.subscribe(EventTypes.LOBBY_FULL_ERROR, EventObserver {
            errorStatus.postValue(Event(EventTypes.LOBBY_FULL_ERROR))
        })
        mEmitterHandler.subscribe(EventTypes.ALREADY_IN_LOBBY_ERROR, EventObserver {
            errorStatus.postValue(Event(EventTypes.ALREADY_IN_LOBBY_ERROR))
        })
    }
}