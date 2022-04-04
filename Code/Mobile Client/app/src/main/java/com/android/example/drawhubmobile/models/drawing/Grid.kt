package com.android.example.drawhubmobile.models.drawing

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import com.android.example.drawhubmobile.views.DrawingCanvasView

class Grid {

    private var mCellSize: Int = 100
    val cellSize: Int
        get() = mCellSize

    private var mPaint: Paint = Paint().apply {
        color = Color.BLACK
        strokeWidth = 2F
        isAntiAlias = true
        isDither = true
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
    }
    val opacity: Int
        get() = mPaint.alpha

    fun setOpacity(newValue: Int) {
        mPaint.alpha = newValue
    }

    fun setCellSize(newValue: Int) {
        mCellSize = newValue
    }

    fun getPathGridPath(): List<Path> {
        val nbOfColumns = DrawingCanvasView.width / mCellSize
        val nbOfRows = DrawingCanvasView.height / mCellSize
        val paths = mutableListOf<Path>()
        for (i in 1 until nbOfColumns + 1) {
            val newPath = Path()
            newPath.moveTo((i * mCellSize).toFloat(), 0F)
            newPath.lineTo((i * mCellSize).toFloat(), DrawingCanvasView.height.toFloat())
            paths.add(newPath)
        }
        for (y in 1 until nbOfRows + 1) {
            val newPath = Path()
            newPath.moveTo(0F, (y * mCellSize).toFloat())
            newPath.lineTo(DrawingCanvasView.width.toFloat(), (y * mCellSize).toFloat())
            paths.add(newPath)
        }
        return paths
    }

    fun getPaint(): Paint {
        return mPaint
    }
}