package com.android.example.drawhubmobile.uicontrollers.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.ScoresAdapter
import com.android.example.drawhubmobile.databinding.FragmentRoundEndDialogBinding
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel


class RoundEndDialogFragment(private val viewModel: GameViewModel) : DialogFragment() {

    private lateinit var binding: FragmentRoundEndDialogBinding

    private lateinit var roomsRecyclerView: RecyclerView
    private lateinit var recyclerViewAdapter: RecyclerView.Adapter<*>
    private lateinit var recyclerViewManager: RecyclerView.LayoutManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        isCancelable = false
        binding = FragmentRoundEndDialogBinding.inflate(inflater, container, false)
        binding.dialogTitle.text =
            getString(R.string.round_end_word_to_draw, viewModel.wordToDraw.value)
        binding.quitGameButton.setOnClickListener { quitGame() }

        viewModel.players.observe(this, {
            initializeRecyclerView(it)
        })

        viewModel.gameEndEvent.observe(this, {
            binding.dialogTitle.text =
                getString(R.string.game_end_word_to_draw, viewModel.wordToDraw.value)
            binding.nextRoundText.visibility = View.GONE
            binding.quitGameButton.visibility = View.VISIBLE
        })
        (requireActivity() as GameActivity).emitParticles()

        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        (requireActivity() as GameActivity).stopParticles()
    }

    private fun initializeRecyclerView(players: List<Player>) {
        recyclerViewManager = LinearLayoutManager(activity)
        recyclerViewAdapter = ScoresAdapter(players)

        roomsRecyclerView = binding.scoresView.apply {
            setHasFixedSize(true)
            layoutManager = recyclerViewManager
            adapter = recyclerViewAdapter
        }
    }

    interface QuitGameDialogListener {
        fun onDialogQuitGameClick()
    }

    private fun quitGame() {
        val listener = context as QuitGameDialogListener
        listener.onDialogQuitGameClick()
        dismiss()
    }
}