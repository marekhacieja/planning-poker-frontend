import { Component } from '@angular/core';
import { PokerService } from '../../services/poker.service';
import { Router } from '@angular/router';

@Component({
  selector : 'app-create-room',
  templateUrl : './create-room.component.html',
  styleUrls : [ './create-room.component.scss' ]
})
export class CreateRoomComponent {

  roomName: string;
  userName: string;

  constructor(private pokerService: PokerService,
              private router: Router) {
  }

  createRoom(): void {
    if (!this.roomName || !this.userName) {
      return;
    }

    this.pokerService.createRoomWithOwner(this.roomName, this.userName).subscribe(() => {
      this.router.navigate([ '/room' ]);
    });
  }

}
