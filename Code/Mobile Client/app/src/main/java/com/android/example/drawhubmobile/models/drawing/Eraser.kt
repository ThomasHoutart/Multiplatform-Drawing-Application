package com.android.example.drawhubmobile.models.drawing

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import com.android.example.drawhubmobile.models.command.ActionType
import com.android.example.drawhubmobile.models.command.Command
import com.android.example.drawhubmobile.models.command.UndoRedoHandler
import com.android.example.drawhubmobile.utils.CollisionDetector

class Eraser(pathManager: PathManager) : Tool(pathManager) {

    override val type = ToolType.ERASER
    override val minStrokeWidth = 10F
    override val maxStrokeWidth = 200F
    override val defaultStrokeWidth: Float
        get() = 50F

    override var mStrokeWidth: Float = defaultStrokeWidth
    private var eraserRect: Rect = Rect()

    private var pathsToUndoRedo = mutableListOf<CustomPath>()
    private var idToUndoRedo = mutableListOf<Int>()

    companion object {
        val eraserPaint = Paint().apply {
            color = Color.BLACK
            isAntiAlias = true
            isDither = true
            style = Paint.Style.STROKE
            strokeWidth = 1F
        }
    }

    override fun onTouchDown(x: Float, y: Float) {
        pathsToUndoRedo = mutableListOf()
        idToUndoRedo = mutableListOf()
        makeEraserRect(x, y)
        doErase()
    }

    override fun onTouchMove(x: Float, y: Float) {
        makeEraserRect(x, y)
        doErase()
    }

    override fun onTouchUp(x: Float, y: Float) {
        eraserRect = Rect()
        if(pathsToUndoRedo.isNotEmpty()) {
            UndoRedoHandler.pushCommand(Command(ActionType.REMOVE, idToUndoRedo, pathsToUndoRedo, mPathManager))
        }
    }

    override fun getRect(): Rect {
        return eraserRect
    }

    override fun getColor(): Int? {
        return null
    }

    override fun setColor(newValue: Int) {
        // Nothing to do
    }

    private fun makeEraserRect(x: Float, y: Float) {
        eraserRect = Rect(
            (x - getStrokeWidth() / 2).toInt(), // Left
            (y - getStrokeWidth() / 2).toInt(), // Top
            (x + getStrokeWidth() / 2).toInt(), // Right
            (y + getStrokeWidth() / 2).toInt()  // Bottom
        )
    }

    private fun doErase() {
        val rects = mPathManager.getIntersectingRects(eraserRect)
        for (rect in rects) {

            if (idToUndoRedo.contains(rect.sharedId))
                continue

            val coords = rect.coords
            val pathSw = rect.pathStrokeWidth
            val coordsLength = coords.size

            if (coordsLength == 1) {
                removePathFromDrawing(rect.sharedId)
            }

            for (i in 1 until coordsLength) {
                val p1 = coords[i - 1]
                val p2 = coords[i]
                if (CollisionDetector.lineRect(p1, p2, pathSw, eraserRect, eraserPaint.strokeWidth)) {
                    removePathFromDrawing(rect.sharedId)
                    break
                }
            }
        }
    }

    private fun removePathFromDrawing(id: Int) {
        pathsToUndoRedo.add(mPathManager.getPath(id)!!.copy())
        idToUndoRedo.add(id)
        mPathManager.removeCustomPathWithID(id)
    }

}