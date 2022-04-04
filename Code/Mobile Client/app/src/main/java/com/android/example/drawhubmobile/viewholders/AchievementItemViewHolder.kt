package com.android.example.drawhubmobile.viewholders

import android.content.Context
import androidx.core.content.res.ResourcesCompat
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.AchievementItemViewBinding
import com.android.example.drawhubmobile.models.Achievement
import com.android.example.drawhubmobile.models.AchievementRank
import com.android.example.drawhubmobile.models.achievementRankToString

class AchievementItemViewHolder(private val binding: AchievementItemViewBinding) :
    RecyclerView.ViewHolder(binding.root) {

    private val context: Context = binding.root.context

    fun setDetails(achievement: Achievement) {
        binding.title = achievement.title
        binding.hint = achievement.hint
        binding.obtained = achievement.obtained
        binding.rank = achievementRankToString(achievement.rank)
        if (!achievement.obtained) {
            binding.rankView.setBackgroundColor(context.getColor(R.color.colorPrimary))
        } else {
            setRankBackground(achievement.rank)
        }
    }

    private fun setRankBackground(rank: AchievementRank) {
        val bgResId = when (rank) {
            AchievementRank.GOLD -> R.drawable.background_gold
            AchievementRank.SILVER -> R.drawable.background_silver
            else -> R.drawable.background_bronze
        }
        val bgDrawable = ResourcesCompat.getDrawable(context.resources, bgResId, context.theme)
        binding.rankView.background = bgDrawable

    }
}