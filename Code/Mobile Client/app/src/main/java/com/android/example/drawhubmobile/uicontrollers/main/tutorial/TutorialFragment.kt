package com.android.example.drawhubmobile.uicontrollers.main.tutorial

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.N_TUTORIAL_PAGES

class TutorialFragment(private val pageIndex: Int, private val closeButtonCallback: () -> Unit) :
    Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        return inflater.inflate(R.layout.fragment_tutorial, container)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val pageTitle = view.findViewById<TextView>(R.id.tutorialTitle)
        val description = view.findViewById<TextView>(R.id.tutorialText)
        val image = view.findViewById<ImageView>(R.id.tutorialImage)
        val button = view.findViewById<Button>(R.id.tutorialButton)

        button.setOnClickListener {
            closeButtonCallback()
        }

        when (pageIndex) {
            0 -> {
                pageTitle.text = getString(R.string.tutorial_page_1_title)
                description.text = getString(R.string.tutorial_page_1_text)
                image.setImageResource(R.drawable.tutorial_game_select)
            }
            1 -> {
                pageTitle.text = getString(R.string.tutorial_page_2_title)
                description.text = getString(R.string.tutorial_page_2_text)
                image.setImageResource(R.drawable.tutorial_game_select_game_mode)
            }
            2 -> {
                pageTitle.text = getString(R.string.tutorial_page_3_title)
                description.text = getString(R.string.tutorial_page_3_text)
                image.setImageResource(R.drawable.tutorial_game_select_difficulty)
            }
            3 -> {
                pageTitle.text = getString(R.string.tutorial_page_4_title)
                description.text = getString(R.string.tutorial_page_4_text)
                image.setImageResource(R.drawable.tutorial_game_select_lobby_choice)
            }
            4 -> {
                pageTitle.text = getString(R.string.tutorial_page_5_title)
                description.text = getString(R.string.tutorial_page_5_text)
                image.setImageResource(R.drawable.tutorial_game_select_actions)
            }
            5 -> {
                pageTitle.text = getString(R.string.tutorial_page_6_title)
                description.text = getString(R.string.tutorial_page_6_text)
                image.setImageResource(R.drawable.tutorial_lobby_leave)
            }
            6 -> {
                pageTitle.text = getString(R.string.tutorial_page_7_title)
                description.text = getString(R.string.tutorial_page_7_text)
                image.setImageResource(R.drawable.tutorial_lobby_chat)
            }
            7 -> {
                pageTitle.text = getString(R.string.tutorial_page_8_title)
                description.text = getString(R.string.tutorial_page_8_text)
                image.setImageResource(R.drawable.tutorial_lobby_player_list)
            }
            8 -> {
                pageTitle.text = getString(R.string.tutorial_page_9_title)
                description.text = getString(R.string.tutorial_page_9_text)
                image.setImageResource(R.drawable.tutorial_lobby_show_spectators)
            }
            9 -> {
                pageTitle.text = getString(R.string.tutorial_page_10_title)
                description.text = getString(R.string.tutorial_page_10_text)
                image.setImageResource(R.drawable.tutorial_lobby_add_bot)
            }
            10 -> {
                pageTitle.text = getString(R.string.tutorial_page_11_title)
                description.text = getString(R.string.tutorial_page_11_text)
                image.setImageResource(R.drawable.tutorial_lobby_start_game)
            }
            11 -> {
                pageTitle.text = getString(R.string.tutorial_page_12_title)
                description.text = getString(R.string.tutorial_page_12_text)
                image.setImageResource(R.drawable.tutorial_artist_timer)
            }
            12 -> {
                pageTitle.text = getString(R.string.tutorial_page_13_title)
                description.text = getString(R.string.tutorial_page_13_text)
                image.setImageResource(R.drawable.tutorial_artist_score)
            }
            13 -> {
                pageTitle.text = getString(R.string.tutorial_page_14_title)
                description.text = getString(R.string.tutorial_page_14_text)
                image.setImageResource(R.drawable.tutorial_artist_grid)
            }
            14 -> {
                pageTitle.text = getString(R.string.tutorial_page_15_title)
                description.text = getString(R.string.tutorial_page_15_text)
                image.setImageResource(R.drawable.tutorial_artist_word)
            }
            15 -> {
                pageTitle.text = getString(R.string.tutorial_page_16_title)
                description.text = getString(R.string.tutorial_page_16_text)
                image.setImageResource(R.drawable.tutorial_artist_tools)
            }
            16 -> {
                pageTitle.text = getString(R.string.tutorial_page_17_title)
                description.text = getString(R.string.tutorial_page_17_text)
                image.setImageResource(R.drawable.tutorial_artist_chat)
            }
            17 -> {
                pageTitle.text = getString(R.string.tutorial_page_18_title)
                description.text = getString(R.string.tutorial_page_18_text)
                image.setImageResource(R.drawable.tutorial_detective)
            }
            18 -> {
                pageTitle.text = getString(R.string.tutorial_page_19_title)
                description.text = getString(R.string.tutorial_page_19_text)
                image.setImageResource(R.drawable.tutorial_detective_chat)
            }
            19 -> {
                pageTitle.text = getString(R.string.tutorial_page_20_title)
                description.text = getString(R.string.tutorial_page_20_text)
                image.setImageResource(R.drawable.tutorial_access)
            }
            else -> {
                description.text = getString(R.string.pager_view_error)
                view.findViewById<ImageView>(R.id.tutorialImage)
                    .setImageResource(R.drawable.avatar_b_5)
            }
        }
        val isLastPage = pageIndex == N_TUTORIAL_PAGES - 1
        renameSkipButtonToClose(button, isLastPage)
    }

    private fun renameSkipButtonToClose(button: Button, isCloseButton: Boolean) {
        val closeText = requireContext().getText(R.string.close)
        val skipText = requireContext().getText(R.string.skip)
        button.text = if (isCloseButton) closeText else skipText
    }
}