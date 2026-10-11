import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { VentaList } from './venta-list';

describe('VentaList', () => {
  const url = `${environment.apiUrl}/ventas/buscar`;
  const pagina = {
    contenido: [],
    pagina: 0,
    tamanio: 10,
    totalElementos: 20,
    totalPaginas: 2,
    ultima: false,
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [VentaList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('paginates with applied filters even when the user edits the form', () => {
    const fixture = TestBed.createComponent(VentaList);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http
      .expectOne((r) => r.url === `${environment.apiUrl}/clientes`)
      .flush({ ...pagina, contenido: [] });
    http.expectOne((r) => r.url === url).flush(pagina);
    fixture.detectChanges();
    const estado: HTMLSelectElement = fixture.nativeElement.querySelector(
      'select[formControlName="estado"]',
    );
    estado.value = 'REGISTRADA';
    estado.dispatchEvent(new Event('change'));
    fixture.componentInstance.buscar();
    const buscar = http.expectOne((r) => r.url === url);
    expect(buscar.request.params.get('estado')).toBe('REGISTRADA');
    buscar.flush(pagina);
    estado.value = 'ANULADA';
    estado.dispatchEvent(new Event('change'));
    fixture.componentInstance.irA(1);
    const siguiente = http.expectOne((r) => r.url === url);
    expect(siguiente.request.params.get('estado')).toBe('REGISTRADA');
    expect(siguiente.request.params.get('pagina')).toBe('1');
    siguiente.flush({ ...pagina, pagina: 1 });
  });

  it('rejects reversed dates without a request and clears filters', () => {
    const fixture = TestBed.createComponent(VentaList);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne((r) => r.url === `${environment.apiUrl}/clientes`).flush(pagina);
    http.expectOne((r) => r.url === url).flush(pagina);
    fixture.detectChanges();
    for (const [name, value] of [
      ['desde', '2026-10-12'],
      ['hasta', '2026-10-11'],
    ]) {
      const input: HTMLInputElement = fixture.nativeElement.querySelector(
        `[formControlName="${name}"]`,
      );
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.componentInstance.buscar();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('posterior');
    http.expectNone((r) => r.url === url);
    fixture.componentInstance.limpiar();
    const limpiar = http.expectOne((r) => r.url === url);
    expect(limpiar.request.params.has('desde')).toBe(false);
    limpiar.flush(pagina);
  });
});
