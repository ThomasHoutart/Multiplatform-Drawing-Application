package com.android.example.drawhubmobile

import android.app.Application
import android.content.Context
import com.android.example.drawhubmobile.models.User
import com.android.example.drawhubmobile.models.http.RetrofitClient
import com.android.example.drawhubmobile.models.socket.CustomSocket
import com.android.example.drawhubmobile.models.socket.CustomSocketIO
import com.android.example.drawhubmobile.network.*
import com.android.example.drawhubmobile.utils.SoundPlayer
import com.github.nkzawa.socketio.client.IO


class DrawHubApplication : Application() {

    companion object {
        var isKicked: Boolean = false
        var ctx: Context? = null

        var socket: CustomSocket = CustomSocketIO(IO.socket(BASE_URL))

        var emitterHandler = EmitterHandler()
        var socketHandler = SocketHandler(socket, emitterHandler)
        var socketErrorHandler = SocketErrorHandler(socket, emitterHandler)
        var chatMessageHandler = ChatMessageHandler(emitterHandler)
        var soundPlayer = SoundPlayer()

        var currentUser = User("", "", "", "", 0)
        var firstTime = false

        fun testReset() {
            socket = CustomSocketIO(IO.socket(BASE_URL))
            emitterHandler = EmitterHandler()
            socketHandler = SocketHandler(socket, emitterHandler)
            socketErrorHandler = SocketErrorHandler(socket, emitterHandler)
            chatMessageHandler = ChatMessageHandler(emitterHandler)
            chatMessageHandler.initContext(ctx!!)
            soundPlayer.init(ctx, emitterHandler)
            soundPlayer = SoundPlayer()
        }

    }

    override fun onCreate() {
        super.onCreate()
        ServerApi.init(RetrofitClient.getRetrofit())
        ctx = applicationContext
        chatMessageHandler.initContext(applicationContext)
        soundPlayer.init(applicationContext, emitterHandler)
    }

    override fun onTerminate() {
        socket.disconnect()
        super.onTerminate()
    }
}
