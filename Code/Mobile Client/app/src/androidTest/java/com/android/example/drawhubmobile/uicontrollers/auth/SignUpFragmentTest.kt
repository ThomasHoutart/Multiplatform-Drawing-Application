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
import com.android.example.drawhubmobile.mocks.CustomSocketMock
import com.android.example.drawhubmobile.mocks.HTTP_TEST_PORT
import com.android.example.drawhubmobile.mocks.RetrofitClientMock
import com.android.example.drawhubmobile.network.*
import com.android.example.drawhubmobile.testUtils.getString
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.hamcrest.CoreMatchers.equalTo
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith


@RunWith(AndroidJUnit4ClassRunner::class)
@LargeTest
class SignUpFragmentTest {

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
    }

    /**
     *
     * TESTS
     *
     */

    // 3.3.2
    @Test
    fun last_Name_Should_Be_At_Least_2_Characters() {
        verifyMinCharacters(R.id.lastNameLayout, R.id.lastNameText, "Last Name", 2)
    }

    // 3.3.2
    @Test
    fun last_Name_Should_Be_Required() {
        verifyRequiredError(R.id.lastNameLayout, R.id.lastNameText)
    }

    // 3.3.2
    @Test
    fun last_Name_Should_Be_At_Max_20_Characters() {
        verifyMax20Characters(R.id.lastNameText)
    }

    // 3.3.3
    @Test
    fun first_Name_Should_Be_At_Least_2_Characters() {
        verifyMinCharacters(R.id.firstNameLayout, R.id.firstNameText, "First Name", 2)
    }

    // 3.3.3
    @Test
    fun first_Name_Should_Be_Required() {
        verifyRequiredError(R.id.firstNameLayout, R.id.firstNameText)
    }

    // 3.3.3
    @Test
    fun first_Name_Should_Be_At_Max_20_Characters() {
        verifyMax20Characters(R.id.firstNameText)
    }

    // 3.3.4
    @Test
    fun username_Should_Be_At_Least_4_Characters() {
        verifyMinCharacters(R.id.usernameLayout, R.id.usernameText, "Username", 4)
    }

    // 3.3.4
    @Test
    fun username_Should_Be_Required() {
        verifyRequiredError(R.id.usernameLayout, R.id.usernameText)
    }

    // 3.3.4
    @Test
    fun username_Should_Be_At_Max_20_Characters() {
        verifyMax20Characters(R.id.usernameText)
    }

    // 3.3.5
    @Test
    fun error_Should_Be_Shown_On_Username_Taken() {
        serverEnqueue(HTTPCodes.USERNAME_TAKEN, "")
        doSignUp()

        onView(withId(R.id.usernameLayout))
            .check(matches(withError(getString(R.string.usernameTakenError))))
    }

    // 3.3.6
    @Test
    fun email_Should_Be_Required() {
        verifyRequiredError(R.id.emailLayout, R.id.emailText)
    }

    // 3.3.6
    @Test
    fun error_Should_Be_Shown_On_Email_Taken() {
        serverEnqueue(HTTPCodes.EMAIL_TAKEN, "")
        doSignUp()

        onView(withId(R.id.emailLayout))
            .check(matches(withError(getString(R.string.emailTakenError))))
    }

    // 3.3.7
    @Test
    fun password_Should_Be_At_Least_4_Characters() {
        verifyMinCharacters(R.id.passwordLayout, R.id.passwordText, "Password", 4)
    }

    // 3.3.7
    @Test
    fun password_Should_Be_Required() {
        verifyRequiredError(R.id.passwordLayout, R.id.passwordText)
    }

    // 3.3.7
    @Test
    fun password_Should_Be_At_Max_20_Characters() {
        verifyMax20Characters(R.id.passwordText)
    }

    // 3.3.8
    @Test
    fun successful_Sign_Up_Should_Redirect_To_LoginFragment() {
        serverEnqueue(HTTPCodes.SUCCESS, "")
        doSignUp()
        assertThat(navController.currentDestination?.id, equalTo(R.id.loginFragment))
    }

    // 3.3.8
    @Test
    fun successful_Sign_Up_Should_Show_Toast_If_Not_Connected() {
        server.shutdown()
        val socket = DrawHubApplication.socket as CustomSocketMock
        socket.connected = false
        doSignUp()
        onView(withText(R.string.notConnected))
            .inRoot(ToastMatcher())
            .check(matches(isDisplayed()))
    }

    // 3.3.8
    @Test
    fun successful_Sign_Up_Should_Show_Confirmation_Toast() {
        serverEnqueue(HTTPCodes.SUCCESS, "")
        doSignUp()
        onView(withText(R.string.userCreatedToast))
            .inRoot(ToastMatcher())
            .check(matches(isDisplayed()))
    }

    // 3.3.9
    @Test
    fun non_Alphanumeric_Username_Should_Show_Error() {
        val invalidUsername = "abc@hey !-d"
        onView(withId(R.id.usernameText))
            .perform(typeText(invalidUsername))
            .perform(closeSoftKeyboard())

        onView(withId(R.id.usernameLayout))
            .check(matches(withError(getString(R.string.usernameSpecialCharactersError))))
    }

    // 3.3.10
    @Test
    fun password_Containing_Emojis_Should_Show_Error() {
        val invalidPassword = "\uD83D\uDE01"
        onView(withId(R.id.passwordText))
            .perform(replaceText(invalidPassword))
            .perform(closeSoftKeyboard())

        onView(withId(R.id.passwordLayout))
            .check(matches(withError(getString(R.string.passwordEmojiError))))
    }

    // No ID, just back navigation
    @Test
    fun back_Button_Should_Navigate_To_LoginFragment() {
        onView(withId(R.id.backButton)).perform(click())
        assertThat(navController.currentDestination?.id, equalTo(R.id.loginFragment))
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
    private fun doSignUp() {
        val views = arrayOf(
            R.id.firstNameText,
            R.id.lastNameText,
            R.id.usernameText,
            R.id.emailText,
            R.id.passwordText
        )
        val values = arrayOf("si", "si", "simon", "si.si@si.si", "simon")
        for ((i, view) in views.withIndex()) {
            onView(withId(view))
                .perform(typeText(values[i]))
                .perform(closeSoftKeyboard())
        }
        onView(withId(R.id.signUpButton))
            .perform(click())
    }

    private fun serverEnqueue(code: Int, body: String) {
        server.enqueue(MockResponse().setResponseCode(code).setBody(body))
    }

    private fun verifyRequiredError(layoutViewId: Int, textViewId: Int) {
        onView(withId(textViewId))
            .perform(typeText("s"))
            .perform(clearText())
            .perform(closeSoftKeyboard())

        onView(withId(layoutViewId))
            .check(matches(withError(getString(R.string.requiredError))))
    }

    private fun verifyMax20Characters(textViewId: Int) {
        val longString = "abcdefghijklmnopqrstuvwxyz"
        val expectedString = "abcdefghijklmnopqrst"
        onView(withId(textViewId))
            .perform(typeText(longString))
            .perform(closeSoftKeyboard())
            .check(matches(withText(expectedString)))

    }

    private fun verifyMinCharacters(layoutViewId: Int, textViewId: Int, field: String, min: Int) {
        onView(withId(textViewId))
            .perform(typeText("s"))
            .perform(closeSoftKeyboard())

        onView(withId(layoutViewId))
            .check(matches(withError("$field must contain at least $min characters")))

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

        val signUpScenario =
            launchFragmentInContainer<SignUpFragment>(themeResId = R.style.AppTheme)

        signUpScenario.onFragment { fragment ->
            Navigation.setViewNavController(fragment.requireView(), navController)
        }
    }
}