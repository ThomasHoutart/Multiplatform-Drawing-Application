package com.android.example.drawhubmobile.validators

import android.content.Context
import com.android.example.drawhubmobile.R

object SignUpValidator {
    fun validateFirstName(context: Context, firstName: String): String? {
        val minLength = CommonValidator.NAMES_MIN_LENGTH
        return getCommonError(context, firstName, R.string.firstNameLabel, minLength)
    }

    fun validateLastName(context: Context, lastName: String): String? {
        val minLength = CommonValidator.NAMES_MIN_LENGTH
        return getCommonError(context, lastName, R.string.lastNameLabel, minLength)
    }

    fun validateUsername(context: Context, username: String): String? {
        val minLength = CommonValidator.USERNAME_MIN_LENGTH
        var error = getCommonError(context, username, R.string.usernameLabel, minLength)

        if (!UsernameValidator.isAlphanumericOnly(username)) {
            error = context.getString(R.string.usernameSpecialCharactersError)
        }

        return error
    }

    fun validateEmail(context: Context, email: String): String? {
        var error: String? = null
        if (email.isEmpty()) {
            error = context.getString(R.string.requiredError)
        } else if (!EmailValidator.isValid(email)) {
            error = context.getString(R.string.invalidEmailError)
        }
        return error
    }

    fun validatePassword(context: Context, password: String): String? {
        val minLength = CommonValidator.PASSWORD_MIN_LENGTH
        var error = getCommonError(context, password, R.string.passwordLabel, minLength)
        if(PasswordValidator.containsEmojis(password)) {
            error = context.getString(R.string.passwordEmojiError)
        }
        return error
    }

    private fun getCommonError(
        context: Context,
        value: String,
        label: Int,
        minLength: Int
    ): String? {
        var error: String? = null
        val isTooShort = !CommonValidator.respectsMinimumLength(value, minLength)
        if (value.isEmpty()) {
            error = context.getString(R.string.requiredError)
        } else if (isTooShort) {
            error = getTooShortErrorText(context, label, minLength)
        }
        return error
    }

    private fun getTooShortErrorText(context: Context, label: Int, minLength: Int): String {
        return context.getString(
            R.string.minLengthError,
            context.getString(label),
            minLength
        )
    }
}