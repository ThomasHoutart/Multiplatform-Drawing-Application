package com.android.example.drawhubmobile.viewmodels.game

import android.content.Context
import android.os.CountDownTimer
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ServerMessageStatus
import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.utils.ToastMaker

class GameViewModel : ViewModel() {

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    // Data passed down from LobbyFragment or MainBackgroundFragment
    val players = MutableLiveData<MutableList<Player>>()

    //val spectators = MutableLiveData<MutableList<Spectator>>()
    var gameName = ""
    var isSpectator = false

    val gameTimerString = MutableLiveData("")
    val isArtist = MutableLiveData<Boolean>()
    val wordToDraw = MutableLiveData<String>()
    val wordWasFoundEvent = MutableLiveData<String>()
    private var eventReset = true
    val currentUserFoundWord = MutableLiveData<Boolean>()

    val dialogIsDisplayed = MutableLiveData<Boolean>(false)
    val gameEndEvent = MutableLiveData<Unit>()
    val finishActivity = MutableLiveData<Boolean>()
    val eliminated = MutableLiveData<String>()

    var artistSent = false

    // Anti-Cheat
    val chatIsBlocked = MutableLiveData(false)
    var punishLevel: Int = 0
    private var cheatCountDownIsRunning: Boolean = false
    private var numberOfMessageSentSinceCountDownStart: Int = 0
    private val cheatCountDown: CountDownTimer = object : CountDownTimer(5000, 250) {
        override fun onTick(millisUntilFinished: Long) {
            if (numberOfMessageSentSinceCountDownStart > 5) {
                punishUser()
                cheatCountDownIsRunning = false
                cancel()
            }
        }

        override fun onFinish() {
            cheatCountDownIsRunning = false
        }
    }

    private var observersWereAdded = false

    // ************************************************************
    //                      Start of observers
    // ************************************************************

    private val endGameObserver = EventObserver {
        val event = it as EndGameEvent
        if (event.gameName == gameName) {
            gameEndEvent.postValue(Unit)
            DrawHubApplication.soundPlayer.playSound(R.raw.game_end)
        }
    }

    private val startRoundObserver = EventObserver {
        val event = it as StartRoundEvent
        isArtist.postValue(event.newArtist == DrawHubApplication.currentUser.username)
        if (!artistSent && event.newArtist != DrawHubApplication.currentUser.username) {
            val roomName = DrawHubApplication.chatMessageHandler.activeRoom!!.name
            val messageContent = "${event.newArtist} is drawing!"
            DrawHubApplication.chatMessageHandler.emitServerMessage(
                ServerMessageStatus.IMPORTANT,
                messageContent,
                roomName
            )
            artistSent = true
        }
        currentUserFoundWord.postValue(false)
        dialogIsDisplayed.postValue(false)
        if (isSpectator)
            dialogIsDisplayed.postValue(false)
        DrawHubApplication.soundPlayer.playSound(R.raw.round_start)
    }

    private val endRoundObserver = EventObserver {
        val event = it as EndRoundEvent
        val newPlayersScore = mutableListOf<Player>()
        for (player in event.scores.players) {
            newPlayersScore.add(Player(player.username, player.score, player.avatar))
        }
        wordToDraw.postValue(event.word)
        players.postValue(newPlayersScore)
        if (!dialogIsDisplayed.value!!)
            dialogIsDisplayed.postValue(true)
        if (isSpectator)
            dialogIsDisplayed.postValue(true)
        if (chatIsBlocked.value!!) {
            chatIsBlocked.postValue(false)
            mEmitterHandler.emit(ChatBlockedEvent(false))
        }
        artistSent = false
    }

    private val gameTickObserver = EventObserver {
        val event = it as GameTickEvent
        gameTimerString.postValue(event.time.toString())
    }

    private val wordToDrawObserver = EventObserver {
        val event = it as WordToDrawEvent
        wordToDraw.postValue(event.word)
    }

    private val wordFoundObserver = EventObserver {
        val event = it as WordFoundEvent
        eventReset = false
        wordWasFoundEvent.postValue(event.username)
        if (event.username == DrawHubApplication.currentUser.username) {
            DrawHubApplication.soundPlayer.playSound(R.raw.word_found)
            currentUserFoundWord.postValue(true)
        }
    }

    private val leaveGameObserver = EventObserver {
        val event = it as LeaveGamePlayerReceivedEvent
        /*if (event.username == DrawHubApplication.currentUser.username) {
            finishActivity.postValue(false)
        } else {*/
        val newPlayersList = mutableListOf<Player>()
        val playersList = players.value
        if (playersList != null) {
            for (player in playersList) {
                if (player.username != event.username)
                    newPlayersList.add(player)
                //}
                players.postValue(newPlayersList)
            }
        }
    }

    private val eliminatedObserver = EventObserver {
        val event = it as EliminatedEvent
        if (event.username == DrawHubApplication.currentUser.username && !isSpectator) {
            isSpectator = true
            eliminated.postValue(event.username)
        } else {
            mEmitterHandler.emit(
                ChatMessageReceivedEvent.asServerMessage(
                    ServerMessageStatus.IMPORTANT,
                    "${event.username} was eliminated",
                    gameName
                )
            )
            eliminated.postValue(event.username)
        }
    }

    private val chatMessageSendObserver = EventObserver {
        if (gameName != "") {
            if (cheatCountDownIsRunning) {
                numberOfMessageSentSinceCountDownStart++
            } else if (!chatIsBlocked.value!!) {
                cheatCountDownIsRunning = true
                numberOfMessageSentSinceCountDownStart = 0
                cheatCountDown.start()
            }
        }
    }

