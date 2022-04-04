import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-custom-button',
    templateUrl: './custom-button.component.html',
    styleUrls: ['./custom-button.component.css']
})
export class CustomButtonComponent {
  private _id = '';
  private _enabled = true;
  private _text = '';

  @Output() click = new EventEmitter<any>();
  
  @Input()
  get enabled(): boolean { return this._enabled; }
  set enabled(enabled: boolean) {
      this._enabled = enabled;
  }

  @Input()
  get id(): string { return this._id; }
  set id(id: string) {
      this._id = id;
  }

  @Input()
  get text(): string { return this._text; }
  set text(text: string) {
      this._text = text;
  }

  onClick(): void {
      this.click.emit();
  }

  constructor() { return; }

}
