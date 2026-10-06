import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ProductoForm } from './producto-form';
import { environment } from '../../../../../environments/environment';

describe('ProductoForm dependencies', () => {
  let http: HttpTestingController;
  const url = environment.apiUrl;
  const categories = [
    { id: 1, nombre: 'Activa', estado: true }, { id: 2, nombre: 'Inactiva', estado: false },
  ];
  const product = { id: 9, nombre: 'Producto QA', precio: 5, stock: 2, estado: true, categoriaId: 2 };
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ProductoForm], providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });
  afterEach(() => http.verify());
  it('shows the original inactive category, blocks it, and allows reassignment', () => {
    const f = TestBed.createComponent(ProductoForm); f.componentRef.setInput('id', '9'); f.detectChanges();
    http.expectOne(`${url}/productos/9`).flush(product);
    http.expectOne(`${url}/categorias`).flush(categories); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Inactiva (inactiva)');
    expect(f.nativeElement.textContent).toContain('La categoría elegida está inactiva');
    f.componentInstance.guardar(); http.expectNone(r => r.method === 'PUT');
    f.componentInstance['form'].controls.categoriaId.setValue(1); f.componentInstance.guardar();
    const req = http.expectOne(`${url}/productos/9`); expect(req.request.body.categoriaId).toBe(1);
    req.flush({ ...product, categoriaId: 1 });
  });
  it('blocks invalid numeric fields and sends numeric category IDs only once', () => {
    const f = TestBed.createComponent(ProductoForm); f.detectChanges();
    http.expectOne(`${url}/categorias`).flush(categories);
    const form = f.componentInstance['form'];
    form.setValue({ nombre: '  Producto QA  ', precio: 0, stock: 1.5, estado: true, categoriaId: 1 });
    f.componentInstance.guardar(); http.expectNone(r => r.method === 'POST');
    form.patchValue({ precio: 0.01, stock: 0 }); f.componentInstance.guardar(); f.componentInstance.guardar();
    const req = http.expectOne(`${url}/productos`);
    expect(req.request.body).toEqual({ nombre: 'Producto QA', precio: 0.01, stock: 0, estado: true, categoriaId: 1 });
    req.flush({ ...product, categoriaId: 1 });
  });
  it('offers a category creation link when no active categories exist', () => {
    const f = TestBed.createComponent(ProductoForm); f.detectChanges();
    http.expectOne(`${url}/categorias`).flush([categories[1]]); f.detectChanges();
    expect(f.nativeElement.textContent).toContain('No hay categorías activas');
    expect(f.nativeElement.querySelector('form')).toBeNull();
  });
});
