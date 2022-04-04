package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.network.EmitterHandler
import org.json.JSONException
import org.json.JSONObject

class SetPathSendEvent(
    pathId: Int, color: String, strokeWidth: Float, path: String, canvasSize: Int): AbstractEvent() {

    val json: JSONObject = JSONObject()

    init {
        json.put("pathId", pathId)
        json.put("color", color)
        json.put("strokeWidth", strokeWidth)
        json.put("path", path)
        json.put("canvasSize", canvasSize)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.SET_PATH_SEND, this)
    }
}

class AppendToPathSendEvent(x: Float,y: Float): AbstractEvent() {
    val json: JSONObject = JSONObject()

    init {
        json.put("x", x)
        json.put("y", y)
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.APPEND_TO_PATH_SEND, this)
    }
}

class SetPathReceivedEvent(args: Array<Any>): AbstractEvent() {

    val pathId: Int
    val color: String
    val strokeWidth: Float
    val path: String
    val canvasSize: Int

    init {
        val data = args[0] as JSONObject

        try {
            pathId = data.getInt("pathId")
            color = data.getString("color")
            strokeWidth = data.getDouble("strokeWidth").toFloat()
            path = data.getString("path")
            canvasSize = data.getInt("canvasSize")
        } catch (e: JSONException) {
            throw JSONException("Invalid SetPath from server JSON format : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.SET_PATH_RECEIVED, this)
    }
}

class AppendToPathReceivedEvent(args: Array<Any>): AbstractEvent() {

    val x: Float
    val y: Float

    init {
        val data = args[0] as JSONObject

        try {
            x = data.getDouble("x").toFloat()
            y = data.getDouble("y").toFloat()
        } catch (e: JSONException) {
            throw JSONException("Invalid AppendToPath from server JSON format : $e")
        }
    }

    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.APPEND_TO_PATH_RECEIVED, this)
    }
}

class UpdateDrawingCanvasEvent : AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.UPDATE_DRAWING_CANVAS, this)
    }
}

class NotArtistErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.NOT_ARTIST_ERROR, this)
    }
}