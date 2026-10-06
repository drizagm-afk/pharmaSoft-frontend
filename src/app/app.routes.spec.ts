import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { cliente, pagina } from './features/clientes/cliente.fixture.spec-helper';

describe('Feature navigation integration', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding()),
      provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('preserves the layout while switching from clients to categories', async () => {
    const harness = await RouterTestingHarness.create('/clientes');
    http.expectOne(r => r.url === `${environment.apiUrl}/clientes`).flush(pagina());
    harness.detectChanges();
    const header = harness.routeNativeElement!.querySelector('app-header');
    const sidebar = harness.routeNativeElement!.querySelector('app-sidebar');
    expect(sidebar!.querySelector('a.activo')!.getAttribute('href')).toBe('/clientes');
    expect(harness.routeNativeElement!.textContent).toContain(cliente.dni);
    await harness.navigateByUrl('/categorias');
    http.expectOne(`${environment.apiUrl}/categorias`).flush([]);
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('app-header')).toBe(header);
    expect(harness.routeNativeElement!.querySelector('app-sidebar')).toBe(sidebar);
    expect(sidebar!.querySelector('a.activo')!.getAttribute('href')).toBe('/categorias');
  });

  it('binds the edit route ID and loads the matching client', async () => {
    const harness = await RouterTestingHarness.create('/clientes/1/editar');
    http.expectOne(`${environment.apiUrl}/clientes/1`).flush(cliente);
    harness.detectChanges();
    expect((harness.routeNativeElement!.querySelector('#dni') as HTMLInputElement).value).toBe(cliente.dni);
  });
});
