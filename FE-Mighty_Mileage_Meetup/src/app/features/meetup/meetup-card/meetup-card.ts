import { Component, inject, signal } from '@angular/core';
import { Meetup } from '../../../shared/models/meetup';
import { MeetupService } from '../../../core/services/meetup';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-meetup-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './meetup-card.html',
  styleUrl: './meetup-card.scss'
})
export class MeetupCardComponent {
  private meetupService = inject(MeetupService);

  meetup = signal<Meetup | null>(null);

  setMeetup(m: Meetup) {
    this.meetup.set(m);
  }

  editMeetup() {
    if (this.meetup()) {
      this.meetupService.setMeetupToEdit(this.meetup()!);
    }
  }

  deleteMeetup() {
    if (this.meetup()) {
      this.meetupService.deleteMeetup(this.meetup()!.id);
    }
  }
}
