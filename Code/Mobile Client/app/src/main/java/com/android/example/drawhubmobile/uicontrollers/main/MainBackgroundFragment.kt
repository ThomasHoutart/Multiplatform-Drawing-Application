package com.android.example.drawhubmobile.uicontrollers.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.findNavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.fragment.findNavController
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.uicontrollers.main.tutorial.TutorialDialogFragment
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel
import com.android.example.drawhubmobile.viewmodels.main.LobbyViewModel
import com.android.example.drawhubmobile.viewmodels.main.MainBackgroundViewModel
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.floatingactionbutton.FloatingActionButton


class MainBackgroundFragment : Fragment() {

    private lateinit var bottomNavigation: BottomNavigationView
    private lateinit var gameSelectFab: FloatingActionButton

    private val gameSelectViewModel by activityViewModels<GameSelectViewModel>()
    private val lobbyViewModel by activityViewModels<LobbyViewModel>()
    private val viewModel by activityViewModels<MainBackgroundViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        gameSelectViewModel.navigateToLobby.observe(this, {
            if (it.isJoining) {
                val action =
                    MainBackgroundFragmentDirections.actionMainBackgroundFragmentToLobbyFragment(
                        it.gameName,
                        it.isCreator,
                        it.isSpectator
                    )
                lobbyViewModel.startGame.postValue(false)
                gameSelectViewModel.resetJoinLobbyEvent()
                lobbyViewModel.resetLeaveLobbyEvent()
                findNavController().navigate(action)
            }
        })
        gameSelectViewModel.navigateToGame.observe(this, {
            if (it.isJoining) {
                val action =
                    MainBackgroundFragmentDirections.actionMainBackgroundFragmentToGameActivity(
                        it.gameName,
                        arrayOf(),
                        it.isSpectator
                    )
                lobbyViewModel.startGame.postValue(false)
                gameSelectViewModel.resetJoinLobbyEvent()
                lobbyViewModel.resetLeaveLobbyEvent()
                findNavController().navigate(action)
            }
        })
        viewModel.unreadMessagesCountLiveData.observe(this, { setupChatBadge(it) })
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_main_background, container, false)

        val navHostId = R.id.bottomNavHostFragment
        val nestedNavHostFragment =
            childFragmentManager.findFragmentById(navHostId) as NavHostFragment
        val navController = nestedNavHostFragment.navController

        if (DrawHubApplication.firstTime) {
            showTutorial()
            DrawHubApplication.firstTime = false
        }

        // Setup the Bottom Navigation
        bottomNavigation = view.findViewById(R.id.bottomNavigation)
        bottomNavigation.selectedItemId = R.id.gameSelectFragment
        bottomNavigation.setOnNavigationItemSelectedListener { item ->
            when (item.itemId) {
                R.id.navigationChat -> {
                    container!!.findNavController()
                        .navigate(R.id.action_mainBackgroundFragment_to_chatFragment)
                    true
                }
                R.id.gameSelectFragment -> {
                    navController.navigate(R.id.gameSelectFragment)
                    true
                }
                R.id.profileFragment -> {
                    navController.navigate(R.id.profileFragment)
                    true
                }
                R.id.achievementsFragment -> {
                    navController.navigate(R.id.achievementsFragment)
                    true
                }
                R.id.leaderboardFragment -> {
                    navController.navigate(R.id.leaderboardFragment)
                    true
                }
                else -> false
            }
        }

        gameSelectFab = view.findViewById(R.id.gameSelectFab)
        gameSelectFab.setOnClickListener {
            bottomNavigation.selectedItemId = R.id.gameSelectFragment
            navController.navigate(R.id.gameSelectFragment)
        }
        setupChatBadge(DrawHubApplication.chatMessageHandler.totalUnreadMessages)
        gameSelectViewModel.resetJoinLobbyEvent()
        lobbyViewModel.resetLeaveLobbyEvent()
        return view
    }

    private fun showTutorial() {
        val dialog = TutorialDialogFragment()
        dialog.show(parentFragmentManager, "TutorialDialogFragment")
    }

    override fun onResume() {
        super.onResume()
        lobbyViewModel.startGame.postValue(false)
    }

    private fun setupChatBadge(unreadCount: Int) {
        val badgeDrawable = bottomNavigation.getOrCreateBadge(R.id.navigationChat)
        badgeDrawable.backgroundColor = requireContext().getColor(R.color.colorAccent)
        badgeDrawable.badgeTextColor = requireContext().getColor(R.color.colorPrimaryDark)
        if (unreadCount > 0) {
            badgeDrawable.isVisible = true
            badgeDrawable.number = unreadCount
        } else {
            badgeDrawable.isVisible = false
            badgeDrawable.clearNumber()
        }
    }
}