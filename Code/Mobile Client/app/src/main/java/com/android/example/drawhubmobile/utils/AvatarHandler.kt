package com.android.example.drawhubmobile.utils

import com.android.example.drawhubmobile.R

object AvatarHandler {

    private val avatarResIds = mutableListOf(
        R.drawable.avatar_b_1,
        R.drawable.avatar_b_2,
        R.drawable.avatar_b_3,
        R.drawable.avatar_b_4,
        R.drawable.avatar_b_5,
        R.drawable.avatar_b_6,
        R.drawable.avatar_p_1,
        R.drawable.avatar_p_2,
        R.drawable.avatar_p_3,
        R.drawable.avatar_p_4,
        R.drawable.avatar_p_5,
        R.drawable.avatar_p_6,
    )

    fun avatarCount() = avatarResIds.size

    fun getAvatarResIdFromInt(avatarId: Int) = avatarResIds[avatarId]
}