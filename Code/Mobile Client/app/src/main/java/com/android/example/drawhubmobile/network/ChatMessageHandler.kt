package com.android.example.drawhubmobile.network

import android.content.Context
import androidx.lifecycle.MutableLiveData
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.models.ServerMessageStatus
import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.models.http.Room
import com.android.example.drawhubmobile.utils.JavaScriptDateConverter

const val GENERAL_CHAT_NAME = "General"
const val SYSTEM_CREATOR_NAME = "System"
const val MAX_JOINED_ROOMS = 15

class ChatMessageHandler(private val emitterHandler: EmitterHandler) {

    private var context: Context? = null

    private val mJoinedRooms = mutableMapOf<String, ChatRoom>()
    val joinedRooms: List<ChatRoom>
        get() = mJoinedRooms.map { entry -> entry.value }

    private var mActiveRoom: ChatRoom? = null
    val activeRoom: ChatRoom?
        get() = mActiveRoom

    val maxRoomJoined = MutableLiveData(false)

    val totalUnreadMessages: Int
        get() {
            var sum = 0
            mJoinedRooms.forEach { entry -> sum += entry.value.unreadMessages }
            return sum
        }

    /*
    * Observers
    */
    private val onMessageReceivedObserver = EventObserver {
        val chatMessageReceivedEvent = it as ChatMessageReceivedEvent
        val sender = chatMessageReceivedEvent.chatMessage.username
        val targetRoom = mJoinedRooms[chatMessageReceivedEvent.roomName]
        if (targetRoom != null) {
            targetRoom.messages.add(chatMessageReceivedEvent.chatMessage)
            if (sender != DrawHubApplication.currentUser.username)
                targetRoom.unreadMessages++
        }
    }

    private val onRoomCreatedObserver = EventObserver {
        val chatRoomCreatedEvent = it as CreateRoomReceivedEvent
        val username = chatRoomCreatedEvent.username
        val roomName = chatRoomCreatedEvent.roomName
        val isCurrentUser = username == DrawHubApplication.currentUser.username
        val maxReached = joinedRooms.size == MAX_JOINED_ROOMS
        if (maxReached)
            maxRoomJoined.postValue(true)
        val isLobby = roomName.contains("Lobby:")
        if (isCurrentUser && (!maxReached || isLobby))
            mJoinedRooms[roomName] = ChatRoom(roomName, username, 0, mutableListOf())
        if (joinedRooms.size >= MAX_JOINED_ROOMS) {
            maxRoomJoined.postValue(true)
        } else {
            maxRoomJoined.postValue(false)
        }
    }

    private val onRoomJoinedObserver = EventObserver {
        val chatRoomJoinedEvent = it as JoinRoomReceivedEvent
        val username = chatRoomJoinedEvent.username
        val roomName = chatRoomJoinedEvent.roomName
        val creator = chatRoomJoinedEvent.roomCreator
        val content: String
        val isCurrentUser = username == DrawHubApplication.currentUser.username
        val maxReached = joinedRooms.size == MAX_JOINED_ROOMS
        val isLobby = roomName.contains("Lobby:")
        if (isCurrentUser && (!maxReached || isLobby)) {
            content = context!!.getString(R.string.currentUserChatJoinedMessage)
            mJoinedRooms[roomName] = ChatRoom(roomName, creator, 0, mutableListOf())
            mActiveRoom = mJoinedRooms[roomName]
        } else {
            content = context!!.getString(R.string.chatJoinedMessage, username)
        }
        emitServerMessage(null, content, chatRoomJoinedEvent.roomName)
        if (joinedRooms.size >= MAX_JOINED_ROOMS) {
            maxRoomJoined.postValue(true)
        } else {
            maxRoomJoined.postValue(false)
        }
    }

    private val onRoomLeftObserver = EventObserver {
        val chatRoomLeftEvent = it as LeaveRoomReceivedEvent
        val roomLeft = chatRoomLeftEvent.roomName
        if (chatRoomLeftEvent.username == DrawHubApplication.currentUser.username) {
            mJoinedRooms.remove(chatRoomLeftEvent.roomName)
            if (roomLeft == activeRoom?.name) {
                mActiveRoom = mJoinedRooms[GENERAL_CHAT_NAME]
            }
        } else {
            val content = context!!.getString(R.string.chatLeftMessage, chatRoomLeftEvent.username)
            emitServerMessage(null, content, chatRoomLeftEvent.roomName)
        }
        if (joinedRooms.size >= MAX_JOINED_ROOMS) {
            maxRoomJoined.postValue(true)
        } else {
            maxRoomJoined.postValue(false)
        }
    }

