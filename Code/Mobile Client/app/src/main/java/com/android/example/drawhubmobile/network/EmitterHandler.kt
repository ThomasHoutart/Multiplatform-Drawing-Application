package com.android.example.drawhubmobile.network

import com.android.example.drawhubmobile.models.event.AbstractEvent
import com.android.example.drawhubmobile.models.event.EventTypes

class EmitterHandler {
    private val emitters = HashMap<EventTypes, EventEmitter>()

    fun emitType(evType: EventTypes, ev: AbstractEvent) {
        emitters[evType]?.emit(ev)
    }

    fun emit(ev: AbstractEvent) {
        ev.visit(this)
        //println(ev.javaClass)
    }

    fun subscribe(evType: EventTypes, obv: EventObserver) {
        if (!emitters.containsKey(evType))
            emitters[evType] = EventEmitter()
        emitters[evType]?.subscribe(obv)
    }

    fun unsubscribe(evType: EventTypes, obv: EventObserver) {
        emitters[evType]?.unsubscribe(obv)
    }
}

class EventEmitter {
    private val subscribers = mutableListOf<EventObserver>()

    fun emit(ev: AbstractEvent) {
        // put in a array to avoid concurrent modifications
        val arrayOfSubscriber = subscribers.toTypedArray()
        for(subscriber in arrayOfSubscriber) {
            subscriber.notify(ev)
        }
    }

    fun subscribe(obv: EventObserver) {
        if (!subscribers.contains(obv))
            subscribers.add(obv)
    }

    fun unsubscribe(obv: EventObserver) {
        val i = subscribers.indexOf(obv)
        if (i >= 0)
            subscribers.removeAt(i)
    }
}

class EventObserver(val lambda: (AbstractEvent) -> Unit) {
    fun notify(ev: AbstractEvent) {
        lambda(ev)
    }
}