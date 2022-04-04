package com.android.example.drawhubmobile.viewmodels.chat

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.models.event.ChatBlockedEvent
import com.android.example.drawhubmobile.models.event.ChatMessageSentEvent
import com.android.example.drawhubmobile.models.event.DeleteRoomReceivedEvent
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.network.GENERAL_CHAT_NAME
import kotlinx.coroutines.launch
import retrofit2.HttpException


class ChatViewModel : ViewModel() {
    private var chatIsBlocked = false
    val textMessage = MutableLiveData("")
    private val mMessagesLiveData = MutableLiveData<List<ChatMessage>>()
    val messagesLiveData: LiveData<List<ChatMessage>>
        get() = mMessagesLiveData

    private val mErrorStatusLiveData = MutableLiveData("")
    val errorStatusLiveData: LiveData<String>
        get() = mErrorStatusLiveData

    val activeRoom: ChatRoom
        get() = DrawHubApplication.chatMessageHandler.activeRoom!!

    var activeRoomName = ""

    private var mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    private val onMessageReceivedObserver = EventObserver {
        DrawHubApplication.chatMessageHandler.clearUnreadMessages()
        mMessagesLiveData.postValue(DrawHubApplication.chatMessageHandler.activeRoom!!.messages)
    }

    private val onNotInRoomErrorObserver = EventObserver {
        mErrorStatusLiveData.postValue(SocketErrorMessages.NOT_IN_ROOM_ERROR)
        DrawHubApplication.chatMessageHandler.setActiveRoom(GENERAL_CHAT_NAME)
    }

    private val onRoomDoesNotExistErrorObserver = EventObserver {
        mErrorStatusLiveData.postValue(SocketErrorMessages.ROOM_DOES_NOT_EXIST_ERROR)
        DrawHubApplication.chatMessageHandler.setActiveRoom(GENERAL_CHAT_NAME)
    }

    private val onRoomDeletedObserver = EventObserver {
        val chatRoomDeletedEvent = it as DeleteRoomReceivedEvent
        if (chatRoomDeletedEvent.roomName == activeRoomName)
            mErrorStatusLiveData.postValue(SocketMessages.DELETE_ROOM)
    }

    private val chatBlockedObserver = EventObserver {
        val event = it as ChatBlockedEvent
        chatIsBlocked = event.isBlocked
    }

    init {
        mMessagesLiveData.postValue(DrawHubApplication.chatMessageHandler.activeRoom!!.messages)
    }

    fun subscribe() {
        mEmitterHandler.subscribe(EventTypes.CHAT_MESSAGE_RECEIVED, onMessageReceivedObserver)
        mEmitterHandler.subscribe(EventTypes.NOT_IN_ROOM_ERROR, onNotInRoomErrorObserver)
        mEmitterHandler.subscribe(
            EventTypes.ROOM_DOES_NOT_EXIST_ERROR,
            onRoomDoesNotExistErrorObserver
        )
        mEmitterHandler.subscribe(EventTypes.DELETE_ROOM_RECEIVED, onRoomDeletedObserver)
        mEmitterHandler.subscribe(EventTypes.BLOCK_CHAT, chatBlockedObserver)
    }

    fun unsubscribe() {
        mEmitterHandler.unsubscribe(EventTypes.CHAT_MESSAGE_RECEIVED, onMessageReceivedObserver)
        mEmitterHandler.unsubscribe(EventTypes.NOT_IN_ROOM_ERROR, onNotInRoomErrorObserver)
        mEmitterHandler.unsubscribe(
            EventTypes.ROOM_DOES_NOT_EXIST_ERROR,
            onRoomDoesNotExistErrorObserver
        )
        mEmitterHandler.unsubscribe(EventTypes.DELETE_ROOM_RECEIVED, onRoomDeletedObserver)
        mEmitterHandler.unsubscribe(EventTypes.BLOCK_CHAT, chatBlockedObserver)
    }

    fun sendMessage() {
        val message = textMessage.value.toString()
        if (message.trim().isEmpty() || chatIsBlocked) return
        mEmitterHandler.emit(ChatMessageSentEvent(message, DrawHubApplication.chatMessageHandler.activeRoom!!.name))
        textMessage.value = ""
    }

    fun clearMessages() {
        DrawHubApplication.chatMessageHandler.clearUnreadMessages()
    }

    fun getChatHistory() {
        viewModelScope.launch {
            try {
                DrawHubApplication.chatMessageHandler.getChatHistory {
                    mMessagesLiveData.postValue(DrawHubApplication.chatMessageHandler.activeRoom!!.messages)
                }
            } catch (e: HttpException) {
                println("Couldn't get the chat history : ${e.message}")
            }
        }
    }

    fun resetChatMessages() {
        mMessagesLiveData.postValue(DrawHubApplication.chatMessageHandler.activeRoom!!.messages)
    }

    // THIS IS NECESSARY TO HANDLE ROOM DELETION
    fun currentActiveRoomName(name: String) {
        activeRoomName = name
    }
}
