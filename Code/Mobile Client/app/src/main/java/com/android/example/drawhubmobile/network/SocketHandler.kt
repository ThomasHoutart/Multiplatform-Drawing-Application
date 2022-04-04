package com.android.example.drawhubmobile.network

import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.models.socket.CustomSocket
import com.android.example.drawhubmobile.models.socket.SocketMessages
import kotlin.math.log

class SocketHandler(private val mSocket: CustomSocket, private val emitterHandler: EmitterHandler) {

    init {
        //            ##############################
        //            ##### Socket subscribers #####
        //            ##############################

        //
        //       Login Event
        //
        mSocket.on(SocketMessages.USER_AUTHENTICATED) { args ->
            emitterHandler.emit(UserAuthenticatedEvent(args))
        }

        //
        //       Chat Event
        //
        mSocket.on(SocketMessages.CHAT_MESSAGE) { args ->
            emitterHandler.emit(ChatMessageReceivedEvent(args))
        }
        mSocket.on(SocketMessages.DELETE_ROOM) { args ->
            emitterHandler.emit(DeleteRoomReceivedEvent(args))
        }
        mSocket.on(SocketMessages.CREATE_ROOM) { args ->
            emitterHandler.emit(CreateRoomReceivedEvent(args))
        }
        mSocket.on(SocketMessages.LEAVE_ROOM) { args ->
            emitterHandler.emit(LeaveRoomReceivedEvent(args))
        }
        mSocket.on(SocketMessages.JOIN_ROOM) { args ->
            emitterHandler.emit(JoinRoomReceivedEvent(args))
        }
        //
        //       Game Event
        //
        mSocket.on(SocketMessages.START_GAME) { args ->
            emitterHandler.emit(StartGameReceivedEvent(args))
        }
        mSocket.on(SocketMessages.END_GAME) { args ->
            emitterHandler.emit(EndGameEvent(args))
        }
        mSocket.on(SocketMessages.START_ROUND) { args ->
            emitterHandler.emit(StartRoundEvent(args))
        }
        mSocket.on(SocketMessages.END_ROUND) { args ->
            emitterHandler.emit(EndRoundEvent(args))
        }
        mSocket.on(SocketMessages.GAME_TICK) { args ->
            emitterHandler.emit(GameTickEvent(args))
        }
        mSocket.on(SocketMessages.WORD_TO_DRAW) { args ->
            emitterHandler.emit(WordToDrawEvent(args))
        }
        mSocket.on(SocketMessages.WORD_FOUND) { args ->
            emitterHandler.emit(WordFoundEvent(args))
        }
        mSocket.on(SocketMessages.LEAVE_GAME_PLAYER) { args ->
            emitterHandler.emit(LeaveGamePlayerReceivedEvent(args))
        }
        mSocket.on(SocketMessages.LEAVE_GAME_SPECTATOR) { args ->
            emitterHandler.emit(LeaveGameSpectatorReceivedEvent(args))
        }
        mSocket.on(SocketMessages.JOIN_GAME_SPECTATOR) { args ->
            emitterHandler.emit(JoinGameSpectatorReceivedEvent(args))
        }
        mSocket.on(SocketMessages.ELIMINATED) { args ->
            emitterHandler.emit(EliminatedEvent(args))
        }
        //
        //       Lobby Event
        //
        mSocket.on(SocketMessages.CREATE_LOBBY) { args ->
            emitterHandler.emit(CreateLobbyReceivedEvent(args))
        }
        mSocket.on(SocketMessages.JOIN_LOBBY_PLAYER) { args ->
            emitterHandler.emit(JoinLobbyPlayerReceivedEvent(args))
        }
        mSocket.on(SocketMessages.JOIN_LOBBY_SPECTATOR) { args ->
            emitterHandler.emit(JoinLobbySpectatorReceivedEvent(args))
        }
        mSocket.on(SocketMessages.LEAVE_LOBBY_PLAYER) { args ->
            emitterHandler.emit(LeaveLobbyPlayerReceivedEvent(args))
        }
        mSocket.on(SocketMessages.LEAVE_LOBBY_SPECTATOR) { args ->
            emitterHandler.emit(LeaveLobbySpectatorReceivedEvent(args))
        }
        mSocket.on(SocketMessages.DELETE_LOBBY) { args ->
            emitterHandler.emit(DeleteLobbyReceivedEvent(args))
        }
        mSocket.on(SocketMessages.UPDATE_LOBBY) { args ->
            emitterHandler.emit(UpdateLobbyEvent(args))
        }
        mSocket.on(SocketMessages.LOBBY_INFO) { args ->
            emitterHandler.emit(LobbyInfoEvent(args))
        }
        //
        //       Drawing Event
        //
        mSocket.on(SocketMessages.SET_PATH) { args ->
            emitterHandler.emit(SetPathReceivedEvent(args))
        }
        mSocket.on(SocketMessages.APPEND_TO_PATH) { args ->
            emitterHandler.emit(AppendToPathReceivedEvent(args))
        }


        //                 #####################################
        //                 #### EmitterHandler subscribers #####
        //                 #####################################

        //
        //       Login Event
        //
        emitterHandler.subscribe(EventTypes.LOGIN_SEND, EventObserver {
            val sendLoginEvent = it as SendLoginEvent
            mSocket.emit(SocketMessages.USER_LOGIN, sendLoginEvent.json)
        })

        emitterHandler.subscribe(EventTypes.LOGOUT_SEND, EventObserver {
            mSocket.emit(SocketMessages.LOGOUT_MESSAGE)
        })
        //
        //       Chat Event
        //
        emitterHandler.subscribe(EventTypes.CHAT_MESSAGE_SEND, EventObserver {
            val chatMessageSentEvent = it as ChatMessageSentEvent
            mSocket.emit(SocketMessages.CHAT_MESSAGE, chatMessageSentEvent.json)
        })

        emitterHandler.subscribe(EventTypes.CREATE_ROOM_SEND, EventObserver {
            val chatRoomCreateEvent = it as CreateRoomSendEvent
            mSocket.emit(SocketMessages.CREATE_ROOM, chatRoomCreateEvent.json)
        })

        emitterHandler.subscribe(EventTypes.JOIN_ROOM_SEND, EventObserver {
            val chatRoomJoinEvent = it as JoinRoomSendEvent
            mSocket.emit(SocketMessages.JOIN_ROOM, chatRoomJoinEvent.json)
        })

        emitterHandler.subscribe(EventTypes.LEAVE_ROOM_SEND, EventObserver {
            val chatRoomLeaveEvent = it as LeaveRoomSendEvent
            mSocket.emit(SocketMessages.LEAVE_ROOM, chatRoomLeaveEvent.json)
        })

        emitterHandler.subscribe(EventTypes.DELETE_ROOM_SEND, EventObserver {
            val chatRoomDeleteEvent = it as DeleteRoomSendEvent
            mSocket.emit(SocketMessages.DELETE_ROOM, chatRoomDeleteEvent.json)
        })
        //
        //       Game Event
        //
        emitterHandler.subscribe(EventTypes.SET_PATH_SEND, EventObserver {
            val event = it as SetPathSendEvent
            mSocket.emit(SocketMessages.SET_PATH, event.json)
        })
        emitterHandler.subscribe(EventTypes.APPEND_TO_PATH_SEND, EventObserver {
            val event = it as AppendToPathSendEvent
            mSocket.emit(SocketMessages.APPEND_TO_PATH, event.json)
        })
        emitterHandler.subscribe(EventTypes.LEAVE_GAME_PLAYER_SEND, EventObserver {
            mSocket.emit(SocketMessages.LEAVE_GAME_PLAYER)
        })
        emitterHandler.subscribe(EventTypes.LEAVE_GAME_SPECTATOR_SEND, EventObserver {
            mSocket.emit(SocketMessages.LEAVE_GAME_SPECTATOR)
        })
        emitterHandler.subscribe(EventTypes.JOIN_GAME_SPECTATOR_SEND, EventObserver {
            val event = it as JoinGameSpectatorSendEvent
            mSocket.emit(SocketMessages.JOIN_GAME_SPECTATOR, event.json)
        })
        emitterHandler.subscribe(EventTypes.USER_CHEATED, EventObserver {
            mSocket.emit(SocketMessages.USER_CHEATED)
        })
        //
        //       Lobby Event
        //
        emitterHandler.subscribe(EventTypes.CREATE_LOBBY_SEND, EventObserver {
            val createLobbySend = it as CreateLobbySendEvent
            mSocket.emit(SocketMessages.CREATE_LOBBY, createLobbySend.json)
        })
        emitterHandler.subscribe(EventTypes.JOIN_LOBBY_PLAYER_SEND, EventObserver {
            val joinPlayerSendEvent = it as JoinLobbyPlayerSendEvent
            mSocket.emit(SocketMessages.JOIN_LOBBY_PLAYER, joinPlayerSendEvent.json)
        })
        emitterHandler.subscribe(EventTypes.JOIN_LOBBY_SPECTATOR_SEND, EventObserver {
            val joinSpectatorSendEvent = it as JoinLobbySpectatorSendEvent
            mSocket.emit(SocketMessages.JOIN_LOBBY_SPECTATOR, joinSpectatorSendEvent.json)
        })
        emitterHandler.subscribe(EventTypes.LEAVE_LOBBY_PLAYER_SEND, EventObserver {
            mSocket.emit(SocketMessages.LEAVE_LOBBY_PLAYER)
        })
        emitterHandler.subscribe(EventTypes.LEAVE_LOBBY_SPECTATOR_SEND, EventObserver {
            mSocket.emit(SocketMessages.LEAVE_LOBBY_SPECTATOR)
        })
        emitterHandler.subscribe(EventTypes.DELETE_LOBBY_SEND, EventObserver {
            mSocket.emit(SocketMessages.DELETE_LOBBY)
        })
        emitterHandler.subscribe(EventTypes.ADD_BOT, EventObserver {
            mSocket.emit(SocketMessages.ADD_BOT)
        })
        emitterHandler.subscribe(EventTypes.START_GAME_SEND, EventObserver {
            mSocket.emit(SocketMessages.START_GAME)
        })
        emitterHandler.subscribe(EventTypes.REMOVE_PLAYER, EventObserver {
            val event = it as RemovePlayerEvent
            mSocket.emit(SocketMessages.REMOVE_PLAYER, event.json)
        })
    }

    fun isConnected(): Boolean {
        return mSocket.connected()
    }

    fun connect() {
        if (!isConnected())
            mSocket.connect()
    }

    fun logout() {
        DrawHubApplication.chatMessageHandler.clearJoinedRooms()
        emitterHandler.emit(SendLogoutEvent())
    }
}