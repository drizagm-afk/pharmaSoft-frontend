import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { AuthService } from './auth-service';
import { crearAuthPrueba } from './auth.fixture.spec-helper';

describe('Security navigation', () => {
  let auth: ReturnType<typeof crearAuthPrueba>;
  beforeEach(() => {
    auth = crearAuthPrueba(['CATALOGO_LEER']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('redirects an anonymous deep link to login with returnUrl', async () => {
    auth.sesion.set(null);
    const harness = await RouterTestingHarness.create('/ventas');
    expect(TestBed.inject(Router).url).toBe('/login?returnUrl=%2Fventas');
    expect(harness.routeNativeElement!.textContent).toContain('Iniciar sesión');
    expect(harness.routeNativeElement!.querySelector('app-header')).toBeNull();
  });
  it('does not allow the login page while authenticated', async () => {
    await RouterTestingHarness.create('/login');
    expect(TestBed.inject(Router).url).toBe('/inicio');
  });
  it.each([
    '/productos/nuevo',
    '/productos/134/editar',
    '/categorias/nuevo',
    '/categorias/9/editar',
    '/clientes',
    '/ventas',
    '/ventas/nueva',
    '/reportes',
  ])('denies direct navigation to %s without the required permission', async (url) => {
    const harness = await RouterTestingHarness.create(url);
    expect(TestBed.inject(Router).url).toBe('/acceso-denegado');
    expect(harness.routeNativeElement!.textContent).toContain('403 · Acceso denegado');
    expect(auth.sesion()).not.toBeNull();
  });
  it('filters the sidebar reactively and displays the session in the header', async () => {
    const harness = await RouterTestingHarness.create('/inicio');
    const sidebar = harness.routeNativeElement!.querySelector('app-sidebar')!;
    expect(sidebar.textContent).toContain('Productos');
    expect(sidebar.textContent).not.toContain('Ventas');
    expect(sidebar.textContent).not.toContain('Reportes');
    auth.sesion.update((s) => ({ ...s!, permisos: ['CATALOGO_LEER', 'VENTAS_LEER'] }));
    harness.detectChanges();
    expect(sidebar.textContent).toContain('Ventas');
    expect(harness.routeNativeElement!.querySelector('app-header')!.textContent).toContain(
      'Cuenta de prueba',
    );
    expect(harness.routeNativeElement!.querySelector('app-header')!.textContent).toContain(
      'expira',
    );
  });
});
