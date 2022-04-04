package com.android.example.drawhubmobile.uicontrollers.main.gameSelect

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.adapters.LobbyListAdapter
import com.android.example.drawhubmobile.databinding.FragmentLobbiesCardBinding
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel

class LobbiesCardFragment : Fragment() {

    private val viewModel by activityViewModels<GameSelectViewModel>()
    private lateinit var binding: FragmentLobbiesCardBinding

    private lateinit var messagesRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentLobbiesCardBinding.inflate(inflater, container, false)

        initializeRecyclerView()

        viewModel.gameList.observe(viewLifecycleOwner, Observer {
            initializeRecyclerView()
        })

        viewModel.selectedLobbyOrGameName.observe(viewLifecycleOwner, Observer {
            initializeRecyclerView()
        })

        return binding.root
    }

    private fun initializeRecyclerView() {
        if (viewModel.gameList.value != null) {
            recyclerViewManager = LinearLayoutManager(activity)
            recyclerViewAdapter = LobbyListAdapter(
                viewModel.gameList.value!!,
                viewModel.selectedLobbyOrGameName.value
            ) { handleOnLobbyClick(it) }

            messagesRecyclerView = binding.lobbiesView.apply {
                setHasFixedSize(true)
                layoutManager = recyclerViewManager
                adapter = recyclerViewAdapter
            }
        }
    }

    private fun handleOnLobbyClick(lobbyName: String) {
        viewModel.selectLobby(lobbyName)
    }

}