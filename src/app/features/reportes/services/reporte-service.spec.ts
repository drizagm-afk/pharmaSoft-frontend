import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { ReporteService } from './reporte-service';

describe('ReporteService', () => {
  const url = `${environment.apiUrl}/reportes/ventas-por-categoria`;
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it.each([
    [null, null],
    ['2026-10-11', null],
    [null, '2026-10-14'],
    ['2026-10-11', '2026-10-14'],
  ])('sends only populated dates (%s, %s)', (desde, hasta) => {
    TestBed.inject(ReporteService).ventasPorCategoria(desde, hasta).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne((r) => r.url === url);
    expect(request.request.params.keys().sort()).toEqual(
      [...(desde ? ['desde'] : []), ...(hasta ? ['hasta'] : [])].sort(),
    );
    if (desde) expect(request.request.params.get('desde')).toBe(desde);
    if (hasta) expect(request.request.params.get('hasta')).toBe(hasta);
    request.flush([]);
  });

  it('maps the existing backend response to the required report model', () => {
    const recibido = vi.fn();
    TestBed.inject(ReporteService).ventasPorCategoria(null, null).subscribe(recibido);
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush([{ categoriaId: 9, categoria: 'Analgésicos', cantidad: 42, total: 610.5 }]);
    expect(recibido).toHaveBeenCalledWith([
      { categoriaId: 9, categoriaNombre: 'Analgésicos', cantidadVendida: 42, montoTotal: 610.5 },
    ]);
  });
});
