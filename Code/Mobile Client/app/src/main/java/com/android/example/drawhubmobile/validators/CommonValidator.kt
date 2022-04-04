package com.android.example.drawhubmobile.validators

object CommonValidator {
    const val USERNAME_MIN_LENGTH = 4
    const val PASSWORD_MIN_LENGTH = 4
    const val NAMES_MIN_LENGTH = 2

    fun respectsMinimumLength(value: String, minLength: Int): Boolean {
        return value.length >= minLength
    }
}