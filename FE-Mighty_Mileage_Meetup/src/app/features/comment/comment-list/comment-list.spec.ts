import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentListComponent } from './comment-list';
import { Comment } from '../../../shared/models/comment';

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 1,
    content: 'Great meetup!',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
    user: { id: 1, first_name: 'Sam', last_name: 'T', username: 'samt', email: 's@t.com' },
  },
  {
    id: 2,
    content: 'Looking forward to it.',
    created_at: '2026-03-15T11:30:00Z',
    updated_at: '2026-03-15T11:30:00Z',
    user: { id: 2, first_name: 'Jo', last_name: 'B', username: 'job', email: 'j@b.com' },
  },
];

describe('CommentListComponent', () => {
  let fixture: ComponentFixture<CommentListComponent>;
  let component: CommentListComponent;

  function createComponent(comments: Comment[]) {
    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('comments', comments);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommentListComponent],
    });
  });

  // --- Instantiation ---

  it('should create', () => {
    createComponent([]);
    expect(component).toBeTruthy();
  });

  // --- Empty state ---

  describe('when there are no comments', () => {
    beforeEach(() => createComponent([]));

    it('should display the "Comments" heading', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('h3')!.textContent).toContain('Comments');
    });

    it('should show the empty state message', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('No comments yet');
    });

    it('should NOT render any comment cards', () => {
      const el: HTMLElement = fixture.nativeElement;
      const cards = el.querySelectorAll('.rounded-xl');
      expect(cards.length).toBe(0);
    });
  });

  // --- With comments ---

  describe('when comments are provided', () => {
    beforeEach(() => createComponent(SAMPLE_COMMENTS));

    it('should render a card for each comment', () => {
      const el: HTMLElement = fixture.nativeElement;
      const cards = el.querySelectorAll('.space-y-3 > div');
      expect(cards.length).toBe(2);
    });

    it('should display the username for each comment', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('samt');
      expect(el.textContent).toContain('job');
    });

    it('should display the comment content', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Great meetup!');
      expect(el.textContent).toContain('Looking forward to it.');
    });

    it('should display the formatted date', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Mar 15, 2026');
    });

    it('should NOT show the empty state message', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).not.toContain('No comments yet');
    });
  });
});
