import { Component, input, output } from '@angular/core';
import { Meetup } from '../../../shared/models/meetup';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-meetup-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './meetup-card.html',
  styleUrl: './meetup-card.scss'
})
export class MeetupCardComponent {
  meetup = input.required<Meetup>();
  currentUserId = input<number | null>(null);

  edit = output<Meetup>();
  delete = output<number>();
}
