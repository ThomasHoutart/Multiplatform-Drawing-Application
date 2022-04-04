package com.android.example.drawhubmobile.utils

import com.android.example.drawhubmobile.models.game.GameTime
import java.time.LocalDateTime
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class JavaScriptDateConverter {
    companion object {
        private const val pattern = "EEE MMM dd yyyy HH:mm:ss zZ (zzzz)"
        private const val profilePattern1 = "dd-MM-yyyy"
        private const val profilePattern2 = "HH:mm"
        private val formatter = DateTimeFormatter.ofPattern(pattern)
        private val profileFormatter1 = DateTimeFormatter.ofPattern(profilePattern1)
        private val profileFormatter2 = DateTimeFormatter.ofPattern(profilePattern2)

        fun convert(jsTimestamp: String): LocalDateTime {
            return LocalDateTime.parse(jsTimestamp, formatter)
        }

        fun getJsString(time: ZonedDateTime): String = time.format(formatter)

        fun convertLocalDateTimeToString(date: LocalDateTime): String {
            return date.format(profileFormatter1) + " at " + date.format(profileFormatter2)
        }

        fun convertToProfileFormat(date: String, gameDurationInSeconds: Int): GameTime {
            val date = convert(date)
            val gameDate = date.format(profileFormatter1)
            val startTime = date.format(profileFormatter2)
            val endTime = date.plusSeconds(gameDurationInSeconds.toLong()).format(profileFormatter2)
            return GameTime(gameDate, startTime, endTime)
        }
    }
}
