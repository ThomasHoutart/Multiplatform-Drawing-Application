package com.android.example.drawhubmobile.network

import com.android.example.drawhubmobile.models.game.GamesAndLobbiesList
import com.android.example.drawhubmobile.models.http.*
import retrofit2.Retrofit
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query


interface ServerApiService {
    @GET("auth/salt")
    suspend fun getSalt(@Query("user") username: String): Salt

    @POST("auth/register")
    suspend fun createUser(@Body newUser: SignUpUser)

    @GET("room/list")
    suspend fun getRooms(@Query("user") username: String = ""): RoomProperties

    @GET("room/messagehistory")
    suspend fun getRoomMessageHistory(
        @Query("roomName") roomName: String,
        @Query("firstKnownId") firstKnownId: String?
    ): MessageHistory

    @GET("game/list")
    suspend fun getGamesList(): GamesAndLobbiesList

    @GET("/profile/")
    suspend fun getProfileInfo(@Query("username") username: String): ProfileInfo

    @GET("/leaderboard/")
    suspend fun getLeaderboardInfo(): LeaderboardInfo

    @GET("/achievement/")
    suspend fun getAchievements(@Query("username") username: String = ""): List<AchievementHttp>
}

object ServerApi {
    lateinit var retrofitService: ServerApiService
    fun init(retrofit: Retrofit) {
        retrofitService = retrofit.create(ServerApiService::class.java)
    }
}
