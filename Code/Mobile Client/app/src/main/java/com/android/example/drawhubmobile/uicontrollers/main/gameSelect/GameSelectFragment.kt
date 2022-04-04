package com.android.example.drawhubmobile.uicontrollers.main.gameSelect

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentGameSelectBinding
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.models.game.GameDifficulty
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel

class GameSelectFragment : Fragment() {

    private val viewModel by activityViewModels<GameSelectViewModel>()
    private lateinit var binding: FragmentGameSelectBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        addObservers()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentGameSelectBinding.inflate(inflater, container, false)

        viewModel.getGameList()
        viewModel.clearSelectedLobby()

        toggleDifficultyVisibility()
        toggleLobbyListVisibility()

        addListeners()

        return binding.root
    }

    override fun onPause() {
        super.onPause()
        viewModel.resetJoinLobbyEvent()
    }

    override fun onResume() {
        super.onResume()
        if (viewModel.difficulty.value != null)
            binding.difficultyToggle.check(difficultyToToggleId(viewModel.difficulty.value!!))
    }

    private fun difficultyToToggleId(difficulty: GameDifficulty): Int {
        return when (difficulty) {
            GameDifficulty.EASY -> R.id.easy
            GameDifficulty.NORMAL -> R.id.normal
            GameDifficulty.HARD -> R.id.hard
        }
    }

    private fun toggleDifficultyVisibility() {
        val gameMode = viewModel.gameMode.value
        binding.difficulty.visibility = if (gameMode == null) View.GONE else View.VISIBLE
        binding.difficultyToggle.visibility = if (gameMode == null) View.GONE else View.VISIBLE
    }

    private fun toggleLobbyListVisibility() {
        val difficulty = viewModel.difficulty.value
        binding.lobbiesLayout.visibility = if (difficulty == null) View.GONE else View.VISIBLE
    }

    private fun addListeners() {
        addDifficultyToggleListener()
        addCreateLobbyButtonListener()
        addJoinLobbyButtonListener()
        addJoinLobbyAsSpectatorButtonListener()
    }

    private fun addDifficultyToggleListener() {
        binding.difficultyToggle.addOnButtonCheckedListener { _, checkedId, _ ->
            val difficulties = GameDifficulty.values()
            when (checkedId) {
                R.id.easy -> viewModel.difficulty.value = difficulties[0]
                R.id.normal -> viewModel.difficulty.value = difficulties[1]
                R.id.hard -> viewModel.difficulty.value = difficulties[2]
            }
            viewModel.filterLobbiesAndGames()
            toggleLobbyListVisibility()
        }
    }

    private fun addJoinLobbyButtonListener() {
        binding.joinLobbyBtn.setOnClickListener {
            viewModel.joinLobby()
        }
    }

    private fun addJoinLobbyAsSpectatorButtonListener() {
        binding.joinLobbyAsSpectatorBtn.setOnClickListener {
            viewModel.spectateLobbyOrGame()
        }
    }

    private fun addCreateLobbyButtonListener() {
        binding.createLobbyBtn.setOnClickListener {
            val dialog = CreateLobbyDialogFragment()
            dialog.setTargetFragment(this, 300)
            dialog.show(parentFragmentManager, "CreateLobbyDialogFragment")
        }
    }

    private fun addObservers() {
        viewModel.gameMode.observe(this, Observer {
            toggleDifficultyVisibility()
        })
        viewModel.errorStatus.observe(this, {
            val event = it.getContentIfNotHandled() ?: return@observe
                when (event) {
                    EventTypes.LOBBY_DOES_NOT_EXIST_ERROR -> ToastMaker.showText(
                        requireContext(),
                        getString(R.string.LobbyDoesNotExistError)
                    )
                    EventTypes.LOBBY_ALREADY_EXISTS_ERROR -> ToastMaker.showText(
                        requireContext(),
                        getString(R.string.LobbyAlreadyExistsError)
                    )
                    EventTypes.LOBBY_FULL_ERROR -> ToastMaker.showText(
                        requireContext(),
                        getString(R.string.LobbyIsFullError)
                    )
                    EventTypes.ALREADY_IN_LOBBY_ERROR -> ToastMaker.showText(
                        requireContext(),
                        getString(R.string.AlreadyInLobbyError)
                    )
                    EventTypes.USER_NOT_IN_LOBBY_ERROR -> ToastMaker.showText(
                        requireContext(),
                        getString(R.string.UserNotInLobbyError)
                    )
                    EventTypes.NOT_ENOUGH_PLAYERS_ERROR -> ToastMaker.showText(
                        requireContext(),
                        getString(R.string.NotEnoughPlayerError)
                    )
                    else -> ToastMaker.showText(requireContext(), getString(R.string.unknown_error))
                }
        })
    }
}