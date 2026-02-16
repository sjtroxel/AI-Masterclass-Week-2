import { Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, effect, inject, input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MeetupService } from '../../core/services/meetup';
import { CommentService } from '../../core/services/comment';
import { CommentListComponent } from '../../features/comment/comment-list/comment-list';
import { CommentFormComponent } from '../../features/comment/comment-form/comment-form';

@Component({
  selector: 'app-meetup-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, CommentListComponent, CommentFormComponent],
  templateUrl: './meetup-detail.html',
  styleUrl: './meetup-detail.scss',
})
export class MeetupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private meetupService = inject(MeetupService);
  protected commentService = inject(CommentService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('commentBottom') commentBottom?: ElementRef;

  /** Optional input for modal usage — when provided, route param is ignored */
  meetupIdInput = input<number | undefined>(undefined, { alias: 'meetupId' });
  isModal = computed(() => this.meetupIdInput() !== undefined);

  meetup = this.meetupService.meetupDetail;
  loading = this.meetupService.loading;
  meetupId!: number;

  constructor() {
    effect(() => {
      const m = this.meetup();
      if (m) {
        this.commentService.seedComments(m.comments ?? []);
        if (!this.isModal()) {
          setTimeout(() =>
            this.commentBottom?.nativeElement?.scrollIntoView({ behavior: 'smooth' })
          );
        }
      }
    });

    this.destroyRef.onDestroy(() => this.commentService.clearComments());
  }

  ngOnInit(): void {
    const inputId = this.meetupIdInput();
    this.meetupId = inputId ?? Number(this.route.snapshot.paramMap.get('id'));
    this.meetupService.getMeetup(this.meetupId);
  }
}
