import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AchievementsHandlerService } from 'src/app/services/achievements-handler/achievements-handler.service';
import { Achievement } from 'src/interface/achievement';

@Component({
    selector: 'app-achievements',
    templateUrl: './achievements.component.html',
    styleUrls: ['./achievements.component.css']
})

export class AchievementsComponent implements OnInit, OnDestroy {
  public choices: string[] = ['All', 'Owned'];
  public filterValue = 'All';
  public achievements: Achievement[] = [];
  public achievementsListener: Subscription;
  constructor(private achievementsHandler: AchievementsHandlerService, private http: HttpClient) {
      this.filterValue = 'All';
  }

  public filterList(): Achievement[] {
      return this.achievements.filter(element => {
          return element.isUnlocked === true;
      })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public onChange(event: any): void {
      this.getAchievements(event.value);
  } 

  public getAchievements(type: string): void {
  	this.achievementsListener = this.achievementsHandler.getAllAchievements().subscribe((achievements: Achievement[]) => {
  		if (achievements) {
              if (type === "All") {
                  this.achievements = achievements;
              }
              else if (type === "Owned") {
                  this.achievements = this.filterList();
              }
  		}
  	});
  }

  terminate(): void {
  	this.achievementsListener.unsubscribe();
  }

  ngOnInit(): void {
      this.getAchievements("All");
  }

  ngOnDestroy(): void {
  	this.terminate();
  }
}
