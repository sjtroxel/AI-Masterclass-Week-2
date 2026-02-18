import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import { MeetupService } from '../../../core/services/meetup';
import { ReverseGeocodingService } from '../../../core/services/reverse-geocoding';
import { Meetup } from '../../../shared/models/meetup';
import { MapComponent } from '../../../shared/components/map/map';

@Component({
  selector: 'app-meetup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MapComponent],
  templateUrl: './meetup-form.html',
  styleUrl: './meetup-form.scss'
})
export class MeetupFormComponent {
  meetupService = inject(MeetupService);
  http = inject(HttpClient);
  private readonly reverseGeocodingService = inject(ReverseGeocodingService);

  form: FormGroup;
  showForm = signal(true);
  submitting = signal(false);
  isReverseGeocoding = signal(false);

  activities = ['run', 'bicycle'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      activity: ['run', Validators.required],
      start_date_time: ['', Validators.required],
      end_date_time: ['', Validators.required],
      guests: [1, [Validators.required, Validators.min(1)]],
      location: this.fb.group({
        address: [''],
        zip_code: ['', [Validators.required]],
        city: [''],
        state: [''],
        country: ['USA']
      })
    });

    // Patch form if editing a meetup
    effect(() => {
      const editing = this.meetupService.meetupToEdit();
      if (editing) this.form.patchValue(editing);
    });
  }

  onCoordinatesSelected(coords: { lat: number; lng: number }): void {
    this.isReverseGeocoding.set(true);
    this.reverseGeocodingService
      .reverseGeocode(coords.lat, coords.lng)
      .pipe(finalize(() => this.isReverseGeocoding.set(false)))
      .subscribe((result) => {
        this.form.patchValue({ location: result });
      });
  }

  lookupZip() {
    const zip = this.form.get('location.zip_code')?.value;
    if (!zip) return;

    this.http.get<any>(`https://api.zippopotam.us/us/${zip}`).subscribe({
      next: (res) => {
        const place = res.places[0];
        this.form.patchValue({
          location: {
            city: place['place name'],
            state: place['state abbreviation']
          }
        });
      },
      error: () => console.warn('ZIP not found')
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formData = this.form.value;
    const editing = this.meetupService.meetupToEdit();

    const request$ = editing
      ? this.meetupService.updateMeetup({ ...editing, ...formData })
      : this.meetupService.addMeetup({ id: Date.now(), ...formData, user_id: 1 } as Meetup);

    if (editing) this.meetupService.clearMeetupToEdit();

    request$.pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe(() => {
      this.form.reset();
      this.showForm.set(false);
    });
  }
}
