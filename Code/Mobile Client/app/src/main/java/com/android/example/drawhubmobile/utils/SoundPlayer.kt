package com.android.example.drawhubmobile.utils

import android.content.Context
import android.media.MediaPlayer
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class SoundPlayer {

    private lateinit var context: Context

    fun init(context: Context?, emitterHandler: EmitterHandler) {
        this.context = context!!
        emitterHandler.subscribe(EventTypes.CHAT_MESSAGE_RECEIVED, EventObserver {
            playSound(R.raw.chat_message_received)
        })
    }

    fun playSound(resId: Int) {
        GlobalScope.launch {
            try {
                val sound = MediaPlayer.create(context, resId)
                sound.setOnCompletionListener {
                    it.reset()
                    it.release()
                }
                sound.start()
            } catch (e: Exception) {
                System.err.println("Could not play the sound: $e")
            }
        }
    }


}