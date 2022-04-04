package com.android.example.drawhubmobile.uicontrollers.auth

import android.os.Bundle
import android.view.*
import android.view.inputmethod.EditorInfo
import android.widget.GridLayout
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.navigation.findNavController
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentSignupBinding
import com.android.example.drawhubmobile.network.HTTPCodes
import com.android.example.drawhubmobile.utils.AvatarHandler
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.validators.SignUpValidator
import com.android.example.drawhubmobile.viewmodels.auth.SignUpViewModel
import kotlin.math.ceil

class SignUpFragment : Fragment() {

    private lateinit var binding: FragmentSignupBinding
    private val viewModel: SignUpViewModel by viewModels()
    private lateinit var selectedAvatarButton: ImageButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.signUpStatusLiveData.observe(this) { checkSignUpStatus(it) }
        setViewModelObservers()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        // Support for API 29 or lower
        @Suppress("DEPRECATION")
        activity?.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

        binding = FragmentSignupBinding.inflate(inflater, container, false)

        binding.apply {
            setEnterKeyListener(firstNameText)
            setEnterKeyListener(lastNameText)
            setEnterKeyListener(usernameText)
            setEnterKeyListener(emailText)
            setEnterKeyListener(passwordText)
        }

        binding.passwordText.setOnEditorActionListener { _, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_SEND -> {
                    handleSignUp()
                    true
                }
                else -> false
            }
        }

        populateAvatarList()

        binding.backButton.setOnClickListener { view -> view.findNavController().navigateUp() }
        binding.signUpButton.setOnClickListener { handleSignUp() }
        binding.lifecycleOwner = viewLifecycleOwner
        binding.signUpViewModel = viewModel

        return binding.root
    }

    override fun onResume() {
        super.onResume()
        clearErrors()
        binding.signUpButton.isEnabled = false
    }

    private fun populateAvatarList() {
        val nColumns = 6
        val nAvatars = AvatarHandler.avatarCount()
        binding.avatarSelect.columnCount = nColumns
        binding.avatarSelect.rowCount = ceil(nAvatars / nColumns.toFloat()).toInt()

        for (avatarId in 0 until nAvatars) {
            val imageBtn = ImageButton(context)
            // Set the image
            imageBtn.setImageResource(AvatarHandler.getAvatarResIdFromInt(avatarId))
            // Set the width and height
            imageBtn.layoutParams = ViewGroup.LayoutParams(125, 125)
            // Set the scale type
            imageBtn.scaleType = ImageView.ScaleType.FIT_CENTER
            // Set on click listener
            imageBtn.setOnClickListener { onAvatarSelected(it, avatarId) }
            // Set background color
            val bgColor =
                if (avatarId == viewModel.avatarId) R.color.colorPrimary else R.color.colorPrimaryDark
            imageBtn.setBackgroundResource(bgColor)
            // Set selectedAvatar
            if (avatarId == viewModel.avatarId) selectedAvatarButton = imageBtn
            // Add the ImageButton to the grid
            binding.avatarSelect.addView(imageBtn)

            // Set the column weight
            val gridParams = imageBtn.layoutParams as GridLayout.LayoutParams
            gridParams.columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1f)
        }
    }

    private fun onAvatarSelected(view: View, avatarId: Int) {
        if (viewModel.avatarId == avatarId) return
        viewModel.avatarId = avatarId

        // Reset the current background
        selectedAvatarButton.setBackgroundResource(R.color.colorPrimaryDark)

        // Set the new background
        selectedAvatarButton = view as ImageButton
        view.setBackgroundResource(R.color.colorPrimary)
    }

    private fun checkSignUpStatus(status: Int) {
        if (status == 0) return
        when (status) {
            HTTPCodes.SUCCESS -> {
                ToastMaker.showText(
                    binding.signUpButton.context,
                    getString(R.string.userCreatedToast)
                )
                binding.signUpButton.findNavController().navigateUp()
            }
            HTTPCodes.USERNAME_TAKEN -> {
                binding.usernameLayout.error = getString(R.string.usernameTakenError)
            }
            HTTPCodes.EMAIL_TAKEN -> {
                binding.emailLayout.error = getString(R.string.emailTakenError)
            }
            else -> {
                ToastMaker.showText(
                    binding.signUpButton.context,
                    getString(R.string.unknown_error)
                )
            }
        }
    }

    private fun setEnterKeyListener(view: TextView) {
        view.setOnKeyListener { clickedView, i, keyEvent ->
            handleOnKey(clickedView, i, keyEvent)
        }
    }

    private fun handleSignUp() {
        if (DrawHubApplication.socketHandler.isConnected()) {
            if (binding.signUpButton.isEnabled) {
                binding.signUpButton.isEnabled = false
                viewModel.performSignUp()
            }
        } else {
            ToastMaker.showText(requireContext(), getString(R.string.notConnected))
        }
    }

    private fun handleOnKey(view: View, keyCode: Int, keyEvent: KeyEvent): Boolean {
        val isKeyDown = keyEvent.action == KeyEvent.ACTION_DOWN
        val isShiftDown = keyEvent.isShiftPressed
        val isEnter =
            (keyCode == KeyEvent.KEYCODE_ENTER) || (keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER)
        val shouldSendMessage = isKeyDown && isEnter && !isShiftDown

        if (shouldSendMessage) {
            handleSignUp()
            return true
        }
        return false
    }

    private fun clearErrors() {
        binding.apply {
            firstNameLayout.error = null
            lastNameLayout.error = null
            usernameLayout.error = null
            emailLayout.error = null
            passwordLayout.error = null
        }
    }

    private fun setViewModelObservers() {
        viewModel.firstName.observe(this, { validateFirstName(it) })
        viewModel.lastName.observe(this, { validateLastName(it) })
        viewModel.username.observe(this, { validateUsername(it) })
        viewModel.password.observe(this, { validatePassword(it) })
        viewModel.email.observe(this, { validateEmail(it) })
    }

    private fun validateFirstName(firstName: String) {
        binding.firstNameLayout.error =
            SignUpValidator.validateFirstName(requireContext(), firstName)
        updateButtonStatus()
    }

    private fun validateLastName(lastName: String) {
        binding.lastNameLayout.error =
            SignUpValidator.validateLastName(requireContext(), lastName)
        updateButtonStatus()
    }

    private fun validateUsername(username: String) {
        binding.usernameLayout.error =
            SignUpValidator.validateUsername(requireContext(), username)
        updateButtonStatus()
    }

    private fun validateEmail(email: String) {
        binding.emailLayout.error =
            SignUpValidator.validateEmail(requireContext(), email)
        updateButtonStatus()
    }

    private fun validatePassword(password: String) {
        binding.passwordLayout.error =
            SignUpValidator.validatePassword(requireContext(), password)
        updateButtonStatus()
    }

    private fun updateButtonStatus() {
        binding.signUpButton.isEnabled = isFormValid() && viewModel.areFieldsFilled()
    }

    private fun isFormValid(): Boolean {
        binding.apply {
            return (firstNameLayout.error == null &&
                    lastNameLayout.error == null &&
                    usernameLayout.error == null &&
                    emailLayout.error == null &&
                    passwordLayout.error == null)
        }
    }
}