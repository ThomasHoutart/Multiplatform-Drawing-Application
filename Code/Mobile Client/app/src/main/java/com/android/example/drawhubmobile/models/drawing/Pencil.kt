package com.android.example.drawhubmobile.models.drawing

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect

class Pencil(pathManager: PathManager) : Tool(pathManager) {

    override val type = ToolType.PENCIL
    override val minStrokeWidth = 1F
    override val maxStrokeWidth = 100F
    override val defaultStrokeWidth: Float
        get() = 10F

    override var mStrokeWidth: Float = defaultStrokeWidth
    private var paint = Paint().apply {
        color = Color.BLACK
        isAntiAlias = true
        isDither = true
        style = Paint.Style.STROKE
        strokeJoin = Paint.Join.ROUND
        strokeCap = Paint.Cap.ROUND
        strokeWidth = 12F
    }

    override fun onTouchDown(x: Float, y: Float) {
        mPathManager.startPath(x, y, Paint(paint))
    }

    override fun onTouchMove(x: Float, y: Float) {
        mPathManager.addToPath(x, y)
    }

    override fun onTouchUp(x: Float, y: Float) {
        mPathManager.endPath()
    }

    override fun getRect(): Rect {
        return Rect()
    }

    override fun getColor(): Int? {
        return paint.color
    }

    override fun setStrokeWidth(value: Float) {
        super.setStrokeWidth(value)
        paint.strokeWidth = value
    }

    override fun setColor(newValue: Int) {
        paint.color = newValue
    }
}