package com.android.example.drawhubmobile.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.databinding.AchievementItemViewBinding
import com.android.example.drawhubmobile.models.Achievement
import com.android.example.drawhubmobile.viewholders.AchievementItemViewHolder


class AchievementsAdapter(private val achievements: List<Achievement>) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = AchievementItemViewBinding.inflate(inflater, parent, false)
        return AchievementItemViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val current = achievements[position]
        val achievementsHolder = holder as AchievementItemViewHolder
        achievementsHolder.setDetails(current)
    }

    override fun getItemCount() = achievements.size

}