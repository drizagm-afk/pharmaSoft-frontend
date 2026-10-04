import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { cliente } from '../../cliente.fixture.spec-helper';
import { ClienteForm } from './cliente-form';

describe('ClienteForm', () => {
  let fixture: ComponentFixture<ClienteForm>;
  let http: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;
  const url = `${environment.apiUrl}/clientes`;
  const fill = (values: Record<string, string>) => {
    for (const [name, value] of Object.entries(values)) {
      const input = fixture.nativeElement.querySelector(`#${name}`) as HTMLInputElement;
      input.value = value; input.dispatchEvent(new Event('input'));
    }
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ClienteForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ClienteForm);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });
  const valid = { dni: '71234567', nombres: 'Ana', apellidos: 'Del Carpio', email: 'ana@example.com' };
  it('blocks a seven-digit DNI without sending a request', () => {
    fixture.detectChanges(); fill({ ...valid, dni: '1234567' }); fixture.componentInstance.guardar(); fixture.detectChanges();
    http.expectNone(url); expect(fixture.nativeElement.textContent).toContain('exactamente 8 dígitos');
  });
  it('trims values and submits blank optional fields as null', () => {
    fixture.detectChanges(); fill({ ...valid, nombres: ' Ana ', telefono: ' ', direccion: ' ' });
    fixture.componentInstance.guardar(); const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ...valid, telefono: null, direccion: null, estado: true });
    req.flush(cliente, { status: 201, statusText: 'Created' });
    expect(navigate).toHaveBeenCalledWith(['/clientes']);
  });
  it('shows a duplicate conflict and stays on the form', () => {
    fixture.detectChanges(); fill(valid); fixture.componentInstance.guardar();
    http.expectOne(url).flush({ message: 'El DNI ya está registrado.' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('El DNI ya está registrado.');
    expect(navigate).not.toHaveBeenCalled();
  });
  it('prefills an edit and updates a nine-digit phone', () => {
    fixture.componentRef.setInput('id', '1'); fixture.detectChanges(); http.expectOne(`${url}/1`).flush(cliente);
    fixture.detectChanges(); expect(fixture.nativeElement.querySelector('#dni').value).toBe(cliente.dni);
    fill({ telefono: '987654321' }); fixture.componentInstance.guardar();
    const req = http.expectOne(`${url}/1`); expect(req.request.method).toBe('PUT');
    expect(req.request.body.telefono).toBe('987654321'); req.flush({ ...cliente, telefono: '987654321' });
    expect(navigate).toHaveBeenCalledWith(['/clientes']);
  });
  it('blocks whitespace-only names and an invalid optional phone', () => {
    fixture.detectChanges(); fill({ ...valid, nombres: '  ', telefono: '123' }); fixture.componentInstance.guardar();
    http.expectNone(url);
  });
  it('displays field errors returned by the backend', () => {
    fixture.detectChanges(); fill(valid); fixture.componentInstance.guardar();
    http.expectOne(url).flush({ message: 'Datos inválidos', validationErrors: { email: 'Correo no permitido' } }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('Correo no permitido');
  });
  it('prevents saving when the edited client cannot be loaded', () => {
    fixture.componentRef.setInput('id', '999'); fixture.detectChanges();
    http.expectOne(`${url}/999`).flush({ message: 'Cliente no encontrado' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges(); fixture.componentInstance.guardar(); http.expectNone(url);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(true);
  });
});
