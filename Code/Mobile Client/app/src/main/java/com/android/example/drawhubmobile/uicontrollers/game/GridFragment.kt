package com.android.example.drawhubmobile.uicontrollers.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.android.example.drawhubmobile.databinding.FragmentGridBinding
import com.android.example.drawhubmobile.viewmodels.game.DrawingCanvasViewModel

class GridFragment : Fragment() {

    private val viewModel: DrawingCanvasViewModel by activityViewModels()
    private lateinit var binding: FragmentGridBinding

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentGridBinding.inflate(inflater, container, false)
        val parent = parentFragment as ArtistFragment

        binding.toggleGridButton.setOnClickListener {
            val currentVisibility = binding.gridOptionsLayout.visibility
            binding.gridOptionsLayout.visibility = when (currentVisibility) {
                View.GONE -> View.VISIBLE
                else -> View.GONE
            }
            parent.updateCanvas()
            viewModel.setGridActive()
        }

        binding.gridCellSizeSlider.addOnChangeListener { _, value, _ ->
            viewModel.setGridCellSize(value.toInt())
            parent.updateCanvas()
        }
        binding.gridCellSizeSlider.value = viewModel.gridCellSize.toFloat()

        binding.gridOpacitySlider.addOnChangeListener { _, value, _ ->
            viewModel.setGridOpacity(value.toInt())
            parent.updateCanvas()
        }
        binding.gridOpacitySlider.value = viewModel.gridOpacity.toFloat()

        return binding.root
    }
}