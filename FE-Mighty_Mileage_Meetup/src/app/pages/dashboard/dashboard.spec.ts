import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { DashboardComponent } from './dashboard';
import { MeetupService } from '../../core/services/meetup';
import { AuthenticationService } from '../../core/services/authentication';
import { Meetup } from '../../shared/models/meetup';
import { environment } from '../../../environments/environment';

const SAMPLE_MEETUPS: Meetup[] = [
  {
    id: 1,
    title: 'Morning Run',
    activity: 'run',
    start_date_time: '2026-03-15T09:00:00Z',
    end_date_time: '2026-03-15T11:00:00Z',
    guests: 5,
    meetup_participants: [],
  },
  {
    id: 2,
    title: 'Bike Tour',
    activity: 'bicycle',
    start_date_time: '2026-03-16T08:00:00Z',
    end_date_time: '2026-03-16T10:00:00Z',
    guests: 3,
    meetup_participants: [],
  },
];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let meetupServiceMock: {
    meetups: ReturnType<typeof signal>;
    meetupToEdit: ReturnType<typeof signal>;
    loading: ReturnType<typeof signal>;
    meetupDetail: ReturnType<typeof signal>;
    loadMeetups: ReturnType<typeof vi.fn>;
    deleteMeetup: ReturnType<typeof vi.fn>;
    setMeetupToEdit: ReturnType<typeof vi.fn>;
    clearMeetupToEdit: ReturnType<typeof vi.fn>;
    addMeetup: ReturnType<typeof vi.fn>;
    updateMeetup: ReturnType<typeof vi.fn>;
    getMeetup: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: {
    getUserId: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    meetupServiceMock = {
      meetups: signal<Meetup[]>([]),
      meetupToEdit: signal<Meetup | null>(null),
      loading: signal(false),
      meetupDetail: signal(null),
      loadMeetups: vi.fn(),
      deleteMeetup: vi.fn(),
      setMeetupToEdit: vi.fn(),
      clearMeetupToEdit: vi.fn(),
      addMeetup: vi.fn(),
      updateMeetup: vi.fn(),
      getMeetup: vi.fn(),
    };

    authServiceMock = {
      getUserId: vi.fn().mockReturnValue(1),
      isLoggedIn: vi.fn().mockReturnValue(true),
      currentUser: vi.fn().mockReturnValue({ username: 'rider1' }),
      getToken: vi.fn().mockReturnValue('token'),
    };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: MeetupService, useValue: meetupServiceMock },
        { provide: AuthenticationService, useValue: authServiceMock },
      ],
    });

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  // --- Instantiation ---

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // --- Initialisation ---

  describe('ngOnInit()', () => {
    it('should call meetupService.loadMeetups() on init', () => {
      fixture.detectChanges(); // triggers ngOnInit
      expect(meetupServiceMock.loadMeetups).toHaveBeenCalled();
    });
  });

  // --- Loading state ---

  describe('loading state', () => {
    it('should show loading message while loading', () => {
      meetupServiceMock.loading = signal(true);
      // Re-create to pick up the new signal
      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Loading meetups');
    });
  });

  // --- Empty state ---

  describe('empty state', () => {
    it('should show empty message when no meetups', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('No meetups yet');
    });
  });

  // --- Rendering meetup cards ---

  describe('meetup list', () => {
    beforeEach(() => {
      (meetupServiceMock.meetups as any).set(SAMPLE_MEETUPS);
      fixture.detectChanges();
    });

    it('should render a meetup card for each meetup', () => {
      const el: HTMLElement = fixture.nativeElement;
      const cards = el.querySelectorAll('app-meetup-card');
      expect(cards.length).toBe(2);
    });

    it('should display the page heading', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('h1')!.textContent).toContain('Mighty Mileage Meetup List');
    });

    it('should have a Create New Meetup button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector<HTMLButtonElement>('button.add');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toContain('Create New Meetup');
    });
  });

  // --- Modal interactions ---

  describe('modal interactions', () => {
    it('should open the create modal when Create button is clicked', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector<HTMLButtonElement>('button.add')!;
      btn.click();
      expect(component.showModal()).toBe(true);
      expect(meetupServiceMock.clearMeetupToEdit).toHaveBeenCalled();
    });

    it('should open the edit modal with a meetup', () => {
      fixture.detectChanges();
      component.openModal(SAMPLE_MEETUPS[0]);
      expect(component.showModal()).toBe(true);
      expect(meetupServiceMock.setMeetupToEdit).toHaveBeenCalledWith(SAMPLE_MEETUPS[0]);
    });

    it('should close the modal and clear edit state', () => {
      fixture.detectChanges();
      component.showModal.set(true);
      component.closeModal();
      expect(component.showModal()).toBe(false);
      expect(meetupServiceMock.clearMeetupToEdit).toHaveBeenCalled();
    });
  });

  // --- Detail modal ---

  describe('detail modal', () => {
    it('should open the detail modal with a meetup id', () => {
      fixture.detectChanges();
      component.openDetailModal(42);
      expect(component.showDetailModal()).toBe(true);
      expect(component.detailMeetupId()).toBe(42);
    });

    it('should close the detail modal and clear the id', () => {
      fixture.detectChanges();
      component.showDetailModal.set(true);
      component.detailMeetupId.set(42);
      component.closeDetailModal();
      expect(component.showDetailModal()).toBe(false);
      expect(component.detailMeetupId()).toBeNull();
    });
  });

  // --- Delete ---

  describe('deleteMeetup()', () => {
    it('should delegate to meetupService.deleteMeetup()', () => {
      fixture.detectChanges();
      component.deleteMeetup(7);
      expect(meetupServiceMock.deleteMeetup).toHaveBeenCalledWith(7);
    });
  });
});
