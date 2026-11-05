import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth-service';
import { crearAuthPrueba } from '../../../core/auth/auth.fixture.spec-helper';
import { AvisoSesion } from './aviso-sesion';

describe('AvisoSesion', () => {
  function preparar(segundos = 107) {
    const auth = crearAuthPrueba();
    auth.segundosRestantes.set(segundos);
    TestBed.configureTestingModule({
      imports: [AvisoSesion],
      providers: [{ provide: AuthService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(AvisoSesion);
    fixture.detectChanges();
    return { auth, fixture };
  }
  it('shows only during the last two minutes and updates mm:ss', () => {
    const { auth, fixture } = preparar(121);
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    auth.segundosRestantes.set(120);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('02:00');
    auth.segundosRestantes.set(107);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('01:47');
  });
  it('dismisses without logging out', () => {
    const { auth, fixture } = preparar();
    fixture.nativeElement.querySelector('[aria-label="Ocultar aviso de sesión"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    expect(auth.sesion()).not.toBeNull();
  });
  it('offers immediate manual logout', () => {
    const { auth, fixture } = preparar();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    expect(auth.sesion()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });
});
