package com.android.example.drawhubmobile.uicontrollers.chat

import android.content.Context
import android.content.res.TypedArray
import android.os.Bundle
import android.util.AttributeSet
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.ChatMessagesAdapter
import com.android.example.drawhubmobile.databinding.FragmentChatBinding
import com.android.example.drawhubmobile.models.ChatMessage
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.viewmodels.chat.ChatViewModel
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel
import com.android.example.drawhubmobile.viewmodels.main.LobbyViewModel
import com.android.example.drawhubmobile.viewmodels.main.MainBackgroundViewModel


class ChatFragment : Fragment() {

    private lateinit var binding: FragmentChatBinding

    private lateinit var messagesRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    // NEEDS TO BE viewModels AND NOT activityViewModels TO WORK
    private val viewModel: ChatViewModel by viewModels()

    private val gameViewModel: GameViewModel by activityViewModels()
    private val mainBackgroundViewModel: MainBackgroundViewModel by activityViewModels()
    private val lobbyViewModel: LobbyViewModel by activityViewModels()

    private var gameStarted = false

    private var inGame = false
    private var isArtist = false

    private val messagesObserver = Observer<List<ChatMessage>> {
        initializeRecyclerView(it)
    }

    private val leaveLobbyObserver = Observer<Boolean> { leavingLobby ->
        if (leavingLobby)
            findNavController().navigate(R.id.action_chatFragment_to_mainBackgroundFragment)
    }

    private val startGameObserver = Observer<Boolean> { gameIsStarting ->
        if ((arguments?.getBoolean("inLobby") == true) && gameIsStarting) {
            gameStarted = true
            val action = ChatFragmentDirections.actionChatFragmentToGameActivity(
                lobbyViewModel.lobbyName,
                lobbyViewModel.players.value!!.toTypedArray(),
                lobbyViewModel.isSpectator
            )
            lobbyViewModel.resetLeaveLobbyEvent()
            findNavController().navigate(action)
        }
    }

    override fun onInflate(context: Context, attrs: AttributeSet, savedInstanceState: Bundle?) {
        super.onInflate(context, attrs, savedInstanceState)
        val a: TypedArray = context.obtainStyledAttributes(attrs, R.styleable.ChatFragment)
        inGame = a.getBoolean(R.styleable.ChatFragment_inGame, false)
        isArtist = a.getBoolean(R.styleable.ChatFragment_isArtist, false)
        a.recycle()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.messagesLiveData.observe(this, messagesObserver)
        lobbyViewModel.startGame.observe(this, startGameObserver)
        lobbyViewModel.leaveLobby.observe(this, leaveLobbyObserver)
        viewModel.errorStatusLiveData.observe(this, { handleErrorStatus(it) })
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        binding = FragmentChatBinding.inflate(inflater, container, false)

        binding.chatMessageInput.setOnKeyListener { view, i, keyEvent ->
            handleOnKey(
                view,
                i,
                keyEvent
            )
        }

        binding.chatMessageInput.setOnEditorActionListener { _, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_SEND -> {
                    viewModel.sendMessage()
                    true
                }
                else -> false
            }
        }

        binding.backButton.setOnClickListener {
            findNavController().navigateUp()
        }

        binding.changeRoomButton.setOnClickListener {
            findNavController().navigate(R.id.action_chatFragment_to_roomListFragment)
        }

        binding.getHistoryButton.setOnClickListener {
            viewModel.getChatHistory()
        }

        binding.lifecycleOwner = viewLifecycleOwner
        binding.chatViewModel = viewModel
        binding.activeRoomName = getActiveRoomName()

        if (inGame) {
            binding.chatAppBar.visibility = View.GONE
        }
        if (isArtist) {
            binding.chatSendGrid.visibility = View.GONE
        }

        if (gameViewModel.isSpectator) {
            enableChat(false)
        }

        viewModel.currentActiveRoomName("" + DrawHubApplication.chatMessageHandler.activeRoom!!.name)

        return binding.root
    }

    override fun onPause() {
        super.onPause()
        // THIS NEEDS TO BE HERE DO NOT CHANGE PLZ
        viewModel.unsubscribe()
        closeSoftwareKeyboard()
    }

    override fun onResume() {
        super.onResume()
        // THIS NEEDS TO BE HERE DO NOT CHANGE PLZ
        viewModel.subscribe()

        // If the game was started, it means that we went back to
        // this fragment after gameEnd
        viewModel.resetChatMessages()
        viewModel.clearMessages()
        mainBackgroundViewModel.updateUnreadMessageCount()
        binding.chatMessageInput.isEnabled = true
        binding.chatMessageInput.requestFocus()
        if (gameStarted) {
            gameStarted = false
            findNavController().navigate(R.id.action_chatFragment_to_mainBackgroundFragment)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.changeRoomButton.isEnabled = !(arguments?.getBoolean("inLobby") ?: false)
    }

    private fun getActiveRoomName(): String {
        var roomName = viewModel.activeRoom.name
        if (roomName.contains("Lobby:")) {
            roomName = getString(R.string.lobby_chat)
        }
        return roomName
    }

    fun enableChat(enabled: Boolean = true) {
        binding.sendButton.isEnabled = enabled
        binding.chatMessageInput.isEnabled = enabled
        //  (InputType) 0 = none / 1 = text
        binding.chatMessageInput.inputType = if (enabled) 1 else 0
    }

    private fun closeSoftwareKeyboard() {
        val inputManager: InputMethodManager =
            requireActivity().getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        inputManager.hideSoftInputFromWindow(
            requireActivity().currentFocus?.windowToken,
            InputMethodManager.HIDE_NOT_ALWAYS
        )
    }

    private fun initializeRecyclerView(messages: List<ChatMessage>) {
        recyclerViewManager = LinearLayoutManager(activity)
        recyclerViewAdapter = ChatMessagesAdapter(messages)

        messagesRecyclerView = binding.chatMessagesView.apply {
            setHasFixedSize(true)
            layoutManager = recyclerViewManager
            adapter = recyclerViewAdapter
        }
        messagesRecyclerView.scrollToPosition(messages.size - 1)
    }

    private fun handleErrorStatus(status: String) {
        var errorString = ""
        if (status == SocketMessages.DELETE_ROOM) {
            binding.chatMessageInput.isEnabled = false
            binding.sendButton.isEnabled = false
            return
        }
        when (status) {
            SocketErrorMessages.NOT_IN_ROOM_ERROR -> errorString =
                getString(R.string.notInRoomToast)
            SocketErrorMessages.ROOM_DOES_NOT_EXIST_ERROR -> errorString =
                getString(R.string.roomDoesNotExistToast)
        }
        if (errorString.isNotEmpty()) {
            binding.chatMessageInput.isEnabled = false
            ToastMaker.showText(requireContext(), errorString)
            findNavController().navigate(R.id.action_chatFragment_to_roomListFragment)
        }
    }

    private fun handleOnKey(view: View, keyCode: Int, keyEvent: KeyEvent): Boolean {
        val isKeyDown = keyEvent.action == KeyEvent.ACTION_DOWN
        val isShiftDown = keyEvent.isShiftPressed
        val isEnter =
            (keyCode == KeyEvent.KEYCODE_ENTER) || (keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER)
        val shouldSendMessage = isKeyDown && isEnter && !isShiftDown

        if (shouldSendMessage) {
            viewModel.sendMessage()
            return true
        }
        return false
    }
}