import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authTokenInterceptor } from './auth-token-interceptor';
import { environment } from '../../environments/environment';

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds Authorization header when token exists in localStorage', () => {
    localStorage.setItem('token', 'my-jwt-token');

    http.get(`${environment.apiUrl}/meetups`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/meetups`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush([]);
  });

  it('does not add Authorization header when no token exists', () => {
    http.get(`${environment.apiUrl}/meetups`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/meetups`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('passes the request through unchanged when no token exists', () => {
    http.get(`${environment.apiUrl}/meetups`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/meetups`);
    expect(req.request.method).toBe('GET');
    expect(req.request.url).toBe(`${environment.apiUrl}/meetups`);
    req.flush([]);
  });

  it('preserves existing headers when adding Authorization', () => {
    localStorage.setItem('token', 'test-token');

    http.get(`${environment.apiUrl}/meetups`, {
      headers: { 'X-Custom': 'value' },
    }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/meetups`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.headers.get('X-Custom')).toBe('value');
    req.flush([]);
  });

  it('works with POST requests too', () => {
    localStorage.setItem('token', 'post-token');

    http.post(`${environment.apiUrl}/meetups`, { title: 'Run' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/meetups`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer post-token');
    req.flush({});
  });
});