    private val onRoomDeletedObserver = EventObserver {
        val chatRoomDeletedEvent = it as DeleteRoomReceivedEvent
        val toRemove = mJoinedRooms[chatRoomDeletedEvent.roomName]
        if (toRemove == mActiveRoom) {
            val content = "This room has been deleted"
            val status = ServerMessageStatus.IMPORTANT
            emitServerMessage(status, content, mActiveRoom!!.name)
            mActiveRoom = mJoinedRooms[GENERAL_CHAT_NAME]
        }
        mJoinedRooms.remove(chatRoomDeletedEvent.roomName)
        if (joinedRooms.size >= MAX_JOINED_ROOMS) {
            maxRoomJoined.postValue(true)
        } else {
            maxRoomJoined.postValue(false)
        }
    }

    /*
    * Constructor
    */
    init {
        emitterHandler.subscribe(EventTypes.CHAT_MESSAGE_RECEIVED, onMessageReceivedObserver)
        emitterHandler.subscribe(EventTypes.CREATE_ROOM_RECEIVED, onRoomCreatedObserver)
        emitterHandler.subscribe(EventTypes.DELETE_ROOM_RECEIVED, onRoomDeletedObserver)
        emitterHandler.subscribe(EventTypes.JOIN_ROOM_RECEIVED, onRoomJoinedObserver)
        emitterHandler.subscribe(EventTypes.LEAVE_ROOM_RECEIVED, onRoomLeftObserver)
        if (joinedRooms.size >= MAX_JOINED_ROOMS) {
            maxRoomJoined.postValue(true)
        } else {
            maxRoomJoined.postValue(false)
        }
    }

    /*
    * Public Methods
    */
    fun initContext(ctx: Context) {
        context = ctx
    }

    fun clearUnreadMessages() {
        mActiveRoom?.unreadMessages = 0
    }

    fun setActiveRoom(room: ChatRoom) {
        mActiveRoom = mJoinedRooms[room.name]
        mActiveRoom?.unreadMessages = 0
    }

    fun setActiveRoom(roomName: String) {
        mActiveRoom = mJoinedRooms[roomName]
    }

    fun createRoom(roomName: String) {
        emitterHandler.emit(CreateRoomSendEvent(roomName))
    }

    fun sendServerHelpMessage() {
        if (activeRoom == null) return
        val content = context!!.getString(R.string.start_game_help_message)
        emitServerMessage(ServerMessageStatus.IMPORTANT, content, activeRoom!!.name)
    }

    fun joinRoom(roomName: String) {
        emitterHandler.emit(JoinRoomSendEvent(roomName))
    }

    fun leaveRoom(roomName: String) {
        emitterHandler.emit(LeaveRoomSendEvent(roomName))
    }

    fun deleteRoom(roomName: String) {
        emitterHandler.emit(DeleteRoomSendEvent(roomName))
    }

    fun readAllMessages() {
        for (room in mJoinedRooms) {
            room.value.unreadMessages = 0
        }
    }

    suspend fun getNonJoinedRooms(): List<Room> {
        val username = DrawHubApplication.currentUser.username
        val completeRooms = ServerApi.retrofitService.getRooms().rooms
        val joinedRooms = ServerApi.retrofitService.getRooms(username).rooms
        val completeNoLobby = completeRooms.filter { room -> !room.name.contains("Lobby:") }
        return completeNoLobby.filter { room -> !joinedRooms.contains(room) }
    }

    suspend fun getChatHistory(onFinish: () -> Unit) {
        val messages = mActiveRoom!!.messages
        val firstMessage = messages.find { chatMessage ->
            chatMessage.id != ""
        }
        val messageHistory = ServerApi.retrofitService.getRoomMessageHistory(
            mActiveRoom!!.name,
            firstMessage?.id
        )
        val messagesToAdd = mutableListOf<ChatMessage>()
        for (m in messageHistory.messages) {
            messagesToAdd.add(
                ChatMessage(
                    m.id,
                    m.author,
                    m.content,
                    JavaScriptDateConverter.convert(m.timestamp),
                    null,
                    m.avatar
                )
            )
        }
        messages.addAll(0, messagesToAdd)
        onFinish()
    }

    fun clearJoinedRooms() {
        mJoinedRooms.clear()
        mActiveRoom = null
    }

    fun emitServerMessage(status: ServerMessageStatus?, content: String, roomName: String) {
        emitterHandler.emit(ChatMessageReceivedEvent.asServerMessage(status, content, roomName))
    }
}