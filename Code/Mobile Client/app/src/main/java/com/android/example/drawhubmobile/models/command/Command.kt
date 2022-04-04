package com.android.example.drawhubmobile.models.command

import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.models.drawing.CustomPath
import com.android.example.drawhubmobile.models.drawing.PathManager
import com.android.example.drawhubmobile.models.event.SetPathSendEvent
import com.android.example.drawhubmobile.network.EmitterHandler
import com.android.example.drawhubmobile.utils.ColorConverter
import com.android.example.drawhubmobile.views.DrawingCanvasView

class Command(private var action: ActionType,
              private val ids: MutableList<Int>,
              private var paths: MutableList<CustomPath>,
              private val pathManager: PathManager
) {

    private val mEmitterHandler: EmitterHandler = DrawHubApplication.emitterHandler

    fun execute() {
        if (action == ActionType.APPEND) {
            for((i, path) in paths.withIndex()) {
                // Add the path to be drawn
                pathManager.addPath(path, ids[i])
                // Send the path drawn to server
                mEmitterHandler.emit(SetPathSendEvent(
                    ids[i],
                    ColorConverter.colorToString(path.getPaint().color),
                    path.getStrokeWidth(),
                    path.getStringPath(),
                    DrawingCanvasView.width,
                ))
            }
        } else {
            paths.clear()
            for(id in ids) {
                val path = pathManager.getPath(id)!!
                // Keep path to maybe append them later
                paths.add(path.copy())
                // Remove
                pathManager.removeCustomPathWithID(id)
                // Send the erased path to server
                mEmitterHandler.emit(SetPathSendEvent(
                    id,
                    ColorConverter.colorToString(path.getPaint().color),
                    path.getStrokeWidth(),
                    "",
                    DrawingCanvasView.width,
                ))
            }
        }
    }

    fun reverse() {
        action = if (action == ActionType.APPEND) ActionType.REMOVE else ActionType.APPEND
    }
}

