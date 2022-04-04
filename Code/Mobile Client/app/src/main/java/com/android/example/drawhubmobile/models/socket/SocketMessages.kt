package com.android.example.drawhubmobile.models.socket

object SocketMessages {
    // Login
    const val USER_LOGIN = "UserLogin"
    const val USER_AUTHENTICATED = "UserAuthenticated"
    // Log Out
    const val LOGOUT_MESSAGE = "UserLogout"

    // Chat
    const val CHAT_MESSAGE = "ChatMessage"
    const val SERVER_MESSAGE_AUTHOR = ":server:"

    // Chat Rooms
    const val CREATE_ROOM = "CreateRoom"
    const val DELETE_ROOM = "DeleteRoom"
    const val JOIN_ROOM = "JoinRoom"
    const val LEAVE_ROOM = "LeaveRoom"

    // In Game
    const val START_GAME = "StartGame"
    const val START_ROUND = "StartRound"
    const val END_ROUND = "EndRound"
    const val END_GAME = "EndGame"
    const val LEAVE_GAME_PLAYER = "LeaveGamePlayer"
    const val JOIN_GAME_SPECTATOR = "JoinGameSpectator"
    const val LEAVE_GAME_SPECTATOR = "LeaveGameSpectator"
    const val HINT = "Hint"
    const val WORD_FOUND = "WordFound"
    const val GAME_TICK = "GameTick"
    const val ELIMINATED = "Eliminate"
    const val WORD_TO_DRAW = "WordToDraw"
    const val USER_CHEATED = "UserCheated"

    // Draw
    const val SET_PATH = "SetPath"
    const val APPEND_TO_PATH = "AppendToPath"

    // Lobby
    const val CREATE_LOBBY = "CreateLobby"
    const val DELETE_LOBBY = "DeleteLobby"
    const val JOIN_LOBBY_PLAYER = "JoinLobbyPlayer"
    const val LEAVE_LOBBY_PLAYER = "LeaveLobbyPlayer"
    const val JOIN_LOBBY_SPECTATOR = "JoinLobbySpectator"
    const val LEAVE_LOBBY_SPECTATOR = "LeaveLobbySpectator"
    const val UPDATE_LOBBY = "UpdateLobby"
    const val LOBBY_INFO = "LobbyInfo"
    const val ADD_BOT = "AddBot"
    const val REMOVE_PLAYER = "KickPlayer"

    // AntiCheat
    const val BLOCK_CHAT = "BlockChat"
    const val BLOCK_ROUND = "BlockRound"
    const val BLOCK_GAME = "BlockGame"
}
