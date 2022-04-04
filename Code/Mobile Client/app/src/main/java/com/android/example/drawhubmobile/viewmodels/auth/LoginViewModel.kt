package com.android.example.drawhubmobile.viewmodels.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.User
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.models.event.SendLoginEvent
import com.android.example.drawhubmobile.models.event.UserAuthenticatedEvent
import com.android.example.drawhubmobile.models.http.Salt
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.network.ServerApi
import com.android.example.drawhubmobile.utils.Hasher
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {

    val username = MutableLiveData("")
    val password = MutableLiveData("")

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler
    private val loginStatusMutableLiveData = MutableLiveData("")
    val loginStatusLiveData: LiveData<String>
        get() = loginStatusMutableLiveData

    private val userAuthenticatedObserver = EventObserver {
        val event = it as UserAuthenticatedEvent
        val socketId = event.socketId
        val firstName = event.firstName
        val lastName = event.lastName
        val usernameStr = username.value!!
        DrawHubApplication.currentUser =
            User(socketId, usernameStr, firstName, lastName, event.avatar)
        DrawHubApplication.firstTime = event.firstTime
        loginStatusMutableLiveData.postValue(SocketMessages.USER_AUTHENTICATED)
    }

    private val userDoesNotExistObserver = EventObserver {
        loginStatusMutableLiveData.postValue(SocketErrorMessages.USER_DOES_NOT_EXIST_ERROR)
    }

    private val badPasswordObserver = EventObserver {
        loginStatusMutableLiveData.postValue(SocketErrorMessages.BAD_PASSWORD_ERROR)
    }

    private val alreadyLoggedInObserver = EventObserver {
        loginStatusMutableLiveData.postValue(SocketErrorMessages.ALREADY_LOGGED_IN_ERROR)
    }

    private val userCheatedErrorObserver = EventObserver {
        loginStatusMutableLiveData.postValue(SocketErrorMessages.USER_CHEATED_ERROR)
    }

    fun clearFields() {
        username.value = ""
        password.value = ""
    }

    fun subscribe() {
        mEmitterHandler.subscribe(EventTypes.USER_AUTHENTICATED, userAuthenticatedObserver)
        mEmitterHandler.subscribe(EventTypes.USER_DOES_NOT_EXIST_ERROR, userDoesNotExistObserver)
        mEmitterHandler.subscribe(EventTypes.BAD_PASSWORD_ERROR, badPasswordObserver)
        mEmitterHandler.subscribe(EventTypes.ALREADY_LOGGED_IN_ERROR, alreadyLoggedInObserver)
        mEmitterHandler.subscribe(EventTypes.USER_CHEATED_ERROR, userCheatedErrorObserver)
    }

    fun performLogin() {
        viewModelScope.launch {
            try {
                val usernameStr = username.value.toString()
                val passwordStr = password.value.toString()
                val salt = ServerApi.retrofitService.getSalt(usernameStr)
                mEmitterHandler.emit(createSendLoginEventWithHash(usernameStr, passwordStr, salt))
            } catch (e: Exception) {
                println("There was a problem while logging in: $e")
                loginStatusMutableLiveData.postValue(SocketErrorMessages.USER_DOES_NOT_EXIST_ERROR)
            }
        }
    }

    fun isUsernameEmpty() = username.value.toString().isEmpty()
    fun isPasswordEmpty() = password.value.toString().isEmpty()

    private fun createSendLoginEventWithHash(
        username: String,
        password: String,
        salt: Salt
    ): SendLoginEvent {
        val hashedPassword = Hasher.hash(password)
        val hashPrep = Hasher.hash(salt.permSalt + hashedPassword)
        val hashToSend = Hasher.hash(salt.tempSalt + hashPrep)
        return SendLoginEvent(username, hashToSend)
    }
}