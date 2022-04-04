package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.models.SimpleUser
import com.android.example.drawhubmobile.network.EmitterHandler
import org.json.JSONArray
import org.json.JSONObject

//
//      Send
//
class CreateLobbySendEvent(gameName: String, gameMode: String, difficulty: String) :
    AbstractEvent() {

    val json: JSONObject = JSONObject()

    init {
        json.put("gameName", gameName)
        json.put("gameMode", gameMode)
        json.put("difficulty", difficulty)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.CREATE_LOBBY_SEND, this)
    }
}

class JoinLobbyPlayerSendEvent(gameName: String) : AbstractEvent() {

    val json: JSONObject = JSONObject()

    init {
        json.put("gameName", gameName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_LOBBY_PLAYER_SEND, this)
    }
}

class JoinLobbySpectatorSendEvent(gameName: String) : AbstractEvent() {

    val json: JSONObject = JSONObject()

    init {
        json.put("gameName", gameName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_LOBBY_SPECTATOR_SEND, this)
    }
}

class LeaveLobbyPlayerSendEvent() : AbstractEvent() {

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_LOBBY_PLAYER_SEND, this)
    }
}

class LeaveLobbySpectatorSendEvent() : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_LOBBY_SPECTATOR_SEND, this)
    }
}

class DeleteLobbySendEvent() : AbstractEvent() {

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.DELETE_LOBBY_SEND, this)
    }
}

class StartGameSendEvent() : AbstractEvent() {

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.START_GAME_SEND, this)
    }
}

//
//      Received
//
class CreateLobbyReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var gameName = ""
    var username = ""
    var gameMode = ""
    var difficulty = ""

    init {
        try {
            val data = args[0] as JSONObject
            gameName = data.get("gameName") as String
            username = data.get("username") as String
            gameMode = data.get("gameMode") as String
            difficulty = data.get("difficulty") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.CREATE_LOBBY_RECEIVED, this)
    }
}

class JoinLobbyPlayerReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var username = ""
    var avatar = 0

    init {
        try {
            val data = args[0] as JSONObject
            username = data.get("username") as String
            avatar = data.get("avatar") as Int
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_LOBBY_PLAYER_RECEIVED, this)
    }
}

class JoinLobbySpectatorReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var username = ""
    var avatar = 0

    init {
        try {
            val data = args[0] as JSONObject
            username = data.get("username") as String
            avatar = data.get("avatar") as Int
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_LOBBY_SPECTATOR_RECEIVED, this)
    }
}

class LeaveLobbyPlayerReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var username = ""

    init {
        try {
            val data = args[0] as JSONObject
            username = data.get("username") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_LOBBY_PLAYER_RECEIVED, this)
    }
}

class LeaveLobbySpectatorReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var username = ""

    init {
        try {
            val data = args[0] as JSONObject
            username = data.get("username") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_LOBBY_SPECTATOR_RECEIVED, this)
    }
}

class DeleteLobbyReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var gameName = ""

    init {
        try {
            val data = args[0] as JSONObject
            gameName = data.get("gameName") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.DELETE_LOBBY_RECEIVED, this)
    }
}

class StartGameReceivedEvent(args: Array<Any>) : AbstractEvent() {

    var gameName = ""

    init {
        try {
            val data = args[0] as JSONObject
            gameName = data.get("gameName") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.START_GAME_RECEIVED, this)
    }
}

//
//      One way events
//
class AddBotEvent() : AbstractEvent() {

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.ADD_BOT, this)
    }
}

class RemovePlayerEvent(username: String) : AbstractEvent() {
    val json: JSONObject = JSONObject()

    init {
        json.put("username", username)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.REMOVE_PLAYER, this)
    }
}

class UpdateLobbyEvent(args: Array<Any>) : AbstractEvent() {

    var gameName: String
    var playerCount: Int

    init {
        val data = args[0] as JSONObject
        gameName = data.get("gameName") as String
        playerCount = data.get("playerCount") as Int
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.UPDATE_LOBBY, this)
    }
}

class LobbyInfoEvent(args: Array<Any>) : AbstractEvent() {
    var players = mutableListOf<SimpleUser>()
    var spectators = mutableListOf<SimpleUser>()

    init {
        try {
            val data = args[0] as JSONObject
            val playersJsonArray = data.get("players") as JSONArray
            for (i in 0 until playersJsonArray.length()) {
                val playerJson = playersJsonArray.get(i) as JSONObject
                val username = playerJson.get("username") as String
                val avatar = playerJson.get("avatar") as Int
                val player = SimpleUser(username, avatar)
                players.add(player)
            }
            val spectatorJsonArray = data.get("spectators") as JSONArray
            for (i in 0 until spectatorJsonArray.length()) {
                val spectatorJson = spectatorJsonArray.get(i) as JSONObject
                val username = spectatorJson.get("username") as String
                val avatar = spectatorJson.get("avatar") as Int
                val spectator = SimpleUser(username, avatar)
                spectators.add(spectator)
            }
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LOBBY_INFO, this)
    }
}

// Error

class LobbyDoesNotExistErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LOBBY_DOES_NOT_EXIST_ERROR, this)
    }
}

class LobbyAlreadyExistsErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LOBBY_ALREADY_EXISTS_ERROR, this)
    }
}

class LobbyFullErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LOBBY_FULL_ERROR, this)
    }
}

class AlreadyInLobbyErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.ALREADY_IN_LOBBY_ERROR, this)
    }
}

class UserNotInLobbyErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.USER_NOT_IN_LOBBY_ERROR, this)
    }
}

class NotEnoughPlayersErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.NOT_ENOUGH_PLAYERS_ERROR, this)
    }
}