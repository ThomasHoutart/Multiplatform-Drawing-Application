package com.android.example.drawhubmobile.uicontrollers.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.navigation.fragment.findNavController
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentArtistBinding
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel

class ArtistFragment : Fragment() {

    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var binding: FragmentArtistBinding

    private val isArtistObserver = Observer<Boolean> { isArtist ->
        if (!isArtist) {
            findNavController().navigate(R.id.action_artistFragment_to_detectiveFragment)
        }
    }

    private val onWordFoundObserver = Observer<String> { username ->
        if (username != "") {
            viewModel.emitWordFoundMessage(requireContext(), username)
            viewModel.resetWordFoundUsername()
        }
    }

    private val wordToDrawObserver = Observer<String> { wordToDraw ->
        binding.wordToDraw.text = wordToDraw
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        addObservers()
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentArtistBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        (activity as? GameActivity)?.showChatButton(false)
    }

    fun updateCanvas() {
        binding.drawingCanvasView.invalidate()
    }

    private fun addObservers() {
        viewModel.isArtist.observe(this, isArtistObserver)
        viewModel.wordToDraw.observe(this, wordToDrawObserver)
        viewModel.wordWasFoundEvent.observe(this, onWordFoundObserver)
    }
}