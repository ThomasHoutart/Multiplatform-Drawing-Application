package com.android.example.drawhubmobile.utils

import org.junit.Assert.assertNotEquals
import org.junit.Test

class HasherTest {
    @Test
    fun `hash returns correct string`() {
        val str = "abc"
        val hashStr = Hasher.hash(str)
        val expected = "BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD"
        assertNotEquals(expected, hashStr)
    }
}