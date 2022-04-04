package com.android.example.drawhubmobile.models.game

enum class GameMode {
    // Order Matters. If we add other game modes, please change also in res/values/attrs.xml
    FREE_FOR_ALL,
    BATTLE_ROYALE
}

fun gameModeToString(gameMode: GameMode?): String {
    return when (gameMode) {
        GameMode.FREE_FOR_ALL -> "FFA"
        GameMode.BATTLE_ROYALE -> "BR"
        else -> ""
    }
}

fun stringToGameMode(gameMode: String): GameMode {
    return when (gameMode) {
        "FFA" -> GameMode.FREE_FOR_ALL
        "BR" -> GameMode.BATTLE_ROYALE
        else -> throw Error("Invalid Game Mode: $gameMode")
    }
}