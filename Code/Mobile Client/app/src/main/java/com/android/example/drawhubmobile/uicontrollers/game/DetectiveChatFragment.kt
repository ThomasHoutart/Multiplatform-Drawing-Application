package com.android.example.drawhubmobile.uicontrollers.game

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.navigation.fragment.FragmentNavigatorExtras
import androidx.navigation.fragment.findNavController
import androidx.transition.TransitionInflater
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.uicontrollers.chat.ChatFragment
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel
import com.android.example.drawhubmobile.views.CardDragLayout
import com.android.example.drawhubmobile.views.DrawingCanvasView
import kotlinx.android.synthetic.main.fragment_chat.*

class DetectiveChatFragment : Fragment() {
    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var chatFragment: ChatFragment

    private val isArtistObserver = Observer<Boolean> { isArtist ->
        if (isArtist) {
            findNavController().navigate(R.id.action_detectiveChatFragment_to_artistFragment)
        }
    }

    private val onWordFoundObserver = Observer<String> { username ->
        if (username != "") {
            viewModel.emitWordFoundMessage(requireContext(), username)
            viewModel.resetWordFoundUsername()
        }
    }

    private val currentUserFoundWordObserver = Observer<Boolean> { wordFound ->
        if (!viewModel.isSpectator)
            chatFragment.enableChat(!wordFound)
    }

    private val eliminatedObserver = Observer<String> {
        if (it == DrawHubApplication.currentUser.username)
            chatFragment.enableChat(false)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sharedElementEnterTransition =
            TransitionInflater.from(context).inflateTransition(android.R.transition.move)
        addObservers()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_detective_chat, container, false)
        val dragLayout = view.findViewById<CardDragLayout>(R.id.cardDragLayout)
        dragLayout.setOnCardClickCallback {
            val canvas = view.findViewById<DrawingCanvasView>(R.id.drawingCanvasView)
            val extras = FragmentNavigatorExtras(canvas to "canvasView")
            findNavController().navigate(
                R.id.action_detectiveChatFragment_to_detectiveFragment,
                null, null, extras
            )
        }
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        (activity as? GameActivity)?.showChatButton(false)
        chatFragment = childFragmentManager.findFragmentById(R.id.chatFragment) as ChatFragment
    }

    private fun addObservers() {
        viewModel.isArtist.observe(this, isArtistObserver)
        viewModel.wordWasFoundEvent.observe(this, onWordFoundObserver)
        viewModel.currentUserFoundWord.observe(this, currentUserFoundWordObserver)
        viewModel.eliminated.observe(this, eliminatedObserver)
    }
}
