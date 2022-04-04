package com.android.example.drawhubmobile.uicontrollers.main.gameSelect

import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.activityViewModels
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentCreateLobbyDialogBinding
import com.android.example.drawhubmobile.utils.ToastMaker
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel

class CreateLobbyDialogFragment : DialogFragment() {

    private lateinit var binding: FragmentCreateLobbyDialogBinding
    private val viewModel by activityViewModels<GameSelectViewModel>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentCreateLobbyDialogBinding.inflate(inflater, container, false)

        binding.actionButton.setOnClickListener {
            createLobby()
        }

        binding.lobbyNameText.setOnKeyListener { view, i, keyEvent ->
            handleOnKey(
                view,
                i,
                keyEvent
            )
        }
        binding.lobbyNameText.setOnEditorActionListener { _, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_GO -> {
                    createLobby()
                    true
                }
                else -> false
            }
        }


        binding.cancelButton.setOnClickListener {
            dialog?.cancel()
        }

        binding.lifecycleOwner = viewLifecycleOwner

        return binding.root
    }

    private fun createLobby() {
        if (binding.lobbyNameText.text.isNullOrBlank()) return
        if (viewModel.difficulty.value == null || viewModel.gameMode.value == null) {
            ToastMaker.showText(requireContext(), getString(R.string.SelectDifficultyAndGameMode))
        } else {
            viewModel.createLobby(binding.lobbyNameText.text.toString())
        }
        // TODO - Simon: Add error handling before dismiss
        dismiss()
    }

    private fun handleOnKey(view: View, keyCode: Int, keyEvent: KeyEvent): Boolean {
        val isKeyDown = keyEvent.action == KeyEvent.ACTION_DOWN
        val isEnter =
            (keyCode == KeyEvent.KEYCODE_ENTER) || (keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER)
        val shouldLogin = isKeyDown && isEnter

        if (shouldLogin) {
            createLobby()
            return true
        }
        return false
    }
}