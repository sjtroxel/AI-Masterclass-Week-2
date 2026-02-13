import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MeetupService } from '../../../core/services/meetup';
import { Meetup } from '../../../shared/models/meetup';

@Component({
  selector: 'app-meetup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './meetup-form.html',
  styleUrl: './meetup-form.scss'
})
export class MeetupFormComponent {
  meetupService = inject(MeetupService);
  http = inject(HttpClient);

  form: FormGroup;
  showForm = signal(true);

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

    const formData = this.form.value;
    const editing = this.meetupService.meetupToEdit();

    if (editing) {
      const updated: Meetup = { ...editing, ...formData };
      this.meetupService.updateMeetup(updated);
      this.meetupService.clearMeetupToEdit();
    } else {
      const newMeetup: Meetup = { id: Date.now(), ...formData, user_id: 1 };
      this.meetupService.addMeetup(newMeetup);
    }

    // Reset and hide form
    this.form.reset();
    this.showForm.set(false);
    console.log('Meetup submitted and form closed');
  }
}
