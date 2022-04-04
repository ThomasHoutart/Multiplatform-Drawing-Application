package com.android.example.drawhubmobile.uicontrollers.game

import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.navigation.fragment.findNavController
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel


class DetectiveFragment : Fragment() {

    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var guessView: EditText

    private val isArtistObserver = Observer<Boolean> { isArtist ->
        if (isArtist) {
            findNavController().navigate(R.id.action_detectiveFragment_to_artistFragment)
        }
    }

    private val onWordFoundObserver = Observer<String> { username ->
        if (username != "") {
            viewModel.emitWordFoundMessage(requireContext(), username, true)
            viewModel.resetWordFoundUsername()
        }
    }

    private val currentUserFoundWordObserver = Observer<Boolean> { wordFound ->
        if (!viewModel.isSpectator)
            guessView.isEnabled = !wordFound
    }

    private val eliminatedObserver = Observer<String> {
        if (it == DrawHubApplication.currentUser.username)
            guessView.visibility = View.GONE
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        addObservers()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_detective, container, false)
        guessView = view.findViewById(R.id.detectiveGuess)
        guessView.visibility = if(viewModel.isSpectator) View.GONE else View.VISIBLE

        addListeners()

        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        (activity as? GameActivity)?.showChatButton(true)
        guessView.requestFocus()
    }

    private fun sendGuess() {
        if (guessView.text.isNullOrBlank()) return
        if (!viewModel.chatIsBlocked.value!!) {
        viewModel.sendGuess(guessView.text.toString())
            guessView.text.clear()
        }
    }

    private fun handleOnKey(view: View, keyCode: Int, keyEvent: KeyEvent): Boolean {
        val isKeyDown = keyEvent.action == KeyEvent.ACTION_DOWN
        val isEnter =
            (keyCode == KeyEvent.KEYCODE_ENTER) || (keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER)
        val shouldLogin = isKeyDown && isEnter

        if (shouldLogin) {
            sendGuess()
            return true
        }
        return false
    }

    private fun addListeners() {
        guessView.setOnEditorActionListener { _, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_GO -> {
                    sendGuess()
                    true
                }
                else -> false
            }
        }
        guessView.setOnKeyListener { _, i, keyEvent ->
            handleOnKey(
                requireView(),
                i,
                keyEvent
            )
        }
    }

    private fun addObservers() {
        viewModel.isArtist.observe(this, isArtistObserver)
        viewModel.wordWasFoundEvent.observe(this, onWordFoundObserver)
        viewModel.currentUserFoundWord.observe(this, currentUserFoundWordObserver)
        viewModel.eliminated.observe(this, eliminatedObserver)
    }
}