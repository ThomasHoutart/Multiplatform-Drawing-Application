package com.android.example.drawhubmobile.adapters

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.android.example.drawhubmobile.uicontrollers.main.tutorial.TutorialFragment

const val N_TUTORIAL_PAGES = 20

class TutorialViewPagerAdapter(
    frag: FragmentActivity,
    private val closeButtonCallback: () -> Unit
) : FragmentStateAdapter(frag) {

    override fun getItemCount(): Int = N_TUTORIAL_PAGES

    override fun createFragment(position: Int): Fragment {
        return TutorialFragment(position, closeButtonCallback)
    }
}