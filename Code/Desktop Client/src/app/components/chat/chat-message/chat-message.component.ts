import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.css'],
})
export class ChatMessageComponent {
  @Input('message') message: string;
  @Input('timestamp') timestamp: string;
  @Input('name') name: string;
  @Input('type') type: number;
  @Input('avatar') avatar: string;

  constructor() {
  	return;
  }
}
