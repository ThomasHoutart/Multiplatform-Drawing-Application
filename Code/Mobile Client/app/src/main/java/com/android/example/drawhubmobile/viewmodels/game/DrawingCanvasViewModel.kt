package com.android.example.drawhubmobile.viewmodels.game

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import androidx.lifecycle.ViewModel
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.drawing.CustomPath
import com.android.example.drawhubmobile.models.drawing.Grid
import com.android.example.drawhubmobile.models.drawing.PathManager
import com.android.example.drawhubmobile.models.command.ActionType
import com.android.example.drawhubmobile.models.command.Command
import com.android.example.drawhubmobile.models.command.UndoRedoHandler
import com.android.example.drawhubmobile.models.drawing.Eraser
import com.android.example.drawhubmobile.models.drawing.Pencil
import com.android.example.drawhubmobile.models.drawing.Tool
import com.android.example.drawhubmobile.models.drawing.ToolType
import com.android.example.drawhubmobile.models.event.EventTypes
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.network.EventObserver
import com.android.example.drawhubmobile.views.DrawingCanvasView

class DrawingCanvasViewModel : ViewModel() {

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    private val pathManager: PathManager = PathManager()
    private val mPencil: Pencil = Pencil(pathManager)
    private val mEraser: Eraser = Eraser(pathManager)
    private var activeTool: Tool = mPencil

    private lateinit var mCanvas: Canvas
    private lateinit var mBitmap: Bitmap

    private val backgroundColor = Color.WHITE

    private val grid: Grid = Grid()
    val gridCellSize: Int
        get() = grid.cellSize
    val gridOpacity: Int
        get() = grid.opacity
    private var isGridActive: Boolean = false

    init {
        mEmitterHandler.subscribe(EventTypes.END_ROUND, EventObserver {
            isGridActive = false
        })
    }

    fun setNewCanvasSize(oldWidth: Int, oldHeight: Int) {
        if (::mBitmap.isInitialized) mBitmap.recycle()
        if(DrawingCanvasView.width == 0 || DrawingCanvasView.height == 0) return
        pathManager.sizeChangedFinish = false
        pathManager.rescalePaths(oldWidth, oldHeight)
        pathManager.sizeChangedFinish = true
        mBitmap = Bitmap.createBitmap(
            DrawingCanvasView.width,
            DrawingCanvasView.height,
            Bitmap.Config.ARGB_8888
        )
        mCanvas = Canvas(mBitmap)
        mCanvas.drawColor(backgroundColor)
    }

    fun drawPaths(canvas: Canvas) {
        // Clear the canvas
        mCanvas.drawColor(backgroundColor)
        // Draw the paths
        for (path in pathManager.getPaths()) {
            mCanvas.drawPath(path.getPath(), path.getPaint())
        }
        // Draw grid
        if (isGridActive) {
            val paths = grid.getPathGridPath()
            for (path in paths) {
                mCanvas.drawPath(path, grid.getPaint())
            }
        }
        // Draw the eraser if needed
        mCanvas.drawRect(activeTool.getRect(), Eraser.eraserPaint)
        // Redraw the bitmap
        canvas.drawBitmap(mBitmap, 0f, 0f, null)
    }

    fun setStrokeWidth(strokeWidth: Float) {
        activeTool.setStrokeWidth(strokeWidth)
    }

    fun setColor(color: Int) {
        mPencil.setColor(color)
    }

    fun setPencil() {
        activeTool = mPencil
    }

    fun setEraser() {
        activeTool = mEraser
    }

    fun getTool(): Tool {
        return activeTool
    }

    fun setGridActive() {
        isGridActive = !isGridActive
    }

    fun setGridCellSize(newValue: Int) {
        grid.setCellSize(newValue)
    }

    fun setGridOpacity(newValue: Int) {
        grid.setOpacity(newValue)
    }

    fun createCommandWithLastAction() {
        if (activeTool.type == ToolType.PENCIL && pathManager.getPath(pathManager.getPaths().size - 1) != null) {
            val index = pathManager.getPaths().size - 1
            val path = pathManager.getPath(index)?.copy()
            UndoRedoHandler.pushCommand(
                Command(
                    ActionType.APPEND,
                    mutableListOf(index),
                    mutableListOf(path!!),
                    pathManager
                )
            )
        }
    }

    fun addPathManagerObserver() {
        pathManager.addObservers()
    }

    fun removePathManagerObserver() {
        pathManager.removeObservers()
    }

    // Method to draw path with debugging info
    private fun drawDebugPath(path: CustomPath) {
        val paint = Paint().apply { strokeWidth = 5F; color = Color.RED }
        val halfSw = path.getStrokeWidth() / 2.3F
        val redPaintRect = Paint(Eraser.eraserPaint).apply { color = Color.RED }
        for (customRect in path.getInnerRects()) {
            mCanvas.drawRect(customRect.rect, redPaintRect)
            for (coord in customRect.coords) {
                mCanvas.drawPoint(coord.x, coord.y, paint)
                mCanvas.drawPoint(coord.x - halfSw, coord.y + halfSw, paint)
                mCanvas.drawPoint(coord.x + halfSw, coord.y + halfSw, paint)
                mCanvas.drawPoint(coord.x - halfSw, coord.y - halfSw, paint)
                mCanvas.drawPoint(coord.x + halfSw, coord.y - halfSw, paint)
            }
        }
    }

}