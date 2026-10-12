import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { VentasPorCategoria } from './ventas-por-categoria';

describe('VentasPorCategoria', () => {
  const url = `${environment.apiUrl}/reportes/ventas-por-categoria`;
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [VentasPorCategoria],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('summarizes category amounts and units', () => {
    const fixture = TestBed.createComponent(VentasPorCategoria);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush([
        { categoriaId: 1, categoria: 'Vitaminas', cantidad: 2, total: 2.4 },
        { categoriaId: 2, categoria: 'Higiene', cantidad: 3, total: 4.35 },
      ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('6.75');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
    const barras: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.barra'));
    expect(parseFloat(barras[0].style.width)).toBeCloseTo((2.4 / 4.35) * 100);
    expect(barras[1].style.width).toBe('100%');
  });

  it('renders zero amounts without invalid bar widths', () => {
    const fixture = TestBed.createComponent(VentasPorCategoria);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne(url)
      .flush([{ categoriaId: 1, categoria: 'Vitaminas', cantidad: 0, total: 0 }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.barra').style.width).toBe('0%');
    expect(fixture.nativeElement.textContent).not.toMatch(/NaN|Infinity/);
  });

  it('recovers from server failure with an empty result', () => {
    const fixture = TestBed.createComponent(VentasPorCategoria);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(url).flush({ message: 'Error temporal' }, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Error temporal');
    fixture.componentInstance.buscar();
    http.expectOne(url).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay ventas en el periodo seleccionado');
    expect(fixture.nativeElement.textContent).not.toContain('Error temporal');
  });
});
