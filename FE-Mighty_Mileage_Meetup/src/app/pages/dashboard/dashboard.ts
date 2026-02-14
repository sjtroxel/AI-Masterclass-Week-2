import { Component, inject, OnInit, signal } from '@angular/core';
import { MeetupService } from '../../core/services/meetup';
import { MeetupFormComponent } from '../../features/meetup/meetup-form/meetup-form';
import { MeetupCardComponent } from '../../features/meetup/meetup-card/meetup-card';

import { AuthenticationService } from '../../core/services/authentication';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MeetupCardComponent, MeetupFormComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  meetupService = inject(MeetupService);
  private authService = inject(AuthenticationService);

  // Use signals directly from the service
  meetups = this.meetupService.meetups;
  meetupToEdit = this.meetupService.meetupToEdit;
  loading = this.meetupService.loading;

  currentUserId = this.authService.getUserId();
  showModal = signal(false);

  ngOnInit(): void {
    this.meetupService.loadMeetups(); // triggers loading signal
  }

  openModal(meetup?: any) {
    if (meetup) this.meetupService.setMeetupToEdit(meetup);
    else this.meetupService.clearMeetupToEdit();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.meetupService.clearMeetupToEdit();
  }

  deleteMeetup(id: number) {
    this.meetupService.deleteMeetup(id);
  }
}
