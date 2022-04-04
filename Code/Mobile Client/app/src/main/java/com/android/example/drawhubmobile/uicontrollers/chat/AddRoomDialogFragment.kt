package com.android.example.drawhubmobile.uicontrollers.chat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.activityViewModels
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentAddRoomDialogBinding
import com.android.example.drawhubmobile.viewmodels.chat.AddRoomDialogViewModel

class AddRoomDialogFragment : DialogFragment() {

    private lateinit var binding: FragmentAddRoomDialogBinding

    // NEEDS TO BE viewModels AND NOT activityViewModels TO WORK
    private val viewModel: AddRoomDialogViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.subscribe()
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentAddRoomDialogBinding.inflate(inflater, container, false)
        viewModel.rooms.observe(viewLifecycleOwner, Observer { rooms ->
            val roomsNames = rooms.map { room -> room.name }
            val listItemId = android.R.layout.simple_list_item_1
            val adapter = ArrayAdapter(requireContext(), listItemId, roomsNames)
            binding.roomListView.adapter = adapter
        })

        binding.roomListView.setOnItemClickListener { _, _, position, _ ->
            viewModel.selectRoomAtIndex(position)
            changeButtonText()
        }

        binding.actionButton.setOnClickListener {
            val isRoomNameEmpty = viewModel.roomName.value!!.trim().isEmpty()
            val isItemSelected = viewModel.selectedRoom != null
            if (!isRoomNameEmpty || isItemSelected) {
                if (viewModel.shouldCreateRoom()) {
                    sendOnCreateRoomEvent()
                } else {
                    sendOnJoinRoomEvent()
                }
                //viewModel.unsubscribeObservers()
                dismiss()
            }
        }

        binding.cancelButton.setOnClickListener {
            dialog?.cancel()
        }

        viewModel.roomName.observe(viewLifecycleOwner, Observer {
            viewModel.updateRoomList()
            changeButtonText()
        })

        binding.lifecycleOwner = viewLifecycleOwner
        binding.viewModel = viewModel

        return binding.root
    }

    interface JoinRoomDialogListener {
        fun onDialogCreateRoomClick(roomName: String)
        fun onDialogJoinRoomClick(roomName: String)
    }

    private fun changeButtonText() {
        if (viewModel.shouldCreateRoom()) {
            binding.actionButton.text = getString(R.string.createLabel)
        } else {
            binding.actionButton.text = getString(R.string.joinLabel)
        }
    }

    private fun sendOnCreateRoomEvent() {
        val listener: JoinRoomDialogListener = targetFragment as JoinRoomDialogListener
        val correctedValue = viewModel.roomName.value!!.trim()
        listener.onDialogCreateRoomClick(correctedValue)
    }

    private fun sendOnJoinRoomEvent() {
        val listener: JoinRoomDialogListener = targetFragment as JoinRoomDialogListener
        val selected = viewModel.selectedRoom!!
        listener.onDialogJoinRoomClick(selected.name)
    }

}