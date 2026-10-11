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
    expect(fixture.nativeElement.textContent).toContain('No hay ventas registradas');
    expect(fixture.nativeElement.textContent).not.toContain('Error temporal');
  });
});
