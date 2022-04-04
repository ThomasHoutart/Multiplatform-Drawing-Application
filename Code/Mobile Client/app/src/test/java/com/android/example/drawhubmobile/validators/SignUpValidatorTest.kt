package com.android.example.drawhubmobile.validators

import android.content.Context
import io.mockk.mockkObject
import io.mockk.verify
import org.junit.Test
import org.mockito.Mockito.mock

class SignUpValidatorTest {

    private val context = mock(Context::class.java)

    @Test
    fun `validateFirstName calls CommonValidator@respectsMinimumLength`() {
        mockkObject(CommonValidator)
        SignUpValidator.validateFirstName(context, "First Name")
        verify(exactly = 1) {
            CommonValidator.respectsMinimumLength(
                "First Name",
                CommonValidator.NAMES_MIN_LENGTH
            )
        }
    }

    @Test
    fun `validateLastName calls CommonValidator@respectsMinimumLength`() {
        mockkObject(CommonValidator)
        SignUpValidator.validateLastName(context, "Last Name")
        verify(exactly = 1) {
            CommonValidator.respectsMinimumLength(
                "Last Name",
                CommonValidator.NAMES_MIN_LENGTH
            )
        }
    }

    @Test
    fun `validateUsername calls CommonValidator@respectsMinimumLength`() {
        mockkObject(CommonValidator)
        SignUpValidator.validateUsername(context, "username")
        verify(exactly = 1) {
            CommonValidator.respectsMinimumLength(
                "username",
                CommonValidator.USERNAME_MIN_LENGTH
            )
        }
    }

    @Test
    fun `validateLastName calls UsernameValidator@isAlphanumericOnly`() {
        mockkObject(UsernameValidator)
        SignUpValidator.validateUsername(context, "username")
        verify(exactly = 1) {
            UsernameValidator.isAlphanumericOnly(
                "username"
            )
        }
    }

    @Test
    fun `validatePassword calls CommonValidator@respectsMinimumLength`() {
        mockkObject(CommonValidator)
        SignUpValidator.validatePassword(context, "testAbc2@")
        verify(exactly = 1) {
            CommonValidator.respectsMinimumLength(
                "testAbc2@",
                CommonValidator.PASSWORD_MIN_LENGTH
            )
        }
    }
}