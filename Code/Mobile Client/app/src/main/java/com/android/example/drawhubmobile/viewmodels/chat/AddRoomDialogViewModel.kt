package com.android.example.drawhubmobile.viewmodels.chat

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.models.http.Room
import com.android.example.drawhubmobile.network.EventObserver
import kotlinx.coroutines.launch


class AddRoomDialogViewModel : ViewModel() {

    private val emitterHandler = DrawHubApplication.emitterHandler

    val roomName = MutableLiveData<String>("")
    private var allRooms: List<Room> = listOf()
    private val mFilteredRooms = MutableLiveData<List<Room>>()
    val rooms: LiveData<List<Room>>
        get() = mFilteredRooms

    private var mSelectedRoom: Room? = null
    val selectedRoom: Room?
        get() = mSelectedRoom

    private val roomCount: Int
        get() = rooms.value!!.size


    private val onRemoteRoomListChangedObserver = EventObserver {
        retrieveAllRooms()
        updateRoomList()
    }

    init {
        retrieveAllRooms()
    }

    fun subscribe() {
        emitterHandler.subscribe(EventTypes.CREATE_ROOM_RECEIVED, onRemoteRoomListChangedObserver)
        emitterHandler.subscribe(EventTypes.DELETE_ROOM_RECEIVED, onRemoteRoomListChangedObserver)
    }

    fun unsubscribeObservers() {
        emitterHandler.unsubscribe(EventTypes.CREATE_ROOM_RECEIVED, onRemoteRoomListChangedObserver)
        emitterHandler.unsubscribe(EventTypes.DELETE_ROOM_RECEIVED, onRemoteRoomListChangedObserver)
    }

    private fun retrieveAllRooms() {
        viewModelScope.launch {
            try {
                allRooms = DrawHubApplication.chatMessageHandler.getNonJoinedRooms()
                mFilteredRooms.value = allRooms
            } catch (e: Exception) {
                System.err.println("Error retrieving room list: ${e.message}")
            }
        }
    }

    fun updateRoomList() {
        viewModelScope.launch {
            if (roomName.value!!.isEmpty()) {
                mFilteredRooms.value = allRooms
            }
            val filtered = allRooms.filter { room ->
                room.name.startsWith(roomName.value!!, true)
            }
            mFilteredRooms.value = filtered
            mSelectedRoom = filtered.find { room -> room.name == roomName.value!! }
        }
    }

    fun selectRoomAtIndex(index: Int) {
        val rooms = mFilteredRooms.value!!
        if (index >= rooms.size) throw IndexOutOfBoundsException()
        mSelectedRoom = rooms[index]
    }

    fun shouldCreateRoom(): Boolean {
        return roomCount == 0 || selectedRoom == null
    }
}