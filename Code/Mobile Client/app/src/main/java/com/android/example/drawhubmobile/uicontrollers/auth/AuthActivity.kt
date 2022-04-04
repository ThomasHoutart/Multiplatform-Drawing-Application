package com.android.example.drawhubmobile.uicontrollers.auth

import android.content.pm.ActivityInfo
import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.viewmodels.main.ProfileViewModel

class AuthActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)
        DrawHubApplication.socketHandler.connect()
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
    }

    override fun onBackPressed() {
        try {
            // If the user is on the loginFragment, simply close the app
            findNavController(R.id.loginButton)
            finishAffinity()
            finish()
        } catch (e: IllegalArgumentException) {
            super.onBackPressed()
        }
    }
}