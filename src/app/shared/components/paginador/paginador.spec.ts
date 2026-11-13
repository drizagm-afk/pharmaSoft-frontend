import { TestBed } from '@angular/core/testing';
import { Paginador } from './paginador';

describe('Paginador', () => {
  it('selecciona el tamaño recibido al crear las opciones y al actualizarlo', () => {
    const fixture = crear();
    expect(fixture.nativeElement.querySelector('select').value).toBe('20');
    fixture.componentRef.setInput('tamanios', [5, 10, 20, 50, 100]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').value).toBe('20');
    fixture.componentRef.setInput('tamanio', 50);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').value).toBe('50');
  });
  function crear(pagina = 0, total = 45) {
    const fixture = TestBed.createComponent(Paginador);
    for (const [key, value] of Object.entries({
      pagina,
      totalPaginas: Math.ceil(total / 20),
      totalElementos: total,
      tamanio: 20,
    }))
      fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  }
  it('navega hasta la última página y muestra su rango parcial', () => {
    const fixture = crear();
    const cambio = vi.fn();
    fixture.componentInstance.cambioPagina.subscribe(cambio);
    fixture.nativeElement.querySelector('[aria-label="Última página"]').click();
    expect(cambio).toHaveBeenCalledWith(2);
    fixture.componentRef.setInput('pagina', 2);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-testid="resumen-paginacion"]').textContent,
    ).toContain('41–45 de 45');
    expect(fixture.nativeElement.querySelector('[aria-label="Última página"]').disabled).toBe(true);
  });
  it('deshabilita navegación con cero filas o durante la carga', () => {
    const fixture = crear(0, 0);
    expect(
      fixture.nativeElement.querySelector('[data-testid="resumen-paginacion"]').textContent,
    ).toContain('0–0 de 0');
    expect(
      [...fixture.nativeElement.querySelectorAll('button')].every((b: any) => b.disabled),
    ).toBe(true);
    fixture.componentRef.setInput('totalPaginas', 3);
    fixture.componentRef.setInput('deshabilitado', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').disabled).toBe(true);
  });
  it('emite un tamaño permitido', () => {
    const fixture = crear();
    const cambio = vi.fn();
    fixture.componentInstance.cambioTamanio.subscribe(cambio);
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    expect(cambio).toHaveBeenCalledWith(50);
  });
});
