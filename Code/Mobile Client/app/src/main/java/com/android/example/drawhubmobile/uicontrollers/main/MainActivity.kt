package com.android.example.drawhubmobile.uicontrollers.main

import android.content.pm.ActivityInfo
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel
import com.android.example.drawhubmobile.viewmodels.main.LobbyViewModel
import com.android.example.drawhubmobile.viewmodels.main.ProfileViewModel


class MainActivity : AppCompatActivity() {

    private val lobbyViewModel: LobbyViewModel by viewModels()
    private val gameSelectViewModel: GameSelectViewModel by viewModels()
    private val profileViewModel: ProfileViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        lobbyViewModel.addSubscribers()
        gameSelectViewModel.addSubscribers()
    }

    override fun onResume() {
        super.onResume()
        if (DrawHubApplication.isKicked) {
            DrawHubApplication.isKicked = false
            finish()
        }
    }

    override fun onBackPressed() {
        try {
            tryQuitApp()
        } catch (e: IllegalArgumentException) {
            try {
                tryLeaveLobby()
            } catch (e: IllegalArgumentException) {
                super.onBackPressed()
            }
        }
    }

    private fun tryQuitApp() {
        findNavController(R.id.bottomNavigation)
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.exitAppTitle))
            .setMessage(getString(R.string.exitAppMessage))
            .setNegativeButton(R.string.no, null)
            .setPositiveButton(R.string.yes) { _, _ ->
                DrawHubApplication.socketHandler.logout()
                finishAffinity()
                finish()
            }
            .create()
            .show()
    }

    fun doLogout() {
        findNavController(R.id.bottomNavigation)
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.logoutTitle))
            .setMessage(getString(R.string.logoutMessage))
            .setNegativeButton(R.string.no, null)
            .setPositiveButton(R.string.yes) { _, _ ->
                DrawHubApplication.socketHandler.logout()
                finish()
            }
            .create()
            .show()
    }

    private fun tryLeaveLobby() {
        findNavController(R.id.startGameButton)
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.leaveLobbyTitle))
            .setMessage(getString(R.string.leaveLobbyMessage))
            .setNegativeButton(R.string.no, null)
            .setPositiveButton(R.string.yes) { _, _ ->
                lobbyViewModel.leaveLobby()
            }
            .create()
            .show()
    }
}