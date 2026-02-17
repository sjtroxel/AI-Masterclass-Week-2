import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { MeetupDetailComponent } from './meetup-detail';
import { MeetupService } from '../../core/services/meetup';
import { CommentService } from '../../core/services/comment';
import { Meetup } from '../../shared/models/meetup';
import { Comment } from '../../shared/models/comment';

const SAMPLE_MEETUP: Meetup & { comments?: Comment[] } = {
  id: 42,
  title: 'Saturday Morning Run',
  activity: 'run',
  start_date_time: '2026-03-15T09:00:00Z',
  end_date_time: '2026-03-15T11:00:00Z',
  guests: 10,
  user: { id: 1, first_name: 'Sam', last_name: 'Troxel', username: 'samt', email: 's@t.com' },
  location: { id: 10, address: '123 Trail Ave', city: 'Portland', state: 'OR', zip_code: '97201', country: 'US' },
  meetup_participants: [
    { id: 100, user_id: 2, meetup_id: 42, user: { id: 2, first_name: 'Jo', last_name: 'B', username: 'job', email: 'j@b.com' } },
  ],
  comments: [
    { id: 1, content: 'Looks fun!', created_at: '2026-03-15T10:00:00Z', updated_at: '2026-03-15T10:00:00Z', user: { id: 2, first_name: 'Jo', last_name: 'B', username: 'job', email: 'j@b.com' } },
  ],
};

describe('MeetupDetailComponent', () => {
  let fixture: ComponentFixture<MeetupDetailComponent>;
  let component: MeetupDetailComponent;
  let meetupServiceMock: {
    meetupDetail: ReturnType<typeof signal>;
    loading: ReturnType<typeof signal>;
    getMeetup: ReturnType<typeof vi.fn>;
  };
  let commentServiceMock: {
    comments: ReturnType<typeof signal>;
    seedComments: ReturnType<typeof vi.fn>;
    clearComments: ReturnType<typeof vi.fn>;
    addComment: ReturnType<typeof vi.fn>;
  };

  // --- Route param mode (default) ---

  describe('with route param', () => {
    beforeEach(() => {
      meetupServiceMock = {
        meetupDetail: signal<(Meetup & { comments?: Comment[] }) | null>(null),
        loading: signal(false),
        getMeetup: vi.fn(),
      };

      commentServiceMock = {
        comments: signal<Comment[]>([]),
        seedComments: vi.fn(),
        clearComments: vi.fn(),
        addComment: vi.fn(),
      };

      TestBed.configureTestingModule({
        imports: [MeetupDetailComponent],
        providers: [
          provideRouter([]),
          { provide: MeetupService, useValue: meetupServiceMock },
          { provide: CommentService, useValue: commentServiceMock },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: () => '42' } } },
          },
        ],
      });

      fixture = TestBed.createComponent(MeetupDetailComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should call getMeetup with the route param id on init', () => {
      fixture.detectChanges();
      expect(meetupServiceMock.getMeetup).toHaveBeenCalledWith(42);
    });

    it('should set meetupId from the route param', () => {
      fixture.detectChanges();
      expect(component.meetupId).toBe(42);
    });

    // --- Loading state ---

    it('should show loading message while loading', () => {
      (meetupServiceMock.loading as any).set(true);
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Loading meetup');
    });

    // --- Not found state ---

    it('should show "Meetup not found" when meetup is null and not loading', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Meetup not found');
    });

    // --- Rendering meetup detail ---

    describe('when meetup is loaded', () => {
      beforeEach(() => {
        (meetupServiceMock.meetupDetail as any).set(SAMPLE_MEETUP);
        fixture.detectChanges();
      });

      it('should display the meetup title', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('h1')!.textContent).toContain('Saturday Morning Run');
      });

      it('should display the activity badge', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('run');
      });

      it('should display formatted start date', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('Mar 15, 2026');
      });

      it('should display the organizer name', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('Sam');
        expect(el.textContent).toContain('Troxel');
      });

      it('should display participant count and guest capacity', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('1 / 10 guests');
      });

      it('should display the location', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('123 Trail Ave');
        expect(el.textContent).toContain('Portland');
        expect(el.textContent).toContain('OR');
        expect(el.textContent).toContain('97201');
      });

      it('should render the comment list child component', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('app-comment-list')).toBeTruthy();
      });

      it('should render the comment form child component', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('app-comment-form')).toBeTruthy();
      });

      it('should show the "Back to Dashboard" link (not modal mode)', () => {
        const el: HTMLElement = fixture.nativeElement;
        const backLink = el.querySelector('a.back-link');
        expect(backLink).toBeTruthy();
        expect(backLink!.textContent).toContain('Back to Dashboard');
      });
    });
  });

  // --- Modal mode (meetupId input) ---

  describe('with meetupId input (modal mode)', () => {
    beforeEach(() => {
      meetupServiceMock = {
        meetupDetail: signal<(Meetup & { comments?: Comment[] }) | null>(SAMPLE_MEETUP),
        loading: signal(false),
        getMeetup: vi.fn(),
      };

      commentServiceMock = {
        comments: signal<Comment[]>([]),
        seedComments: vi.fn(),
        clearComments: vi.fn(),
        addComment: vi.fn(),
      };

      TestBed.configureTestingModule({
        imports: [MeetupDetailComponent],
        providers: [
          provideRouter([]),
          { provide: MeetupService, useValue: meetupServiceMock },
          { provide: CommentService, useValue: commentServiceMock },
          {
            provide: ActivatedRoute,
            useValue: { snapshot: { paramMap: { get: () => null } } },
          },
        ],
      });

      fixture = TestBed.createComponent(MeetupDetailComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('meetupId', 99);
      fixture.detectChanges();
    });

    it('should use the input meetupId instead of route param', () => {
      expect(component.meetupId).toBe(99);
      expect(meetupServiceMock.getMeetup).toHaveBeenCalledWith(99);
    });

    it('should be in modal mode', () => {
      expect(component.isModal()).toBe(true);
    });

    it('should NOT show the "Back to Dashboard" link', () => {
      const el: HTMLElement = fixture.nativeElement;
      const backLink = el.querySelector('a.back-link');
      expect(backLink).toBeNull();
    });
  });
});
