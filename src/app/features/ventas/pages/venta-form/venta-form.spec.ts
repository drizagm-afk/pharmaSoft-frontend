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
  const catalogo = (stock = 3) => {
    http.expectOne((r) => r.url === `${url}/clientes`).flush(pagina([cliente]));
    http.expectOne((r) => r.url === `${url}/productos`).flush(pagina([{ ...producto, stock }]));
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
    catalogo();
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
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
    catalogo(0);
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
});
