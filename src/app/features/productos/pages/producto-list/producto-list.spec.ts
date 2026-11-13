import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ProductoList } from './producto-list';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/auth/auth-service';
import { crearAuthPrueba } from '../../../../core/auth/auth.fixture.spec-helper';

describe('ProductoList con estado en URL', () => {
  const url = `${environment.apiUrl}/productos`;
  const producto = {
    id: 1,
    nombre: 'Vitamina C',
    precio: 5,
    stock: 2,
    estado: true,
    categoriaId: 46,
    categoriaNombre: 'Vitaminas',
    descripcion: null,
    fechaCreacion: '2026-10-06',
    fechaModificacion: null,
  };
  const pagina = {
    contenido: [producto],
    pagina: 0,
    tamanio: 20,
    totalElementos: 45,
    totalPaginas: 3,
    ultima: false,
  };
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{ path: 'productos', component: ProductoList }],
          withComponentInputBinding(),
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: crearAuthPrueba() },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  async function abrir(ruta = '/productos') {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(ruta, ProductoList);
    http
      .expectOne(`${environment.apiUrl}/categorias`)
      .flush([{ id: 46, nombre: 'Vitaminas', estado: true }]);
    return { harness, component };
  }
  function lectura() {
    return http.expectOne((r) => r.url === url);
  }

  it('restaura pagina, tamanio y orden de una URL directa', async () => {
    const { harness } = await abrir('/productos?pagina=2&tamanio=20&orden=precio&dir=desc');
    const req = lectura();
    expect(req.request.params.toString()).toBe(
      'pagina=2&tamanio=20&ordenarPor=precio&direccion=desc',
    );
    req.flush({ ...pagina, pagina: 2, ultima: true });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Página 3 de 3');
    expect(
      harness.routeNativeElement?.querySelector('[data-testid="tabla-productos"]'),
    ).not.toBeNull();
  });
  it('mantiene la tabla durante la carga y cancela peticiones sustituidas', async () => {
    const { harness } = await abrir();
    lectura().flush(pagina);
    await harness.fixture.whenStable();
    await harness.navigateByUrl('/productos?pagina=1', ProductoList);
    const anterior = lectura();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Vitamina C');
    await harness.navigateByUrl('/productos?pagina=2', ProductoList);
    expect(anterior.cancelled).toBe(true);
    lectura().flush({ ...pagina, pagina: 2, ultima: true });
    await harness.fixture.whenStable();
  });
  it('guarda tamaño, orden y categoría en la URL y reinicia la página', async () => {
    const { component, harness } = await abrir('/productos?pagina=2');
    lectura().flush({ ...pagina, pagina: 2 });
    await harness.fixture.whenStable();
    component.ordenar('precio');
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toContain('orden=precio'));
    expect(TestBed.inject(Router).url).toContain('pagina=0');
    lectura().flush(pagina);
    await harness.fixture.whenStable();
    component.cambiarTamanio(50);
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toContain('tamanio=50'));
    const req = lectura();
    expect(req.request.params.get('tamanio')).toBe('50');
    req.flush({ ...pagina, tamanio: 50, totalPaginas: 1 });
    await harness.fixture.whenStable();
    component.filtrarPorCategoria('47');
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toContain('categoriaId=47'));
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('No hay productos de esta');
    http.expectNone((r) => r.url === url);
  });
  it('preserva permisos y la baja recarga la página actual', async () => {
    const { component, harness } = await abrir();
    lectura().flush(pagina);
    await harness.fixture.whenStable();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.darDeBaja(producto);
    http.expectOne(`${url}/1`).flush(null);
    TestBed.tick();
    lectura().flush({ ...pagina, contenido: [{ ...producto, estado: false }] });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Inactivo');
    confirm.mockRestore();
    const auth = TestBed.inject(AuthService) as unknown as ReturnType<typeof crearAuthPrueba>;
    auth.sesion.update((s) => ({ ...s!, permisos: ['CATALOGO_LEER'] }));
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).not.toContain('Acciones');
    expect(harness.routeNativeElement?.textContent).not.toContain('Dar de baja');
  });
  it('normaliza parámetros inválidos y mantiene visible el fallo de categorías', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      '/productos?pagina=-1&tamanio=500&orden=password&dir=x',
      ProductoList,
    );
    http
      .expectOne(`${environment.apiUrl}/categorias`)
      .flush({}, { status: 500, statusText: 'Error' });
    const req = lectura();
    expect(req.request.params.toString()).toBe(
      'pagina=0&tamanio=20&ordenarPor=nombre&direccion=asc',
    );
    req.flush(pagina);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(
      'No se pudieron cargar las categorías',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Vitamina C');
  });
});
