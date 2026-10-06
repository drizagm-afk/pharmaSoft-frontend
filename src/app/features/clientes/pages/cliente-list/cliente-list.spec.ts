import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { cliente, pagina } from '../../cliente.fixture.spec-helper';
import { ClienteList } from './cliente-list';

describe('ClienteList', () => {
  let fixture: ComponentFixture<ClienteList>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/clientes`;
  const listRequest = () => http.expectOne(r => r.url === url);
  const render = () => fixture.detectChanges();
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ClienteList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    http = TestBed.inject(HttpTestingController); fixture = TestBed.createComponent(ClienteList);
    render(); listRequest().flush(pagina()); render();
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });
  it('shows the first page with missing phone and inactive state', () => {
    expect(fixture.nativeElement.textContent).toContain('Página 1 de 3');
    expect(fixture.nativeElement.textContent).toContain('—');
    expect(fixture.nativeElement.querySelector('.paginacion button').disabled).toBe(true);
  });
  it('resets page size and fetches the next page', () => {
    fixture.componentInstance.cambiarTamanio('5');
    const req = listRequest(); expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('tamanio')).toBe('5'); req.flush({ ...pagina(), tamanio: 5 });
    fixture.componentInstance.cambiarPagina(1);
    const next = listRequest(); expect(next.request.params.get('pagina')).toBe('1');
    next.flush({ ...pagina([cliente], 1), tamanio: 5 }); render();
    expect(fixture.nativeElement.textContent).toContain('Página 2 de 3');
  });
  it('toggles sort direction and resets the page', () => {
    fixture.componentInstance.ordenar('dni');
    const asc = listRequest(); expect(asc.request.params.get('direccion')).toBe('asc'); asc.flush(pagina());
    fixture.componentInstance.ordenar('dni');
    const desc = listRequest(); expect(desc.request.params.get('direccion')).toBe('desc');
    expect(desc.request.params.get('ordenarPor')).toBe('dni'); desc.flush(pagina());
  });
  it('filters by DNI and surname locally without another request', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    for (const text of ['712', 'DEL CARPIO']) {
      input.value = text; input.dispatchEvent(new Event('input')); render();
      expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('Ana');
    }
    input.value = 'missing'; input.dispatchEvent(new Event('input')); render();
    expect(fixture.nativeElement.textContent).toContain('No hay coincidencias');
    http.expectNone(r => r.url === url);
  });
  it('reloads after logical deletion and keeps the inactive row', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fixture.componentInstance.eliminar(cliente);
    http.expectOne(`${url}/1`).flush(null, { status: 204, statusText: 'No Content' });
    listRequest().flush(pagina([{ ...cliente, estado: false }])); render();
    expect(fixture.nativeElement.textContent).toContain('Inactivo');
    expect(fixture.nativeElement.textContent).toContain('Ana');
  });
  it('shows the repeated-deletion conflict without reloading', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true); fixture.componentInstance.eliminar(cliente);
    http.expectOne(`${url}/1`).flush({ message: 'El cliente ya está inactivo.' }, { status: 409, statusText: 'Conflict' });
    render(); expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('ya está inactivo');
    http.expectNone(r => r.url === url);
  });
  it('does not delete when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false); fixture.componentInstance.eliminar(cliente);
    http.expectNone(`${url}/1`);
  });
  it('rejects a legacy array response with an understandable message', () => {
    fixture.componentInstance.cargar(); listRequest().flush([cliente]); render();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('listado paginado');
  });
});
