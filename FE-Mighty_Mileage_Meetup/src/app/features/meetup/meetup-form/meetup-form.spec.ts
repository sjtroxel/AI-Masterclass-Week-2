import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { of, EMPTY } from 'rxjs';
import { MeetupFormComponent } from './meetup-form';
import { MeetupService } from '../../../core/services/meetup';
import { GeocodingService } from '../../../core/services/geocoding';
import { ReverseGeocodingService } from '../../../core/services/reverse-geocoding';
import { MapComponent } from '../../../shared/components/map/map';
import { Meetup } from '../../../shared/models/meetup';

describe('MeetupFormComponent', () => {
  let component: MeetupFormComponent;
  let fixture: ComponentFixture<MeetupFormComponent>;
  let httpMock: HttpTestingController;
  let meetupServiceMock: {
    meetupToEdit: ReturnType<typeof signal>;
    addMeetup: ReturnType<typeof vi.fn>;
    updateMeetup: ReturnType<typeof vi.fn>;
    clearMeetupToEdit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    meetupServiceMock = {
      meetupToEdit: signal<Meetup | null>(null),
      addMeetup: vi.fn().mockReturnValue(of(null)),
      updateMeetup: vi.fn().mockReturnValue(of(null)),
      clearMeetupToEdit: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [MeetupFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MeetupService, useValue: meetupServiceMock },
        { provide: GeocodingService, useValue: { geocode: vi.fn(() => EMPTY) } },
        { provide: ReverseGeocodingService, useValue: { reverseGeocode: vi.fn(() => EMPTY) } },
      ],
    })
      .overrideComponent(MeetupFormComponent, {
        // Remove HttpClientModule from the component's own imports so the
        // test-level provideHttpClient/provideHttpClientTesting take effect.
        remove: { imports: [HttpClientModule] },
      })
      // Prevent Leaflet from initialising in happy-dom (same reason map.spec uses NO_ERRORS_SCHEMA)
      .overrideComponent(MapComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      });

    fixture = TestBed.createComponent(MeetupFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  // --- Instantiation ---

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Form initialisation ---

  describe('form initialisation', () => {
    it('should create the form with all required controls', () => {
      const controls = ['title', 'activity', 'start_date_time', 'end_date_time', 'guests'];
      controls.forEach((name) => {
        expect(component.form.contains(name)).toBe(true);
      });
    });

    it('should have a nested location group', () => {
      expect(component.form.contains('location')).toBe(true);
      const loc = component.form.get('location')!;
      expect(loc.get('address')).toBeTruthy();
      expect(loc.get('zip_code')).toBeTruthy();
      expect(loc.get('city')).toBeTruthy();
      expect(loc.get('state')).toBeTruthy();
      expect(loc.get('country')).toBeTruthy();
    });

    it('should default activity to "run"', () => {
      expect(component.form.get('activity')!.value).toBe('run');
    });

    it('should default guests to 1', () => {
      expect(component.form.get('guests')!.value).toBe(1);
    });

    it('should default country to "USA"', () => {
      expect(component.form.get('location.country')!.value).toBe('USA');
    });

    it('should be invalid when required fields are empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should have isReverseGeocoding default to false', () => {
      expect(component.isReverseGeocoding()).toBe(false);
    });
  });

  // --- Template rendering ---

  describe('template', () => {
    it('should render the Title & Activity section', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Title & Activity');
    });

    it('should render the Location section', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Location');
    });

    it('should render a Save Meetup button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toContain('Save Meetup');
    });

    it('should render activity radio buttons', () => {
      const el: HTMLElement = fixture.nativeElement;
      const radios = el.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(2);
    });
  });

  // --- Submit (create mode) ---

  describe('onSubmit() — create mode', () => {
    function fillForm() {
      component.form.setValue({
        title: 'Park Run',
        activity: 'run',
        start_date_time: '2026-04-01T08:00',
        end_date_time: '2026-04-01T10:00',
        guests: 3,
        location: { address: '1 Main St', zip_code: '97201', city: 'Portland', state: 'OR', country: 'USA' },
      });
    }

    it('should NOT submit when form is invalid', () => {
      component.onSubmit();
      expect(meetupServiceMock.addMeetup).not.toHaveBeenCalled();
    });

    it('should call addMeetup with form data when valid and not editing', () => {
      fillForm();
      component.onSubmit();
      expect(meetupServiceMock.addMeetup).toHaveBeenCalledTimes(1);
      const arg = meetupServiceMock.addMeetup.mock.calls[0][0];
      expect(arg.title).toBe('Park Run');
      expect(arg.activity).toBe('run');
      expect(arg.guests).toBe(3);
    });

    it('should reset the form after submit', () => {
      fillForm();
      component.onSubmit();
      expect(component.form.get('title')!.value).toBeNull();
    });

    it('should hide the form after submit', () => {
      fillForm();
      component.onSubmit();
      expect(component.showForm()).toBe(false);
    });
  });

  // --- Submit (edit mode) ---

  describe('onSubmit() — edit mode', () => {
    const EXISTING: Meetup = {
      id: 42,
      title: 'Old Title',
      activity: 'run',
      start_date_time: '2026-03-15T09:00:00Z',
      end_date_time: '2026-03-15T11:00:00Z',
      guests: 5,
    };

    it('should call updateMeetup when editing an existing meetup', () => {
      (meetupServiceMock.meetupToEdit as any).set(EXISTING);
      fixture.detectChanges();

      // Update the title
      component.form.patchValue({
        title: 'New Title',
        start_date_time: '2026-03-15T09:00',
        end_date_time: '2026-03-15T11:00',
        location: { zip_code: '97201' },
      });

      component.onSubmit();
      expect(meetupServiceMock.updateMeetup).toHaveBeenCalledTimes(1);
      const arg = meetupServiceMock.updateMeetup.mock.calls[0][0];
      expect(arg.id).toBe(42);
      expect(arg.title).toBe('New Title');
    });

    it('should clear the edit state after updating', () => {
      (meetupServiceMock.meetupToEdit as any).set(EXISTING);
      fixture.detectChanges();

      component.form.patchValue({
        start_date_time: '2026-03-15T09:00',
        end_date_time: '2026-03-15T11:00',
        location: { zip_code: '97201' },
      });

      component.onSubmit();
      expect(meetupServiceMock.clearMeetupToEdit).toHaveBeenCalled();
    });
  });

  // --- ZIP lookup ---

  describe('lookupZip()', () => {
    it('should populate city and state from ZIP API response', () => {
      component.form.get('location.zip_code')!.setValue('97201');
      component.lookupZip();

      const req = httpMock.expectOne('https://api.zippopotam.us/us/97201');
      expect(req.request.method).toBe('GET');
      req.flush({ places: [{ 'place name': 'Portland', 'state abbreviation': 'OR' }] });

      expect(component.form.get('location.city')!.value).toBe('Portland');
      expect(component.form.get('location.state')!.value).toBe('OR');
    });

    it('should do nothing when zip_code is empty', () => {
      component.form.get('location.zip_code')!.setValue('');
      component.lookupZip();
      httpMock.expectNone('https://api.zippopotam.us/us/');
    });
  });
});
