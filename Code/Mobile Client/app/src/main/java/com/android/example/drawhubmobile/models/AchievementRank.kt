package com.android.example.drawhubmobile.models

enum class AchievementRank {
    GOLD, SILVER, BRONZE;
}

fun achievementRankFromString(rank: String): AchievementRank {
    return when (rank) {
        "Gold" -> AchievementRank.GOLD
        "Silver" -> AchievementRank.SILVER
        else -> AchievementRank.BRONZE
    }
}

fun achievementRankToString(rank: AchievementRank): String {
    return when (rank) {
        AchievementRank.GOLD -> "Gold"
        AchievementRank.SILVER -> "Silver"
        AchievementRank.BRONZE -> "Bronze"
    }
}