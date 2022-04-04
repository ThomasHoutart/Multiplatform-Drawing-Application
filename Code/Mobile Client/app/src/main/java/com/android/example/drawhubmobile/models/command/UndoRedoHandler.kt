package com.android.example.drawhubmobile.models.command

import java.util.*

class UndoRedoHandler {
    companion object {
        private val doneCommand: Stack<Command> = Stack()
        private val undoneCommand: Stack<Command> = Stack()

        fun pushCommand(command: Command) {
            doneCommand.push(command)
            undoneCommand.clear()
        }

        fun undo() {
            if (doneCommand.empty()) return
            val mostRecentAction = doneCommand.pop()
            mostRecentAction?.reverse()
            mostRecentAction?.execute()
            undoneCommand.push(mostRecentAction)
        }

        fun redo() {
            if (undoneCommand.empty()) return
            val mostRecentAction = undoneCommand.pop()
            mostRecentAction?.reverse()
            mostRecentAction?.execute()
            doneCommand.push(mostRecentAction)
        }
    }
}