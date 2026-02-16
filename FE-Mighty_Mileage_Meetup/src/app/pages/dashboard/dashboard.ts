import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { MeetupService } from '../../core/services/meetup';
import { MeetupFormComponent } from '../../features/meetup/meetup-form/meetup-form';
import { MeetupCardComponent } from '../../features/meetup/meetup-card/meetup-card';
import { MeetupDetailComponent } from '../meetup-detail/meetup-detail';
import { AuthenticationService } from '../../core/services/authentication';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MeetupCardComponent, MeetupFormComponent, MeetupDetailComponent],
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

  // Detail modal state
  showDetailModal = signal(false);
  detailMeetupId = signal<number | null>(null);

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.showDetailModal()) {
      this.closeDetailModal();
    } else if (this.showModal()) {
      this.closeModal();
    }
  }

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

  openDetailModal(meetupId: number) {
    this.detailMeetupId.set(meetupId);
    this.showDetailModal.set(true);
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.detailMeetupId.set(null);
  }

  deleteMeetup(id: number) {
    this.meetupService.deleteMeetup(id);
  }
}
