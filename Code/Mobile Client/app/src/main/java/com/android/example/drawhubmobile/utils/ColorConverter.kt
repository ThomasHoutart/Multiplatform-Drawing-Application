package com.android.example.drawhubmobile.utils

object ColorConverter {
    fun colorToString(color: Int): String {
        return String.format("#%08X", (0xFFFFFFFF and color.toLong()))
    }
}