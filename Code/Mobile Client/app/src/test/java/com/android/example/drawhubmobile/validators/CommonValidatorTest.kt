package com.android.example.drawhubmobile.validators

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CommonValidatorTest {
    @Test
    fun `respectsMinimumLength returns false if input is too short`() {
        val notRespected = CommonValidator.respectsMinimumLength("1234", 5)
        assertFalse(notRespected)
    }

    @Test
    fun `respectsMinimumLength returns true if input longer than minimum length`() {
        val respected = CommonValidator.respectsMinimumLength("1234672", 5)
        assertTrue(respected)
    }
}
