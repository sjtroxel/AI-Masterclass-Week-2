import { Component, computed, inject, input, output } from '@angular/core';
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

  meetup = input.required<Meetup>();
  currentUserId = input<number | null>(null);

  edit = output<Meetup>();
  delete = output<number>();
  viewDetails = output<number>();

  isOwner = computed(() => this.meetup().user?.id === this.currentUserId());

  isParticipant = computed(() => {
    const userId = this.currentUserId();
    const participants = this.meetup().meetup_participants;
    if (!userId || !participants) return false;
    return participants.some((p) => p.user_id === userId);
  });

  participantCount = computed(() => this.meetup().meetup_participants?.length ?? 0);

  joinMeetup() {
    this.meetupService.joinMeetup(this.meetup().id);
  }

  leaveMeetup() {
    const userId = this.currentUserId();
    if (userId) {
      this.meetupService.leaveMeetup(this.meetup().id, userId);
    }
  }
}
