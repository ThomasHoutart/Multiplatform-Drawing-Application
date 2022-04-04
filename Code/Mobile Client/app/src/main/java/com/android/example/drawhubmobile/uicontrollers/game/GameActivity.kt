package com.android.example.drawhubmobile.uicontrollers.game

import android.content.pm.ActivityInfo
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.findNavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.navArgs
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.ActivityGameBinding
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.models.game.Spectator
import com.android.example.drawhubmobile.utils.ParticleHandler
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.viewmodels.game.DrawingCanvasViewModel
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel
import com.plattysoft.leonids.ParticleSystem


class GameActivity : AppCompatActivity(), RoundEndDialogFragment.QuitGameDialogListener {

    private val viewModel: GameViewModel by viewModels()
    private val drawViewModel: DrawingCanvasViewModel by viewModels()
    private lateinit var binding: ActivityGameBinding
    private lateinit var navController: NavController
    private val args: GameActivityArgs by navArgs()
    private lateinit var dialog: RoundEndDialogFragment
    private var firstCheatValue = true
    private var dialogIsShowing = false

    private lateinit var leftEmitter: ParticleSystem
    private lateinit var rightEmitter: ParticleSystem

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

        binding = ActivityGameBinding.inflate(layoutInflater)
        binding.lifecycleOwner = this

        binding.leaveGameButton.setOnClickListener { promptLeaveGame() }

        binding.viewModel = viewModel

        //viewModel.addObservers()

        viewModel.gameName = args.gameName
        viewModel.isSpectator = args.isSpectator
        if (args.isSpectator)
            drawViewModel.addPathManagerObserver()
        getPlayersAndSpectatorsFromLobby()

        dialog = RoundEndDialogFragment(viewModel)

        try {
            leftEmitter = ParticleHandler.getRoundEndDialogEmitter(this, true)
            rightEmitter = ParticleHandler.getRoundEndDialogEmitter(this, false)
        } catch (e: Exception) {
            println("Could not create particles (onCreate): $e")
        }

        addObservers()
        setContentView(binding.root)
    }

    override fun onStart() {
        super.onStart()
        val nestedNavHostFragment =
            supportFragmentManager.findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = nestedNavHostFragment.navController

        binding.openChatButton.setOnClickListener {
            showChatButton(false)
            navController.navigate(R.id.action_detectiveFragment_to_detectiveChatFragment)
        }
    }

    override fun onBackPressed() {
        try {
            findNavController(R.id.drawingCanvasView)
            promptLeaveGame()
        } catch (e: IllegalArgumentException) {
            super.onBackPressed()
        }
    }

    override fun onDialogQuitGameClick() {
        // Finish activity when the game is over and the final score is shown
        // Doesn't send leave game event because game is over
        finish()
    }

    fun showChatButton(show: Boolean = false) {
        binding.openChatButton.visibility = if (show) View.VISIBLE else View.GONE
    }

    fun emitParticles() {
        try {
            leftEmitter = ParticleHandler.getRoundEndDialogEmitter(this, true)
            rightEmitter = ParticleHandler.getRoundEndDialogEmitter(this, false)
            leftEmitter.emitWithGravity(binding.emitterLeft, Gravity.BOTTOM, 60)
            rightEmitter.emitWithGravity(binding.emitterRight, Gravity.BOTTOM, 60)
        } catch (e: Exception) {
            println("Could not create particles: $e")
        }
    }

    fun stopParticles() {
        try {
            leftEmitter.stopEmitting()
            rightEmitter.stopEmitting()
        } catch (e: Exception) {
            println("Could not stop particles: $e")
        }
    }

    private fun getPlayersAndSpectatorsFromLobby() {
        val players = mutableListOf<Player>()
        for (player in args.players) {
            players.add(Player(player.username, 0, player.avatar))
        }
        /*val spectators = mutableListOf<Spectator>()
        for (spectator in args.spectators) {
            spectators.add(Spectator(spectator.username, spectator.avatar))
        }*/
        viewModel.players.postValue(players)
        //viewModel.spectators.postValue(spectators)
    }

    private fun promptLeaveGame() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.leaveGameTitle))
            .setMessage(getString(R.string.leaveGameMessage))
            .setNegativeButton(R.string.no, null)
            .setPositiveButton(R.string.yes) { _, _ ->
                viewModel.sendLeaveGameEvent()
                viewModel.gameName = ""
                viewModel.isSpectator = false
                finish()
            }
            .create()
            .show()
    }

    private fun addObservers() {
        viewModel.isArtist.observe(this, { isArtist ->
            if (dialogIsShowing) {
                dialogIsShowing = false
                dialog.dismiss()
            }
            // Listen to draw event from server depending of role
            if (isArtist) {
                drawViewModel.removePathManagerObserver()
            } else {
                drawViewModel.addPathManagerObserver()
            }
        })

        viewModel.dialogIsDisplayed.observe(this, { dialogIsDisplayed ->
            if (dialogIsDisplayed)
                showRoundEndDialog()
        })

        viewModel.finishActivity.observe(this, {
            if (it)
                DrawHubApplication.isKicked = true
            viewModel.gameName = ""
            viewModel.isSpectator = false
            finish()
        })

        viewModel.eliminated.observe(this, {
            if (it == DrawHubApplication.currentUser.username) {
                ToastMaker.showText(
                    this,
                    "You were eliminated ... But no worries, your sucking may help you in the future!"
                )
            } else {
                ToastMaker.showText(
                    this,
                    "$it was ELIMINATED, but no worries! It's a good thing."
                )
            }
        })

        viewModel.chatIsBlocked.observe(this, {
            if (firstCheatValue) {
                firstCheatValue = false
            } else {

                if (it) {
                    if (viewModel.punishLevel < 3) {
                        ToastMaker.showText(
                            this,
                            "Your chat was blocked for sending too many messages."
                        )
                    } else {
                        ToastMaker.showText(
                            this,
                            "You were ban for 1 min"
                        )
                    }
                } else {
                    ToastMaker.showText(
                        this,
                        "You can chat again but watch yourself"
                    )
                }
            }
        })
    }

    private fun showRoundEndDialog() {
        if (!dialogIsShowing){
            dialogIsShowing = true
            dialog.show(supportFragmentManager, "RoundEndDialogFragment")
        }
    }
}