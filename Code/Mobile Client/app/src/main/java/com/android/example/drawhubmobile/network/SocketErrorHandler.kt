package com.android.example.drawhubmobile.network

import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.models.socket.CustomSocket
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages

class SocketErrorHandler(
    private val mSocket: CustomSocket,
    private val mEmitterHandler: EmitterHandler
) {
    init {
        // Auth
        mSocket.on(SocketErrorMessages.USER_DOES_NOT_EXIST_ERROR) {
            mEmitterHandler.emit(UserDoesNotExistEvent())
        }
        mSocket.on(SocketErrorMessages.BAD_PASSWORD_ERROR) {
            mEmitterHandler.emit(BadPasswordEvent())
        }
        mSocket.on(SocketErrorMessages.ALREADY_LOGGED_IN_ERROR) {
            mEmitterHandler.emit(AlreadyLoggedInEvent())
        }
        mSocket.on(SocketErrorMessages.USER_CHEATED_ERROR) {
            mEmitterHandler.emit(UserCheatedErrorEvent())
        }

        // Chat and Chat Rooms
        mSocket.on(SocketErrorMessages.NOT_IN_ROOM_ERROR) {
            mEmitterHandler.emit(NotInRoomErrorEvent())
        }
        mSocket.on(SocketErrorMessages.ROOM_DOES_NOT_EXIST_ERROR) {
            mEmitterHandler.emit(RoomDoesNotExistErrorEvent())
        }
        mSocket.on(SocketErrorMessages.ROOM_ALREADY_EXISTS_ERROR) {
            mEmitterHandler.emit(RoomAlreadyExistErrorEvent())
        }
        mSocket.on(SocketErrorMessages.MAX_ROOMS_JOINED_ERROR) {
            mEmitterHandler.emit(MaxRoomsJoinedErrorEvent())
        }
        mSocket.on(SocketErrorMessages.ALREADY_IN_ROOM_ERROR) {
            mEmitterHandler.emit(AlreadyInRoomErrorEvent())
        }

        // Lobby
        mSocket.on(SocketErrorMessages.LOBBY_DOES_NOT_EXIST_ERROR) {
            mEmitterHandler.emit(LobbyDoesNotExistErrorEvent())
        }
        mSocket.on(SocketErrorMessages.LOBBY_ALREADY_EXISTS_ERROR) {
            mEmitterHandler.emit(LobbyAlreadyExistsErrorEvent())
        }
        mSocket.on(SocketErrorMessages.LOBBY_FULL_ERROR) {
            mEmitterHandler.emit(LobbyFullErrorEvent())
        }
        mSocket.on(SocketErrorMessages.ALREADY_IN_LOBBY_ERROR) {
            mEmitterHandler.emit(AlreadyInLobbyErrorEvent())
        }
        mSocket.on(SocketErrorMessages.USER_NOT_IN_LOBBY_ERROR) {
            mEmitterHandler.emit(UserNotInLobbyErrorEvent())
        }
        mSocket.on(SocketErrorMessages.NOT_ENOUGH_PLAYERS_ERROR) {
            mEmitterHandler.emit(NotEnoughPlayersErrorEvent())
        }
    }
}