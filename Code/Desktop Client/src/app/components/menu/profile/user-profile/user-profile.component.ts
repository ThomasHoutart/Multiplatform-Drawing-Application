import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartOptions, ChartType } from 'chart.js';
import {
    Label,
    monkeyPatchChartJsLegend,
    monkeyPatchChartJsTooltip,
    SingleDataSet,
} from 'ng2-charts';
import { EditComponent } from '../edit/edit.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  public userInfo = {
      firstName: 'thom',
      lastName: 'laNouille',
      email: 'gros_gars_plein@chocolat.luv',
      numberOfGamesPlayed: 122,
      winrate: 0.4,
      averageGameTime: 232,
      totalGameTime: 7732,
  };

  public pieChartOptions: ChartOptions = {
      responsive: true,
  };
  public pieChartLabels: Label[] = ['Win', 'Loss'];
  public pieChartData: SingleDataSet = [35, 23];
  public pieChartType: ChartType = 'doughnut';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartColors = [
      {
          backgroundColor: ['#F2BE54', '#292A2D'],
      },
  ];

  public editProfile(): void {
      this.dialog.open(EditComponent);
  }

  constructor(public dialog: MatDialog) {
      monkeyPatchChartJsLegend();
      monkeyPatchChartJsTooltip();
  }
}
