import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MeetupCardComponent } from './meetup-card';
import { MeetupService } from '../../../core/services/meetup';
import { Meetup } from '../../../shared/models/meetup';

const BASE_MEETUP: Meetup = {
  id: 42,
  title: 'Saturday Morning Run',
  activity: 'run',
  start_date_time: '2026-03-15T09:00:00Z',
  end_date_time: '2026-03-15T11:00:00Z',
  guests: 5,
  user: { id: 1, first_name: 'Sam', last_name: 'T', username: 'samt', email: 's@t.com' },
  location: { id: 10, address: '123 Trail Ave', city: 'Portland', state: 'OR', zip_code: '97201', country: 'US' },
  meetup_participants: [
    { id: 100, user_id: 2, meetup_id: 42, user: { id: 2, first_name: 'Jo', last_name: 'B', username: 'job', email: 'j@b.com' } },
    { id: 101, user_id: 3, meetup_id: 42, user: { id: 3, first_name: 'Al', last_name: 'C', username: 'alc', email: 'a@c.com' } },
  ],
};

describe('MeetupCardComponent', () => {
  let fixture: ComponentFixture<MeetupCardComponent>;
  let component: MeetupCardComponent;
  let meetupServiceMock: { joinMeetup: ReturnType<typeof vi.fn>; leaveMeetup: ReturnType<typeof vi.fn> };

  function createComponent(meetup: Meetup = BASE_MEETUP, currentUserId: number | null = null) {
    fixture = TestBed.createComponent(MeetupCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('meetup', meetup);
    fixture.componentRef.setInput('currentUserId', currentUserId);
    fixture.detectChanges();
  }

  beforeEach(() => {
    meetupServiceMock = {
      joinMeetup: vi.fn().mockReturnValue(of(null)),
      leaveMeetup: vi.fn().mockReturnValue(of(null)),
    };

    TestBed.configureTestingModule({
      imports: [MeetupCardComponent],
      providers: [{ provide: MeetupService, useValue: meetupServiceMock }],
    });
  });

  // --- Instantiation ---

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  // --- Rendering @Input data ---

  describe('data rendering', () => {
    beforeEach(() => createComponent());

    it('should display the meetup title', () => {
      const el: HTMLElement = fixture.nativeElement;
      const title = el.querySelector('h3');
      expect(title!.textContent).toContain('Saturday Morning Run');
    });

    it('should display the activity badge', () => {
      const el: HTMLElement = fixture.nativeElement;
      const badge = el.querySelector('.rounded-full');
      expect(badge!.textContent).toContain('run');
    });

    it('should display the location city', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Portland');
    });

    it('should display the formatted date', () => {
      const el: HTMLElement = fixture.nativeElement;
      // DatePipe 'medium' produces something like "Mar 15, 2026, 9:00:00 AM"
      expect(el.textContent).toContain('Mar 15, 2026');
    });

    it('should display the participant count', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('2 participants');
    });

    it('should show singular "participant" when count is 1', () => {
      const meetup = { ...BASE_MEETUP, meetup_participants: [BASE_MEETUP.meetup_participants![0]] };
      createComponent(meetup);
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('1 participant');
      expect(el.textContent).not.toContain('1 participants');
    });

    it('should display "No location yet" when location is missing', () => {
      const meetup = { ...BASE_MEETUP, location: undefined };
      createComponent(meetup);
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('No location yet');
    });
  });

  // --- Details button ---

  describe('Details button', () => {
    it('should emit viewDetails with the meetup id when clicked', () => {
      createComponent();
      const emitSpy = vi.spyOn(component.viewDetails, 'emit');
      const el: HTMLElement = fixture.nativeElement;
      const detailsBtn = el.querySelector<HTMLButtonElement>('button.btn-secondary')!;
      expect(detailsBtn.textContent).toContain('Details');
      detailsBtn.click();
      expect(emitSpy).toHaveBeenCalledWith(42);
    });
  });

  // --- Owner actions ---

  describe('when current user is the owner', () => {
    beforeEach(() => createComponent(BASE_MEETUP, 1));

    it('should show Edit and Delete buttons', () => {
      const el: HTMLElement = fixture.nativeElement;
      const buttons = Array.from(el.querySelectorAll('button'));
      const labels = buttons.map((b) => b.textContent!.trim());
      expect(labels).toContain('Edit');
      expect(labels).toContain('Delete');
    });

    it('should NOT show Join or Leave buttons', () => {
      const el: HTMLElement = fixture.nativeElement;
      const buttons = Array.from(el.querySelectorAll('button'));
      const labels = buttons.map((b) => b.textContent!.trim());
      expect(labels).not.toContain('Join');
      expect(labels).not.toContain('Leave');
    });

    it('should emit edit with the meetup when Edit is clicked', () => {
      const emitSpy = vi.spyOn(component.edit, 'emit');
      const el: HTMLElement = fixture.nativeElement;
      const editBtn = Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Edit')!;
      editBtn.click();
      expect(emitSpy).toHaveBeenCalledWith(BASE_MEETUP);
    });

    it('should emit delete with meetup id when Delete is clicked', () => {
      const emitSpy = vi.spyOn(component.delete, 'emit');
      const el: HTMLElement = fixture.nativeElement;
      const deleteBtn = el.querySelector<HTMLButtonElement>('button.btn-danger')!;
      deleteBtn.click();
      expect(emitSpy).toHaveBeenCalledWith(42);
    });
  });

  // --- Non-owner, not a participant ---

  describe('when current user is NOT the owner and NOT a participant', () => {
    beforeEach(() => createComponent(BASE_MEETUP, 99));

    it('should show a Join button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const buttons = Array.from(el.querySelectorAll('button'));
      const labels = buttons.map((b) => b.textContent!.trim());
      expect(labels).toContain('Join');
    });

    it('should call meetupService.joinMeetup() when Join is clicked', () => {
      const el: HTMLElement = fixture.nativeElement;
      const joinBtn = Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Join')!;
      joinBtn.click();
      expect(meetupServiceMock.joinMeetup).toHaveBeenCalledWith(42);
    });
  });

  // --- Non-owner, IS a participant ---

  describe('when current user is a participant (not owner)', () => {
    beforeEach(() => createComponent(BASE_MEETUP, 2));

    it('should show a Leave button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const buttons = Array.from(el.querySelectorAll('button'));
      const labels = buttons.map((b) => b.textContent!.trim());
      expect(labels).toContain('Leave');
    });

    it('should call meetupService.leaveMeetup() when Leave is clicked', () => {
      const el: HTMLElement = fixture.nativeElement;
      const leaveBtn = Array.from(el.querySelectorAll('button')).find((b) => b.textContent!.trim() === 'Leave')!;
      leaveBtn.click();
      expect(meetupServiceMock.leaveMeetup).toHaveBeenCalledWith(42, 2);
    });
  });
});
