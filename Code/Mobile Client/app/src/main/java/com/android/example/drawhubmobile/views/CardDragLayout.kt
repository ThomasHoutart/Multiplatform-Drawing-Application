package com.android.example.drawhubmobile.views

import android.content.Context
import android.graphics.PointF
import android.graphics.Rect
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View
import android.widget.LinearLayout
import androidx.core.view.ViewCompat
import androidx.customview.widget.ViewDragHelper
import com.android.example.drawhubmobile.utils.CollisionDetector
import com.google.android.material.card.MaterialCardView
import kotlin.math.max
import kotlin.math.min


class CardDragLayout(context: Context?, attrs: AttributeSet?) :
    LinearLayout(context, attrs) {

    private lateinit var dragHelper: ViewDragHelper
    private var cardView: MaterialCardView? = null
    private var cardDragged: Boolean = false
    private var touchedCard: Boolean = false
    private val scaleGestureDetector = ScaleGestureDetector(
        context,
        object : ScaleGestureDetector.OnScaleGestureListener {
            override fun onScale(p0: ScaleGestureDetector?): Boolean {
                return false
            }

            override fun onScaleBegin(p0: ScaleGestureDetector?): Boolean {
                if (p0 == null) return false
                val card = cardView!!
                val cardViewRect = Rect(card.left, card.top, card.right, card.bottom)
                val eventPoint = PointF(p0.focusX, p0.focusY)
                val isInCard = CollisionDetector.pointRect(eventPoint, cardViewRect)
                if (isInCard) {
                    onCardClickedWithoutDragCallback()
                    return true
                }
                return false
            }

            override fun onScaleEnd(p0: ScaleGestureDetector?) {
                // Nothing to do
            }
        })


    private lateinit var onCardClickedWithoutDragCallback: () -> Unit

    private fun init() {
        dragHelper = ViewDragHelper.create(this, callback)
        // Set Boundary Touch Callback Activated
        val left = ViewDragHelper.EDGE_LEFT
        val top = ViewDragHelper.EDGE_TOP
        val right = ViewDragHelper.EDGE_RIGHT
        val bottom = ViewDragHelper.EDGE_BOTTOM
        dragHelper.setEdgeTrackingEnabled(left or top or right or bottom)
    }

    private val callback: ViewDragHelper.Callback = object : ViewDragHelper.Callback() {
        override fun tryCaptureView(child: View, pointerId: Int): Boolean {
            return child === cardView
        }

        override fun onViewPositionChanged(
            changedView: View,
            left: Int,
            top: Int,
            dx: Int,
            dy: Int
        ) {
        }

        override fun onViewCaptured(capturedChild: View, activePointerId: Int) {
            cardView?.isDragged = true
        }

        override fun onViewReleased(releasedChild: View, xvel: Float, yvel: Float) {
            cardView?.isDragged = false
        }

        override fun onEdgeLock(edgeFlags: Int): Boolean {
            return false
        }

        override fun getViewHorizontalDragRange(child: View): Int {
            return measuredWidth - child.measuredWidth
        }

        override fun getViewVerticalDragRange(child: View): Int {
            return measuredHeight - child.measuredHeight
        }

        override fun clampViewPositionVertical(child: View, top: Int, dy: Int): Int {
            // Limit the upper and lower boundaries of the view (based on the upper left corner coordinate point of the view)
            val topBound = paddingTop
            val bottomBound = height - child.height
            return min(max(top, topBound), bottomBound)
        }

        override fun clampViewPositionHorizontal(child: View, left: Int, dx: Int): Int {
            // Limit the left and right boundaries of the view (based on the upper left corner coordinate point of the view)
            val leftBound = paddingLeft
            val rightBound = width - child.width
            return min(max(left, leftBound), rightBound)
        }
    }

    override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
        return dragHelper.shouldInterceptTouchEvent(event)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val card = cardView!!
        val cardViewRect = Rect(card.left, card.top, card.right, card.bottom)
        val eventPoint = PointF(event.x, event.y)
        val isInCard = CollisionDetector.pointRect(eventPoint, cardViewRect)
        if (event.pointerCount > 1) {
            return scaleGestureDetector.onTouchEvent(event)
        }
        return when (event.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                if (isInCard) {
                    touchedCard = true
                    dragHelper.processTouchEvent(event)
                } else {
                    touchedCard = false
                }
                touchedCard
            }
            MotionEvent.ACTION_MOVE -> {
                if (touchedCard || isInCard) {
                    touchedCard = true
                    cardDragged = true
                    dragHelper.processTouchEvent(event)
                    true
                } else {
                    cardDragged = false
                    false
                }
            }
            else -> {
                touchedCard = false
                cardDragged = false
                false
            }
        }
    }

    override fun onFinishInflate() {
        super.onFinishInflate()
        cardView = getChildAt(0) as MaterialCardView
    }

    fun setOnCardClickCallback(cb: () -> Unit) {
        onCardClickedWithoutDragCallback = cb
    }

    private fun smoothToTop(view: View) {
        // Animation moves smoothly to the specified position
        if (dragHelper.smoothSlideViewTo(view, paddingLeft, paddingTop)) {
            ViewCompat.postInvalidateOnAnimation(this)
        }
    }

    private fun smoothToBottom(view: View) {
        // Animation moves smoothly to the specified position
        if (dragHelper.smoothSlideViewTo(view, paddingLeft, height - view.height)) {
            ViewCompat.postInvalidateOnAnimation(this)
        }
    }

    override fun computeScroll() {
        if (dragHelper.continueSettling(true)) {
            ViewCompat.postInvalidateOnAnimation(this)
        }
    }

    companion object {
        private const val TAG = "DragLayout"
    }

    init {
        init()
    }
}