package com.android.example.drawhubmobile.viewmodels.main

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.Achievement
import com.android.example.drawhubmobile.models.achievementRankFromString
import com.android.example.drawhubmobile.network.ServerApi
import kotlinx.coroutines.launch

class AchievementsViewModel : ViewModel() {

    private val mAchievementsLiveData = MutableLiveData<List<Achievement>>()
    val achievementsLiveData: LiveData<List<Achievement>>
        get() = mAchievementsLiveData

    fun getAchievements() {
        viewModelScope.launch {
            try {
                val username = DrawHubApplication.currentUser.username
                val achievementsHttp = ServerApi.retrofitService.getAchievements(username)
                val achievements = achievementsHttp.map { a ->
                    Achievement(
                        a.title,
                        a.hint,
                        a.obtained,
                        achievementRankFromString(a.rank)
                    )
                }
                mAchievementsLiveData.postValue(achievements)
            } catch (e: Exception) {
                System.err.println("Could not retrieve the achievements list: $e")
            }
        }
    }
}