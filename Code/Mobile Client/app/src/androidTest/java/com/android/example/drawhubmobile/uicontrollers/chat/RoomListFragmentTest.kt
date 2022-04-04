package com.android.example.drawhubmobile.uicontrollers.chat

import androidx.fragment.app.testing.launchFragmentInContainer
import androidx.navigation.Navigation
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.matcher.ViewMatchers
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.filters.LargeTest
import androidx.test.internal.runner.junit4.AndroidJUnit4ClassRunner
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.mocks.CustomSocketMock
import com.android.example.drawhubmobile.mocks.HTTP_TEST_PORT
import com.android.example.drawhubmobile.mocks.RetrofitClientMock
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.models.User
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.network.GENERAL_CHAT_NAME
import com.android.example.drawhubmobile.network.ServerApi
import com.android.example.drawhubmobile.network.SocketErrorHandler
import com.android.example.drawhubmobile.network.SocketHandler
import com.android.example.drawhubmobile.testUtils.ChatMessageGenerator
import com.android.example.drawhubmobile.uicontrollers.main.MainActivity
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.hamcrest.CoreMatchers
import org.json.JSONObject
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith


@RunWith(AndroidJUnit4ClassRunner::class)
@LargeTest
class RoomListFragmentTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    private lateinit var navController: TestNavHostController
    private lateinit var server: MockWebServer
    private lateinit var generalRoom: ChatRoom

    /**
     *
     * BEFORE
     *
     */
    @Before
    fun setupApp() {
        initWebServer()
        initAppMocks()
        addGeneralRoom()
        mockServerMessageReceivedEvent()
        initNavController()
    }

    /**
     *
     * TESTS
     *
     */
    @Test
    fun back_Button_Should_Navigate_To_ChatFragment() {
        onView(withId(R.id.backButton)).perform(click())
        ViewMatchers.assertThat(
            navController.currentDestination?.id,
            CoreMatchers.equalTo(R.id.chatFragment)
        )
    }

    @Test
    fun clearMessages_Button_Should_Clear_All_Notifications() {
    }

    @Test
    fun rooms_Should_Be_Updated_On_Join_Received() {
    }

    @Test
    fun rooms_Should_Be_Updated_On_Delete_Received() {
    }

    @Test
    fun notification_Should_Be_Shown_On_Join_Room() {
    }

    @Test
    fun notification_Should_Be_Shown_When_Message_Received() {
    }

    @Test
    fun delete_Room_Should_Open_Correct_Dialog() {
    }

    @Test
    fun leave_Room_Should_Open_Correct_Dialog() {
    }

    @Test
    fun add_Room_Should_Open_Correct_Dialog() {
    }

    @Test
    fun addRoomDialog_Should_Fetch_Available_Rooms() {
    }

    @Test
    fun addRoomDialog_Should_Allow_To_Join_A_Room() {
    }

    @Test
    fun addRoomDialog_Should_Allow_To_Create_A_Room() {
    }

    @Test
    fun creating_An_Existing_Room_Should_Show_Error() {
    }


    /**
     *
     * AFTER
     *
     */
    @After
    fun tearDown() {
        server.shutdown()
        DrawHubApplication.chatMessageHandler.clearJoinedRooms()
    }

    /**
     *
     * HELPER METHODS
     *
     */
    private fun doReceiveMessage(content: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.emitServer(
            SocketMessages.CHAT_MESSAGE,
            ChatMessageGenerator.generateMessage(generalRoom.creator, generalRoom.name, content)
        )
    }

    private fun doReceiveJoin(username: String, roomName: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", roomName)
        msgContent.put("username", username)
        msgContent.put("creator", generalRoom.creator)
        socket.emitServer(SocketMessages.JOIN_ROOM, msgContent)
    }

    private fun doReceiveLeave(username: String, roomName: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", roomName)
        msgContent.put("username", username)
        socket.emitServer(SocketMessages.LEAVE_ROOM, msgContent)
    }

    private fun doReceiveDelete(roomName: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", roomName)
        socket.emitServer(SocketMessages.DELETE_ROOM, msgContent)
    }

    private fun doReceiveCreate(roomName: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", roomName)
        socket.emitServer(SocketMessages.CREATE_ROOM, msgContent)
    }

    private fun doSendJoin() {
    }

    private fun doSendLeave() {
    }

    private fun doSendDelete() {
    }

    private fun doSendCreate() {
    }

    private fun chatMessages() = DrawHubApplication.chatMessageHandler.activeRoom?.messages
    private fun nChatMessages() = chatMessages()?.size

    private fun enqueueChatHistory() {
        val messages = ChatMessageGenerator.generateMessages(10, "test", generalRoom.name)
        val history = JSONObject()
        history.put("messageHistory", messages)
        serverEnqueue(200, history.toString())
    }

    private fun serverEnqueue(code: Int, body: String) {
        server.enqueue(MockResponse().setResponseCode(code).setBody(body))
    }

    private fun initWebServer() {
        server = MockWebServer()
        ServerApi.init(RetrofitClientMock.getRetrofit())
        server.start(HTTP_TEST_PORT)
    }

    private fun initAppMocks() {
        DrawHubApplication.testReset()
        DrawHubApplication.socket = CustomSocketMock()

        DrawHubApplication.socketHandler = SocketHandler(
            DrawHubApplication.socket,
            DrawHubApplication.emitterHandler
        )

        DrawHubApplication.socketErrorHandler = SocketErrorHandler(
            DrawHubApplication.socket,
            DrawHubApplication.emitterHandler
        )

        DrawHubApplication.currentUser = User("abc", "simon", "simon", "simon")
    }

    private fun initNavController() {
        navController = TestNavHostController(
            ApplicationProvider.getApplicationContext()
        )
        activityRule.scenario.onActivity {
            it.runOnUiThread {
                navController.setGraph(R.navigation.main_nav_graph)
                navController.setCurrentDestination(R.id.roomListFragment)
            }
        }

        val roomListScenario =
            launchFragmentInContainer<RoomListFragment>(themeResId = R.style.AppTheme)

        roomListScenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }
    }

    private fun addGeneralRoom() {
        generalRoom = ChatRoom(GENERAL_CHAT_NAME, "server", 0, mutableListOf())
        val socket = DrawHubApplication.socket as CustomSocketMock
        val roomJSON = JSONObject()
        roomJSON.put("roomName", generalRoom.name)
        roomJSON.put("username", "simon")
        roomJSON.put("creator", generalRoom.creator)
        socket.emitServer(SocketMessages.JOIN_ROOM, roomJSON)
        DrawHubApplication.chatMessageHandler.setActiveRoom(generalRoom)
    }

    private fun mockServerMessageReceivedEvent() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.CHAT_MESSAGE) {
            val clientMsg = it[0] as JSONObject
            val roomName = clientMsg.getString("roomName")
            val content = clientMsg.getString("content")
            socket.emitServer(
                SocketMessages.CHAT_MESSAGE,
                ChatMessageGenerator.generateMessage("simon", roomName, content)
            )
        }
    }
}