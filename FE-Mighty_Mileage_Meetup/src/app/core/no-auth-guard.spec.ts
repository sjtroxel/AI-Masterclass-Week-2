import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { noAuthGuard } from './no-auth-guard';

describe('noAuthGuard', () => {
  let router: Router;

  const executeGuard: CanActivateFn = (route, state) =>
    TestBed.runInInjectionContext(() => noAuthGuard(route, state));

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/login' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns true when user is NOT logged in', () => {
    const result = executeGuard(mockRoute, mockState);

    expect(result).toBe(true);
  });

  it('returns false when user IS logged in', () => {
    localStorage.setItem('token', 'valid-token');

    const result = executeGuard(mockRoute, mockState);

    expect(result).toBe(false);
  });

  it('navigates to / when user is logged in', () => {
    localStorage.setItem('token', 'valid-token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    executeGuard(mockRoute, mockState);

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('does not navigate when user is not logged in', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    executeGuard(mockRoute, mockState);

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
