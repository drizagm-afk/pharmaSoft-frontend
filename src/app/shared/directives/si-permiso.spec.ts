import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth/auth-service';
import { SiPermiso } from './si-permiso';

@Component({
  imports: [SiPermiso],
  template: `<button *appSiPermiso="'CATALOGO_ESCRIBIR'">Editar</button>`,
})
class Host {}

describe('SiPermiso', () => {
  it('reacts to permission changes without duplicating the view', () => {
    const permitido = signal(false);
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: AuthService, useValue: { tienePermiso: () => permitido() } }],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    permitido.set(true);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
    permitido.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
