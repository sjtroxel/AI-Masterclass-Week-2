import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Meetup } from '../../shared/models/meetup';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MeetupService {
  private readonly apiUrl = `${environment.apiUrl}/meetups`;

  constructor(private http: HttpClient) {}

  // Signals
  private meetupsSignal = signal<Meetup[]>([]);
  private meetupToEditSignal = signal<Meetup | null>(null);
  private loadingSignal = signal<boolean>(false);

  // Exposed signals
  meetups = this.meetupsSignal.asReadonly();
  meetupToEdit = this.meetupToEditSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

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
  addMeetup(newMeetup: Meetup) {
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

    this.http.post<Meetup>(this.apiUrl, payload).subscribe({
      next: (created) => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set([...current, created]);
      },
      error: (err) => console.error('Error adding meetup:', err),
    });
  }

  // Update existing meetup
  updateMeetup(updatedMeetup: Meetup) {
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

    this.http.put<Meetup>(`${this.apiUrl}/${updatedMeetup.id}`, payload).subscribe({
      next: (saved) => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set(
          current.map((m) => (m.id === saved.id ? saved : m))
        );
      },
      error: (err) => console.error('Error updating meetup:', err),
    });
  }

  // Delete a meetup
  deleteMeetup(id: number) {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const current = this.ensureArray(this.meetupsSignal());
        this.meetupsSignal.set(current.filter((m) => m.id !== id));
      },
      error: (err) => console.error('Error deleting meetup:', err),
    });
  }
}
