package com.android.example.drawhubmobile.models.game

data class JoinLobby (val gameName: String,
                      val isCreator: Boolean,
                      val isJoining: Boolean,
                      val isSpectator: Boolean)