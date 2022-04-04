package com.android.example.drawhubmobile.testUtils

import androidx.test.platform.app.InstrumentationRegistry

fun getString(id: Int, vararg args: Any): String {
    val appContext = InstrumentationRegistry.getInstrumentation().targetContext
    return appContext.resources.getString(id, *args)
}