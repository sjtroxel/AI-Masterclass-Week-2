import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, EMPTY } from 'rxjs';
import { Meetup, MeetupParticipant } from '../../shared/models/meetup';
import { Comment } from '../../shared/models/comment';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast';

@Injectable({
  providedIn: 'root',
})
export class MeetupService {
  private readonly apiUrl = `${environment.apiUrl}/meetups`;
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  // Signals
  private meetupsSignal = signal<Meetup[]>([]);
  private meetupToEditSignal = signal<Meetup | null>(null);
  private loadingSignal = signal<boolean>(false);
  private meetupDetailSignal = signal<(Meetup & { comments?: Comment[] }) | null>(null);

  // Exposed signals
  meetups = this.meetupsSignal.asReadonly();
  meetupToEdit = this.meetupToEditSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  meetupDetail = this.meetupDetailSignal.asReadonly();

  // Setters
  setMeetupToEdit(meetup: Meetup) {
    this.meetupToEditSignal.set(meetup);
  }

  clearMeetupToEdit() {
    this.meetupToEditSignal.set(null);
  }

  // --- Helper to ensure iterable ---
  private ensureArray(data: any): Meetup[] {
    return Array.isArray(data) ? data : [];
  }

  // Load a single meetup by ID (extended view includes comments)
  getMeetup(id: number) {
    this.loadingSignal.set(true);
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe({
      next: (data) => {
        this.meetupDetailSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading meetup:', err);
        this.meetupDetailSignal.set(null);
        this.loadingSignal.set(false);
      },
    });
  }

  // Load meetups from API
  loadMeetups() {
    this.loadingSignal.set(true);
    this.http.get<any>(this.apiUrl).subscribe({
      next: (data) => {
        this.meetupsSignal.set(JSON.parse(data.meetups));
        this.loadingSignal.set(false);
      },
      error: (err) => {
        console.error('Error loading meetups:', err);
        this.meetupsSignal.set([]);
        this.loadingSignal.set(false);
      },
    });
  }

  // Add a new meetup
  addMeetup(newMeetup: Meetup): Observable<Meetup> {
    const payload = {
      meetup: {
        title: newMeetup.title,
        activity: newMeetup.activity,
        start_date_time: new Date(newMeetup.start_date_time).toISOString(),
        end_date_time: new Date(newMeetup.end_date_time).toISOString(),
        guests: newMeetup.guests,
        location_attributes: {
          address: newMeetup.location?.address,
          city: newMeetup.location?.city,
          state: newMeetup.location?.state,
          zip_code: newMeetup.location?.zip_code,
          country: newMeetup.location?.country,
        },
      },
    };

    return this.http.post<Meetup>(this.apiUrl, payload).pipe(
      tap((created) => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set([...current, created]);
        this.toast.success('Meetup created!');
      }),
      catchError((err) => {
        console.error('Error adding meetup:', err);
        this.toast.error('Failed to create meetup.');
        return EMPTY;
      })
    );
  }

  // Update existing meetup
  updateMeetup(updatedMeetup: Meetup): Observable<Meetup> {
    const payload = {
      meetup: {
        title: updatedMeetup.title,
        activity: updatedMeetup.activity,
        start_date_time: updatedMeetup.start_date_time,
        end_date_time: updatedMeetup.end_date_time,
        guests: updatedMeetup.guests,
        location_attributes: {
          address: updatedMeetup.location?.address,
          city: updatedMeetup.location?.city,
          state: updatedMeetup.location?.state,
          zip_code: updatedMeetup.location?.zip_code,
          country: updatedMeetup.location?.country,
        },
      },
    };

    return this.http.put<Meetup>(`${this.apiUrl}/${updatedMeetup.id}`, payload).pipe(
      tap((saved) => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set(
          current.map((m) => (m.id === saved.id ? saved : m))
        );
        this.toast.success('Meetup updated!');
      }),
      catchError((err) => {
        console.error('Error updating meetup:', err);
        this.toast.error('Failed to update meetup.');
        return EMPTY;
      })
    );
  }

  // Delete a meetup
  deleteMeetup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set(current.filter((m) => m.id !== id));
        this.toast.success('Meetup deleted.');
      }),
      catchError((err) => {
        console.error('Error deleting meetup:', err);
        this.toast.error('Failed to delete meetup.');
        return EMPTY;
      })
    );
  }

  // Join a meetup
  joinMeetup(id: number): Observable<MeetupParticipant> {
    return this.http.post<MeetupParticipant>(`${this.apiUrl}/${id}/join`, {}).pipe(
      tap((participant) => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set(
          current.map((m) =>
            m.id === id
              ? { ...m, meetup_participants: [...(m.meetup_participants || []), participant] }
              : m
          )
        );
        this.toast.success('Joined meetup!');
      }),
      catchError((err) => {
        console.error('Error joining meetup:', err);
        this.toast.error('Failed to join meetup. Please try again.');
        return EMPTY;
      })
    );
  }

  // Leave a meetup
  leaveMeetup(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/leave`).pipe(
      tap(() => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set(
          current.map((m) =>
            m.id === id
              ? { ...m, meetup_participants: (m.meetup_participants || []).filter((p) => p.user_id !== userId) }
              : m
          )
        );
        this.toast.success('Left meetup.');
      }),
      catchError((err) => {
        console.error('Error leaving meetup:', err);
        this.toast.error('Failed to leave meetup. Please try again.');
        return EMPTY;
      })
    );
  }
}
