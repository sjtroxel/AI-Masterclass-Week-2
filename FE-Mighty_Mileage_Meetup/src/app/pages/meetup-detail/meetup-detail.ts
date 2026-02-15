import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MeetupService } from '../../core/services/meetup';

@Component({
  selector: 'app-meetup-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './meetup-detail.html',
  styleUrl: './meetup-detail.scss',
})
export class MeetupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private meetupService = inject(MeetupService);

  meetup = this.meetupService.meetupDetail;
  loading = this.meetupService.loading;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.meetupService.getMeetup(id);
  }
}
