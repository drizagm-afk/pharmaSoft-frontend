import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { ClienteService } from './cliente-service';
import { cliente, pagina } from '../cliente.fixture.spec-helper';

describe('ClienteService', () => {
  let service: ClienteService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/clientes`;
  const { id, fechaCreacion, fechaModificacion, ...dto } = cliente;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ClienteService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses the required default pagination parameters and unwraps no data', () => {
    const next = vi.fn(); service.listar().subscribe(next);
    const req = http.expectOne(r => r.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().sort()).toEqual(['direccion', 'ordenarPor', 'pagina', 'tamanio']);
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('tamanio')).toBe('10');
    expect(req.request.params.get('ordenarPor')).toBe('apellidos');
    expect(req.request.params.get('direccion')).toBe('asc');
    req.flush(pagina()); expect(next).toHaveBeenCalledWith(pagina());
  });
  it('sends custom pagination and sorting parameters', () => {
    service.listar(1, 5, 'dni', 'desc').subscribe();
    const req = http.expectOne(r => r.url === url);
    expect(req.request.params.toString()).toBe('pagina=1&tamanio=5&ordenarPor=dni&direccion=desc');
    req.flush(pagina());
  });
  it('loads a client by ID', () => {
    const next = vi.fn(); service.obtener(1).subscribe(next);
    const req = http.expectOne(`${url}/1`); expect(req.request.method).toBe('GET');
    req.flush(cliente); expect(next).toHaveBeenCalledWith(cliente);
  });
  it('creates a client with null optional fields', () => {
    service.crear(dto).subscribe(); const req = http.expectOne(url);
    expect(req.request.method).toBe('POST'); expect(req.request.body).toEqual(dto);
    req.flush(cliente, { status: 201, statusText: 'Created' });
  });
  it('updates a client', () => {
    service.actualizar(1, dto).subscribe(); const req = http.expectOne(`${url}/1`);
    expect(req.request.method).toBe('PUT'); expect(req.request.body).toEqual(dto); req.flush(cliente);
  });
  it('completes a logical deletion on 204', () => {
    const complete = vi.fn(); service.eliminar(1).subscribe({ complete });
    const req = http.expectOne(`${url}/1`); expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' }); expect(complete).toHaveBeenCalledOnce();
  });
  it('propagates a backend conflict without changing its message', () => {
    const error = vi.fn(); service.eliminar(1).subscribe({ error });
    http.expectOne(`${url}/1`).flush({ message: 'El cliente ya está inactivo.' }, { status: 409, statusText: 'Conflict' });
    expect(error.mock.calls[0][0].error.message).toBe('El cliente ya está inactivo.');
  });
});
