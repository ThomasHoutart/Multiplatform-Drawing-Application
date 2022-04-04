package com.android.example.drawhubmobile.uicontrollers.chat

import android.app.Dialog
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.android.example.drawhubmobile.R

class DeleteRoomDialogFragment(
    private var roomName: String,
    private var onDeleteClick: () -> Unit
) : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return activity?.let {
            val builder = AlertDialog.Builder(it)
            builder.setTitle(R.string.deleteRoomTitle)
            builder.setMessage(getString(R.string.deleteRoomDialogMessage, roomName))
                .setPositiveButton(R.string.deleteLabel) { _, _ ->
                    onDeleteClick()
                    dismiss()
                }
                .setNegativeButton(android.R.string.cancel) { _, _ ->
                    dismiss()
                }
            builder.create()
        } ?: throw IllegalStateException("Activity cannot be null")
    }
}