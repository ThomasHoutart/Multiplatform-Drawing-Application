package com.android.example.drawhubmobile.models

enum class TimePeriod {
    TODAY,
    THIS_WEEK,
    ALL_TIME,
}

fun timePeriodToString(timePeriod: TimePeriod?): String {
    return when (timePeriod) {
        TimePeriod.TODAY -> "TODAY"
        TimePeriod.THIS_WEEK -> "THIS WEEK"
        TimePeriod.ALL_TIME -> "ALL TIME"
        else -> ""
    }
}

fun stringToTimePeriod(timePeriod: String): TimePeriod {
    return when (timePeriod) {
        "TODAY" -> TimePeriod.TODAY
        "THIS WEEK" -> TimePeriod.THIS_WEEK
        "ALL TIME" -> TimePeriod.ALL_TIME
        else -> throw Error("Invalid Time Period: $timePeriod")
    }
}