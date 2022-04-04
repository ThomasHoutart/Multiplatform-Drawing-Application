package com.android.example.drawhubmobile.models.socket

abstract class CustomSocket {
    abstract fun emit(event: String, vararg args: Any)
    abstract fun on(event: String, fn: (args: Array<Any>) -> Unit)
    abstract fun connected(): Boolean
    abstract fun connect()
    abstract fun disconnect()
}