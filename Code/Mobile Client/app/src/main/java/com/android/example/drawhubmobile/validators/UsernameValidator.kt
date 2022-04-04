package com.android.example.drawhubmobile.validators

import java.util.regex.Pattern

object UsernameValidator {
    fun isAlphanumericOnly(username: String): Boolean {
        val pattern = Pattern.compile("^[a-zA-Z0-9]*$")
        return pattern.matcher(username).matches()
    }
}