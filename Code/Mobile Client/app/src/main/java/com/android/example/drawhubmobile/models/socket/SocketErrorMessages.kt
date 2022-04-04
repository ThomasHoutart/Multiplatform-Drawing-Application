package com.android.example.drawhubmobile.models.socket

object SocketErrorMessages {
    // General
    const val INTERNAL_SERVER_ERROR = "InternalServerError"
    const val NOT_LOGGED_IN_ERROR = "NotLoggedInError"
    const val NO_CONTENT_ERROR = "NoContentError"
    const val BAD_CONTENT_ERROR = "BadContentError"
    const val PERMISSION_ERROR = "PermissionError"

    // Auth Errors
    const val USER_DOES_NOT_EXIST_ERROR = "UserDoesNotExistError"
    const val BAD_PASSWORD_ERROR = "BadPasswordError"
    const val ALREADY_LOGGED_IN_ERROR = "UserAlreadyLoggedInError"
    const val USER_CHEATED_ERROR = "UserCheatedError"

    // Chat Rooms Errors
    const val NOT_IN_ROOM_ERROR = "NotInRoomError"
    const val ROOM_DOES_NOT_EXIST_ERROR = "RoomDoesNotExistError"
    const val ROOM_ALREADY_EXISTS_ERROR = "RoomAlreadyExistsError"
    const val MAX_ROOMS_JOINED_ERROR = "MaxRoomsJoinedError"
    const val ALREADY_IN_ROOM_ERROR = "AlreadyInRoomError"

    // Lobby Errors
    const val LOBBY_DOES_NOT_EXIST_ERROR = "LobbyDoesNotExistError"
    const val LOBBY_ALREADY_EXISTS_ERROR = "LobbyAlreadyExistsError"
    const val LOBBY_FULL_ERROR = "LobbyFullError"
    const val ALREADY_IN_LOBBY_ERROR = "AlreadyInLobbyError"
    const val USER_NOT_IN_LOBBY_ERROR = "UserNotInLobbyError"
    const val NOT_ENOUGH_PLAYERS_ERROR = "NotEnoughPlayersError"

    // Draw
    const val NOT_ARTIST_ERROR = "NotArtistError"
}