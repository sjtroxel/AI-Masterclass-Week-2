import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NavbarComponent } from './navbar';
import { AuthenticationService } from '../../../core/services/authentication';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: {
    isLoggedIn: ReturnType<typeof vi.fn>;
    currentUser: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  function createComponent() {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: vi.fn().mockReturnValue(false),
      currentUser: vi.fn().mockReturnValue(null),
      logout: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        provideRouter([]),
      ],
    });

    router = TestBed.inject(Router);
  });

  // --- Instantiation ---

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  // --- Logged-out state ---

  describe('when logged out', () => {
    beforeEach(() => {
      authServiceMock.isLoggedIn.mockReturnValue(false);
      authServiceMock.currentUser.mockReturnValue(null);
      createComponent();
    });

    it('should show Login link', () => {
      const el: HTMLElement = fixture.nativeElement;
      const loginLink = el.querySelector('a[href="/login"]');
      expect(loginLink).toBeTruthy();
      expect(loginLink!.textContent).toContain('Login');
    });

    it('should show Sign Up link', () => {
      const el: HTMLElement = fixture.nativeElement;
      const signupLink = el.querySelector('a[href="/signup"]');
      expect(signupLink).toBeTruthy();
      expect(signupLink!.textContent).toContain('Sign Up');
    });

    it('should NOT show the Logout button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const logoutBtn = el.querySelector('button.btn-danger');
      expect(logoutBtn).toBeNull();
    });

    it('should NOT show a username greeting', () => {
      const el: HTMLElement = fixture.nativeElement;
      const greeting = el.querySelector('.username');
      expect(greeting).toBeNull();
    });
  });

  // --- Logged-in state ---

  describe('when logged in', () => {
    beforeEach(() => {
      authServiceMock.isLoggedIn.mockReturnValue(true);
      authServiceMock.currentUser.mockReturnValue({ username: 'rider1' });
      createComponent();
    });

    it('should show username greeting', () => {
      const el: HTMLElement = fixture.nativeElement;
      const greeting = el.querySelector('.username');
      expect(greeting).toBeTruthy();
      expect(greeting!.textContent).toContain('rider1');
    });

    it('should show Logout button', () => {
      const el: HTMLElement = fixture.nativeElement;
      const logoutBtn = el.querySelector('button.btn-danger');
      expect(logoutBtn).toBeTruthy();
      expect(logoutBtn!.textContent).toContain('Logout');
    });

    it('should NOT show Login or Sign Up links', () => {
      const el: HTMLElement = fixture.nativeElement;
      const loginLink = el.querySelector('a[href="/login"]');
      const signupLink = el.querySelector('a[href="/signup"]');
      expect(loginLink).toBeNull();
      expect(signupLink).toBeNull();
    });
  });

  // --- Logout action ---

  describe('logout()', () => {
    beforeEach(() => {
      authServiceMock.isLoggedIn.mockReturnValue(true);
      authServiceMock.currentUser.mockReturnValue({ username: 'rider1' });
      createComponent();
    });

    it('should call authService.logout() and navigate to /login when Logout button is clicked', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const el: HTMLElement = fixture.nativeElement;
      const logoutBtn = el.querySelector<HTMLButtonElement>('button.btn-danger')!;
      logoutBtn.click();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
