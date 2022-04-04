package com.android.example.drawhubmobile.uicontrollers.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ListView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.LeaderboardListViewAdapter
import com.android.example.drawhubmobile.databinding.FragmentLeaderboardBinding
import com.android.example.drawhubmobile.models.TimePeriod
import com.android.example.drawhubmobile.models.game.GameDifficulty
import com.android.example.drawhubmobile.models.game.GameMode
import com.android.example.drawhubmobile.viewmodels.main.LeaderboardViewModel

class LeaderboardFragment : Fragment() {

    private val viewModel by viewModels<LeaderboardViewModel>()

    private lateinit var playerListView: ListView
    private lateinit var playerListViewAdapter: LeaderboardListViewAdapter
    private lateinit var noGamesTextView: TextView

    private lateinit var binding: FragmentLeaderboardBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        viewModel.getLeaderboardInfo { initializeDefaultValue() }
        binding = FragmentLeaderboardBinding.inflate(layoutInflater)
        playerListView = binding.leaderboardListView
        noGamesTextView = binding.noGamesText
        addButtonListeners()
        return binding.root
    }

    private fun addButtonListeners() {
        binding.leaderboardGameModeToggle.addOnButtonCheckedListener { _, checkedId, _ ->
            viewModel.gameMode = when (checkedId) {
                R.id.leaderboardFfa -> GameMode.FREE_FOR_ALL
                else -> GameMode.BATTLE_ROYALE
            }
            initializePlayerListView()
        }
        binding.leaderboardDifficultyToggle.addOnButtonCheckedListener { _, checkedId, _ ->
            viewModel.difficulty = when (checkedId) {
                R.id.leaderboardNormal -> GameDifficulty.NORMAL
                R.id.leaderboardHard -> GameDifficulty.HARD
                else -> GameDifficulty.EASY
            }
            initializePlayerListView()
        }
        binding.leaderboardTimeToggle.addOnButtonCheckedListener { _, checkedId, _ ->
            viewModel.timePeriod = when (checkedId) {
                R.id.leaderboardToday -> TimePeriod.TODAY
                R.id.leaderboardThisWeek -> TimePeriod.THIS_WEEK
                else -> TimePeriod.ALL_TIME
            }
            initializePlayerListView()
        }
    }

    private fun initializePlayerListView() {
        if (viewModel.everyOptionsAreSelected()) {
            val playerList = viewModel.getPlayerList()
            if (playerList.isEmpty()) {
                playerListView.visibility = View.GONE
                noGamesTextView.visibility = View.VISIBLE
            } else {
                playerListView.visibility = View.VISIBLE
                noGamesTextView.visibility = View.GONE
                playerListViewAdapter = LeaderboardListViewAdapter(
                    requireContext(),
                    playerList
                )
                playerListView.adapter = playerListViewAdapter
            }
        }
    }

    private fun initializeDefaultValue() {
        viewModel.gameMode = GameMode.FREE_FOR_ALL
        viewModel.difficulty = GameDifficulty.NORMAL
        viewModel.timePeriod = TimePeriod.ALL_TIME
        initializePlayerListView()
    }
}