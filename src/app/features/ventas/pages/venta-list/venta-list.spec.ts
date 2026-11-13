import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { environment } from '../../../../../environments/environment';
import { VentaList } from './venta-list';

describe('VentaList con estado en URL', () => {
  const url = `${environment.apiUrl}/ventas/buscar`;
  const pagina = {
    contenido: [],
    pagina: 0,
    tamanio: 20,
    totalElementos: 60,
    totalPaginas: 3,
    ultima: false,
  };
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'ventas', component: VentaList }], withComponentInputBinding()),
        provideLocationMocks(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function abrir(ruta = '/ventas') {
    const harness = await RouterTestingHarness.create();
    TestBed.inject(Router).setUpLocationChangeListener();
    const component = await harness.navigateByUrl(ruta, VentaList);
    http.expectOne((r) => r.url === `${environment.apiUrl}/clientes`).flush(pagina);
    return { harness, component };
  }
  function lectura() {
    return http.expectOne((r) => r.url === url);
  }

  it('restaura filtros y página de la URL al abrir y navegar hacia atrás', async () => {
    const ruta =
      '/ventas?pagina=2&tamanio=20&estado=REGISTRADA&clienteId=11&desde=2026-11-01&hasta=2026-11-12';
    const { harness } = await abrir(ruta);
    const req = lectura();
    expect(req.request.params.get('pagina')).toBe('2');
    expect(req.request.params.get('clienteId')).toBe('11');
    expect(req.request.params.get('estado')).toBe('REGISTRADA');
    req.flush({ ...pagina, pagina: 2 });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      (harness.routeNativeElement?.querySelector('[formControlName="desde"]') as HTMLInputElement)
        .value,
    ).toBe('2026-11-01');
    await harness.navigateByUrl('/ventas?pagina=0', VentaList);
    lectura().flush(pagina);
    await harness.fixture.whenStable();
    TestBed.inject(Location).back();
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe(ruta));
    const volver = lectura();
    expect(volver.request.params.get('estado')).toBe('REGISTRADA');
    volver.flush({ ...pagina, pagina: 2 });
    await harness.fixture.whenStable();
  });
  it('solo aplica filtros al buscar y los conserva al paginar', async () => {
    const { harness, component } = await abrir();
    lectura().flush(pagina);
    await harness.fixture.whenStable();
    const estado = harness.routeNativeElement?.querySelector(
      '[formControlName="estado"]',
    ) as HTMLSelectElement;
    estado.value = 'REGISTRADA';
    estado.dispatchEvent(new Event('change'));
    component.buscar();
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toContain('estado=REGISTRADA'));
    const req = lectura();
    expect(req.request.params.get('pagina')).toBe('0');
    req.flush(pagina);
    await harness.fixture.whenStable();
    estado.value = 'ANULADA';
    estado.dispatchEvent(new Event('change'));
    component.irA(1);
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toContain('pagina=1'));
    const siguiente = lectura();
    expect(siguiente.request.params.get('estado')).toBe('REGISTRADA');
    siguiente.flush({ ...pagina, pagina: 1 });
    await harness.fixture.whenStable();
  });
  it('rechaza fechas invertidas y limpiar elimina los filtros de la URL', async () => {
    const { harness, component } = await abrir('/ventas?pagina=2&estado=ANULADA');
    lectura().flush({ ...pagina, pagina: 2 });
    await harness.fixture.whenStable();
    for (const [name, value] of [
      ['desde', '2026-11-12'],
      ['hasta', '2026-11-01'],
    ]) {
      const input = harness.routeNativeElement?.querySelector(
        `[formControlName="${name}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    component.buscar();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('posterior');
    http.expectNone((r) => r.url === url);
    component.limpiar();
    await vi.waitFor(() => expect(TestBed.inject(Router).url).not.toContain('estado='));
    const req = lectura();
    expect(req.request.params.has('estado')).toBe(false);
    expect(req.request.params.get('pagina')).toBe('0');
    req.flush(pagina);
    await harness.fixture.whenStable();
  });
});
