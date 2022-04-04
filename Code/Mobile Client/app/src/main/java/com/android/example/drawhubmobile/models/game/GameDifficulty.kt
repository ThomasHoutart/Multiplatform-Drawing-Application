package com.android.example.drawhubmobile.models.game

enum class GameDifficulty {
    EASY,
    NORMAL,
    HARD
}

fun gameDifficultyToString(difficulty: GameDifficulty?): String {
    return when (difficulty) {
        GameDifficulty.EASY -> "Easy"
        GameDifficulty.NORMAL -> "Normal"
        GameDifficulty.HARD -> "Hard"
        else -> ""
    }
}

fun stringToGameDifficulty(difficulty: String): GameDifficulty {
    return when (difficulty) {
        "Easy" -> GameDifficulty.EASY
        "Normal" -> GameDifficulty.NORMAL
        "Hard" -> GameDifficulty.HARD
        else -> throw Error("Invalid Game Difficulty: $difficulty")
    }
}