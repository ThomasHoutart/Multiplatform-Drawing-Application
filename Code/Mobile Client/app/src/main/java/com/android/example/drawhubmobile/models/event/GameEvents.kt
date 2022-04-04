package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.models.game.Scores
import com.android.example.drawhubmobile.models.http.ScoresJson
import com.android.example.drawhubmobile.network.EmitterHandler
import org.json.JSONArray
import org.json.JSONObject

class EndGameEvent(args: Array<Any>) : AbstractEvent() {

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
        es.emitType(EventTypes.END_GAME, this)
    }
}

class StartRoundEvent(args: Array<Any>) : AbstractEvent() {

    var newArtist = ""

    init {
        try {
            val data = args[0] as JSONObject
            newArtist = data.get("artist") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.START_ROUND, this)
    }
}

class EndRoundEvent(args: Array<Any>) : AbstractEvent() {

    lateinit var scores: Scores
    lateinit var word: String

    init {
        try {
            val data = args[0] as JSONObject
            val jsonArray = data.get("scores") as JSONArray
            var players = mutableListOf<Player>()
            for (i in 0 until jsonArray.length()) {
                val inGameUser = jsonArray.get(i) as JSONObject
                val avatar = try {
                    inGameUser.getInt("avatar")
                } catch (e: Exception) {
                    0
                }
                players.add(
                    Player(
                        inGameUser.getString("username"),
                        inGameUser.getInt("score"),
                        avatar
                    )
                )
            }
            players = players.sortedBy { player -> player.score }.reversed().toMutableList()
            scores = Scores(players)
            word = data.getString("word")
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.END_ROUND, this)
    }
}

class GameTickEvent(args: Array<Any>) : AbstractEvent() {
    var time = 0

    init {
        try {
            val data = args[0] as JSONObject
            time = data.get("timeLeft") as Int
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.GAME_TICK, this)
    }
}

class WordToDrawEvent(args: Array<Any>) : AbstractEvent() {
    var word = ""

    init {
        try {
            val data = args[0] as JSONObject
            word = data.get("word") as String
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.WORD_TO_DRAW, this)
    }
}

class WordFoundEvent(args: Array<Any>) : AbstractEvent() {
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
        es.emitType(EventTypes.WORD_FOUND, this)
    }
}

class JoinGameSpectatorSendEvent(gameName: String) : AbstractEvent() {

    val json: JSONObject = JSONObject()

    init {
        json.put("gameName", gameName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_GAME_SPECTATOR_SEND, this)
    }
}

class LeaveGamePlayerSendEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_GAME_PLAYER_SEND, this)
    }
}

class LeaveGameSpectatorSendEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_GAME_SPECTATOR_SEND, this)
    }
}

class JoinGameSpectatorReceivedEvent(args: Array<Any>) : AbstractEvent() {
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
        es.emitType(EventTypes.JOIN_GAME_SPECTATOR_RECEIVED, this)
    }
}

class LeaveGamePlayerReceivedEvent(args: Array<Any>) : AbstractEvent() {
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
        es.emitType(EventTypes.LEAVE_GAME_PLAYER_RECEIVED, this)
    }
}

class LeaveGameSpectatorReceivedEvent(args: Array<Any>) : AbstractEvent() {
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
        es.emitType(EventTypes.LEAVE_GAME_SPECTATOR_RECEIVED, this)
    }
}

class EliminatedEvent(args: Array<Any>) : AbstractEvent() {

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
        es.emitType(EventTypes.ELIMINATED, this)
    }
}

class UserCheatedEvent() : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.USER_CHEATED, this)
    }
}

class GameInfoEvent(args: Array<Any>) : AbstractEvent() {

    var scores = mutableListOf<Player>()

    init {
        try {
            val data = args[0] as JSONObject
            val playersJsonArray = data.get("scores") as JSONArray
            for (i in 0 until playersJsonArray.length()) {
                val playerJson = playersJsonArray.get(i) as JSONObject
                scores.add(
                    Player(
                        playerJson.get("username") as String,
                        playerJson.get("score") as Int,
                        playerJson.get("avatar") as Int
                    )
                )
            }
        } catch (e: Exception) {
            System.err.println("Json format error : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.GAME_INFO, this)
    }
}

// Error Event

class NotArtistEvent() : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.NOT_ARTIST_ERROR, this)
    }
}