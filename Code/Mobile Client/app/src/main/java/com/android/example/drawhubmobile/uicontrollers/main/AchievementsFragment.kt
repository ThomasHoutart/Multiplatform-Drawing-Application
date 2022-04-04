package com.android.example.drawhubmobile.uicontrollers.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.adapters.AchievementsAdapter
import com.android.example.drawhubmobile.databinding.FragmentAchievementsBinding
import com.android.example.drawhubmobile.models.Achievement
import com.android.example.drawhubmobile.viewmodels.main.AchievementsViewModel


class AchievementsFragment : Fragment() {

    private lateinit var binding: FragmentAchievementsBinding
    private val viewModel: AchievementsViewModel by activityViewModels()

    private lateinit var roomsRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentAchievementsBinding.inflate(inflater, container, false)
        viewModel.achievementsLiveData.observe(viewLifecycleOwner, { initializeRecyclerView(it) })
        viewModel.getAchievements()
        return binding.root
    }

    private fun initializeRecyclerView(achievements: List<Achievement>) {
        recyclerViewManager = LinearLayoutManager(activity)
        recyclerViewAdapter = AchievementsAdapter(achievements)
        roomsRecyclerView = binding.achievementsView.apply {
            setHasFixedSize(true)
            layoutManager = recyclerViewManager
            adapter = recyclerViewAdapter
        }
    }

}