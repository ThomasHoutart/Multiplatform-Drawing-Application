package com.android.example.drawhubmobile.utils

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.*

class JavaScriptDateConverterTest {
    @Test
    fun `convert works on common date string`() {
        val dateStr = "Tue Oct 06 2020 14:43:59 GMT-0400 (Eastern Daylight Time)"
        val converted = JavaScriptDateConverter.convert(dateStr)
        assertEquals(6, converted.dayOfMonth)
        assertEquals(DayOfWeek.TUESDAY, converted.dayOfWeek)
        assertEquals(2020, converted.year)
        assertEquals(43, converted.minute)
        assertEquals(59, converted.second)
    }

    @Test
    fun `getJsString returns the correct date string`() {
        val date = LocalDate.of(2020, 10, 6)
        val time = LocalTime.of(14, 43, 59)
        val localtime = LocalDateTime.of(date, time)
        val datetime = ZonedDateTime.of(localtime, ZoneId.systemDefault())
        val datetimeStr = JavaScriptDateConverter.getJsString(datetime)
        val expected = "Tue Oct 06 2020 14:43:59 EDT-0400 (Eastern Daylight Time)"
        assertEquals(expected, datetimeStr)
    }
}