    private val gameInfoObserver = EventObserver {
        val event = it as GameInfoEvent
        players.postValue(event.scores)
    }

    // ************************************************************
    //                      End of observers
    // ************************************************************

    init {
        addSubscribers()
    }

    override fun onCleared() {
        super.onCleared()
        mEmitterHandler.unsubscribe(EventTypes.END_GAME, endGameObserver)
        mEmitterHandler.unsubscribe(EventTypes.START_ROUND, startRoundObserver)
        mEmitterHandler.unsubscribe(EventTypes.END_ROUND, endRoundObserver)
        mEmitterHandler.unsubscribe(EventTypes.GAME_TICK, gameTickObserver)
        mEmitterHandler.unsubscribe(EventTypes.WORD_TO_DRAW, wordToDrawObserver)
        mEmitterHandler.unsubscribe(EventTypes.WORD_FOUND, wordFoundObserver)
        mEmitterHandler.unsubscribe(EventTypes.LEAVE_GAME_PLAYER_RECEIVED, leaveGameObserver)
        mEmitterHandler.unsubscribe(EventTypes.ELIMINATED, eliminatedObserver)
        mEmitterHandler.unsubscribe(EventTypes.CHAT_MESSAGE_SEND, chatMessageSendObserver)
        mEmitterHandler.unsubscribe(EventTypes.GAME_INFO, gameInfoObserver)
    }

    fun sendGuess(guess: String) {
        if (!chatIsBlocked.value!!)
            mEmitterHandler.emit(ChatMessageSentEvent(guess, "Lobby:${gameName}"))
    }

    fun sendLeaveGameEvent() {
        if (isSpectator) {
            mEmitterHandler.emit(LeaveGameSpectatorSendEvent())
        } else {
            mEmitterHandler.emit(LeaveGamePlayerSendEvent())
        }
    }

    private fun punishUser() {
        when (punishLevel) {
            0 -> {
                chatIsBlocked.postValue(true)
                mEmitterHandler.emit(ChatBlockedEvent(true))
                object : CountDownTimer(5000, 5000) {
                    override fun onTick(millisUntilFinished: Long) {
                        // Do nothing
                    }

                    override fun onFinish() {
                        chatIsBlocked.postValue(false)
                        mEmitterHandler.emit(ChatBlockedEvent(false))
                    }
                }.start()
            }
            1 -> {
                chatIsBlocked.postValue(true)
                mEmitterHandler.emit(ChatBlockedEvent(true))
            }
            2 -> {
                finishActivity.postValue(true)
                mEmitterHandler.emit(UserCheatedEvent())
                mEmitterHandler.emit(SendLogoutEvent())
            }
        }
        punishLevel++
    }

    private fun addSubscribers() {
        if (!observersWereAdded) {
            mEmitterHandler.subscribe(EventTypes.END_GAME, endGameObserver)
            mEmitterHandler.subscribe(EventTypes.START_ROUND, startRoundObserver)
            mEmitterHandler.subscribe(EventTypes.END_ROUND, endRoundObserver)
            mEmitterHandler.subscribe(EventTypes.GAME_TICK, gameTickObserver)
            mEmitterHandler.subscribe(EventTypes.WORD_TO_DRAW, wordToDrawObserver)
            mEmitterHandler.subscribe(EventTypes.WORD_FOUND, wordFoundObserver)
            mEmitterHandler.subscribe(EventTypes.LEAVE_GAME_PLAYER_RECEIVED, leaveGameObserver)
            mEmitterHandler.subscribe(EventTypes.ELIMINATED, eliminatedObserver)
            mEmitterHandler.subscribe(EventTypes.CHAT_MESSAGE_SEND, chatMessageSendObserver)
            mEmitterHandler.subscribe(EventTypes.GAME_INFO, gameInfoObserver)
            observersWereAdded = true
        }
    }

    /*private fun addLeaveGameSpectatorSubscriber() {
        mEmitterHandler.subscribe(EventTypes.LEAVE_GAME_SPECTATOR_RECEIVED, EventObserver {
            val event = it as LeaveGameSpectatorReceivedEvent
            if (event.username == DrawHubApplication.currentUser.username) {
                finishActivity.postValue(false)
            } else {
                val newSpectatorsList = mutableListOf<Spectator>()
                for (spectator in spectators.value!!) {
                    if (spectator.username != event.username)
                        newSpectatorsList.add(spectator)
                }
                spectators.postValue(newSpectatorsList)
            }
        })
    }*/

    fun emitWordFoundMessage(context: Context, userWhoGuessed: String, showToast: Boolean = false) {
        val messageHandler = DrawHubApplication.chatMessageHandler
        val roomName = messageHandler.activeRoom!!.name
        val currentUsername = DrawHubApplication.currentUser.username
        val messageContent = if (userWhoGuessed == currentUsername) {
            context.getString(R.string.word_guessed_by_current)
        } else {
            context.getString(R.string.word_guessed_by_other, userWhoGuessed)
        }
        DrawHubApplication.chatMessageHandler.emitServerMessage(
            ServerMessageStatus.GOOD,
            messageContent,
            roomName
        )

        if (showToast) {
            ToastMaker.showText(
                context,
                messageContent
            )
        }
    }

    fun resetWordFoundUsername() {
        // It's super important to reset the username after having sent
        // the first event, as to avoid triggering the observers at bad times.
        // Note that the observers have: if(username != "") to not react to an empty
        // username.
        if (!eventReset) {
            wordWasFoundEvent.postValue("")
            eventReset = true
        }
    }

}