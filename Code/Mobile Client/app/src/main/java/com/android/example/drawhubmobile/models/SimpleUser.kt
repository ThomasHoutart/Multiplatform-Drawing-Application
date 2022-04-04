package com.android.example.drawhubmobile.models

import android.os.Parcel
import android.os.Parcelable

data class SimpleUser(val username: String, val avatar: Int): Parcelable {
    constructor(parcel: Parcel) : this(
        parcel.readString()!!,
        parcel.readInt()
    ) {
    }

    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(username)
        parcel.writeInt(avatar)
    }

    override fun describeContents(): Int {
        return 0
    }

    companion object CREATOR : Parcelable.Creator<SimpleUser> {
        override fun createFromParcel(parcel: Parcel): SimpleUser {
            return SimpleUser(parcel)
        }

        override fun newArray(size: Int): Array<SimpleUser?> {
            return arrayOfNulls(size)
        }
    }
}