package com.android.example.drawhubmobile.matchers

import android.view.View
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.hamcrest.TypeSafeMatcher

fun withError(error: String): Matcher<View?>? {
    return object : TypeSafeMatcher<View?>() {
        override fun describeTo(description: Description) {
            description.appendText("Should show error: $error")
        }

        override fun matchesSafely(view: View?): Boolean {
            val out = arrayListOf<View?>()
            view?.findViewsWithText(out, error, View.FIND_VIEWS_WITH_TEXT)
            if (out.size == 0) return false
            return out[0]?.visibility == View.VISIBLE
        }
    }
}