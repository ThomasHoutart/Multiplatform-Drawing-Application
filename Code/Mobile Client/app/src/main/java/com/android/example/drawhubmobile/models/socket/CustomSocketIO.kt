package com.android.example.drawhubmobile.models.socket

import com.github.nkzawa.socketio.client.Socket

class CustomSocketIO(private val socket: Socket) : CustomSocket() {
    override fun emit(event: String, vararg args: Any) {
        socket.emit(event, *args)
    }

    override fun on(event: String, fn: (args: Array<Any>) -> Unit) {
        socket.on(event, fn)
    }

    override fun connected() = socket.connected()

    override fun connect() {
        socket.connect()
    }

    override fun disconnect() {
        socket.disconnect()
    }

}