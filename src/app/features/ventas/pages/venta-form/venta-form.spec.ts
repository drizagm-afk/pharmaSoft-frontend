import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { cliente } from '../../../clientes/cliente.fixture.spec-helper';
import { Producto } from '../../../productos/models/producto.model';
import { VentaForm } from './venta-form';

const producto: Producto = {
  id: 1,
  nombre: 'Vitamina C',
  categoriaId: 1,
  categoriaNombre: 'Vitaminas',
  precio: 1.2,
  stock: 3,
  estado: true,
  descripcion: null,
  fechaCreacion: '2026-10-11',
  fechaModificacion: null,
};
const pagina = <T>(contenido: T[]) => ({
  contenido,
  pagina: 0,
  tamanio: 100,
  totalElementos: contenido.length,
  totalPaginas: 1,
  ultima: true,
});

describe('VentaForm', () => {
  let fixture: ComponentFixture<VentaForm>;
  let http: HttpTestingController;
  const url = environment.apiUrl;
  const actualizarSeleccion = (stock = 3) => {
    http.expectOne(`${url}/clientes/${cliente.id}`).flush(cliente);
    http.expectOne(`${url}/productos/${producto.id}`).flush({ ...producto, stock });
    fixture.detectChanges();
  };
  const preparar = () => {
    fixture.componentInstance.elegirCliente(cliente);
    fixture.componentInstance.agregarProducto(producto);
    fixture.detectChanges();
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentaForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(VentaForm);
    fixture.detectChanges();
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('requires a client and details without sending a request', () => {
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Busque y seleccione');
    http.expectNone(`${url}/ventas`);
  });

  it('combines repeated products and calculates decimal totals', () => {
    preparar();
    fixture.componentInstance.agregarProducto(producto);
    fixture.detectChanges();
    expect(fixture.componentInstance.detalles.length).toBe(1);
    expect(fixture.componentInstance.detalles.at(0).controls.cantidad.value).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('2.40');
  });

  it.each([0, -1, 1.5, 4])('rejects invalid or excessive quantity %s', (cantidad) => {
    preparar();
    fixture.componentInstance.detalles.at(0).controls.cantidad.setValue(cantidad);
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    http.expectNone(`${url}/ventas`);
  });

  it('returns from confirmation without creating a sale', () => {
    preparar();
    fixture.componentInstance.revisar();
    fixture.componentInstance.volver();
    fixture.componentInstance.confirmar();
    http.expectNone(`${url}/ventas`);
    expect(fixture.componentInstance.detalles.length).toBe(1);
  });

  it('sends only identifiers and quantities and prevents double submission', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    preparar();
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    fixture.componentInstance.confirmar();
    const request = http.expectOne(`${url}/ventas`);
    expect(request.request.body).toEqual({
      clienteId: cliente.id,
      detalles: [{ productoId: 1, cantidad: 1 }],
    });
    request.flush({ id: 42 });
    expect(navigate).toHaveBeenCalledWith(['/ventas', 42], {
      queryParams: { nueva: 1, imprimir: 1 },
    });
  });

  it('refreshes stock after a conflict and preserves the entered sale', () => {
    preparar();
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    http
      .expectOne(`${url}/ventas`)
      .flush({ message: 'Stock insuficiente' }, { status: 409, statusText: 'Conflict' });
    actualizarSeleccion(0);
    expect(fixture.componentInstance.detalles.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Stock insuficiente');
    expect(fixture.nativeElement.textContent).toContain('Producto no disponible');
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    http.expectNone(`${url}/ventas`);
  });

  it('shows server failure and allows a retry with the same details', () => {
    preparar();
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    http
      .expectOne(`${url}/ventas`)
      .flush({ message: 'Error temporal' }, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Error temporal');
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    http
      .expectOne(`${url}/ventas`)
      .flush({ message: 'Error temporal' }, { status: 500, statusText: 'Error' });
  });

  const escribir = (campo: string, texto: string) => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector(`[data-testid="${campo}"]`);
    input.value = texto;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('finds a product outside the old 100-record window through the server', async () => {
    vi.useFakeTimers();
    http.expectNone((r) => r.url === `${url}/productos` || r.url === `${url}/clientes`);
    escribir('buscar-producto', 'Solución salina');
    await vi.advanceTimersByTimeAsync(250);
    const req = http.expectOne((r) => r.url === `${url}/productos/buscar`);
    expect(req.request.params.get('texto')).toBe('Solución salina');
    req.flush(pagina([{ ...producto, id: 5015, nombre: 'Solución salina 100 ml' }]));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="opcion-producto"]').textContent,
    ).toContain('Solución salina 100 ml');
  });

  it('cancels an old search and retains the selected product and total', async () => {
    vi.useFakeTimers();
    preparar();
    escribir('buscar-producto', 'Vitamina');
    await vi.advanceTimersByTimeAsync(250);
    const anterior = http.expectOne((r) => r.url === `${url}/productos/buscar`);
    escribir('buscar-producto', 'Solución');
    expect(anterior.cancelled).toBe(true);
    await vi.advanceTimersByTimeAsync(250);
    http
      .expectOne((r) => r.url === `${url}/productos/buscar`)
      .flush(pagina([{ ...producto, id: 5015, nombre: 'Solución salina 100 ml' }]));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="total-venta"]').textContent,
    ).toContain('1.20');
    expect(fixture.componentInstance.detalles.at(0).controls.productoId.value).toBe(1);
  });

  it('selects a customer from a server search without a preloaded list', async () => {
    vi.useFakeTimers();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    escribir('buscar-cliente', 'Nicolás Zúñiga');
    await vi.advanceTimersByTimeAsync(250);
    http
      .expectOne((r) => r.url === `${url}/clientes/buscar`)
      .flush(pagina([{ ...cliente, id: 1001, nombres: 'Nicolás', apellidos: 'Zúñiga Salas' }]));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[data-testid="opcion-cliente"]').click();
    fixture.componentInstance.agregarProducto(producto);
    fixture.componentInstance.revisar();
    fixture.componentInstance.confirmar();
    const req = http.expectOne(`${url}/ventas`);
    expect(req.request.body.clienteId).toBe(1001);
    req.flush({ id: 44 });
  });

  it('recovers from a failed search and clears obsolete results immediately', async () => {
    vi.useFakeTimers();
    escribir('buscar-producto', 'Vitamina');
    await vi.advanceTimersByTimeAsync(250);
    http
      .expectOne((r) => r.url === `${url}/productos/buscar`)
      .flush(
        { message: 'No se pudo consultar el catálogo' },
        { status: 503, statusText: 'Unavailable' },
      );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se pudo consultar el catálogo');
    escribir('buscar-producto', 'Vitamina C');
    await vi.advanceTimersByTimeAsync(250);
    http.expectOne((r) => r.url === `${url}/productos/buscar`).flush(pagina([producto]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="opcion-producto"]')).toHaveLength(
      1,
    );
    escribir('buscar-producto', '');
    expect(fixture.nativeElement.querySelectorAll('[data-testid="opcion-producto"]')).toHaveLength(
      0,
    );
  });
});
