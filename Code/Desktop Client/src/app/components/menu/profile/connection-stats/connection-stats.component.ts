import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { ConnectionsHistory } from 'src/interface/profileInfo';
import { Month } from './constant';

@Component({
    selector: 'app-connection-stats',
    templateUrl: './connection-stats.component.html',
    styleUrls: ['./connection-stats.component.css']
})
export class ConnectionStatsComponent {

  connectionHistory: ConnectionsHistory[];
  public displayedColumns: any;

  constructor(public profile: ProfileService) {
      this.displayedColumns = ['login', 'logout'];
      this.getConnectionHistory();
  }

  public getConnectionHistory(): void {
      this.connectionHistory = this.profile.info.connections.reverse();
      this.trimString();
  }

  public trimString(): void {
      for (const time of this.connectionHistory) {
          time.login = this.convertString(time.login);
          time.logout = this.convertString(time.logout);
      }
  }

  public convertString(time: string): string {
      const newDate = new Date(time)

      return Month[newDate.getMonth()] + ' ' + newDate.getDate().toString() + ' ' + newDate.getFullYear().toString() +
           ' ' + newDate.toTimeString().substr(0, 8);
  }
}
