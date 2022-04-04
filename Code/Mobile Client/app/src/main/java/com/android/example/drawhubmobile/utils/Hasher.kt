package com.android.example.drawhubmobile.utils

import java.security.MessageDigest

class Hasher {
    companion object{
        fun hash(input: String): String {
            return input.sha256()
        }

        private fun String.sha256(): String {
            return hashString(this, "SHA-256")
        }

        private fun hashString(input: String, algorithm: String): String {
            return stringify(MessageDigest
                .getInstance(algorithm)
                .digest(input.toByteArray()).toUByteArray())
        }

        private fun stringify(arr: UByteArray): String {
            var str = ""
            arr.forEach { e ->
                str += "$e,"
            }
            return str.slice(0 until str.length - 1)
        }
    }
}
