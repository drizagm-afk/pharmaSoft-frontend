import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoList } from './producto-list';
import { environment } from '../../../../../environments/environment';
import { provideRouter } from '@angular/router';

describe('ProductoList', () => {
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/productos`;
  const product = { id: 1, nombre: 'QA Producto', precio: 5, stock: 2, estado: true,
    categoriaId: 46, categoriaNombre: 'QA Categoria', descripcion: null,
    fechaCreacion: '2026-10-06', fechaModificacion: null };
  const page = { contenido: [product], pagina: 0, tamanio: 10,
    totalElementos: 12, totalPaginas: 2, ultima: false };
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductoList], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function load() {
    const fixture = TestBed.createComponent(ProductoList); fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/categorias`).flush([]);
    const req = http.expectOne(r => r.url === url);
    expect(req.request.params.toString()).toBe('pagina=0&tamanio=10&ordenarPor=nombre&direccion=asc');
    req.flush(page); fixture.detectChanges(); return fixture;
  }
  it('filters the current page without making HTTP requests', () => {
    const fixture = load();
    fixture.componentInstance.filtrarPorCategoria('47'); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No hay productos de esta');
    fixture.componentInstance.filtrarPorCategoria('46'); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('QA Producto');
    http.expectNone(r => r.url === url);
  });
  it('resets pagination when sorting and changing page size', () => {
    const fixture = load(); fixture.componentInstance.cambiarPagina(1);
    const next = http.expectOne(r => r.url === url); expect(next.request.params.get('pagina')).toBe('1');
    next.flush({ ...page, pagina: 1, ultima: true });
    fixture.componentInstance.ordenar('precio');
    const sorted = http.expectOne(r => r.url === url);
    expect(sorted.request.params.get('pagina')).toBe('0'); expect(sorted.request.params.get('direccion')).toBe('asc');
    sorted.flush(page); fixture.componentInstance.ordenar('precio');
    const desc = http.expectOne(r => r.url === url); expect(desc.request.params.get('direccion')).toBe('desc');
    desc.flush(page); fixture.componentInstance.cambiarTamanio('5');
    const size = http.expectOne(r => r.url === url); expect(size.request.params.get('tamanio')).toBe('5'); size.flush(page);
  });
  it('keeps a category loading failure visible after products load', () => {
    const fixture = TestBed.createComponent(ProductoList); fixture.detectChanges();
    http.expectOne(`${environment.apiUrl}/categorias`).flush({}, { status: 500, statusText: 'Error' });
    http.expectOne(r => r.url === url).flush(page); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar las');
    expect(fixture.nativeElement.textContent).toContain('QA Producto');
  });
  it('reloads after soft deletion and disables the inactive product button', () => {
    const fixture = load(); const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.darDeBaja(product);
    const deletion = http.expectOne(`${url}/1`); expect(deletion.request.method).toBe('DELETE'); deletion.flush(null);
    http.expectOne(r => r.url === url).flush({ ...page, contenido: [{ ...product, estado: false }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];
    expect(buttons.find(b => b.textContent?.includes('Dar de baja'))?.disabled).toBe(true);
    confirm.mockRestore();
  });
});
