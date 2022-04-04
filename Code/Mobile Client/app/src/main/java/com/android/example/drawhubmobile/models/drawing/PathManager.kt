package com.android.example.drawhubmobile.models.drawing

import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.event.*
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.utils.ColorConverter
import com.android.example.drawhubmobile.views.DrawingCanvasView


class PathManager {
    private var mPaths: MutableMap<Int, CustomPath> = mutableMapOf()
    private var currentID: Int = 0
    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler
    private var scaleFactor: Float = 0F
    private var lastSetUpCanvasSize = 0
    var sizeChangedFinish = true

    private val mSetPathObserver = EventObserver {
        val event = it as SetPathReceivedEvent

        val strPathArray = event.path.split(" ")
        val pathCoordArray = if (event.path.isNotBlank()) {
            strPathArray.slice(0 until strPathArray.size - 1).map { it.toFloat() }
        } else {
            listOf()
        }

        val strColor = event.color
        val pathId = event.pathId
        currentID = pathId

        scaleFactor = DrawingCanvasView.height / event.canvasSize.toFloat()
        lastSetUpCanvasSize = event.canvasSize
        val scaledStrokeWidth = event.strokeWidth * scaleFactor

        val paint = Paint().apply {
            color = Color.parseColor(strColor)
            strokeWidth = scaledStrokeWidth
            isAntiAlias = true
            isDither = true
            style = Paint.Style.STROKE
            strokeJoin = Paint.Join.ROUND
            strokeCap = Paint.Cap.ROUND
        }

        val customPath = CustomPath(pathId, Path(), paint)
        fillScaledCustomPath(customPath, pathCoordArray)
        // Checking if it's a new path
        mPaths[pathId] = customPath
        mEmitterHandler.emit(UpdateDrawingCanvasEvent())
    }

    private val mAppendToPathObserver = EventObserver {
        val event = it as AppendToPathReceivedEvent
        if (sizeChangedFinish) {
            mPaths[currentID]?.addToPath(event.x * scaleFactor, event.y * scaleFactor)
            mEmitterHandler.emit(UpdateDrawingCanvasEvent())
        }
    }

    init {
        /*mEmitterHandler.subscribe(EventTypes.END_ROUND, EventObserver {
            clear()
            mEmitterHandler.emit(UpdateDrawingCanvasEvent())
        })*/
        mEmitterHandler.subscribe(EventTypes.START_ROUND, EventObserver {
            clear()
            mEmitterHandler.emit(UpdateDrawingCanvasEvent())
        })
    }

    fun addObservers() {
        mEmitterHandler.subscribe(EventTypes.SET_PATH_RECEIVED, mSetPathObserver)
        mEmitterHandler.subscribe(EventTypes.APPEND_TO_PATH_RECEIVED, mAppendToPathObserver)
    }

    fun removeObservers() {
        mEmitterHandler.unsubscribe(EventTypes.SET_PATH_RECEIVED, mSetPathObserver)
        mEmitterHandler.unsubscribe(EventTypes.APPEND_TO_PATH_RECEIVED, mAppendToPathObserver)
    }

    fun clear() {
        mPaths = mutableMapOf()
    }

    fun startPath(x: Float, y: Float, paint: Paint) {
        val customPath = CustomPath(mPaths.size, Path(), paint)
        if (mPaths.isEmpty()) {
            mPaths[0] = customPath
            currentID = 0
        } else {
            currentID = mPaths.size
            mPaths[currentID] = customPath
        }
        val currentPath = mPaths[currentID]!!
        currentPath.addToPath(x, y)
        mEmitterHandler.emit(
            SetPathSendEvent(
                currentID,
                ColorConverter.colorToString(currentPath.getPaint().color),
                currentPath.getStrokeWidth(),
                currentPath.getStringPath(),
                DrawingCanvasView.width,
            )
        )
    }

    fun addToPath(x: Float, y: Float) {
        mPaths[currentID]?.addToPath(x, y)
        mEmitterHandler.emit(AppendToPathSendEvent(x, y))
    }

    fun endPath() {
        if (!mPaths.isEmpty())
            mPaths[currentID]!!.endPath()
    }

    fun getPaths(): List<CustomPath> {
        return mPaths.values.toList()
    }

    fun getPath(index: Int): CustomPath? {
        return mPaths[index]
    }

    fun addPath(newPath: CustomPath, index: Int) {
        mPaths[index] = newPath
    }

    fun getIntersectingRects(rect: Rect): List<CustomPathRect> {
        val pathList: MutableList<CustomPathRect> = mutableListOf()
        for (path in mPaths)
            for (pathRect in path.value.getInnerRects())
                if (Rect.intersects(pathRect.rect, rect))
                    pathList.add(pathRect)

        return pathList
    }

    fun removeCustomPathWithID(id: Int) {
        val toRemove = mPaths[id]
        toRemove?.clear()
        val color = toRemove?.getPaint()?.color ?: Color.BLACK
        val strokeWidth = toRemove?.getStrokeWidth() ?: 1F
        val stringPath = toRemove?.getStringPath() ?: ""
        mEmitterHandler.emit(
            SetPathSendEvent(
                id,
                ColorConverter.colorToString(color),
                strokeWidth,
                stringPath,
                DrawingCanvasView.height,
            )
        )
    }

    fun rescalePaths(oldWidth: Int, oldHeight: Int) {
        if (oldHeight == 0 || oldWidth == 0) return
        // Width == Height for the canvas
        val scaleFactor = DrawingCanvasView.height / oldHeight.toFloat()
        this.scaleFactor = DrawingCanvasView.height / lastSetUpCanvasSize.toFloat()
        if (scaleFactor == 1F) return
        val paths = mPaths
        for (path in paths) {
            path.value.scalePath(scaleFactor)
        }
    }

    private fun fillScaledCustomPath(
        customPath: CustomPath,
        coordinates: List<Float>
    ) {
        if (coordinates.size > 1) {
            // Set starting point
            val x0 = coordinates[0] * scaleFactor
            val y0 = coordinates[1] * scaleFactor
            customPath.addToPath(x0, y0)
            // Add lines
            var i = 2
            val maxIndex = coordinates.size
            while (i < maxIndex) {
                customPath.addToPath(
                    coordinates[i] * scaleFactor,
                    coordinates[i + 1] * scaleFactor
                )
                i += 2
            }
        }
    }
}