package com.android.example.drawhubmobile.mocks

import com.android.example.drawhubmobile.models.http.RetrofitProvider
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

const val HTTP_TEST_PORT = 4562

object RetrofitClientMock : RetrofitProvider() {
    override fun getRetrofit(): Retrofit {
        return Retrofit.Builder()
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .baseUrl("http://localhost:$HTTP_TEST_PORT/")
            .build()
    }
}