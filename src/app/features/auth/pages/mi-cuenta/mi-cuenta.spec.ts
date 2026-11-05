import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { PerfilUsuario, Sesion } from '../../../../core/auth/auth.model';
import { environment } from '../../../../../environments/environment';
import { MiCuenta } from './mi-cuenta';

describe('MiCuenta', () => {
  let fixture: ComponentFixture<MiCuenta>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/auth/me`;
  const perfil: PerfilUsuario = {
    username: 'vendedor',
    nombreCompleto: 'Nombre del servidor',
    roles: ['VENDEDOR'],
    permisos: ['CATALOGO_LEER', 'VENTAS_LEER'],
  };
  beforeEach(() => {
    const sesion: Sesion = { ...perfil, token: 'test', expiraEn: Date.now() + 3600_000 };
    sessionStorage.setItem('pharmasoft.sesion', JSON.stringify(sesion));
    TestBed.configureTestingModule({
      imports: [MiCuenta],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MiCuenta);
    fixture.detectChanges();
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });
  function responder(datos = perfil) {
    http.expectOne(url).flush(datos);
    fixture.detectChanges();
  }
  it('shows loading, then all five modules and eight granted/denied permissions', () => {
    expect(fixture.nativeElement.textContent).toContain('Cargando perfil...');
    responder();
    expect(fixture.nativeElement.textContent).toContain('Nombre del servidor');
    expect(fixture.nativeElement.textContent).toContain('VENDEDOR');
    expect(fixture.nativeElement.querySelectorAll('.modulo').length).toBe(5);
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(8);
    expect(fixture.nativeElement.querySelectorAll('li.concedido').length).toBe(2);
    expect(fixture.nativeElement.textContent).not.toContain('Sus permisos cambiaron');
  });
  it('warns about changed server permissions without modifying session or token', () => {
    const auth = TestBed.inject(AuthService);
    const before = sessionStorage.getItem('pharmasoft.sesion');
    responder({
      ...perfil,
      roles: ['ALMACENERO'],
      permisos: ['CATALOGO_LEER', 'CATALOGO_ESCRIBIR'],
    });
    expect(fixture.nativeElement.textContent).toContain(
      'Sus permisos cambiaron. Cierre sesión y vuelva a ingresar para actualizarlos.',
    );
    expect(fixture.nativeElement.textContent).toContain('ALMACENERO');
    expect(sessionStorage.getItem('pharmasoft.sesion')).toBe(before);
    expect(auth.token()).toBe('test');
  });
  it('compares permissions as sets, ignoring their order', () => {
    responder({ ...perfil, permisos: [...perfil.permisos].reverse() });
    expect(fixture.nativeElement.textContent).not.toContain('Sus permisos cambiaron');
  });
  it('keeps the session on connection errors and allows retry', () => {
    http.expectOne(url).error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'No se pudo conectar',
    );
    expect(TestBed.inject(AuthService).sesion()).not.toBeNull();
    fixture.nativeElement.querySelector('.btn-primary').click();
    fixture.detectChanges();
    responder();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nombre del servidor');
  });
  it('does not send duplicate profile requests while loading', () => {
    fixture.componentInstance.cargar();
    responder();
  });
});
