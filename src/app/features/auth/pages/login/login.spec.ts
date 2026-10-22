import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { environment } from '../../../../../environments/environment';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    sessionStorage.clear();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
  });
  function fill() {
    for (const [field, value] of [
      ['username', 'vendedor'],
      ['password', 'Vendedor2026*'],
    ]) {
      const input = fixture.nativeElement.querySelector(
        `[formControlName="${field}"]`,
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  }
  it('validates both empty fields without sending a request', () => {
    component.ingresar();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ingrese su usuario.');
    expect(fixture.nativeElement.textContent).toContain('Ingrese su contraseña.');
    TestBed.inject(HttpTestingController).expectNone(`${environment.apiUrl}/auth/login`);
  });
  it('keeps the login open on 401, displays the backend message and clears the password', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl');
    fill();
    component.ingresar();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush(
        { message: 'Usuario o contraseña incorrectos' },
        { status: 401, statusText: 'Unauthorized' },
      );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Usuario o contraseña incorrectos',
    );
    expect(fixture.nativeElement.querySelector('[formControlName="password"]').value).toBe('');
    expect(navigate).not.toHaveBeenCalled();
  });
  it.each([
    ['/ventas?estado=REGISTRADA', '/ventas?estado=REGISTRADA'],
    ['https://example.com', '/inicio'],
    ['//example.com', '/inicio'],
    ['/\\example.com', '/inicio'],
  ])('uses a safe destination after login: %s', (returnUrl, expected) => {
    fixture.componentRef.setInput('returnUrl', returnUrl);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fill();
    component.ingresar();
    component.ingresar();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({
        token: 'test',
        tipo: 'Bearer',
        expiraEnSegundos: 60,
        username: 'vendedor',
        nombreCompleto: 'Vendedor',
        roles: ['VENDEDOR'],
        permisos: ['VENTAS_LEER'],
      });
    expect(navigate).toHaveBeenCalledWith(expected);
    expect(TestBed.inject(AuthService).sesion()?.username).toBe('vendedor');
  });
  it('shows the expiration notice from the URL input', () => {
    fixture.componentRef.setInput('expirada', '1');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Su sesión expiró');
  });
});
