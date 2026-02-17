import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { AuthenticationService } from './authentication';
import { environment } from '../../../environments/environment';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // --- Instantiation ---

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- login() ---

  describe('login()', () => {
    it('should POST to /login with username and password', () => {
      service.login('rider1', 'secret').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'rider1', password: 'secret' });
      req.flush({ token: 'abc123' });
    });

    it('should return the token from the server response', () => {
      let result: { token: string } | undefined;
      service.login('rider1', 'secret').subscribe((res) => (result = res));

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      req.flush({ token: 'jwt-token-xyz' });

      expect(result?.token).toBe('jwt-token-xyz');
    });
  });

  // --- signup() ---

  describe('signup()', () => {
    it('should POST to /signup with wrapped user payload', () => {
      const user = { username: 'newrider', password: 'Pass1', email: 'r@r.com' };
      service.signup(user).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user });
      req.flush({});
    });
  });

  // --- Token management ---

  describe('token management', () => {
    it('setToken() persists to localStorage', () => {
      service.setToken('my-jwt');
      expect(localStorage.getItem('token')).toBe('my-jwt');
    });

    it('getToken() reads from localStorage', () => {
      localStorage.setItem('token', 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });

    it('getToken() returns null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  // --- User ID management ---

  describe('user ID management', () => {
    it('setUserId() stores numeric id as string in localStorage', () => {
      service.setUserId(42);
      expect(localStorage.getItem('user_id')).toBe('42');
    });

    it('getUserId() returns parsed integer', () => {
      localStorage.setItem('user_id', '99');
      expect(service.getUserId()).toBe(99);
    });

    it('getUserId() returns null when no user_id is stored', () => {
      expect(service.getUserId()).toBeNull();
    });
  });

  // --- Username management ---

  describe('username management', () => {
    it('setUser() stores username in localStorage', () => {
      service.setUser('rider1');
      expect(localStorage.getItem('username')).toBe('rider1');
    });

    it('currentUser() returns object when username is stored', () => {
      localStorage.setItem('username', 'rider1');
      expect(service.currentUser()).toEqual({ username: 'rider1' });
    });

    it('currentUser() returns null when no username is stored', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('clearUser() removes username and user_id from localStorage', () => {
      localStorage.setItem('username', 'rider1');
      localStorage.setItem('user_id', '1');
      service.clearUser();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
    });
  });

  // --- Auth checks ---

  describe('isLoggedIn()', () => {
    it('returns false when no token is in localStorage', () => {
      expect(service.isLoggedIn()).toBe(false);
    });

    it('returns true when a token is present', () => {
      localStorage.setItem('token', 'some-token');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  // --- logout() ---

  describe('logout()', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem('token', 'valid-token');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('removes username and user_id from localStorage', () => {
      localStorage.setItem('username', 'rider1');
      localStorage.setItem('user_id', '1');
      service.logout();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
    });

    it('navigates to /login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      service.logout();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
