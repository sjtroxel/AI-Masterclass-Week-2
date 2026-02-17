import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MeetupService } from './meetup';
import { Meetup, MeetupParticipant } from '../../shared/models/meetup';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/meetups`;

const mockUser = {
  id: 1,
  first_name: 'Jane',
  last_name: 'Doe',
  username: 'janedoe',
  email: 'jane@example.com',
};

const mockMeetup: Meetup = {
  id: 1,
  title: 'Morning Ride',
  activity: 'bicycle',
  start_date_time: '2026-03-01T08:00:00Z',
  end_date_time: '2026-03-01T10:00:00Z',
  guests: 5,
  user: mockUser,
  meetup_participants: [],
  location: {
    address: '123 Trail Rd',
    city: 'Denver',
    state: 'CO',
    zip_code: '80202',
    country: 'US',
  },
};

const mockMeetup2: Meetup = {
  id: 2,
  title: 'Evening Run',
  activity: 'run',
  start_date_time: '2026-03-02T18:00:00Z',
  end_date_time: '2026-03-02T19:00:00Z',
  guests: 3,
  user: mockUser,
  meetup_participants: [],
};

describe('MeetupService', () => {
  let service: MeetupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(MeetupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // --- Instantiation ---

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- Signal defaults ---

  describe('initial signal state', () => {
    it('meetups starts as empty array', () => {
      expect(service.meetups()).toEqual([]);
    });

    it('meetupToEdit starts as null', () => {
      expect(service.meetupToEdit()).toBeNull();
    });

    it('loading starts as false', () => {
      expect(service.loading()).toBe(false);
    });

    it('meetupDetail starts as null', () => {
      expect(service.meetupDetail()).toBeNull();
    });
  });

  // --- setMeetupToEdit / clearMeetupToEdit ---

  describe('meetupToEdit management', () => {
    it('setMeetupToEdit() updates the signal', () => {
      service.setMeetupToEdit(mockMeetup);
      expect(service.meetupToEdit()).toEqual(mockMeetup);
    });

    it('clearMeetupToEdit() resets to null', () => {
      service.setMeetupToEdit(mockMeetup);
      service.clearMeetupToEdit();
      expect(service.meetupToEdit()).toBeNull();
    });
  });

  // --- loadMeetups ---

  describe('loadMeetups()', () => {
    it('GETs /meetups and populates meetups signal', () => {
      service.loadMeetups();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('GET');
      req.flush({ meetups: JSON.stringify([mockMeetup, mockMeetup2]) });

      expect(service.meetups().length).toBe(2);
      expect(service.meetups()[0].title).toBe('Morning Ride');
      expect(service.loading()).toBe(false);
    });

    it('sets meetups to empty array on error', () => {
      service.loadMeetups();

      const req = httpMock.expectOne(API);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(service.meetups()).toEqual([]);
      expect(service.loading()).toBe(false);
    });
  });

  // --- getMeetup (single) ---

  describe('getMeetup()', () => {
    it('GETs /meetups/:id and populates meetupDetail signal', () => {
      service.getMeetup(1);
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ ...mockMeetup, comments: [] });

      expect(service.meetupDetail()?.id).toBe(1);
      expect(service.meetupDetail()?.title).toBe('Morning Ride');
      expect(service.loading()).toBe(false);
    });

    it('sets meetupDetail to null on error', () => {
      service.getMeetup(999);

      const req = httpMock.expectOne(`${API}/999`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });

      expect(service.meetupDetail()).toBeNull();
      expect(service.loading()).toBe(false);
    });
  });

  // --- addMeetup ---

  describe('addMeetup()', () => {
    it('POSTs to /meetups with nested payload including location_attributes', () => {
      service.addMeetup(mockMeetup);

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.meetup.title).toBe('Morning Ride');
      expect(req.request.body.meetup.activity).toBe('bicycle');
      expect(req.request.body.meetup.location_attributes.city).toBe('Denver');
      req.flush(mockMeetup);
    });

    it('appends the created meetup to the meetups signal', () => {
      service.addMeetup(mockMeetup);

      const req = httpMock.expectOne(API);
      req.flush(mockMeetup);

      expect(service.meetups().length).toBe(1);
      expect(service.meetups()[0].id).toBe(1);
    });
  });

  // --- updateMeetup ---

  describe('updateMeetup()', () => {
    it('PUTs to /meetups/:id with nested payload', () => {
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([mockMeetup]) });

      const updated = { ...mockMeetup, title: 'Afternoon Ride' };
      service.updateMeetup(updated);

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.meetup.title).toBe('Afternoon Ride');
      req.flush(updated);
    });

    it('replaces the matching meetup in the signal', () => {
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([mockMeetup]) });

      const updated = { ...mockMeetup, title: 'Afternoon Ride' };
      service.updateMeetup(updated);
      httpMock.expectOne(`${API}/1`).flush(updated);

      expect(service.meetups()[0].title).toBe('Afternoon Ride');
    });
  });

  // --- deleteMeetup ---

  describe('deleteMeetup()', () => {
    it('DELETEs /meetups/:id', () => {
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([mockMeetup, mockMeetup2]) });

      service.deleteMeetup(1);

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('removes the meetup from the signal', () => {
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([mockMeetup, mockMeetup2]) });

      service.deleteMeetup(1);
      httpMock.expectOne(`${API}/1`).flush(null);

      expect(service.meetups().length).toBe(1);
      expect(service.meetups()[0].id).toBe(2);
    });
  });

  // --- joinMeetup ---

  describe('joinMeetup()', () => {
    const mockParticipant: MeetupParticipant = {
      id: 10,
      user_id: 2,
      meetup_id: 1,
      user: { ...mockUser, id: 2, username: 'joiner' },
    };

    it('POSTs to /meetups/:id/join', () => {
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([mockMeetup]) });

      service.joinMeetup(1);

      const req = httpMock.expectOne(`${API}/1/join`);
      expect(req.request.method).toBe('POST');
      req.flush(mockParticipant);
    });

    it('appends participant to the matching meetup', () => {
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([mockMeetup]) });

      service.joinMeetup(1);
      httpMock.expectOne(`${API}/1/join`).flush(mockParticipant);

      const participants = service.meetups()[0].meetup_participants!;
      expect(participants.length).toBe(1);
      expect(participants[0].user_id).toBe(2);
    });
  });

  // --- leaveMeetup ---

  describe('leaveMeetup()', () => {
    it('DELETEs /meetups/:id/leave', () => {
      const meetupWithParticipant = {
        ...mockMeetup,
        meetup_participants: [{ id: 10, user_id: 2, meetup_id: 1, user: mockUser }],
      };
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([meetupWithParticipant]) });

      service.leaveMeetup(1, 2);

      const req = httpMock.expectOne(`${API}/1/leave`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('removes the participant from the matching meetup', () => {
      const meetupWithParticipant = {
        ...mockMeetup,
        meetup_participants: [{ id: 10, user_id: 2, meetup_id: 1, user: mockUser }],
      };
      service.loadMeetups();
      httpMock.expectOne(API).flush({ meetups: JSON.stringify([meetupWithParticipant]) });

      service.leaveMeetup(1, 2);
      httpMock.expectOne(`${API}/1/leave`).flush(null);

      expect(service.meetups()[0].meetup_participants!.length).toBe(0);
    });
  });
});
