package com.android.example.drawhubmobile.viewmodels.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.models.http.SignUpUser
import com.android.example.drawhubmobile.network.HTTPCodes
import com.android.example.drawhubmobile.network.ServerApi
import com.android.example.drawhubmobile.utils.Hasher
import kotlinx.coroutines.launch
import retrofit2.HttpException

class SignUpViewModel : ViewModel() {
    val firstName = MutableLiveData<String>("")
    val lastName = MutableLiveData<String>("")
    val username = MutableLiveData<String>("")
    val email = MutableLiveData<String>("")
    val password = MutableLiveData<String>("")
    var avatarId = 0

    private val mSignUpStatusLiveData = MutableLiveData<Int>(0)
    val signUpStatusLiveData: LiveData<Int>
        get() = mSignUpStatusLiveData

    fun performSignUp() {
        viewModelScope.launch {
            try {
                ServerApi.retrofitService.createUser(createNewUser())
                mSignUpStatusLiveData.postValue(HTTPCodes.SUCCESS)
            } catch (e: HttpException) {
                println("An error occurred during sign up: $e")
                mSignUpStatusLiveData.postValue(e.code())
            }
        }
    }

    fun areFieldsFilled(): Boolean {
        return !(firstName.value.toString().isEmpty() ||
                lastName.value.toString().isEmpty() ||
                username.value.toString().isEmpty() ||
                email.value.toString().isEmpty() ||
                password.value.toString().isEmpty())
    }

    private fun createNewUser(): SignUpUser {
        return SignUpUser(
            firstName.value!!.toString(),
            lastName.value!!.toString(),
            username.value!!.toString(),
            email.value!!.toString(),
            Hasher.hash(password.value!!.toString()),
            avatarId
        )
    }
}