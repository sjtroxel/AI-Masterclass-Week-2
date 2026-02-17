import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { SignupComponent } from './signup';
import { AuthenticationService } from '../../core/services/authentication';
import { environment } from '../../../environments/environment';

const VALID_FORM = {
  first_name: 'Sam',
  last_name: 'Troxel',
  username: 'samt',
  email: 'sam@example.com',
  password: 'Secret1!',
  password_confirmation: 'Secret1!',
};

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthenticationService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthenticationService);
    router = TestBed.inject(Router);

    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // --- Instantiation ---

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Form initialisation ---

  describe('form initialisation', () => {
    it('should create the signupForm with all required controls', () => {
      const controls = ['first_name', 'last_name', 'username', 'email', 'password', 'password_confirmation'];
      controls.forEach((name) => {
        expect(component.signupForm.contains(name)).toBe(true);
      });
    });

    it('should initialise all fields as empty strings', () => {
      Object.keys(VALID_FORM).forEach((key) => {
        expect(component.signupForm.get(key)!.value).toBe('');
      });
    });

    it('should be invalid when empty', () => {
      expect(component.signupForm.valid).toBe(false);
    });

    it('should be valid when all fields are correctly filled', () => {
      component.signupForm.setValue(VALID_FORM);
      expect(component.signupForm.valid).toBe(true);
    });

    it('should be invalid when email format is wrong', () => {
      component.signupForm.setValue({ ...VALID_FORM, email: 'not-an-email' });
      expect(component.signupForm.valid).toBe(false);
    });
  });

  // --- Submit behaviour ---

  describe('signup()', () => {
    it('should NOT call the API when the form is invalid', () => {
      component.signup();
      httpMock.expectNone(`${environment.apiUrl}/signup`);
    });

    it('should POST to /signup with wrapped form data when valid', () => {
      component.signupForm.setValue(VALID_FORM);
      component.signup();

      const req = httpMock.expectOne(`${environment.apiUrl}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user: VALID_FORM });
      req.flush({ token: 'jwt-xyz', user: { id: 1, username: 'samt' } });
    });
  });

  // --- Successful signup with auto-login ---

  describe('on successful signup (with token)', () => {
    beforeEach(() => {
      component.signupForm.setValue(VALID_FORM);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
    });

    it('should store the token, user id, and username', () => {
      const tokenSpy = vi.spyOn(authService, 'setToken');
      const idSpy = vi.spyOn(authService, 'setUserId');
      const userSpy = vi.spyOn(authService, 'setUser');

      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush({
        token: 'jwt-xyz',
        user: { id: 1, username: 'samt' },
      });

      expect(tokenSpy).toHaveBeenCalledWith('jwt-xyz');
      expect(idSpy).toHaveBeenCalledWith(1);
      expect(userSpy).toHaveBeenCalledWith('samt');
    });

    it('should navigate to / after auto-login', () => {
      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush({
        token: 'jwt-xyz',
        user: { id: 1, username: 'samt' },
      });

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear any previous errors', () => {
      component.errors = ['old error'];
      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush({
        token: 'jwt-xyz',
        user: { id: 1, username: 'samt' },
      });

      expect(component.errors).toEqual([]);
    });
  });

  // --- Successful signup without token (redirect to login) ---

  describe('on successful signup (without token)', () => {
    it('should navigate to /login when no token is returned', () => {
      component.signupForm.setValue(VALID_FORM);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);

      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush({ message: 'Created' });

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // --- Failed signup ---

  describe('on failed signup', () => {
    beforeEach(() => {
      component.signupForm.setValue(VALID_FORM);
    });

    it('should populate errors array with Rails validation errors', () => {
      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush(
        { errors: ['Username has already been taken', 'Email is invalid'] },
        { status: 422, statusText: 'Unprocessable Entity' },
      );

      expect(component.errors).toEqual(['Username has already been taken', 'Email is invalid']);
    });

    it('should show a generic error when response has no errors array', () => {
      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(component.errors).toEqual(['An unexpected error occurred. Please try again.']);
    });

    it('should display error messages in the template', () => {
      component.signup();
      httpMock.expectOne(`${environment.apiUrl}/signup`).flush(
        { errors: ['Username has already been taken'] },
        { status: 422, statusText: 'Unprocessable Entity' },
      );

      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Username has already been taken');
    });
  });
});
