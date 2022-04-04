package com.android.example.drawhubmobile.uicontrollers.auth

import android.os.Bundle
import android.view.*
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.findNavController
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentLoginBinding
import com.android.example.drawhubmobile.models.socket.SocketErrorMessages
import com.android.example.drawhubmobile.models.socket.SocketMessages
import com.android.example.drawhubmobile.utils.ParticleHandler
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.viewmodels.auth.LoginViewModel
import java.util.*


class LoginFragment : Fragment() {

    private lateinit var binding: FragmentLoginBinding
    private val viewModel by viewModels<LoginViewModel>()
    private lateinit var emitterList: List<View>
    private lateinit var particleTimer: Timer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.username.observe(this, { clearErrors() })
        viewModel.password.observe(this, { clearErrors() })
        viewModel.loginStatusLiveData.observe(this, { checkLoginStatus(it) })
        viewModel.subscribe()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        // Support for API 29 or lower
        @Suppress("DEPRECATION")
        activity?.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

        binding = FragmentLoginBinding.inflate(inflater, container, false)
        binding.loginButton.setOnClickListener { onLoginClick() }
        binding.forgotPasswordText.setOnClickListener { onForgotPasswordClick(it) }
        binding.signUpText.setOnClickListener { onSignUpClick(it) }
        binding.passwordText.setOnKeyListener { view, i, keyEvent ->
            handleOnKey(
                view,
                i,
                keyEvent
            )
        }

        binding.lifecycleOwner = viewLifecycleOwner
        binding.loginViewModel = viewModel

        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        particleTimer = Timer()
        emitterList = listOf(
            binding.emitterBottom,
            binding.emitterTop,
            binding.emitterLeft,
            binding.emitterRight
        )
        scheduleParticles()
    }

    override fun onPause() {
        super.onPause()
        clearErrors()
        viewModel.clearFields()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        clearErrors()
        particleTimer.cancel()
        particleTimer.purge()
        viewModel.clearFields()
    }

    private fun scheduleParticles() {
        particleTimer.scheduleAtFixedRate(
            object : TimerTask() {
                override fun run() {
                    val activity = requireActivity()
                    activity.runOnUiThread {
                        ParticleHandler.emitLoginParticle(activity, emitterList.random())
                    }
                }
            },
            0,
            1000
        )
    }

    private fun onLoginClick() {
        if (!DrawHubApplication.socketHandler.isConnected()) {
            ToastMaker.showText(requireContext(), getString(R.string.notConnected))
            DrawHubApplication.socketHandler.connect()
            return
        }
        if (!validateFormFilled()) return
        binding.loginButton.isEnabled = false
        viewModel.performLogin()
    }

    private fun checkLoginStatus(status: String) {
        if (status == SocketMessages.USER_AUTHENTICATED) {
            DrawHubApplication.soundPlayer.playSound(R.raw.login_jingle)
            binding.loginButton.findNavController()
                .navigate(R.id.action_loginFragment_to_mainActivity)
        } else {
            val userDoesNotExist = status == SocketErrorMessages.USER_DOES_NOT_EXIST_ERROR
            val badPassword = status == SocketErrorMessages.BAD_PASSWORD_ERROR
            val alreadyLoggedIn = status == SocketErrorMessages.ALREADY_LOGGED_IN_ERROR

            var errorMessage = ""
            if (userDoesNotExist || badPassword)
                errorMessage = getString(R.string.invalidLoginErrorLabel)
            if (alreadyLoggedIn)
                errorMessage = getString(R.string.alreadyLoggedInErrorLabel)
            binding.apply {
                loginErrorText.visibility = View.VISIBLE
                loginErrorText.text = errorMessage
                loginButton.isEnabled = true
                usernameLayout.error = ""
                passwordLayout.error = ""
            }
            if (status == SocketErrorMessages.USER_CHEATED_ERROR)
                ToastMaker.showText(requireContext(), "You were banned 1 min for cheating")
        }
    }

    private fun validateFormFilled(): Boolean {
        var filled = true
        if (viewModel.isUsernameEmpty()) {
            binding.usernameLayout.error = getString(R.string.requiredError)
            filled = false
        }
        if (viewModel.isPasswordEmpty()) {
            binding.passwordLayout.error = getString(R.string.requiredError)
            filled = false
        }
        return filled
    }

    private fun clearErrors() {
        binding.usernameLayout.error = null
        binding.passwordLayout.error = null
        binding.loginErrorText.visibility = View.GONE
        binding.loginButton.isEnabled = true
    }

    private fun onForgotPasswordClick(view: View) {
        ToastMaker.showText(view.context, getString(R.string.workInProgressMessage))
    }

    private fun onSignUpClick(view: View) {
        if (DrawHubApplication.socketHandler.isConnected()) {
            view.findNavController().navigate(R.id.action_loginFragment_to_signUpFragment)
        } else {
            ToastMaker.showText(view.context, getString(R.string.notConnected))
        }
    }

    private fun handleOnKey(view: View, keyCode: Int, keyEvent: KeyEvent): Boolean {
        val isKeyDown = keyEvent.action == KeyEvent.ACTION_DOWN
        val isEnter =
            (keyCode == KeyEvent.KEYCODE_ENTER) || (keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER)
        val shouldLogin = isKeyDown && isEnter

        if (shouldLogin) {
            onLoginClick()
            return true
        }
        return false
    }

}