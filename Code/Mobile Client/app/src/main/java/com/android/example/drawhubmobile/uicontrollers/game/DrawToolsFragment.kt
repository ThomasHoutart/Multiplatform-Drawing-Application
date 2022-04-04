package com.android.example.drawhubmobile.uicontrollers.game

import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.graphics.alpha
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.databinding.FragmentDrawToolsBinding
import com.android.example.drawhubmobile.models.command.UndoRedoHandler
import com.android.example.drawhubmobile.models.event.UpdateDrawingCanvasEvent
import com.android.example.drawhubmobile.models.drawing.ToolType
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.viewmodels.game.DrawingCanvasViewModel
import com.larswerkman.holocolorpicker.ColorPicker
import com.larswerkman.holocolorpicker.OpacityBar
import com.larswerkman.holocolorpicker.SVBar

class DrawToolsFragment : Fragment() {

    private val viewModel: DrawingCanvasViewModel by activityViewModels()
    private lateinit var binding: FragmentDrawToolsBinding
    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = FragmentDrawToolsBinding.inflate(inflater, container, false)

        connectColorPicker()
        connectStrokeWidthSlider()
        connectToolButtons()
        connectUndoRedoButtons()
        setStrokeWidthSliderValues()

        return binding.root
    }

    private fun connectColorPicker() {
        val picker: ColorPicker = binding.colorPicker
        val svBar: SVBar = binding.svBar
        val opacityBar: OpacityBar = binding.opacityBar

        picker.addSVBar(svBar)
        picker.addOpacityBar(opacityBar)
        picker.color = viewModel.getTool().getColor() ?: Color.BLACK
        svBar.setValue(0F)

        picker.showOldCenterColor = false

        picker.setOnColorChangedListener { color ->
            viewModel.setColor(color)
        }

        opacityBar.setOnOpacityChangedListener { opacity ->
            val color = getColorWithOpacity(picker.color, opacity)
            viewModel.setColor(color)
        }
    }

    private fun connectStrokeWidthSlider() {
        binding.strokeWidthSlider.addOnChangeListener { _, value, _ ->
            viewModel.setStrokeWidth(value)
        }
    }

    private fun connectToolButtons() {
        binding.pencilButton.setOnClickListener {
            setTool(ToolType.PENCIL)
        }
        binding.eraserButton.setOnClickListener {
            setTool(ToolType.ERASER)
        }
    }

    private fun connectUndoRedoButtons() {
        binding.undoButton.setOnClickListener {
            UndoRedoHandler.undo()
            mEmitterHandler.emit(UpdateDrawingCanvasEvent())
        }

        binding.redoButton.setOnClickListener {
            UndoRedoHandler.redo()
            mEmitterHandler.emit(UpdateDrawingCanvasEvent())
        }
    }

    private fun getColorWithOpacity(color: Int, opacity: Int): Int {
        val col = Color.valueOf(color)
        val newColor = Color.valueOf(col.red(), col.green(), col.blue(), opacity / 255F)
        return newColor.toArgb()
    }

    private fun setToolButtonBackgroundTint(type: ToolType) {
        val isPencil = type == ToolType.PENCIL
        val colorAccent = requireContext().getColor(R.color.colorAccent)
        val colorText = requireContext().getColor(R.color.colorText)
        val pencilButtonColor = if (isPencil) colorAccent else colorText
        val eraserButtonColor = if (isPencil) colorText else colorAccent
        binding.pencilButton.backgroundTintList = ColorStateList.valueOf(pencilButtonColor)
        binding.eraserButton.backgroundTintList = ColorStateList.valueOf(eraserButtonColor)
    }

    private fun setTool(type: ToolType) {
        setToolButtonBackgroundTint(type)
        if (type == ToolType.PENCIL) {
            viewModel.setPencil()
        } else {
            viewModel.setEraser()
        }
        setStrokeWidthSliderValues()
    }

    private fun setStrokeWidthSliderValues() {
        val tool = viewModel.getTool()
        val minWidth = tool.minStrokeWidth
        val maxWidth = tool.maxStrokeWidth
        val value = tool.getStrokeWidth()
        binding.strokeWidthSlider.value = value
        binding.strokeWidthSlider.valueFrom = minWidth
        binding.strokeWidthSlider.valueTo = maxWidth
    }

    private fun setColorPickerValues() {
        val toolColor = viewModel.getTool().getColor()
        binding.colorPicker.color = toolColor ?: Color.BLACK
        if (toolColor != null) {
            binding.opacityBar.opacity = Color.valueOf(toolColor).toArgb().alpha
        } else {
            binding.opacityBar.opacity = Color.BLACK
        }
    }
}