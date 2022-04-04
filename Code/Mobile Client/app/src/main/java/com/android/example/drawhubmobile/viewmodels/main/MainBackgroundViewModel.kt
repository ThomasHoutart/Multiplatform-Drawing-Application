package com.android.example.drawhubmobile.viewmodels.main

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver

class MainBackgroundViewModel : ViewModel() {
    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler
    private val messageHandler = DrawHubApplication.chatMessageHandler
    private val mUnreadMessagesCountLiveData = MutableLiveData<Int>()

    val unreadMessagesCountLiveData: LiveData<Int>
        get() = mUnreadMessagesCountLiveData

    init {
        mEmitterHandler.subscribe(EventTypes.CHAT_MESSAGE_RECEIVED, EventObserver {
            mUnreadMessagesCountLiveData.postValue(messageHandler.totalUnreadMessages)
        })
        val nUnread = messageHandler.totalUnreadMessages
        mUnreadMessagesCountLiveData.value = nUnread
    }

    fun updateUnreadMessageCount() {
        val nUnread = messageHandler.totalUnreadMessages
        mUnreadMessagesCountLiveData.value = nUnread
    }
}