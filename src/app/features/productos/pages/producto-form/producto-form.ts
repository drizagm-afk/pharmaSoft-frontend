import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { ProductoService } from '../../services/producto-service';

@Component({ selector: 'app-producto-form', imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html', styleUrl: './producto-form.css' })
export class ProductoForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = input<string>();
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaOriginal = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly cargaFallida = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});
  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    stock: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
    estado: [true],
    categoriaId: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
  });
  private readonly elegida = toSignal(this.form.controls.categoriaId.valueChanges, { initialValue: null });
  protected readonly opciones = computed(() => this.categorias().filter(c => c.estado || c.id === this.categoriaOriginal()));
  protected readonly hayCategoriasActivas = computed(() => this.categorias().some(c => c.estado));
  protected readonly categoriaInactiva = computed(() => {
    const categoria = this.categorias().find(c => c.id === this.elegida());
    return !!categoria && !categoria.estado;
  });
  ngOnInit(): void {
    const id = this.id();
    if (id && (!/^\d+$/.test(id) || Number(id) <= 0 || !Number.isSafeInteger(Number(id)))) {
      this.fallar('El identificador del producto no es válido.'); return;
    }
    if (id) {
      forkJoin({ categorias: this.categoriaService.listar(), producto: this.service.obtener(Number(id)) })
        .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: ({ categorias, producto }) => {
            this.categorias.set(categorias); this.categoriaOriginal.set(producto.categoriaId);
            this.form.setValue({ nombre: producto.nombre, precio: producto.precio, stock: producto.stock,
              estado: producto.estado, categoriaId: producto.categoriaId }); this.cargando.set(false);
          }, error: err => this.fallar(mensajeError(err)),
        });
    } else {
      this.categoriaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: datos => { this.categorias.set(datos); this.cargando.set(false); },
        error: err => this.fallar(mensajeError(err)),
      });
    }
  }
  guardar(): void {
    if (this.cargando() || this.cargaFallida() || this.guardando()) return;
    this.form.controls.nombre.setValue(this.form.controls.nombre.value.trim());
    this.error.set(null); this.erroresServidor.set({});
    const v = this.form.getRawValue();
    const categoria = this.categorias().find(c => c.id === v.categoriaId);
    if (this.form.invalid || !categoria || !categoria.estado) {
      this.form.markAllAsTouched();
      if (this.form.valid && !categoria) this.error.set('Seleccione una categoría válida.');
      return;
    }
    const dto = { nombre: v.nombre, precio: Number(v.precio), stock: Number(v.stock),
      estado: v.estado, categoriaId: Number(v.categoriaId) };
    this.guardando.set(true);
    const peticion = this.id() ? this.service.actualizar(Number(this.id()), dto) : this.service.crear(dto);
    peticion.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
      next: () => { void this.router.navigate(['/productos']); },
      error: err => { this.error.set(mensajeError(err)); this.erroresServidor.set(erroresDeValidacion(err)); },
    });
  }
  private fallar(mensaje: string): void { this.error.set(mensaje); this.cargaFallida.set(true); this.cargando.set(false); }
}
