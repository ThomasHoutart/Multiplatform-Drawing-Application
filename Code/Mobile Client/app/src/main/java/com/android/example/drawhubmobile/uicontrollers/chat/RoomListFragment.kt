package com.android.example.drawhubmobile.uicontrollers.chat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.ChatRoomsAdapter
import com.android.example.drawhubmobile.databinding.FragmentRoomListBinding
import com.android.example.drawhubmobile.models.ChatRoom
import com.android.example.drawhubmobile.network.MAX_JOINED_ROOMS
import com.android.example.drawhubmobile.viewmodels.chat.RoomListViewModel

class RoomListFragment : Fragment(), AddRoomDialogFragment.JoinRoomDialogListener {

    private lateinit var binding: FragmentRoomListBinding

    private lateinit var roomsRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    // NEEDS TO BE viewModels AND NOT activityViewModels TO WORK
    private val viewModel: RoomListViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.roomsLiveData.observe(this, { joined ->
            val joinedRoomsText = "(${joined.size}/$MAX_JOINED_ROOMS)"
            binding.joinedRooms.text = joinedRoomsText
            initializeRecyclerView(joined)
        }
        )
        viewModel.getChatMessageHandlerLiveData().observe(this, { maxReached ->
            binding.addRoomButton.isClickable = !maxReached
            binding.canAdd = !maxReached
        })
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentRoomListBinding.inflate(inflater, container, false)
        binding.backButton.setOnClickListener {
            findNavController().navigate(R.id.action_roomListFragment_to_chatFragment)
        }

        viewModel.checkJoinedRoomsCount()

        binding.addRoomButton.setOnClickListener { openJoinRoomDialog() }
        binding.markAllAsReadButton.setOnClickListener { viewModel.readAllUnread() }
        initializeRecyclerView(viewModel.roomsLiveData.value!!)
        return binding.root
    }

    private fun initializeRecyclerView(rooms: List<ChatRoom>) {
        recyclerViewManager = LinearLayoutManager(activity)
        recyclerViewAdapter = ChatRoomsAdapter(
            rooms,
            { onListItemClick(it) },
            { onListItemDeleteClick(it) },
            { onListItemLeaveClick(it) })

        roomsRecyclerView = binding.roomsView.apply {
            setHasFixedSize(true)
            layoutManager = recyclerViewManager
            adapter = recyclerViewAdapter
        }
        roomsRecyclerView.scrollToPosition(rooms.size - 1)
    }

    private fun onListItemClick(room: ChatRoom) {
        viewModel.setActiveRoom(room)
        findNavController().navigate(R.id.action_roomListFragment_to_chatFragment)
    }

    private fun onListItemDeleteClick(room: ChatRoom) {
        val dialog = DeleteRoomDialogFragment(room.name) {
            viewModel.deleteRoom(room.name)
        }
        dialog.show(parentFragmentManager, "DeleteRoomDialogFragment")
    }

    private fun onListItemLeaveClick(room: ChatRoom) {
        val dialog = LeaveRoomDialogFragment(room.name) {
            viewModel.leaveRoom(room.name)
        }
        dialog.show(parentFragmentManager, "LeaveRoomDialogFragment")
    }

    private fun openJoinRoomDialog() {
        val dialog = AddRoomDialogFragment()
        dialog.setTargetFragment(this, 300)
        dialog.show(parentFragmentManager, "JoinRoomDialogFragment")
    }

    override fun onDialogCreateRoomClick(roomName: String) {
        viewModel.createRoom(roomName)
    }

    override fun onDialogJoinRoomClick(roomName: String) {
        viewModel.joinRoom(roomName)
    }
}
