package com.android.example.drawhubmobile.uicontrollers.chat

import android.app.Dialog
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import com.android.example.drawhubmobile.R

class LeaveRoomDialogFragment(
    private var roomName: String,
    private var onLeaveClick: () -> Unit
) : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return activity?.let {
            val builder = AlertDialog.Builder(it)
            builder.setTitle(R.string.leaveRoomTitle)
            builder.setMessage(getString(R.string.leaveRoomDialogMessage, roomName))
                .setPositiveButton(getString(R.string.leaveLabel)) { _, _ ->
                    onLeaveClick()
                    dismiss()
                }
                .setNegativeButton(android.R.string.cancel) { _, _ ->
                    dismiss()
                }
            builder.create()
        } ?: throw IllegalStateException("Activity cannot be null")
    }
}