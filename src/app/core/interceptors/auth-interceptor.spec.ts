import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth-service';
import { authInterceptor } from './auth-interceptor';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  const token = vi.fn();
  beforeEach(() => {
    token.mockReturnValue('jwt-de-prueba');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { token } },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function check(url: string, expected: string | null) {
    TestBed.inject(HttpClient).get(url).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne(url);
    expect(req.request.headers.get('Authorization')).toBe(expected);
    req.flush({});
  }
  it('adds Bearer only to an API request', () =>
    check(`${environment.apiUrl}/productos`, 'Bearer jwt-de-prueba'));
  it.each([
    'https://example.com/data',
    `${environment.apiUrl}-other/productos`,
    `${environment.apiUrl}/auth/login?test=1`,
  ])('does not attach the token to %s', (url) => check(url, null));
  it('does not attach an expired or absent token', () => {
    token.mockReturnValue(null);
    check(`${environment.apiUrl}/productos`, null);
  });
});
