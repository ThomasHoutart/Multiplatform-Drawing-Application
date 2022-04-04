package com.android.example.drawhubmobile.validators

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class UsernameValidatorTest {
    @Test
    fun `isAlphanumericOnly returns false for whitespace characters`() {
        val invalid = UsernameValidator.isAlphanumericOnly("abc ")
        assertFalse(invalid)
    }

    @Test
    fun `isAlphanumericOnly returns false for special characters`() {
        val invalid = UsernameValidator.isAlphanumericOnly("abc!")
        assertFalse(invalid)
    }

    @Test
    fun `isAlphanumericOnly returns true for correct input`() {
        val valid = UsernameValidator.isAlphanumericOnly("test123")
        assertTrue(valid)
    }
}