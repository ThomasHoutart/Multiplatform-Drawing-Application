import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-hint-list',
    templateUrl: './hint-list.component.html',
    styleUrls: ['./hint-list.component.css']
})
export class HintListComponent implements OnInit {
  public hintFormArray: FormArray;

  constructor() {return}

  isListValid(): boolean {
      for (const hint of this.hintFormArray.getRawValue()) {
          if (hint.length < 5) {
              return false;
          }
      }

      return true;
  }

  getHints(): string[] {
      return this.hintFormArray.getRawValue();
  }

  ngOnInit(): void {
      this.hintFormArray = new FormArray([], [Validators.required, Validators.minLength(1)]);
  	  this.initHintFormArray();
  }

  private initHintFormArray(): void {
  	this.hintFormArray.push(new FormControl('', [Validators.required, Validators.minLength(5)]));
  }

  public deleteHint(index: number): void{
  	this.hintFormArray.removeAt(index);
  }
  public addHint(): void{
  	this.hintFormArray.push(new FormControl('', [Validators.required, Validators.minLength(5)]));
  }
}
