package com.android.example.drawhubmobile.uicontrollers.main.gameSelect

import android.content.Context
import android.content.res.TypedArray
import android.os.Bundle
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Observer
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentGameModeItemBinding
import com.android.example.drawhubmobile.models.game.GameMode
import com.android.example.drawhubmobile.viewmodels.main.GameSelectViewModel

class GameModeItemFragment : Fragment() {

    private val viewModel by activityViewModels<GameSelectViewModel>()
    private lateinit var binding: FragmentGameModeItemBinding
    private lateinit var gameMode: GameMode
    private var gameModeName = ""
    private var gameModeDescription = ""

    override fun onInflate(context: Context, attrs: AttributeSet, savedInstanceState: Bundle?) {
        super.onInflate(context, attrs, savedInstanceState)
        val a: TypedArray = context.obtainStyledAttributes(attrs, R.styleable.GameModeItemFragment)
        gameModeName = a.getString(R.styleable.GameModeItemFragment_modeName) ?: "Undefined"
        gameModeDescription =
            a.getString(R.styleable.GameModeItemFragment_modeDescription) ?: "Empty Description"
        gameMode = GameMode.values()[a.getInt(R.styleable.GameModeItemFragment_gameMode, 0)]
        a.recycle()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentGameModeItemBinding.inflate(inflater, container, false)
        binding.backgroundCard.setOnClickListener {
            if (viewModel.gameMode.value != gameMode) {
                viewModel.gameMode.value = gameMode
                viewModel.filterLobbiesAndGames()
            }
        }

        viewModel.gameMode.observe(viewLifecycleOwner, Observer {
            if (it == gameMode) {
                highlight()
            } else {
                clearHighlight()
            }
        })

        binding.modeDescription = gameModeDescription
        binding.modeName = gameModeName

        return binding.root
    }

    private fun highlight() {
        binding.backgroundCard.strokeWidth = 4
        binding.highlightedView.visibility = View.VISIBLE
        binding.nonHighlightedView.visibility = View.GONE
        binding.root.requestLayout()
    }

    private fun clearHighlight() {
        binding.backgroundCard.strokeWidth = 0
        binding.highlightedView.visibility = View.GONE
        binding.nonHighlightedView.visibility = View.VISIBLE
        binding.root.requestLayout()
    }
}