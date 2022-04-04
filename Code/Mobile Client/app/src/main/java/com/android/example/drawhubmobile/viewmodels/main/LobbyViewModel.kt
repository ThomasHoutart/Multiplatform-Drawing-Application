package com.android.example.drawhubmobile.viewmodels.main

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.Event
import com.android.example.drawhubmobile.models.SimpleUser
import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver

class LobbyViewModel : ViewModel() {

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    val startGame = MutableLiveData(false)
    val leaveLobby = MutableLiveData(false)
    val errorStatus = MutableLiveData<Event<EventTypes>>()

    private val mPlayers: MutableLiveData<MutableList<SimpleUser>> =
        MutableLiveData(mutableListOf())
    val players: LiveData<MutableList<SimpleUser>>
        get() = mPlayers

    private val mSpectators: MutableLiveData<MutableList<SimpleUser>> =
        MutableLiveData(mutableListOf())
    val spectators: LiveData<MutableList<SimpleUser>>
        get() = mSpectators

    var lobbyName = ""
    var isCreator = false
    var isSpectator = false

    // *************************************************
    //                      Observers
    //
    private val joinPlayerObserver = EventObserver {
        val event = it as JoinLobbyPlayerReceivedEvent
        val newPlayerList = mutableListOf<SimpleUser>()
        newPlayerList.addAll(mPlayers.value!!)
        newPlayerList.add(SimpleUser(event.username, event.avatar))
        mPlayers.postValue(newPlayerList)
    }

    private val joinSpectatorObserver = EventObserver {
        val event = it as JoinLobbySpectatorReceivedEvent
        val newSpectatorList = mutableListOf<SimpleUser>()
        newSpectatorList.addAll(mSpectators.value!!)
        newSpectatorList.add(SimpleUser(event.username, event.avatar))
        mSpectators.postValue(newSpectatorList)
    }

    private val leavePlayerObserver = EventObserver {
        val event = it as LeaveLobbyPlayerReceivedEvent
        if (DrawHubApplication.currentUser.username == event.username) {
            leaveLobby.postValue(true)
        } else {
            val newPlayerList = mutableListOf<SimpleUser>()
            for (player in players.value!!) {
                if (player.username != event.username)
                    newPlayerList.add(player)
            }
            mPlayers.postValue(newPlayerList)
        }
    }

    private val leaveSpectatorObserver = EventObserver {
        val event = it as LeaveLobbySpectatorReceivedEvent
        if (DrawHubApplication.currentUser.username == event.username) {
            leaveLobby.postValue(true)
        } else {
            val newSpectatorList = mutableListOf<SimpleUser>()
            for (spectator in spectators.value!!) {
                if (spectator.username != event.username)
                    newSpectatorList.add(spectator)
            }
            mSpectators.postValue(newSpectatorList)
        }
    }

    private val startGameObserver = EventObserver {
        val event = it as StartGameReceivedEvent
        if (lobbyName == event.gameName) {
            DrawHubApplication.chatMessageHandler.sendServerHelpMessage()
            startGame.postValue(true)
        }
    }

    private val endGameObserver = EventObserver {
        val event = it as EndGameEvent
        if (lobbyName == event.gameName)
            startGame.postValue(false)
    }

    private val deleteLobbyObserver = EventObserver {
        val event = it as DeleteLobbyReceivedEvent
        print("*******   Delete Lobby Event with ${event.gameName} and the lobby name is $lobbyName   ***********")
        if (lobbyName == event.gameName)
            leaveLobby.postValue(true)
    }

    private val lobbyInfoObserver = EventObserver {
        val event = it as LobbyInfoEvent
        mPlayers.postValue(event.players)
        mSpectators.postValue(event.spectators)
    }
    //
    //
    //************************************************

    init {
        addErrorSubscribers()
    }

    fun addBot() {
        mEmitterHandler.emit(AddBotEvent())
    }

    fun startGame() {
        mEmitterHandler.emit(StartGameSendEvent())
    }

    fun leaveLobby() {
        if (isCreator) {
            mEmitterHandler.emit(DeleteLobbySendEvent())
        } else {
            if (isSpectator) {
                mEmitterHandler.emit(LeaveLobbySpectatorSendEvent())
            } else {
                mEmitterHandler.emit(LeaveLobbyPlayerSendEvent())
            }
        }
    }

    fun removePlayer(username: String) {
        mEmitterHandler.emit(RemovePlayerEvent(username))
    }

    fun resetLeaveLobbyEvent() {
        leaveLobby.postValue(false)
        lobbyName = ""
        isCreator = false
        isSpectator = false
    }

    fun addSubscribers() {
        mEmitterHandler.subscribe(EventTypes.JOIN_LOBBY_PLAYER_RECEIVED, joinPlayerObserver)
        mEmitterHandler.subscribe(EventTypes.JOIN_LOBBY_SPECTATOR_RECEIVED, joinSpectatorObserver)
        mEmitterHandler.subscribe(EventTypes.LEAVE_LOBBY_PLAYER_RECEIVED, leavePlayerObserver)
        mEmitterHandler.subscribe(EventTypes.LEAVE_LOBBY_SPECTATOR_RECEIVED, leaveSpectatorObserver)
        mEmitterHandler.subscribe(EventTypes.START_GAME_RECEIVED, startGameObserver)
        mEmitterHandler.subscribe(EventTypes.DELETE_LOBBY_RECEIVED, deleteLobbyObserver)
        mEmitterHandler.subscribe(EventTypes.LOBBY_INFO, lobbyInfoObserver)
        mEmitterHandler.subscribe(EventTypes.END_GAME, endGameObserver)
        addErrorSubscribers()
    }

    private fun addErrorSubscribers() {
        // TODO: Lobby Error Handling
        mEmitterHandler.subscribe(EventTypes.USER_NOT_IN_LOBBY_ERROR, EventObserver {
            errorStatus.postValue(Event(EventTypes.USER_NOT_IN_LOBBY_ERROR))
        })
        mEmitterHandler.subscribe(EventTypes.NOT_ENOUGH_PLAYERS_ERROR, EventObserver {
            errorStatus.postValue(Event(EventTypes.NOT_ENOUGH_PLAYERS_ERROR))
        })
    }
}