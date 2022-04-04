package com.android.example.drawhubmobile.models.drawing

import android.graphics.Rect

abstract class Tool(protected val mPathManager: PathManager) {

    abstract val type: ToolType
    abstract val minStrokeWidth: Float
    abstract val maxStrokeWidth: Float
    protected abstract val defaultStrokeWidth: Float
    protected abstract var mStrokeWidth: Float

    open fun setStrokeWidth(value: Float) {
        mStrokeWidth = getStrokeWidthConstrained(value)
    }

    fun getStrokeWidth() = mStrokeWidth

    private fun getStrokeWidthConstrained(sw: Float): Float {
        if (sw < minStrokeWidth)
            return minStrokeWidth
        if (sw > maxStrokeWidth)
            return maxStrokeWidth
        return sw
    }

    abstract fun onTouchDown(x: Float, y: Float)
    abstract fun onTouchMove(x: Float, y: Float)
    abstract fun onTouchUp(x: Float, y: Float)
    abstract fun getRect(): Rect
    abstract fun getColor(): Int?
    abstract fun setColor(newValue: Int)
}