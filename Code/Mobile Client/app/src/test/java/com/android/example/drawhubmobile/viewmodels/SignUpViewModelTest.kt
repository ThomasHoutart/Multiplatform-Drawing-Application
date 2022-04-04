package com.android.example.drawhubmobile.viewmodels

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.android.example.drawhubmobile.viewmodels.auth.SignUpViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.newSingleThreadContext
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TestRule


class SignUpViewModelTest {
    @get:Rule
    var rule: TestRule = InstantTaskExecutorRule()

    private val mainThreadSurrogate = newSingleThreadContext("UI thread")

    @Before
    fun setUp() {
        Dispatchers.setMain(mainThreadSurrogate)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain() // reset main dispatcher to the original Main dispatcher
        mainThreadSurrogate.close()
    }

    @Test
    fun `areFieldsFilled returns false if some fields are not filled`() {
        val signUpVM = SignUpViewModel()
        signUpVM.firstName.value = "asd"
        signUpVM.lastName.value = ""
        signUpVM.email.value = ""
        signUpVM.username.value = "asd"
        signUpVM.password.value = "asd"
        assert(!signUpVM.areFieldsFilled())
    }

    @Test
    fun `areFieldsFilled returns true when all fields are filled`() {
        val signUpVM = SignUpViewModel()
        signUpVM.firstName.value = "asd"
        signUpVM.lastName.value = "asd"
        signUpVM.email.value = "asd"
        signUpVM.username.value = "asd"
        signUpVM.password.value = "asd"
        assert(signUpVM.areFieldsFilled())
    }

}