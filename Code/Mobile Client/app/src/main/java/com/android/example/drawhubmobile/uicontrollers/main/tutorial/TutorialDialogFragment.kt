package com.android.example.drawhubmobile.uicontrollers.main.tutorial

import ZoomOutPageTransformer
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import androidx.viewpager2.widget.ViewPager2
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.TutorialViewPagerAdapter
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator

class TutorialDialogFragment : DialogFragment() {

    private lateinit var viewPager: ViewPager2

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_tutorial_dialog, container)
        setViewPager2(view)
        return view
    }

    private fun setViewPager2(view: View) {
        viewPager = view.findViewById(R.id.tutorialPager)
        val tabLayout = view.findViewById<TabLayout>(R.id.tabLayout)
        val pagerAdapter = TutorialViewPagerAdapter(requireActivity()) { dismiss() }
        viewPager.adapter = pagerAdapter
        TabLayoutMediator(tabLayout, viewPager) { _, _ -> }.attach()
        viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                val layout = viewPager.layoutParams
                viewPager.layoutParams = layout
            }
        })
        viewPager.setPageTransformer(ZoomOutPageTransformer())
    }
}