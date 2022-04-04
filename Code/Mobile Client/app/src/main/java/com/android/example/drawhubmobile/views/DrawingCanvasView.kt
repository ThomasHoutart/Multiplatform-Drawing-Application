package com.android.example.drawhubmobile.views

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.viewmodels.game.DrawingCanvasViewModel
import com.android.example.drawhubmobile.viewmodels.game.GameViewModel
import kotlin.math.abs

class DrawingCanvasView(context: Context, attrs: AttributeSet) : View(context, attrs) {

    private var viewModel: DrawingCanvasViewModel =
        ViewModelProvider(context as ViewModelStoreOwner).get(DrawingCanvasViewModel::class.java)

    private val gameViewModel: GameViewModel =
        ViewModelProvider(context as ViewModelStoreOwner).get(GameViewModel::class.java)

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    /**
     * Don't draw every single pixel.
     * If the finger has has moved less than this distance, don't draw. scaledTouchSlop, returns
     * the distance in pixels a touch can wander before we think the user is scrolling.
     */
    private val touchTolerance = 5F

    private var currentX = 0f
    private var currentY = 0f

    companion object {
        var width: Int =
            DrawHubApplication.ctx!!.resources.getDimension(R.dimen.canvas_size).toInt()
        var height: Int =
            DrawHubApplication.ctx!!.resources.getDimension(R.dimen.canvas_size).toInt()
    }

    override fun onFinishInflate() {
        super.onFinishInflate()
        mEmitterHandler.subscribe(EventTypes.UPDATE_DRAWING_CANVAS, EventObserver {
            invalidate()
        })
    }

    override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
        super.onSizeChanged(width, height, oldWidth, oldHeight)
        val prevWidth = DrawingCanvasView.width
        val prevHeight = DrawingCanvasView.height
        DrawingCanvasView.width = width
        DrawingCanvasView.height = height
        viewModel.setNewCanvasSize(prevWidth, prevHeight)
    }

    override fun onDraw(canvas: Canvas) {
        viewModel.drawPaths(canvas)
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (!gameViewModel.isSpectator && !gameViewModel.dialogIsDisplayed.value!!) {
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN -> touchDown(event)
                MotionEvent.ACTION_MOVE -> touchMove(event)
                MotionEvent.ACTION_UP -> touchUp(event)
            }
        }
        return true
    }

    private fun touchDown(event: MotionEvent) {
        if (gameViewModel.isArtist.value == true) {
            viewModel.getTool().onTouchDown(event.x, event.y)
            invalidate()
        }
    }

    private fun touchMove(event: MotionEvent) {
        if (gameViewModel.isArtist.value == true) {
            val dx = abs(event.x - currentX)
            val dy = abs(event.y - currentY)
            // Waiting for a minimum of movement
            if (dx >= touchTolerance || dy >= touchTolerance) {
                viewModel.getTool().onTouchMove(event.x, event.y)

                currentX = event.x
                currentY = event.y
            }
            // calls onDraw
            invalidate()
        }
    }

    private fun touchUp(event: MotionEvent) {
        if (gameViewModel.isArtist.value == true) {
            viewModel.getTool().onTouchUp(event.x, event.y)
            viewModel.createCommandWithLastAction()
            invalidate()
        }
    }
}


