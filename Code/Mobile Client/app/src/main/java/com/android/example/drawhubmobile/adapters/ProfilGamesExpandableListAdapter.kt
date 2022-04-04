package com.android.example.drawhubmobile.adapters

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseExpandableListAdapter
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.GameForExpandableList
import com.android.example.drawhubmobile.utils.AvatarHandler

class ProfileGamesExpandableListAdapter(
    private val context: Context,
    private val title: List<String>,
    private val games: HashMap<String, GameForExpandableList>,
) : BaseExpandableListAdapter() {

    override fun getChild(listPosition: Int, expandedListPosition: Int): Any {
        return games[title[listPosition]]!!
    }

    override fun getChildId(listPosition: Int, expandedListPosition: Int): Long {
        return expandedListPosition.toLong()
    }

    override fun getChildView(
        listPosition: Int,
        expandedListPosition: Int,
        isLastChild: Boolean,
        convertView: View?,
        parent: ViewGroup
    ): View {
        var convertViewRef = convertView
        val gameInfo = getChild(listPosition, expandedListPosition) as GameForExpandableList
        val layoutInflater =
            this.context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        convertViewRef = layoutInflater.inflate(R.layout.list_item_game_statistics, null)
        // Stats
        convertViewRef!!.findViewById<TextView>(R.id.date).text =
            convertViewRef.resources.getString(R.string.date, gameInfo.date)
        convertViewRef.findViewById<TextView>(R.id.startTime).text =
            convertViewRef.resources.getString(R.string.start_time, gameInfo.startTime)
        convertViewRef.findViewById<TextView>(R.id.endTime).text =
            convertViewRef.resources.getString(R.string.end_time, gameInfo.endTime)
        // First
        if (gameInfo.first.avatar != -1 && gameInfo.first.score != -1) {
            convertViewRef.findViewById<TextView>(R.id.firstUsername).text =
                gameInfo.first.username
            convertViewRef.findViewById<ImageView>(R.id.firstAvatar)
                .setImageResource(AvatarHandler.getAvatarResIdFromInt(gameInfo.first.avatar))
            convertViewRef.findViewById<TextView>(R.id.firstScore).text =
                gameInfo.first.score.toString()
        }
        // Second
        if (gameInfo.second.avatar != -1 && gameInfo.second.score != -1) {
            convertViewRef.findViewById<TextView>(R.id.secondUsername).text =
                gameInfo.second.username
            convertViewRef.findViewById<ImageView>(R.id.secondAvatar)
                .setImageResource(AvatarHandler.getAvatarResIdFromInt(gameInfo.second.avatar))
            convertViewRef.findViewById<TextView>(R.id.secondScore).text =
                gameInfo.second.score.toString()
        }
        // Third
        if (gameInfo.third.avatar != -1 && gameInfo.third.score != -1) {
            convertViewRef.findViewById<TextView>(R.id.thirdUsername).text =
                gameInfo.third.username
            convertViewRef.findViewById<ImageView>(R.id.thirdAvatar)
                .setImageResource(AvatarHandler.getAvatarResIdFromInt(gameInfo.third.avatar))
            convertViewRef.findViewById<TextView>(R.id.thirdScore).text =
                gameInfo.third.score.toString()
        }
        return convertViewRef
    }

    override fun getChildrenCount(listPosition: Int): Int {
        return 1
    }

    override fun getGroup(listPosition: Int): Any {
        return title[listPosition]
    }

    override fun getGroupCount(): Int {
        return title.size
    }

    override fun getGroupId(listPosition: Int): Long {
        return listPosition.toLong()
    }

    override fun getGroupView(
        listPosition: Int,
        isExpanded: Boolean,
        convertView: View?,
        parent: ViewGroup
    ): View {
        var convertViewRef = convertView
        val listTitle = getGroup(listPosition) as String
        if (convertViewRef == null) {
            val layoutInflater =
                this.context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
            convertViewRef = layoutInflater.inflate(R.layout.list_group_game_statistics, null)

        }
        val titleTextView = convertViewRef!!.findViewById<TextView>(R.id.gameTitle)
        val gameModeAndDifficulty =
            convertViewRef.findViewById<TextView>(R.id.gameModeAndDifficulty)
        titleTextView.text = listTitle
        val gameInfo = games[title[listPosition]]!!
        gameModeAndDifficulty.text = convertViewRef.resources.getString(
            R.string.profile_game_mode_and_difficulty, gameInfo.gameMode, gameInfo.difficulty
        )
        if (isExpanded) {
            titleTextView.background = ContextCompat.getDrawable(context, R.color.colorAccent)
            gameModeAndDifficulty.background =
                ContextCompat.getDrawable(context, R.color.colorAccent)
        } else {
            titleTextView.background = ContextCompat.getDrawable(context, R.color.colorText)
            gameModeAndDifficulty.background = ContextCompat.getDrawable(context, R.color.colorText)
        }
        return convertViewRef
    }

    override fun hasStableIds(): Boolean {
        return false
    }

    override fun isChildSelectable(listPosition: Int, expandedListPosition: Int): Boolean {
        return true
    }
}