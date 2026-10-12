import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { VentaDetalle } from './venta-detalle';

describe('VentaDetalle', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [VentaDetalle],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  it('rejects an invalid route identifier without contacting the server', () => {
    const fixture = TestBed.createComponent(VentaDetalle);
    fixture.componentRef.setInput('id', 'invalid');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('no es válido');
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it('renders and automatically prints a cancelled receipt even if client lookup fails', async () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {});
    const fixture = TestBed.createComponent(VentaDetalle);
    fixture.componentRef.setInput('id', '42');
    fixture.componentRef.setInput('imprimir', '1');
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}/ventas/42`).flush({
      id: 42,
      clienteId: 1,
      clienteNombre: 'Cliente de prueba',
      estado: 'ANULADA',
      fecha: '2026-10-11T12:00:00',
      total: 2.5,
      detalles: [
        { productoId: 1, productoNombre: 'Producto', cantidad: 1, precio: 2.5, subtotal: 2.5 },
      ],
    });
    http
      .expectOne(`${environment.apiUrl}/clientes/1`)
      .flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('000042');
    expect(fixture.nativeElement.textContent).toContain('ANULADA');
    expect(imprimir).toHaveBeenCalledOnce();
  });
});
