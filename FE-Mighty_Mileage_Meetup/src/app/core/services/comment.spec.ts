import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CommentService } from './comment';
import { Comment } from '../../shared/models/comment';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const mockComment: Comment = {
  id: 1,
  content: 'Great ride today!',
  created_at: '2026-03-01T12:00:00Z',
  updated_at: '2026-03-01T12:00:00Z',
  user: {
    id: 1,
    first_name: 'Jane',
    last_name: 'Doe',
    username: 'janedoe',
    email: 'jane@example.com',
  },
};

const mockComment2: Comment = {
  id: 2,
  content: 'Can\'t wait for next time!',
  created_at: '2026-03-01T13:00:00Z',
  updated_at: '2026-03-01T13:00:00Z',
  user: {
    id: 2,
    first_name: 'John',
    last_name: 'Smith',
    username: 'johnsmith',
    email: 'john@example.com',
  },
};

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CommentService);
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
    it('comments starts as empty array', () => {
      expect(service.comments()).toEqual([]);
    });

    it('loading starts as false', () => {
      expect(service.loading()).toBe(false);
    });

    it('totalPages starts as 1', () => {
      expect(service.totalPages()).toBe(1);
    });

    it('currentPage starts as 1', () => {
      expect(service.currentPage()).toBe(1);
    });
  });

  // --- getComments (paginated) ---

  describe('getComments()', () => {
    it('GETs /meetups/:id/comments with page param', () => {
      service.getComments(5, 2);
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(
        (r) => r.url === `${API}/meetups/5/comments` && r.params.get('page') === '2'
      );
      expect(req.request.method).toBe('GET');
      req.flush({
        comments: JSON.stringify([mockComment]),
        total_pages: 3,
        current_page: 2,
      });

      expect(service.comments().length).toBe(1);
      expect(service.comments()[0].content).toBe('Great ride today!');
      expect(service.totalPages()).toBe(3);
      expect(service.currentPage()).toBe(2);
      expect(service.loading()).toBe(false);
    });

    it('defaults to page 1 when no page is specified', () => {
      service.getComments(5);

      const req = httpMock.expectOne(
        (r) => r.url === `${API}/meetups/5/comments` && r.params.get('page') === '1'
      );
      req.flush({
        comments: JSON.stringify([mockComment]),
        total_pages: 1,
        current_page: 1,
      });

      expect(service.currentPage()).toBe(1);
    });

    it('sets comments to empty array on error', () => {
      service.getComments(5);

      const req = httpMock.expectOne(
        (r) => r.url === `${API}/meetups/5/comments`
      );
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(service.comments()).toEqual([]);
      expect(service.loading()).toBe(false);
    });
  });

  // --- addComment ---

  describe('addComment()', () => {
    it('POSTs to /meetups/:id/comments with wrapped content', () => {
      service.addComment(5, 'Nice meetup!').subscribe();

      const req = httpMock.expectOne(`${API}/meetups/5/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ comment: { content: 'Nice meetup!' } });
      req.flush(mockComment);
    });

    it('appends the new comment to the comments signal', () => {
      service.seedComments([mockComment]);

      service.addComment(5, 'Another comment').subscribe();

      const req = httpMock.expectOne(`${API}/meetups/5/comments`);
      req.flush(mockComment2);

      expect(service.comments().length).toBe(2);
      expect(service.comments()[1].id).toBe(2);
    });
  });

  // --- seedComments ---

  describe('seedComments()', () => {
    it('sets comments signal directly without HTTP call', () => {
      service.seedComments([mockComment, mockComment2]);

      expect(service.comments().length).toBe(2);
      expect(service.comments()[0].content).toBe('Great ride today!');
      // httpMock.verify() in afterEach confirms no HTTP was made
    });
  });

  // --- clearComments ---

  describe('clearComments()', () => {
    it('resets comments to empty array', () => {
      service.seedComments([mockComment]);
      service.clearComments();
      expect(service.comments()).toEqual([]);
    });

    it('resets totalPages to 1', () => {
      // Load some comments to change pagination state
      service.getComments(5, 2);
      httpMock.expectOne((r) => r.url === `${API}/meetups/5/comments`).flush({
        comments: JSON.stringify([mockComment]),
        total_pages: 5,
        current_page: 2,
      });

      service.clearComments();
      expect(service.totalPages()).toBe(1);
    });

    it('resets currentPage to 1', () => {
      service.getComments(5, 3);
      httpMock.expectOne((r) => r.url === `${API}/meetups/5/comments`).flush({
        comments: JSON.stringify([mockComment]),
        total_pages: 5,
        current_page: 3,
      });

      service.clearComments();
      expect(service.currentPage()).toBe(1);
    });
  });
});
