package com.android.example.drawhubmobile.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.GridLayout
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.RecyclerView
import com.android.example.drawhubmobile.R
import com.android.example.drawhubmobile.models.game.Player
import com.android.example.drawhubmobile.viewholders.ScoreItemViewHolder


class ScoresAdapter(private val playersSorted: List<Player>) :
    RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val view: View
        view = LayoutInflater.from(parent.context)
            .inflate(R.layout.score_item_view, parent, false) as ConstraintLayout
        return ScoreItemViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentPlayer = playersSorted[position]
        val playerHolder = holder as ScoreItemViewHolder
        playerHolder.setDetails(currentPlayer, position)
    }

    override fun getItemCount() = playersSorted.size
}