import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { GeneralStats } from 'src/interface/profileInfo';

@Component({
    selector: 'app-general-stats',
    templateUrl: './general-stats.component.html',
    styleUrls: ['./general-stats.component.css']
})
export class GeneralStatsComponent implements OnInit {

  public generalStats: GeneralStats;
  public winrate: number;
  public gamePlayed: number;
  public totalGameTime: string;
  public totalTime: string;
  public pieChartOptions: ChartOptions = {
      responsive: true,
  };
  public pieChartLabels: Label[] = ['Win', 'Loss'];
  public pieChartData: SingleDataSet;
  public pieChartType: ChartType = 'doughnut';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors = [
      {
          backgroundColor: ['#F2BE54', '#292A2D'],
      },
  ];
  constructor(private profile: ProfileService) {
      return;
  }

  public getGameStats(): void {
      this.gamePlayed = this.profile.gameStat.gamePlayed;
      this.winrate = this.getWinrate();
      this.totalGameTime = this.getTime(this.profile.gameStat.totalGameTime);
      this.totalTime = this.getTime(this.profile.gameStat.totalTime);
      this.pieChartData = [this.profile.info.nWins , this.profile.info.nLosses];
  }

  public getWinrate(): number {
      return this.profile.gameStat.gamePlayed === 0 ? 0 : Math.round(this.profile.gameStat.winrate * 100)
  }

  public getTime(time: number): string {
      const hours: number = time / 60 / 60;
      const minute: number = time / 60;

    
      return (hours >= 1 ? Math.round(hours) + 'h' : '') + (minute >= 1 ? Math.round(minute % 60) + 'm' : '') + time % 60+ 's';
  }
  
  ngOnInit(): void {
      this.getGameStats();
  }
}
