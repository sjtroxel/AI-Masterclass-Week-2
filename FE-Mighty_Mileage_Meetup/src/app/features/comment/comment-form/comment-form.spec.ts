import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentFormComponent } from './comment-form';
import { CommentService } from '../../../core/services/comment';

describe('CommentFormComponent', () => {
  let fixture: ComponentFixture<CommentFormComponent>;
  let component: CommentFormComponent;
  let commentServiceMock: {
    addComment: ReturnType<typeof vi.fn>;
    comments: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    commentServiceMock = {
      addComment: vi.fn(),
      comments: vi.fn().mockReturnValue([]),
    };

    TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [
        { provide: CommentService, useValue: commentServiceMock },
      ],
    });

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('meetupId', 42);
    fixture.detectChanges();
  });

  // --- Instantiation ---

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Form initialisation ---

  describe('form initialisation', () => {
    it('should have a content control', () => {
      expect(component.form.contains('content')).toBe(true);
    });

    it('should initialise content as empty', () => {
      expect(component.form.get('content')!.value).toBe('');
    });

    it('should be invalid when content is empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should be valid when content is provided', () => {
      component.form.get('content')!.setValue('Nice meetup!');
      expect(component.form.valid).toBe(true);
    });

    it('should be invalid when content exceeds 2000 characters', () => {
      component.form.get('content')!.setValue('x'.repeat(2001));
      expect(component.form.valid).toBe(false);
    });
  });

  // --- Char counter ---

  describe('character counter', () => {
    it('should start at 0', () => {
      expect(component.charCount()).toBe(0);
    });

    it('should track content length as user types', () => {
      component.form.get('content')!.setValue('Hello');
      expect(component.charCount()).toBe(5);
    });

    it('should display the counter in the template', () => {
      component.form.get('content')!.setValue('Hello world');
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('11 / 2000');
    });
  });

  // --- Template rendering ---

  describe('template', () => {
    it('should render a textarea', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('textarea')).toBeTruthy();
    });

    it('should render a Post Comment button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
      expect(btn).toBeTruthy();
      expect(btn!.textContent).toContain('Post Comment');
    });

    it('should disable the submit button when form is invalid', () => {
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      expect(btn.disabled).toBe(true);
    });

    it('should enable the submit button when form is valid', () => {
      component.form.get('content')!.setValue('A comment');
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      expect(btn.disabled).toBe(false);
    });
  });

  // --- Submission ---

  describe('onSubmit()', () => {
    it('should NOT call addComment when form is invalid', () => {
      component.onSubmit();
      expect(commentServiceMock.addComment).not.toHaveBeenCalled();
    });

    it('should call commentService.addComment with meetupId and content', () => {
      component.form.get('content')!.setValue('Great run!');
      component.onSubmit();
      expect(commentServiceMock.addComment).toHaveBeenCalledWith(42, 'Great run!');
    });

    it('should reset the form after submission', () => {
      component.form.get('content')!.setValue('Great run!');
      component.onSubmit();
      expect(component.form.get('content')!.value).toBeNull();
    });
  });
});
