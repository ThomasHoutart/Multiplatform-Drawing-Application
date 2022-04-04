package com.android.example.drawhubmobile.models.drawing

import android.graphics.*
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

class CustomPathRect(val sharedId: Int, val coords: List<PointF>, val pathStrokeWidth: Float) {
    val rect: Rect

    init {
        var minX = Int.MAX_VALUE
        var maxX = Int.MIN_VALUE
        var minY = Int.MAX_VALUE
        var maxY = Int.MIN_VALUE
        val halfStrokeWidth = (pathStrokeWidth / 2.3).roundToInt()
        for (point in coords) {
            minX = min(point.x.toInt(), minX)
            maxX = max(point.x.toInt(), maxX)
            minY = min(point.y.toInt(), minY)
            maxY = max(point.y.toInt(), maxY)
        }
        rect = Rect(
            minX - halfStrokeWidth,
            minY - halfStrokeWidth,
            maxX + halfStrokeWidth,
            maxY + halfStrokeWidth
        )
    }
}

class CustomPath(private val id: Int, private val path: Path, private var paint: Paint) {

    // TODO: Add boolean addInnerRects to NOT calculate innerRects when Receiving
    private var stringPath: String = ""

    private val maxCoordLength = 20
    private val totalCoords: MutableList<PointF> = mutableListOf()
    private val currentCoords: MutableList<PointF> = mutableListOf()

    private val innerRects: MutableList<CustomPathRect> = mutableListOf()

    fun copy(id: Int = this.id, path: Path = this.path, paint: Paint = this.paint): CustomPath {
        val newCustomPath = CustomPath(id, Path(path), Paint(paint))
        for (rect in this.innerRects) {
            newCustomPath.innerRects.add(rect)
        }
        newCustomPath.stringPath = this.stringPath
        return newCustomPath
    }

    fun clear() {
        path.reset()
        currentCoords.clear()
        totalCoords.clear()
        innerRects.clear()
        stringPath = ""
    }

    fun getPath(): Path {
        return path
    }

    fun getStringPath(): String {
        return stringPath
    }

    fun getPaint(): Paint {
        return paint
    }

    fun getStrokeWidth(): Float {
        return paint.strokeWidth
    }

    fun addToPath(x: Float, y: Float) {
        if (path.isEmpty) {
            path.moveTo(x, y)
            path.lineTo(x, y)
        } else {
            path.lineTo(x, y)
        }
        currentCoords.add(PointF(x, y))
        totalCoords.add(PointF(x, y))
        if (currentCoords.size > maxCoordLength) {
            innerRects.add(
                CustomPathRect(
                    id,
                    currentCoords.toList(),
                    paint.strokeWidth
                )
            )
            currentCoords.clear()
        }
        stringPath += "$x $y "
    }

    fun endPath() {
        if (currentCoords.isNotEmpty()) {
            innerRects.add(
                CustomPathRect(
                    id,
                    currentCoords.toList(),
                    paint.strokeWidth
                )
            )
            currentCoords.clear()
        }
    }

    fun getInnerRects(): List<CustomPathRect> {
        return innerRects
    }

    fun scalePath(scaleFactor: Float) {
        val newCoords = mutableListOf<PointF>()
        for (coord in totalCoords)
            newCoords.add(PointF(coord.x * scaleFactor, coord.y * scaleFactor))

        clear()

        paint.strokeWidth = paint.strokeWidth * scaleFactor

        for (coord in newCoords) {
            addToPath(coord.x, coord.y)
        }

        endPath()
    }

    fun highlight() {
        paint.color = Color.YELLOW
    }
}