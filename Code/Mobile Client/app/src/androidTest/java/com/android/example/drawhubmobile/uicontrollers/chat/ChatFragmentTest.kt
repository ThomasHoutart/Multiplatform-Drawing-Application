package com.android.example.drawhubmobile.uicontrollers.chat

import androidx.fragment.app.testing.launchFragmentInContainer
import androidx.navigation.Navigation
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.doesNotExist
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.filters.LargeTest
import androidx.test.internal.runner.junit4.AndroidJUnit4ClassRunner
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.matchers.ToastMatcher
import com.android.example.drawhubmobile.mocks.CustomSocketMock
import com.android.example.drawhubmobile.mocks.HTTP_TEST_PORT
import com.android.example.drawhubmobile.mocks.RetrofitClientMock
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.models.User
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.network.ServerApi
import com.android.example.drawhubmobile.network.SocketErrorHandler
import com.android.example.drawhubmobile.network.SocketHandler
import com.android.example.drawhubmobile.testUtils.ChatMessageGenerator
import com.android.example.drawhubmobile.testUtils.getString
import com.android.example.drawhubmobile.uicontrollers.main.MainActivity
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.hamcrest.CoreMatchers.*
import org.json.JSONObject
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith


@RunWith(AndroidJUnit4ClassRunner::class)
@LargeTest
class ChatFragmentTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    private lateinit var navController: TestNavHostController
    private lateinit var server: MockWebServer
    private lateinit var testRoom: ChatRoom

    /**
     *
     * BEFORE
     *
     */
    @Before
    fun setupApp() {
        initWebServer()
        initAppMocks()
        addTestRoom()
        subscribeToClientMessages()
        initNavController()
    }

    /**
     *
     * TESTS
     *
     */
    @Test
    fun active_Room_Name_Should_Be_Shown() {
        onView(withId(R.id.toolbar_title)).check(matches(withText(testRoom.name)))
    }

    @Test
    fun back_Button_Should_Navigate_To_The_Previous_Fragment() {
        onView(withId(R.id.backButton)).perform(click())
        assertThat(navController.currentDestination?.id, equalTo(R.id.mainBackgroundFragment))
    }

    @Test
    fun get_History_Button_Should_Add_10_Messages_To_The_Active_Room() {
        enqueueChatHistory()
        val prevSize = nChatMessages()
        assert(prevSize != null)

        onView(withId(R.id.getHistoryButton)).perform(click())
        val currentSize = nChatMessages()

        assert(currentSize != null)
        assert(currentSize == (prevSize!! + 10))
    }

    @Test
    fun change_Room_Button_Should_Navigate_To_RoomListFragment() {
        onView(withId(R.id.changeRoomButton)).perform(click())
        assertThat(navController.currentDestination?.id, equalTo(R.id.roomListFragment))
    }

    @Test
    fun send_Button_Should_Send_Message() {
        val prevSize = nChatMessages()
        doSendMessage("Hello!")
        onView(withText("Hello!")).check(matches(isDisplayed()))
        assert(nChatMessages() == (prevSize!! + 1))
    }

    @Test
    fun chat_Message_Should_Not_Exceed_140_Characters() {
        var veryLongString = "aakdjhfgaksjdhfgaksdjhfgwiqeufqoweufhqwieufhqowieufh"
        veryLongString += "aakdjhfgaksjdhfgaksdjhfgwiqeufqoweufhqwieufhqowieufh"
        veryLongString += "aakdjhfgaksjdhfgaksdjhfgwiqeufqoweufhqwieufhqowieufh"
        doSendMessage(veryLongString)
        assert(chatMessages()?.get(1)?.text?.length == 140)
    }

    @Test
    fun send_Button_Should_Clear_EditText() {
        doSendMessage("Hello!")
        onView(withId(R.id.chatMessageInput)).check(matches(withText("")))
    }

    @Test
    fun send_Action_Button_On_SoftKeyboard_Should_Send_Message() {
        val prevSize = nChatMessages()
        onView(withId(R.id.chatMessageInput))
            .perform(typeText("Hello!"))
            .perform(pressImeActionButton())
        assert(nChatMessages() == (prevSize!! + 1))
    }

    @Test
    fun chat_Messages_Should_Update_On_Message_Sent() {
        val prevSize = nChatMessages()
        for (i in 1..3) {
            doSendMessage("Hello!")
            val currChatMessages = chatMessages()
            assert(currChatMessages?.size == (prevSize!! + i))
            assert(currChatMessages?.get(i)?.text == "Hello!")
            assert(currChatMessages?.get(i)?.username == "simon")
        }
    }

    @Test
    fun chat_Messages_Should_Show_The_Right_View_On_Message_Sent() {
        doSendMessage("Hello!")
        assert(chatMessages()?.get(1)?.username == "simon")
        onView(withText("Hello!")).check(matches(isDisplayed()))
        onView(withId(R.id.usernameText)).check(doesNotExist())
    }

    @Test
    fun chat_Messages_Should_Update_On_Message_Received() {
        val prevSize = nChatMessages()
        for (i in 1..3) {
            doReceiveMessage("Hello!")
            val currChatMessages = chatMessages()
            assert(currChatMessages?.size == (prevSize!! + i))
            assert(currChatMessages?.get(i)?.text == "Hello!")
            assert(currChatMessages?.get(i)?.username == testRoom.creator)
        }
    }

    @Test
    fun chat_Messages_Should_Show_The_Right_View_On_Message_Received() {
        doReceiveMessage("Hello!")
        assert(chatMessages()?.get(1)?.username == testRoom.creator)
        onView(withText("Hello!")).check(matches(isDisplayed()))
        onView(withId(R.id.usernameText)).check(matches(isDisplayed()))
    }

    @Test
    fun chat_Message_ViewHolder_Should_Show_The_Timestamp_For_Sent_Message() {
        doSendMessage("a")
        val matcher = allOf(isDisplayed())
        onView(withId(R.id.timestampText)).check(matches(matcher))
    }

    @Test
    fun chat_Message_ViewHolder_Should_Show_The_Timestamp_For_Received_Message() {
        doReceiveMessage("a")
        val matcher = allOf(isDisplayed())
        onView(withId(R.id.timestampText)).check(matches(matcher))
    }

    @Test
    fun received_Chat_Message_ViewHolder_Should_Show_The_Username_Of_The_Sender() {
        doReceiveMessage("Hello!")
        val matcher = allOf(isDisplayed(), withText(testRoom.name))
        onView(withId(R.id.usernameText)).check(matches(matcher))
    }

    @Test
    fun sending_Message_When_Not_Connected_Should_Show_The_Correct_Toast() {
    }

    @Test
    fun server_Message_Should_Be_Shown_On_CurrentUser_Join() {
        val serverMsg = chatMessages()?.get(0)
        assert(serverMsg?.username == SocketMessages.SERVER_MESSAGE_AUTHOR)
        assert(serverMsg?.text == getString(R.string.currentUserChatJoinedMessage))
    }

    @Test
    fun server_Message_Should_Be_Shown_On_User_Join() {
        doReceiveJoin("simon123")
        val serverMsg = chatMessages()?.get(1)
        assert(serverMsg?.username == SocketMessages.SERVER_MESSAGE_AUTHOR)
        assert(serverMsg?.text == getString(R.string.chatJoinedMessage, "simon123"))
    }

    @Test
    fun server_Message_Should_Be_Shown_On_User_Leave() {
        doReceiveLeave("simon123")
        val serverMsg = chatMessages()?.get(1)
        assert(serverMsg?.username == SocketMessages.SERVER_MESSAGE_AUTHOR)
        assert(serverMsg?.text == getString(R.string.chatLeftMessage, "simon123"))
    }

    @Test
    fun server_Message_Should_Be_Shown_On_Room_Deleted() {
        doReceiveDelete()
        onView(withText(getString(R.string.activeRoomDeletedServerMessage)))
            .check(matches(hasTextColor(R.color.colorTextImportant)))
    }

    @Test
    fun input_Should_Be_Disabled_On_Room_Deleted() {
        doReceiveDelete()
        onView(withId(R.id.chatMessageInput)).check(matches(not(isEnabled())))
        onView(withId(R.id.sendButton)).check(matches(not(isEnabled())))
    }

    @Test
    fun not_In_Room_Server_Error_Should_Show_Toast() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.CHAT_MESSAGE) {
            socket.emitServer(SocketErrorMessages.NOT_IN_ROOM_ERROR)
        }
        doSendMessage("abc")
        onView(withText(R.string.notInRoomToast))
            .inRoot(ToastMatcher())
            .check(matches(isDisplayed()))
        assertThat(navController.currentDestination?.id, equalTo(R.id.roomListFragment))
    }


    @Test
    fun room_Does_Not_Exist_Server_Error_Should_Show_Toast() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.CHAT_MESSAGE) {
            socket.emitServer(SocketErrorMessages.ROOM_DOES_NOT_EXIST_ERROR)
        }
        doSendMessage("abc")
        onView(withText(R.string.roomDoesNotExistToast))
            .inRoot(ToastMatcher())
            .check(matches(isDisplayed()))
        assertThat(navController.currentDestination?.id, equalTo(R.id.roomListFragment))
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

    private fun doSendMessage(content: String) {
        onView(withId(R.id.chatMessageInput))
            .perform(typeText(content))
            .perform(closeSoftKeyboard())
        onView(withId(R.id.sendButton)).perform(click())
    }

    private fun doReceiveMessage(content: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.emitServer(
            SocketMessages.CHAT_MESSAGE,
            ChatMessageGenerator.generateMessage(testRoom.creator, testRoom.name, content)
        )
    }

    private fun doReceiveJoin(username: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", testRoom.name)
        msgContent.put("username", username)
        msgContent.put("creator", testRoom.creator)
        socket.emitServer(SocketMessages.JOIN_ROOM, msgContent)

    }

    private fun doReceiveLeave(username: String) {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", testRoom.name)
        msgContent.put("username", username)
        socket.emitServer(SocketMessages.LEAVE_ROOM, msgContent)
    }

    private fun doReceiveDelete() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val msgContent = JSONObject()
        msgContent.put("roomName", testRoom.name)
        socket.emitServer(SocketMessages.DELETE_ROOM, msgContent)
    }

    private fun chatMessages() = DrawHubApplication.chatMessageHandler.activeRoom?.messages
    private fun nChatMessages() = chatMessages()?.size

    private fun enqueueChatHistory() {
        val messages = ChatMessageGenerator.generateMessages(10, "test", testRoom.name)
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
                navController.setCurrentDestination(R.id.chatFragment)
            }
        }

        val chatScenario = launchFragmentInContainer<ChatFragment>(themeResId = R.style.AppTheme)

        chatScenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }
    }

    private fun addTestRoom() {
        testRoom = ChatRoom("test", "test", 0, mutableListOf())
        val socket = DrawHubApplication.socket as CustomSocketMock
        val roomJSON = JSONObject()
        roomJSON.put("roomName", testRoom.name)
        roomJSON.put("username", "simon")
        roomJSON.put("creator", testRoom.creator)
        socket.emitServer(SocketMessages.JOIN_ROOM, roomJSON)
        DrawHubApplication.chatMessageHandler.setActiveRoom(testRoom)
    }

    private fun subscribeToClientMessages() {
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