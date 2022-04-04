package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.network.EmitterHandler
import org.json.JSONObject

class SendLogoutEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LOGOUT_SEND, this)
    }
}

class SendLoginEvent(val username: String, val password: String) : AbstractEvent() {
    var json: JSONObject = JSONObject()

    init {
        json.put("username", username)
        json.put("hash", password)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LOGIN_SEND, this)
    }
}

class UserAuthenticatedEvent(args: Array<Any>) : AbstractEvent() {

    var socketId: String
    var firstName: String
    var lastName: String
    var firstTime: Boolean
    var avatar: Int

    init {
        val data = args[0] as JSONObject
        socketId = data.get("hashSocketId") as String
        firstName = data.get("firstName") as String
        lastName = data.get("lastName") as String
        firstTime = data.get("firstTime") as Boolean
        avatar = data.get("avatar") as Int
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.USER_AUTHENTICATED, this)
    }
}

class UserDoesNotExistEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.USER_DOES_NOT_EXIST_ERROR, this)
    }
}

class BadPasswordEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.BAD_PASSWORD_ERROR, this)
    }
}

class AlreadyLoggedInEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.ALREADY_LOGGED_IN_ERROR, this)
    }
}

class UserCheatedErrorEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.USER_CHEATED_ERROR, this)
    }
}
