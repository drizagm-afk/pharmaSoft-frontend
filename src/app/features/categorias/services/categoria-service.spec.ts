import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { Categoria, CategoriaRequest } from '../models/categoria.model';
import { CategoriaService } from './categoria-service';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/categorias`;
  const dto: CategoriaRequest = { nombre: 'Vitaminas', descripcion: null, estado: true };
  const categoria: Categoria = {
    id: 8, ...dto, fechaCreacion: '2026-10-01T10:00:00', fechaModificacion: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists categories from the configured API', () => {
    const next = vi.fn();
    service.listar().subscribe(next);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('GET');
    request.flush([categoria]);
    expect(next).toHaveBeenCalledWith([categoria]);
  });

  it('loads a category by ID', () => {
    const next = vi.fn();
    service.obtener(8).subscribe(next);
    const request = http.expectOne(`${url}/8`);
    expect(request.request.method).toBe('GET');
    request.flush(categoria);
    expect(next).toHaveBeenCalledWith(categoria);
  });

  it('creates a category with the request DTO', () => {
    const next = vi.fn();
    service.crear(dto).subscribe(next);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);
    request.flush(categoria, { status: 201, statusText: 'Created' });
    expect(next).toHaveBeenCalledWith(categoria);
  });

  it('updates a category including an inactive state', () => {
    const updated = { ...dto, estado: false };
    const next = vi.fn();
    service.actualizar(8, updated).subscribe(next);
    const request = http.expectOne(`${url}/8`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updated);
    request.flush({ ...categoria, ...updated });
    expect(next).toHaveBeenCalledWith({ ...categoria, ...updated });
  });

  it('completes deletion when the API returns 204', () => {
    const complete = vi.fn();
    service.eliminar(8).subscribe({ complete });
    const request = http.expectOne(`${url}/8`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(complete).toHaveBeenCalledOnce();
  });

  it('preserves backend errors for the component to display', () => {
    const error = vi.fn();
    const body = { message: 'La categoria ya existe.', validationErrors: null };
    service.crear(dto).subscribe({ error });
    http.expectOne(url).flush(body, { status: 409, statusText: 'Conflict' });
    const response = error.mock.calls[0][0] as HttpErrorResponse;
    expect(response.status).toBe(409);
    expect(response.error).toEqual(body);
  });
});
