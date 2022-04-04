package com.android.example.drawhubmobile.uicontrollers.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.adapters.ScoresAdapter
import com.android.example.drawhubmobile.databinding.FragmentScoresBinding
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel
import kotlin.math.min

class ScoresFragment : Fragment() {

    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var binding: FragmentScoresBinding

    private lateinit var roomsRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentScoresBinding.inflate(inflater, container, false)

        binding.scoresToggle.setOnClickListener {
            val visible = binding.scoresLayout.visibility == View.VISIBLE
            binding.scoresLayout.visibility = if (visible) View.GONE else View.VISIBLE
        }

        viewModel.players.observe(viewLifecycleOwner, {
            val sortedBest = it.subList(0, min(3, it.size))
            initializeRecyclerView(sortedBest)
            val currentUserInList =
                sortedBest.find { p -> p.username == DrawHubApplication.currentUser.username }
            binding.scoresMeLayout.visibility =
                if (currentUserInList != null) View.GONE else View.VISIBLE
        })


        return binding.root
    }

    private fun initializeRecyclerView(players: List<Player>) {
        recyclerViewManager = LinearLayoutManager(activity)
        recyclerViewAdapter = ScoresAdapter(players)

        roomsRecyclerView = binding.bestScoresView.apply {
            setHasFixedSize(true)
            layoutManager = recyclerViewManager
            adapter = recyclerViewAdapter
        }
    }
}