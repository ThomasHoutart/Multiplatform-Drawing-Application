package com.android.example.drawhubmobile.validators

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PasswordValidatorTest {
    @Test
    fun `containsEmojis returns true on input containing emojis`() {
        val emojiString = "dwd \uD83D\uDC69\uD83C\uDFFE\u200D\uD83C\uDF3E"
        assertTrue(PasswordValidator.containsEmojis(emojiString))
    }

    @Test
    fun `containsEmojis returns false if no emoji is present`() {
        val emojiString = "abo2!#0p1-1xwh1éà3"
        assertFalse(PasswordValidator.containsEmojis(emojiString))
    }
}