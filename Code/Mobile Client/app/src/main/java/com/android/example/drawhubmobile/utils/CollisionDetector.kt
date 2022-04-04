package com.android.example.drawhubmobile.utils

import android.graphics.PointF
import android.graphics.Rect

object CollisionDetector {
    fun lineRect(
        p1: PointF,
        p2: PointF,
        strokeWidthLine: Float,
        rect: Rect,
        strokeWidthRect: Float
    ): Boolean {
        val rectTopLeft = PointF(rect.left.toFloat(), rect.top.toFloat())
        val rectTopRight = PointF(rect.right.toFloat(), rect.top.toFloat())
        val rectBottomRight = PointF(rect.right.toFloat(), rect.bottom.toFloat())
        val rectBottomLeft = PointF(rect.left.toFloat(), rect.bottom.toFloat())

        val line = Line(p1, p2, strokeWidthLine)
        val lines = line.getFourPerpendicularLines()
        lines.add(line)
        lines.addAll(line.getFourParallelLines())

        val leftLine = Line(rectTopLeft, rectBottomLeft, strokeWidthRect)
        val rightLine = Line(rectTopRight, rectBottomRight, strokeWidthRect)
        val topLine = Line(rectTopLeft, rectTopRight, strokeWidthRect)
        val bottomLine = Line(rectBottomLeft, rectBottomRight, strokeWidthRect)

        for(parallelOrPerpendicularLine in lines) {
            val left = areLinesColliding(parallelOrPerpendicularLine, leftLine)
            val right = areLinesColliding(parallelOrPerpendicularLine, rightLine)
            val top = areLinesColliding(parallelOrPerpendicularLine, topLine)
            val bottom = areLinesColliding(parallelOrPerpendicularLine, bottomLine)
            if (left || right || top || bottom)
                return true
        }
        return false
    }

    fun pointRect(
        p: PointF,
        rect: Rect
    ): Boolean {
        return !(p.x < rect.left || p.x > rect.right || p.y < rect.top || p.y > rect.bottom)
    }

    private fun areLinesColliding(lineA: Line, lineB: Line): Boolean {
        val p1 = lineA.p1
        val p2 = lineA.p2
        val p3 = lineB.p1
        val p4 = lineB.p2
        // calculate the direction of the lines
        val uA =
            ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y))
        val uB =
            ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y))

        // if uA and uB are between 0-1, lines are colliding
        if (uA in 0.0..1.0 && uB in 0.0..1.0) {
            return true
        }
        return false
    }

    private data class Line(val p1: PointF, val p2: PointF, val strokeWidth: Float) {
        fun getFourParallelLines(): MutableList<Line> {
            val lines = mutableListOf<Line>()
            val halfSW = strokeWidth / 2.3F
            val p1TopLeft = PointF(p1.x - halfSW, p1.y + halfSW)
            val p1TopRight = PointF(p1.x + halfSW, p1.y + halfSW)
            val p1BottomLeft = PointF(p1.x - halfSW, p1.y - halfSW)
            val p1BottomRight = PointF(p1.x + halfSW, p1.y - halfSW)
            val p2TopLeft = PointF(p2.x - halfSW, p2.y + halfSW)
            val p2TopRight = PointF(p2.x + halfSW, p2.y + halfSW)
            val p2BottomLeft = PointF(p2.x - halfSW, p2.y - halfSW)
            val p2BottomRight = PointF(p2.x + halfSW, p2.y - halfSW)

            lines.add(Line(p1TopLeft, p2TopLeft,0F))
            lines.add(Line(p1TopRight, p2TopRight,0F))
            lines.add(Line(p1BottomLeft, p2BottomLeft,0F))
            lines.add(Line(p1BottomRight, p2BottomRight,0F))

            return lines
        }

        fun getFourPerpendicularLines(): MutableList<Line> {
            val lines = mutableListOf<Line>()
            val halfSW = strokeWidth / 2.3F
            val p2TopLeft = PointF(p2.x - halfSW, p2.y + halfSW)
            val p2TopRight = PointF(p2.x + halfSW, p2.y + halfSW)
            val p2BottomLeft = PointF(p2.x - halfSW, p2.y - halfSW)
            val p2BottomRight = PointF(p2.x + halfSW, p2.y - halfSW)

            lines.add(Line(p2BottomRight, p2BottomLeft,0F))
            lines.add(Line(p2BottomLeft, p2TopLeft,0F))
            lines.add(Line(p2TopLeft, p2TopRight,0F))
            lines.add(Line(p2TopRight, p2BottomRight,0F))

            return lines
        }
    }
}