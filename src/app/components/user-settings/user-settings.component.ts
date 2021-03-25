import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserDataService } from '../../services/user-data.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector : 'app-user-settings',
  templateUrl : './user-settings.component.html',
  styleUrls : [ './user-settings.component.scss' ]
})
export class UserSettingsComponent implements OnInit {

  @ViewChild('input') input: ElementRef;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  currentUsername: string;
  newUsername: string;
  observer: boolean;
  isInRoom: boolean;
  isChangeNameMode = false;

  private userSub$: Subscription;

  constructor(public userDataService: UserDataService,
              private userService: UserService,
              private router: Router,
              private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.userSub$ = this.userDataService.currentUser.subscribe(() => {
      this.init();
    });
  }

  changeUserType(): void {
    this.userService.changeUserType(!this.observer).subscribe(() => {
      this.observer = this.userDataService.currentUserValue.observer;
    });
  }

  logout(): void {
    const url = window.location.origin;
    if ('home'.match(url)) {
      this.userDataService.logout();
    } else {
      this.leaveRoomAndLogout();
    }
    this.init();
  }

  onChangeNameClick(event: MouseEvent): void {
    event.stopPropagation();
    this.isChangeNameMode = !this.isChangeNameMode;

    if (this.isChangeNameMode === false) {
      this.changeName();
    }

    setTimeout(() => {
      this.input.nativeElement.focus();
    }, 0);
  }

  menuClosed(): void {
    this.changeName();
  }

  menuOpened(): void {
    this.input.nativeElement.blur();
    this.isChangeNameMode = false;
  }

  changeName(): void {
    this.input.nativeElement.blur();

    if (this.currentUsername === this.newUsername) {
      return;
    }

    if (this.newUsername.length === 0) {
      this.newUsername = this.currentUsername;
    }

    this.isChangeNameMode = false;
    const isInRoom = !!this.userDataService.currentUserValue?.roomKey;

    if (this.currentUsername === this.newUsername) {
      return;
    }

    this.changePassword(isInRoom);
  }

  private init(): void {
    this.isInRoom = !!this.userDataService.currentUserValue?.roomKey;
    this.observer = this.userDataService.currentUserValue?.observer;
    this.currentUsername = this.userDataService.currentUserValue?.userName;
    this.newUsername = this.currentUsername;
  }

  private changePassword(isInRoom: boolean): void {
    if (isInRoom) {
      this.userService.changeUsernameInRoom(this.newUsername).subscribe(
        () => {},
        error => {
          this.newUsername = this.currentUsername;
          this.snackBar.open(error.error.message, 'OK', {
            duration : 2000
          });
        });
    } else {
      this.userService.changeUsername(this.newUsername);
      this.currentUsername = this.newUsername;
    }
  }

  private leaveRoomAndLogout(): void {
    this.userService.leaveRoom().subscribe(() => {
        this.routeToHomeAndLogout();
      },
      () => {
        this.router.navigate([ '/home' ]).then(() => {
          this.routeToHomeAndLogout();
        });
      }
    );
  }

  private routeToHomeAndLogout(): void {
    this.router.navigate([ '/home' ]).then(() => {
      this.userDataService.logout();
    });
  }

}
