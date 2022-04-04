package com.android.example.drawhubmobile.mocks

import com.android.example.drawhubmobile.models.socket.CustomSocket

class CustomSocketMock : CustomSocket() {

    var connected = true

    private val clientToServer = mutableMapOf<String, (args: Array<Any>) -> Unit>()
    private val serverToClient = mutableMapOf<String, (args: Array<Any>) -> Unit>()

    override fun emit(event: String, vararg args: Any) {
        clientToServer[event]?.invoke(args.toList().toTypedArray())
    }

    override fun on(event: String, fn: (args: Array<Any>) -> Unit) {
        serverToClient[event] = fn
    }

    // What the server should do when the client emits
    fun onClient(event: String, fn: (args: Array<Any>) -> Unit) {
        clientToServer[event] = fn
    }

    // The server's response
    fun emitServer(event: String, vararg args: Any) {
        serverToClient[event]?.invoke(args.toList().toTypedArray())
    }

    override fun connected() = connected

    // Do not implement these functions...
    override fun connect() {}
    override fun disconnect() {}
}