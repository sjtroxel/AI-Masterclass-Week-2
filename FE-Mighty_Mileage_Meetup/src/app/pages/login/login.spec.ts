import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login';
import { AuthenticationService } from '../../core/services/authentication';
import { environment } from '../../../environments/environment';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthenticationService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
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
    it('should create the loginForm with username and password controls', () => {
      expect(component.loginForm.contains('username')).toBe(true);
      expect(component.loginForm.contains('password')).toBe(true);
    });

    it('should initialise both fields as empty strings', () => {
      expect(component.loginForm.get('username')!.value).toBe('');
      expect(component.loginForm.get('password')!.value).toBe('');
    });

    it('should mark the form as invalid when empty', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('should mark the form as valid when both fields are filled', () => {
      component.loginForm.setValue({ username: 'rider1', password: 'secret' });
      expect(component.loginForm.valid).toBe(true);
    });
  });

  // --- Validation messages in template ---

  describe('validation messages', () => {
    it('should show username error when field is touched and empty', () => {
      component.loginForm.get('username')!.markAsTouched();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Username is required');
    });

    it('should show password error when field is touched and empty', () => {
      component.loginForm.get('password')!.markAsTouched();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('Password is required');
    });
  });

  // --- Submit behaviour ---

  describe('onSubmit()', () => {
    it('should NOT call the API when the form is invalid', () => {
      component.onSubmit();
      httpMock.expectNone(`${environment.apiUrl}/login`);
    });

    it('should POST to /login with form values when valid', () => {
      component.loginForm.setValue({ username: 'rider1', password: 'secret' });
      component.onSubmit();

      const req = httpMock.expectOne(`${environment.apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'rider1', password: 'secret' });
      req.flush({ token: 'jwt-abc', user: { id: 7, username: 'rider1' } });
    });
  });

  // --- Successful login ---

  describe('on successful login', () => {
    beforeEach(() => {
      component.loginForm.setValue({ username: 'rider1', password: 'secret' });
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
    });

    it('should store the token via AuthenticationService', () => {
      const spy = vi.spyOn(authService, 'setToken');
      component.onSubmit();

      httpMock.expectOne(`${environment.apiUrl}/login`).flush({
        token: 'jwt-abc',
        user: { id: 7, username: 'rider1' },
      });

      expect(spy).toHaveBeenCalledWith('jwt-abc');
    });

    it('should store the user id and username', () => {
      const idSpy = vi.spyOn(authService, 'setUserId');
      const userSpy = vi.spyOn(authService, 'setUser');
      component.onSubmit();

      httpMock.expectOne(`${environment.apiUrl}/login`).flush({
        token: 'jwt-abc',
        user: { id: 7, username: 'rider1' },
      });

      expect(idSpy).toHaveBeenCalledWith(7);
      expect(userSpy).toHaveBeenCalledWith('rider1');
    });

    it('should navigate to / after login', () => {
      component.onSubmit();

      httpMock.expectOne(`${environment.apiUrl}/login`).flush({
        token: 'jwt-abc',
        user: { id: 7, username: 'rider1' },
      });

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear the error flag', () => {
      component.isError = true;
      component.onSubmit();

      httpMock.expectOne(`${environment.apiUrl}/login`).flush({
        token: 'jwt-abc',
        user: { id: 7, username: 'rider1' },
      });

      expect(component.isError).toBe(false);
    });
  });

  // --- Failed login ---

  describe('on failed login', () => {
    beforeEach(() => {
      component.loginForm.setValue({ username: 'rider1', password: 'wrong' });
    });

    it('should set isError to true', () => {
      component.onSubmit();

      httpMock.expectOne(`${environment.apiUrl}/login`).flush(
        { error: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

      expect(component.isError).toBe(true);
    });

    it('should display the error message in the template', () => {
      component.onSubmit();

      httpMock.expectOne(`${environment.apiUrl}/login`).flush(
        { error: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' },
      );

      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.textContent).toContain('credentials failed');
    });
  });
});
