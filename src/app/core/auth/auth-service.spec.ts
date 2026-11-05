import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth-service';
import { LoginResponse } from './auth.model';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  const key = 'pharmasoft.sesion';
  const response: LoginResponse = {
    token: 'jwt-de-prueba',
    tipo: 'Bearer',
    expiraEnSegundos: 60,
    username: 'vendedor',
    nombreCompleto: 'Vendedor de prueba',
    roles: ['VENDEDOR'],
    permisos: ['CATALOGO_LEER', 'VENTAS_LEER'],
  };
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });
  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
    vi.useRealTimers();
    sessionStorage.clear();
  });
  function login() {
    const auth = TestBed.inject(AuthService);
    auth.login({ username: 'vendedor', password: 'Password2026*' }).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
    return auth;
  }
  function emitir(duracion: number) {
    const auth = TestBed.inject(AuthService);
    auth.login({ username: 'vendedor', password: 'Password2026*' }).subscribe();
    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ ...response, expiraEnSegundos: duracion });
    return auth;
  }
  it('starts warning exactly when a three-minute session has two minutes left', () => {
    const auth = emitir(180);
    expect(auth.segundosRestantes()).toBe(180);
    expect(auth.porVencer()).toBe(false);
    vi.advanceTimersByTime(59_000);
    expect(auth.segundosRestantes()).toBe(121);
    expect(auth.porVencer()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(auth.segundosRestantes()).toBe(120);
    expect(auth.porVencer()).toBe(true);
    vi.advanceTimersByTime(13_000);
    expect(auth.segundosRestantes()).toBe(107);
  });
  it('hiding the warning neither changes the expiry nor prevents logout at zero', () => {
    const auth = emitir(180);
    const expiry = auth.sesion()!.expiraEn;
    vi.advanceTimersByTime(60_000);
    auth.ocultarAviso();
    expect(auth.avisoOculto()).toBe(true);
    expect(auth.sesion()!.expiraEn).toBe(expiry);
    vi.advanceTimersByTime(120_000);
    expect(auth.sesion()).toBeNull();
    expect(auth.segundosRestantes()).toBe(0);
    vi.runAllTimers();
    expect(vi.getTimerCount()).toBe(0);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledTimes(1);
  });
  it('resets dismissed state and replaces both timers when a new session starts', () => {
    const auth = emitir(180);
    vi.advanceTimersByTime(60_000);
    auth.ocultarAviso();
    emitir(360);
    expect(auth.avisoOculto()).toBe(false);
    vi.advanceTimersByTime(120_000);
    expect(auth.sesion()).not.toBeNull();
    expect(auth.segundosRestantes()).toBe(240);
    auth.cerrarSesion();
    vi.runAllTimers();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('resumes the countdown after reloading a saved session', () => {
    sessionStorage.setItem(key, JSON.stringify({ ...response, expiraEn: Date.now() + 107_000 }));
    const auth = TestBed.inject(AuthService);
    expect(auth.segundosRestantes()).toBe(107);
    expect(auth.porVencer()).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(auth.segundosRestantes()).toBe(106);
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps a dismissed warning hidden after F5 during the same session', () => {
    sessionStorage.setItem(
      key,
      JSON.stringify({ ...response, expiraEn: Date.now() + 107_000, avisoOculto: true }),
    );
    const auth = TestBed.inject(AuthService);
    expect(auth.porVencer()).toBe(true);
    expect(auth.avisoOculto()).toBe(true);
    expect(auth.segundosRestantes()).toBe(107);
  });
  it.each([{ empleadoNombre: 'Nombre del backend' }, { nombreCompleto: 'Nombre de la guía' }])(
    'normalizes auth/me without replacing the stored session: %o',
    (name) => {
      const auth = emitir(3600);
      const stored = sessionStorage.getItem(key);
      const next = vi.fn();
      auth.obtenerPerfil().subscribe(next);
      const req = http.expectOne(`${environment.apiUrl}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush({
        username: 'vendedor',
        roles: ['ALMACENERO'],
        permisos: ['CATALOGO_ESCRIBIR'],
        ...name,
      });
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCompleto: 'empleadoNombre' in name ? name.empleadoNombre : name.nombreCompleto,
        }),
      );
      expect(sessionStorage.getItem(key)).toBe(stored);
      expect(auth.sesion()!.roles).toEqual(['VENDEDOR']);
    },
  );
  it('stores profile and expiry without storing the password', () => {
    const start = Date.now();
    const auth = login();
    const stored = JSON.parse(sessionStorage.getItem(key)!);
    expect(stored.expiraEn).toBe(start + 60_000);
    expect(stored).toEqual(auth.sesion());
    expect(stored.password).toBeUndefined();
    expect(auth.token()).toBe(response.token);
    expect(auth.tienePermiso('VENTAS_LEER')).toBe(true);
    expect(auth.tienePermiso('CATALOGO_ESCRIBIR')).toBe(false);
  });
  it('restores an unexpired session after a reload', () => {
    const stored = { ...response, expiraEn: Date.now() + 60_000 };
    sessionStorage.setItem(key, JSON.stringify(stored));
    expect(TestBed.inject(AuthService).sesion()).toEqual(stored);
  });
  it.each([
    'broken JSON',
    '{}',
    'null',
    JSON.stringify({ ...response, expiraEn: 0 }),
    JSON.stringify({ ...response, expiraEn: Date.now() + 60_000, permisos: 'invalid' }),
    JSON.stringify({ ...response, expiraEn: 'tomorrow' }),
  ])('discards corrupt or expired storage: %s', (value) => {
    sessionStorage.setItem(key, value);
    expect(TestBed.inject(AuthService).sesion()).toBeNull();
    expect(sessionStorage.getItem(key)).toBeNull();
  });
  it('expires automatically and preserves the current URL', () => {
    const auth = login();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/productos?categoriaId=9');
    vi.advanceTimersByTime(60_000);
    expect(auth.sesion()).toBeNull();
    expect(sessionStorage.getItem(key)).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { expirada: '1', returnUrl: '/productos?categoriaId=9' },
    });
  });
  it('clears storage and cancels the expiry timer on logout', () => {
    const auth = login();
    auth.cerrarSesion();
    expect(auth.autenticado()).toBe(false);
    expect(sessionStorage.getItem(key)).toBeNull();
    vi.advanceTimersByTime(60_000);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledTimes(1);
  });
});
