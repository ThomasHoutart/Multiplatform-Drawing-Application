package com.android.example.drawhubmobile.uicontrollers.main.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.android.example.drawhubmobile.DrawHubApplication
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.adapters.ProfileGamesExpandableListAdapter
import com.android.example.drawhubmobile.databinding.FragmentProfileBinding
import com.android.example.drawhubmobile.uicontrollers.main.MainActivity
import com.android.example.drawhubmobile.uicontrollers.main.tutorial.TutorialDialogFragment
import com.android.example.drawhubmobile.utils.AvatarHandler
import com.android.example.drawhubmobile.viewmodels.main.ProfileViewModel

class ProfileFragment : Fragment() {

    private val viewModel: ProfileViewModel by activityViewModels()

    private lateinit var binding: FragmentProfileBinding

    private lateinit var gamesExpandableListAdapter: ProfileGamesExpandableListAdapter
    private lateinit var gamesExpandableListView: ProfileExpandableListView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setProfileInfoObserver()

    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        viewModel.getProfileInfo()
        binding = FragmentProfileBinding.inflate(inflater, container, false)
        setLogoutOnClickListener()
        setUserAvatar()
        binding.tutorialButton.setOnClickListener { showTutorial() }
        return binding.root
    }

    private fun initialiseGamesExpandableListView() {
        gamesExpandableListView = binding.gamesExpandableListView
        gamesExpandableListAdapter = ProfileGamesExpandableListAdapter(
            requireContext(),
            viewModel.titles,
            viewModel.games
        )
        gamesExpandableListView.setAdapter(gamesExpandableListAdapter)
        // Set height
        val params = gamesExpandableListView.layoutParams
        //params.height = 400
        gamesExpandableListView.layoutParams = params
    }

    private fun setUserAvatar() {
        val avatarInt = DrawHubApplication.currentUser.avatar
        val avatarResId = AvatarHandler.getAvatarResIdFromInt(avatarInt)
        binding.avatar.setImageResource(avatarResId)
    }

    private fun setProfileInfoObserver() {
        viewModel.receiveInfo.observe(this, {
            setUsernameDetail()
            setGeneralStatistics()
            initialiseGamesExpandableListView()
            setConnectionDetail()
        })
    }

    private fun showTutorial() {
        val dialog = TutorialDialogFragment()
        dialog.show(parentFragmentManager, "TutorialDialogFragment")
    }

    private fun setLogoutOnClickListener() {
        binding.logoutButton.setOnClickListener {
            val act = activity as MainActivity
            act.doLogout()
        }
    }

    private fun setGeneralStatistics() {
        binding.AverageGameTime.text =
            getString(R.string.average_game_time, viewModel.getAverageGameTime())
        binding.gamesPlayed.text =
            getString(R.string.games_played, viewModel.gamesPlayed.toString())
        binding.winRate.text =
            getString(R.string.win_rate, viewModel.getWinRate())
        binding.totalGameTime.text =
            getString(R.string.total_game_time, viewModel.getTotalGameTime())
    }

    private fun setConnectionDetail() {
        binding.loginList.text = viewModel.logins
        binding.logoutList.text = viewModel.logouts
        binding.connectionDurationList.text = viewModel.connectionDurations
    }

    private fun setUsernameDetail() {
        binding.username.text = DrawHubApplication.currentUser.username
        binding.firstnameLastname.text = getString(
            R.string.first_and_last_name,
            DrawHubApplication.currentUser.firstName,
            DrawHubApplication.currentUser.lastName
        )
    }
}