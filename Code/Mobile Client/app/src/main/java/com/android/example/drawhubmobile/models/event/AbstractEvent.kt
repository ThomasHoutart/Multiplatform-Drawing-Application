package com.android.example.drawhubmobile.models.event

import com.android.example.drawhubmobile.network.EmitterHandler

abstract class AbstractEvent {
    open fun visit(es: EmitterHandler) {
    }
}