package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.network.EmitterHandler

// Error

class InternalServerErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.INTERNAL_SERVER_ERROR, this)
    }
}

class NotLoggedInErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.NOT_LOGGED_IN_ERROR, this)
    }
}

class NoContentErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.NO_CONTENT_ERROR, this)
    }
}

class BadContentErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.BAD_CONTENT_ERROR, this)
    }
}

class PermissionErrorEvent: AbstractEvent() {
    override fun visit(es: EmitterHandler) {
        es.emitType(EventTypes.PERMISSION_ERROR, this)
    }
}