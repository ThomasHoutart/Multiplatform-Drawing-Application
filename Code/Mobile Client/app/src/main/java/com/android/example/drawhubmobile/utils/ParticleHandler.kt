package com.android.example.drawhubmobile.utils

import android.annotation.SuppressLint
import android.view.View
import android.view.animation.AccelerateInterpolator
import androidx.fragment.app.FragmentActivity
import com.android.example.drawhubmobile.R
import com.plattysoft.leonids.ParticleSystem
import com.plattysoft.leonids.modifiers.ScaleModifier

object ParticleHandler {

    fun emitLoginParticle(activity: FragmentActivity, emitter: View) {
        ParticleSystem(activity, 1, R.drawable.particle_circle, 5000)
            .setSpeedRange(0.05f, 0.1f)
            .setScaleRange(1f, 3f)
            .setFadeOut(4000)
            .addModifier(ScaleModifier(0f, 4f, 0, 10000))
            .oneShot(emitter, 1)
    }

    @SuppressLint("UseCompatLoadingForDrawables")
    fun getRoundEndDialogEmitter(activity: FragmentActivity, isLeft: Boolean): ParticleSystem {
        val vxMin = if (isLeft) 0.01f else -0.05f
        val vxMax = if (isLeft) 0.05f else -0.01f
        val star = R.drawable.particle_star
        return ParticleSystem(activity, 200, star, 3000)
            .setAcceleration(0.00003f, 90)
            .setSpeedByComponentsRange(vxMin, vxMax, 0.05f, -0.1f)
            .setFadeOut(500, AccelerateInterpolator())
            .setScaleRange(0.01f, 0.2f)
            .setInitialRotationRange(0, 360)
            .setRotationSpeed(120f)
    }
}