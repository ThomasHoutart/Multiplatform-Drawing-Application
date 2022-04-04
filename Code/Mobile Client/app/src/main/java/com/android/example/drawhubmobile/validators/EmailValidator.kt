package com.android.example.drawhubmobile.validators

import android.util.Patterns

object EmailValidator {
    fun isValid(email: String) = Patterns.EMAIL_ADDRESS.matcher(email).matches()
}