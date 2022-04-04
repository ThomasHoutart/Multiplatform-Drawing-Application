package com.android.example.drawhubmobile.models

data class Achievement(
    val title: String,
    val hint: String,
    val obtained: Boolean,
    val rank: AchievementRank
)