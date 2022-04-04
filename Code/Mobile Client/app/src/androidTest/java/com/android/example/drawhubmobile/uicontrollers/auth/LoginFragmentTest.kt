package com.android.example.drawhubmobile.uicontrollers.auth

import androidx.fragment.app.testing.launchFragmentInContainer
import androidx.navigation.Navigation
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.filters.LargeTest
import androidx.test.internal.runner.junit4.AndroidJUnit4ClassRunner
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.matchers.ToastMatcher
import com.android.example.drawhubmobile.matchers.withError
import com.android.example.drawhubmobile.matchers.withIndex
import com.android.example.drawhubmobile.mocks.CustomSocketMock
import com.android.example.drawhubmobile.mocks.HTTP_TEST_PORT
import com.android.example.drawhubmobile.mocks.RetrofitClientMock
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.network.ServerApi
import com.android.example.drawhubmobile.network.SocketErrorHandler
import com.android.example.drawhubmobile.network.SocketHandler
import com.android.example.drawhubmobile.testUtils.getString
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.hamcrest.CoreMatchers.equalTo
import org.hamcrest.CoreMatchers.not
import org.json.JSONObject
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith


@RunWith(AndroidJUnit4ClassRunner::class)
@LargeTest
class LoginFragmentTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(AuthActivity::class.java)

    private lateinit var navController: TestNavHostController
    private lateinit var server: MockWebServer

    /**
     *
     * BEFORE
     *
     */
    @Before
    fun setupApp() {
        initWebServer()
        initAppMocks()
        initNavController()
        // Add the salt response to validate login
        serverEnqueue(200, createSalt())
    }

    /**
     *
     * TESTS
     *
     */
    // 3.2.1
    @Test
    fun loginFragment_Should_Be_First_Shown_View() {
        assertThat(navController.currentDestination?.id, equalTo(R.id.loginFragment))
    }

    // 3.2.4
    // 3.2.5
    @Test
    fun clicking_Login_With_Empty_Fields_Should_Show_Errors() {
        onView(withId(R.id.loginButton)).perform(click())
        onView(withIndex(withText(R.string.requiredError), 0))
            .check(matches(isDisplayed()))
        onView(withIndex(withText(R.string.requiredError), 1))
            .check(matches(isDisplayed()))
    }

    // 3.2.4
    // 3.2.5
    @Test
    fun clicking_Login_With_Empty_Username_Should_Show_Error() {
        onView(withId(R.id.passwordText))
            .perform(typeText("simon"))
            .perform(closeSoftKeyboard())
        onView(withId(R.id.loginButton))
            .perform(click())

        onView(withId(R.id.usernameLayout))
            .check(matches(withError(getString(R.string.requiredError))))
    }

    // 3.2.4
    // 3.2.5
    @Test
    fun clicking_Login_With_Empty_Password_Should_Show_Error() {
        onView(withId(R.id.usernameText))
            .perform(typeText("simon"))
            .perform(closeSoftKeyboard())
        onView(withId(R.id.loginButton))
            .perform(click())

        onView(withId(R.id.passwordLayout))
            .check(matches(withError(getString(R.string.requiredError))))
    }

    // 3.2.3
    // 3.2.2
    @Test
    fun confirmed_Login_Should_Redirect_The_Player_To_MainActivity() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.USER_LOGIN) {
            socket.emitServer(SocketMessages.USER_AUTHENTICATED, createUser())
        }
        doLogin()
        assertThat(navController.currentDestination?.id, equalTo(R.id.mainActivity))
    }

    @Test
    fun login_Button_Should_Be_Disabled_On_Login_Sent() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.USER_LOGIN) {
            socket.emitServer(SocketMessages.USER_AUTHENTICATED, createUser())
        }
        doLogin()
        onView(withId(R.id.loginButton))
            .check(matches(not(isEnabled())))
    }

    // 3.2.5
    @Test
    fun denied_Login_Should_Update_The_UI_Correctly() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        val randomError = listOf(
            SocketErrorMessages.BAD_PASSWORD_ERROR,
            SocketErrorMessages.USER_DOES_NOT_EXIST_ERROR,
            SocketErrorMessages.ALREADY_LOGGED_IN_ERROR
        ).random()
        socket.onClient(SocketMessages.USER_LOGIN) {
            socket.emitServer(randomError)
        }
        doLogin()

        // Error message shown
        onView(withId(R.id.loginErrorText))
            .check(matches(withEffectiveVisibility(Visibility.VISIBLE)))
            .check(matches(not(withText(""))))
        // Login Button Re-enabled
        onView(withId(R.id.loginButton))
            .check(matches(isEnabled()))
    }

    // 3.2.5
    // 3.2.6
    @Test
    fun already_Logged_In_Login_Error_Should_Be_Shown_Correctly() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.USER_LOGIN) {
            socket.emitServer(SocketErrorMessages.ALREADY_LOGGED_IN_ERROR)
        }
        doLogin()

        onView(withId(R.id.loginErrorText))
            .check(matches(withEffectiveVisibility(Visibility.VISIBLE)))
            .check(matches(withText(R.string.alreadyLoggedInErrorLabel)))
    }

    // 3.2.5
    @Test
    fun invalid_Credentials_Login_Error_Should_Be_Shown_Correctly_For_Wrong_Username() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.USER_LOGIN) {
            socket.emitServer(SocketErrorMessages.USER_DOES_NOT_EXIST_ERROR)
        }
        doLogin()

        onView(withId(R.id.loginErrorText))
            .check(matches(withEffectiveVisibility(Visibility.VISIBLE)))
            .check(matches(withText(R.string.invalidLoginErrorLabel)))
    }

    // 3.2.5
    @Test
    fun invalid_Credentials_Login_Error_Should_Be_Shown_Correctly_For_Wrong_Password() {
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.onClient(SocketMessages.USER_LOGIN) {
            socket.emitServer(SocketErrorMessages.BAD_PASSWORD_ERROR)
        }
        doLogin()

        onView(withId(R.id.loginErrorText))
            .check(matches(withEffectiveVisibility(Visibility.VISIBLE)))
            .check(matches(withText(R.string.invalidLoginErrorLabel)))
    }

    // 3.3.1
    @Test
    fun clicking_On_SignUp_Should_Redirect_To_SignUpFragment() {
        onView(withId(R.id.signUpText))
            .perform(click())
        assertThat(navController.currentDestination?.id, equalTo(R.id.signUpFragment))
    }

    // 3.2.7
    @Test
    // This test is supposed to fail when forgot password functionality will be implemented.
    // Change to : clicking_On_Forgot_Password_Should_Redirect_To_ForgotPasswordFragment
    fun clicking_On_Forgot_Password_Should_Show_Toast() {
        onView(withId(R.id.forgotPasswordText))
            .perform(click())
        onView(withText(R.string.workInProgressMessage))
            .inRoot(ToastMatcher())
            .check(matches(isDisplayed()))
    }

    /**
     *
     * AFTER
     *
     */
    @After
    fun tearDown() {
        server.shutdown()
    }

    /**
     *
     * HELPER METHODS
     *
     */
    private fun doLogin() {
        onView(withId(R.id.usernameText)).perform(typeText("simon")).perform(closeSoftKeyboard())
        onView(withId(R.id.passwordText)).perform(typeText("simon")).perform(closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
    }

    private fun serverEnqueue(code: Int, body: String) {
        server.enqueue(MockResponse().setResponseCode(code).setBody(body))
    }

    private fun createSalt(): String {
        val saltJSON = JSONObject()
        saltJSON.put("tempSalt", "abc")
        saltJSON.put("permSalt", "abc")
        return saltJSON.toString()
    }

    private fun createUser(): JSONObject {
        val userAuth = JSONObject()
        userAuth.put("hashSocketId", "abc")
        userAuth.put("firstName", "abc")
        userAuth.put("lastName", "abc")
        return userAuth
    }

    private fun initAppMocks() {
        DrawHubApplication.socket = CustomSocketMock()

        DrawHubApplication.socketHandler = SocketHandler(
            DrawHubApplication.socket,
            DrawHubApplication.emitterHandler
        )

        DrawHubApplication.socketErrorHandler = SocketErrorHandler(
            DrawHubApplication.socket,
            DrawHubApplication.emitterHandler
        )

    }

    private fun initWebServer() {
        server = MockWebServer()
        ServerApi.init(RetrofitClientMock.getRetrofit())
        server.start(HTTP_TEST_PORT)
    }

    private fun initNavController() {
        navController = TestNavHostController(
            ApplicationProvider.getApplicationContext()
        )
        activityRule.scenario.onActivity {
            it.runOnUiThread {
                navController.setGraph(R.navigation.auth_nav_graph)
            }
        }

        val loginScenario = launchFragmentInContainer<LoginFragment>(themeResId = R.style.AppTheme)

        loginScenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }
    }
}