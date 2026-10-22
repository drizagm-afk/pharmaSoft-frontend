import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { errorInterceptor } from './error-interceptor';
import { environment } from '../../../environments/environment';

describe('errorInterceptor', () => {
  const cerrarSesion = vi.fn();
  const sesion = vi.fn();
  beforeEach(() => {
    cerrarSesion.mockClear();
    sesion.mockReturnValue({ token: 'test' });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { cerrarSesion, sesion } },
        { provide: Router, useValue: { url: '/productos' } },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function fail(url: string, status: number) {
    const error = vi.fn();
    TestBed.inject(HttpClient).get(url).subscribe({ error });
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush({ message: 'Mensaje del backend' }, { status, statusText: 'Error' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ status }));
  }
  it('logs out on API 401 and remembers the current page', () => {
    fail(`${environment.apiUrl}/productos`, 401);
    expect(cerrarSesion).toHaveBeenCalledWith('expirada', '/productos');
  });
  it.each([
    `${environment.apiUrl}/auth/login`,
    `${environment.apiUrl}/auth/login?test=1`,
    'https://example.com/api',
  ])('does not log out on a 401 from %s', (url) => {
    fail(url, 401);
    expect(cerrarSesion).not.toHaveBeenCalled();
  });
  it('preserves the session and propagates a 403', () => {
    fail(`${environment.apiUrl}/productos`, 403);
    expect(cerrarSesion).not.toHaveBeenCalled();
  });
  it('does not repeat logout after another request cleared the session', () => {
    sesion.mockReturnValue(null);
    fail(`${environment.apiUrl}/productos`, 401);
    expect(cerrarSesion).not.toHaveBeenCalled();
  });
});
