package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.network.EmitterHandler
import org.json.JSONException
import org.json.JSONObject


class CreateRoomSendEvent(roomName: String) : AbstractEvent() {
    var json: JSONObject = JSONObject()

    init {
        json.put("roomName", roomName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.CREATE_ROOM_SEND, this)
    }
}

class JoinRoomSendEvent(roomName: String) : AbstractEvent() {
    var json: JSONObject = JSONObject()

    init {
        json.put("roomName", roomName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_ROOM_SEND, this)
    }
}

class LeaveRoomSendEvent(roomName: String) : AbstractEvent() {
    var json: JSONObject = JSONObject()

    init {
        json.put("roomName", roomName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_ROOM_SEND, this)
    }
}

class DeleteRoomSendEvent(roomName: String) : AbstractEvent() {
    var json: JSONObject = JSONObject()

    init {
        json.put("roomName", roomName)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.DELETE_ROOM_SEND, this)
    }
}

class CreateRoomReceivedEvent(args: Array<Any>) : AbstractEvent() {
    private val data = args[0] as JSONObject
    val roomName: String
    val username: String

    init {
        try {
            roomName = data.getString("roomName")
            username = data.getString("username")
        } catch (e: JSONException) {
            throw JSONException("Invalid ChatRoomCreatedEvent JSON format...")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.CREATE_ROOM_RECEIVED, this)
    }
}

class JoinRoomReceivedEvent(args: Array<Any>) : AbstractEvent() {
    private val data = args[0] as JSONObject
    val roomName: String
    val username: String
    val roomCreator: String

    init {
        try {
            roomName = data.getString("roomName")
            username = data.getString("username")
            roomCreator = data.getString("creator")
        } catch (e: JSONException) {
            throw JSONException("Invalid ChatRoomJoinedEvent JSON format...")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.JOIN_ROOM_RECEIVED, this)
    }
}

class LeaveRoomReceivedEvent(args: Array<Any>) : AbstractEvent() {
    private val data = args[0] as JSONObject
    val roomName: String
    val username: String

    init {
        try {
            roomName = data.getString("roomName")
            username = data.getString("username")
        } catch (e: JSONException) {
            throw JSONException("Invalid ChatRoomLeftEvent JSON format...")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.LEAVE_ROOM_RECEIVED, this)
    }
}

class DeleteRoomReceivedEvent(args: Array<Any>) : AbstractEvent() {
    private val data = args[0] as JSONObject
    val roomName: String

    init {
        try {
            roomName = data.getString("roomName")
        } catch (e: JSONException) {
            throw JSONException("Invalid ChatRoomDeletedEvent JSON format...")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.DELETE_ROOM_RECEIVED, this)
    }
}

// Error

class NotInRoomErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.NOT_IN_ROOM_ERROR, this)
    }
}

class RoomDoesNotExistErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.ROOM_DOES_NOT_EXIST_ERROR, this)
    }
}

class RoomAlreadyExistErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.ROOM_ALREADY_EXISTS_ERROR, this)
    }
}

class MaxRoomsJoinedErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.MAX_ROOMS_JOINED_ERROR, this)
    }
}

class AlreadyInRoomErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.ALREADY_IN_ROOM_ERROR, this)
    }
}