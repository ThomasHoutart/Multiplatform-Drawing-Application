package com.android.example.drawhubmobile.viewmodels

import com.android.example.drawhubmobile.viewmodels.auth.LoginViewModel
import org.junit.Test

class LoginViewModelTest {
    @Test
    fun `isUsernameEmpty returns true if username is empty`() {
        val loginVM = LoginViewModel()
        assert(loginVM.isUsernameEmpty())
    }

    @Test
    fun `isUsernameEmpty returns false if username is not empty`() {
        val loginVM = LoginViewModel()
        loginVM.username.value = "asd"
        assert(!loginVM.isUsernameEmpty())
    }

    @Test
    fun `isPasswordEmpty returns true if password is empty`() {
        val loginVM = LoginViewModel()
        assert(loginVM.isPasswordEmpty())
    }

    @Test
    fun `isPasswordEmpty returns false if password is not empty`() {
        val loginVM = LoginViewModel()
        loginVM.password.value = "asd"
        assert(!loginVM.isPasswordEmpty())
    }

}