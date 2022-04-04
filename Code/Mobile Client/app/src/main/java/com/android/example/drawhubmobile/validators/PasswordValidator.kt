package com.android.example.drawhubmobile.validators

object PasswordValidator {
    fun containsEmojis(password: String): Boolean {
        for (c in password) {
            if (c.isSurrogate())
                return true
        }
        return false
    }
}