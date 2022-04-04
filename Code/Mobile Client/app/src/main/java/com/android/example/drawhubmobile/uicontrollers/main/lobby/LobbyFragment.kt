package com.android.example.drawhubmobile.uicontrollers.main.lobby

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AlertDialog
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.PlayerListAdapter
import com.android.example.drawhubmobile.databinding.FragmentLobbyBinding
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.models.game.GameMode
import com.android.example.drawhubmobile.models.game.InGameUser
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.models.game.Spectator
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel
import com.android.example.drawhubmobile.viewmodels.main.LobbyViewModel

class LobbyFragment : Fragment() {

    private val viewModel: LobbyViewModel by activityViewModels()
    private val gameSelectViewModel by activityViewModels<GameSelectViewModel>()
    private val args: LobbyFragmentArgs by navArgs()
    private lateinit var binding: FragmentLobbyBinding

    private lateinit var playersRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    private var navigatingToChat = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        addObservers()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        navigatingToChat = false
        binding = FragmentLobbyBinding.inflate(inflater, container, false)
        binding.viewModel = viewModel

        initializeRecyclerView(false)
        addListeners()

        if (gameSelectViewModel.gameMode.value == GameMode.BATTLE_ROYALE) {
            binding.addBotButton.isEnabled = false
        }
        viewModel.isCreator = args.isCreator
        viewModel.lobbyName = args.lobbyName
        viewModel.isSpectator = args.isSpectator

        binding.lifecycleOwner = viewLifecycleOwner

        return binding.root
    }

    override fun onPause() {
        super.onPause()
        if (!navigatingToChat)
            viewModel.resetLeaveLobbyEvent()
    }

    override fun onResume() {
        super.onResume()
        // If the game was started, it means that we went back to
        // this fragment after gameEnd
        if (viewModel.startGame.value == true) {
            findNavController().navigate(R.id.action_lobbyFragment_to_mainBackgroundFragment)
        }
    }

    private fun initializeRecyclerView(showSpectator: Boolean) {
        val playersAndSpectators = mutableListOf<InGameUser>()
        for (player in viewModel.players.value!!) {
            playersAndSpectators.add(Player(player.username, 0, player.avatar))
        }
        if (showSpectator) {
            for (spectator in viewModel.spectators.value!!) {
                playersAndSpectators.add(Spectator(spectator.username, spectator.avatar))
            }
        }
        recyclerViewManager = LinearLayoutManager(activity)
        recyclerViewAdapter = PlayerListAdapter(
            playersAndSpectators,
            { handleOnKickPlayerClick(it) },
            viewModel.isCreator
        )

        playersRecyclerView = binding.playersRecyclerView.apply {
            setHasFixedSize(true)
            layoutManager = recyclerViewManager
            adapter = recyclerViewAdapter
        }
    }

    private fun handleOnKickPlayerClick(username: String) {
        val dialog = RemovePlayerDialogFragment(username) {
            viewModel.removePlayer(username)
        }
        dialog.show(parentFragmentManager, "RemovePlayerDialogFragment")
    }

    private fun addListeners() {
        binding.showSpectatorsButton.setOnCheckedChangeListener { buttonView, isChecked ->
            initializeRecyclerView(isChecked)
        }

        if (gameSelectViewModel.gameMode.value != GameMode.BATTLE_ROYALE) {
            binding.addBotButton.setOnClickListener {
                viewModel.addBot()
            }
        }

        binding.openChatButton.setOnClickListener {
            navigatingToChat = true
            val bundle = bundleOf("inLobby" to true)
            findNavController().navigate(R.id.action_lobbyFragment_to_chatFragment, bundle)
        }

        binding.leaveLobbyButton.setOnClickListener {
            if (viewModel.isCreator) {
                AlertDialog.Builder(requireContext())
                    .setTitle(getString(R.string.delete_lobby))
                    .setMessage(getString(R.string.delete_lobby_message))
                    .setNegativeButton(R.string.no, null)
                    .setPositiveButton(R.string.yes) { _, _ ->
                        viewModel.leaveLobby()
                    }
                    .create()
                    .show()
            } else {
                AlertDialog.Builder(requireContext())
                    .setTitle(getString(R.string.leaveLobbyTitle))
                    .setMessage(getString(R.string.leaveLobbyMessage))
                    .setNegativeButton(R.string.no, null)
                    .setPositiveButton(R.string.yes) { _, _ ->
                        viewModel.leaveLobby()
                    }
                    .create()
                    .show()
            }
        }

        binding.startGameButton.setOnClickListener {
            viewModel.startGame()
        }
    }

    private fun addObservers() {
        viewModel.startGame.observe(this, { gameIsStarting ->
            if (gameIsStarting) {
                val action = LobbyFragmentDirections.actionLobbyFragmentToGameActivity(
                    viewModel.lobbyName,
                    viewModel.players.value!!.toTypedArray(),
                    viewModel.isSpectator
                )
                findNavController().navigate(action)
            }
        })
        viewModel.leaveLobby.observe(this, { leavingLobby ->
            if (leavingLobby) {
                gameSelectViewModel.resetJoinLobbyEvent()
                findNavController().navigate(R.id.action_lobbyFragment_to_mainBackgroundFragment)
            }
        })
        viewModel.players.observe(
            this,
            { initializeRecyclerView(binding.showSpectatorsButton.isChecked) })
        viewModel.spectators.observe(
            this,
            { initializeRecyclerView(binding.showSpectatorsButton.isChecked) })
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
                EventTypes.USER_DOES_NOT_EXIST_ERROR -> ToastMaker.showText(
                    requireContext(),
                    getString(R.string.UserDoesNotExistError)
                )
                else -> ToastMaker.showText(requireContext(), getString(R.string.unknown_error))
            }
        })
    }
}