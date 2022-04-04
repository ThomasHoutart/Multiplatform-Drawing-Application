package com.android.example.drawhubmobile.uicontrollers.main.lobby

import android.app.Dialog
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.android.example.drawhubmobile.R

class RemovePlayerDialogFragment(private var username: String, private var onKickClick: () -> Unit) : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return activity?.let {
            val builder = AlertDialog.Builder(it)
            builder.setTitle("Kick Player")
            builder.setMessage(getString(R.string.kick_player_dialog, username))
                .setPositiveButton(getString(R.string.Kick)) { _, _ ->
                    onKickClick()
                    dismiss()
                }
                .setNegativeButton(android.R.string.cancel) { _, _ ->
                    dismiss()
                }
            builder.create()
        } ?: throw IllegalStateException("Activity cannot be null")
    }
}