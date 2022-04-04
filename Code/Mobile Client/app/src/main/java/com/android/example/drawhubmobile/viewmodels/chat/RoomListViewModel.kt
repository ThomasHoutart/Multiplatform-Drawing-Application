package com.android.example.drawhubmobile.viewmodels.chat

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.network.MAX_JOINED_ROOMS
import kotlin.coroutines.coroutineContext

class RoomListViewModel : ViewModel() {
    private val mRoomsLiveData = MutableLiveData<List<ChatRoom>>()
    val roomsLiveData: LiveData<List<ChatRoom>>
        get() = mRoomsLiveData
    private val mMaxRoomsJoined = MutableLiveData(false)
    val maxRoomsJoined: LiveData<Boolean>
        get() = mMaxRoomsJoined

    private val chatMessageHandler = DrawHubApplication.chatMessageHandler
    private var emitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    private val onMessageReceivedObserver = EventObserver {
        mRoomsLiveData.postValue(chatMessageHandler.joinedRooms)
    }

    private val onRoomDeletedObserver = EventObserver {
        mRoomsLiveData.postValue(chatMessageHandler.joinedRooms)
    }

    init {
        mRoomsLiveData.value = chatMessageHandler.joinedRooms
        emitterHandler.subscribe(EventTypes.DELETE_ROOM_RECEIVED, onRoomDeletedObserver)
        emitterHandler.subscribe(EventTypes.LEAVE_ROOM_RECEIVED, onRoomDeletedObserver)
        emitterHandler.subscribe(EventTypes.CHAT_MESSAGE_RECEIVED, onMessageReceivedObserver)
    }

    fun setActiveRoom(room: ChatRoom) {
        chatMessageHandler.setActiveRoom(room)
    }

    fun createRoom(roomName: String) {
        chatMessageHandler.createRoom(roomName)
        mRoomsLiveData.value = chatMessageHandler.joinedRooms
        checkJoinedRoomsCount()
    }

    fun joinRoom(roomName: String) {
        chatMessageHandler.joinRoom(roomName)
        mRoomsLiveData.value = chatMessageHandler.joinedRooms
        checkJoinedRoomsCount()
    }

    fun leaveRoom(roomName: String) {
        chatMessageHandler.leaveRoom(roomName)
        mRoomsLiveData.value = chatMessageHandler.joinedRooms
        checkJoinedRoomsCount()
    }

    fun deleteRoom(roomName: String) {
        chatMessageHandler.deleteRoom(roomName)
        mRoomsLiveData.value = chatMessageHandler.joinedRooms
        checkJoinedRoomsCount()
    }

    fun readAllUnread() {
        chatMessageHandler.readAllMessages()
        mRoomsLiveData.value = chatMessageHandler.joinedRooms
    }

    fun checkJoinedRoomsCount() {
        mMaxRoomsJoined.value = chatMessageHandler.joinedRooms.size == MAX_JOINED_ROOMS
    }

    fun getChatMessageHandlerLiveData(): LiveData<Boolean> {
        return chatMessageHandler.maxRoomJoined
    }
}