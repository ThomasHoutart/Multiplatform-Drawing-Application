package com.android.example.drawhubmobile.utils

import android.content.Context
import android.view.Gravity
import android.widget.Toast

object ToastMaker {
    fun showText(context: Context, text: String) {
        val toast = Toast.makeText(
            context,
            text,
            Toast.LENGTH_SHORT
        )
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 0)
        toast.show()
    }
}