package com.android.example.drawhubmobile.uicontrollers.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel


class GameLoadingFragment : Fragment() {

    private val viewModel by activityViewModels<GameViewModel>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (viewModel.isSpectator) {
            findNavController().navigate(R.id.action_gameLoadingFragment_to_detectiveFragment)
        }

        viewModel.isArtist.observe(this, { isArtist ->
            if (isArtist) {
                findNavController().navigate(R.id.action_gameLoadingFragment_to_artistFragment)
            } else {
                findNavController().navigate(R.id.action_gameLoadingFragment_to_detectiveFragment)
            }
        })
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_loading_spinner, container, false)
        return view
    }
}