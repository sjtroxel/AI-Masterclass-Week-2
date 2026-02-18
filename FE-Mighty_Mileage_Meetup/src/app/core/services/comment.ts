import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, EMPTY } from 'rxjs';
import { Comment } from '../../shared/models/comment';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  // Signals
  private commentsSignal = signal<Comment[]>([]);
  private loadingSignal = signal<boolean>(false);
  private totalPagesSignal = signal<number>(1);
  private currentPageSignal = signal<number>(1);

  // Exposed signals
  comments = this.commentsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  totalPages = this.totalPagesSignal.asReadonly();
  currentPage = this.currentPageSignal.asReadonly();

  // Load comments for a meetup (paginated)
  getComments(meetupId: number, page: number = 1) {
    this.loadingSignal.set(true);
    this.http
      .get<any>(`${this.apiUrl}/meetups/${meetupId}/comments`, {
        params: { page: page.toString() },
      })
      .subscribe({
        next: (data) => {
          this.commentsSignal.set(JSON.parse(data.comments));
          this.totalPagesSignal.set(data.total_pages);
          this.currentPageSignal.set(data.current_page);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          console.error('Error loading comments:', err);
          this.commentsSignal.set([]);
          this.loadingSignal.set(false);
        },
      });
  }

  // Add a new comment to a meetup
  addComment(meetupId: number, content: string): Observable<Comment> {
    return this.http
      .post<Comment>(`${this.apiUrl}/meetups/${meetupId}/comments`, {
        comment: { content },
      })
      .pipe(
        tap((created) => {
          this.commentsSignal.set([...this.commentsSignal(), created]);
          this.toast.success('Comment posted!');
        }),
        catchError((err) => {
          console.error('Error adding comment:', err);
          this.toast.error('Failed to add comment. Please try again.');
          return EMPTY;
        })
      );
  }

  // Prime the signal from inline meetup data (no HTTP call needed)
  seedComments(comments: Comment[]) {
    this.commentsSignal.set(comments);
  }

  // Reset state when navigating away
  clearComments() {
    this.commentsSignal.set([]);
    this.totalPagesSignal.set(1);
    this.currentPageSignal.set(1);
  }
}
