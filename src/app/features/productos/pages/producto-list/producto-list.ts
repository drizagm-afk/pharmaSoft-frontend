import { Component, computed, DestroyRef, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-list', imports: [CurrencyPipe, RouterLink],
  templateUrl: './producto-list.html', styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit, OnChanges {
  readonly categoriaId = input<string>();
  private inicializado = false;
  private readonly service = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly destroyRef = inject(DestroyRef);
  private peticion?: Subscription;
  protected readonly resultado = signal<PaginaResponse<Producto> | null>(null);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');
  protected readonly cargando = signal(false);
  protected readonly dandoBaja = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly errorCategorias = signal<string | null>(null);
  protected readonly columnasOrden = [
    { campo: 'nombre', etiqueta: 'Nombre' }, { campo: 'precio', etiqueta: 'Precio' },
    { campo: 'stock', etiqueta: 'Stock' },
  ] as const;
  protected readonly productos = computed(() => {
    const lista = this.resultado()?.contenido ?? [];
    return this.categoriaFiltro() === null ? lista : lista.filter(p => p.categoriaId === this.categoriaFiltro());
  });
  protected readonly categoriaNombre = computed(() =>
    this.categorias().find(c => c.id === this.categoriaFiltro())?.nombre ?? this.categoriaFiltro());
  ngOnInit(): void {
    this.aplicarCategoriaRuta(); this.inicializado = true;
    this.cargarCategorias(); this.cargar();
  }
  ngOnChanges(): void {
    if (this.inicializado) { this.aplicarCategoriaRuta(); this.cargar(); }
  }
  private aplicarCategoriaRuta(): void {
    this.filtrarPorCategoria(this.categoriaId() ?? '');
    this.tamanio.set(this.categoriaFiltro() !== null ? 100 : 10);
    this.pagina.set(0);
  }
  cargarCategorias(): void {
    this.errorCategorias.set(null);
    this.categoriaService.listar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: datos => this.categorias.set(datos),
      error: err => this.errorCategorias.set(mensajeError(err)),
    });
  }
  cargar(): void {
    this.peticion?.unsubscribe(); this.cargando.set(true); this.error.set(null);
    this.peticion = this.service.listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: datos => {
          if (Array.isArray(datos)) {
            this.resultado.set(null); this.error.set('El backend debe devolver un listado paginado de productos.');
          } else { this.resultado.set(datos); this.pagina.set(datos.pagina); }
          this.cargando.set(false);
        },
        error: err => { this.resultado.set(null); this.error.set(mensajeError(err)); this.cargando.set(false); },
      });
  }
  cambiarPagina(delta: number): void {
    const datos = this.resultado(); const siguiente = this.pagina() + delta;
    if (this.cargando() || this.dandoBaja() !== null || !datos || siguiente < 0 || siguiente >= datos.totalPaginas) return;
    this.pagina.set(siguiente); this.cargar();
  }
  cambiarTamanio(valor: string): void {
    const valorNumerico = Number(valor); if (![5, 10, 20, 100].includes(valorNumerico)) return;
    this.tamanio.set(valorNumerico); this.pagina.set(0); this.cargar();
  }
  ordenar(campo: OrdenProducto): void {
    this.direccion.set(this.ordenarPor() === campo && this.direccion() === 'asc' ? 'desc' : 'asc');
    this.ordenarPor.set(campo); this.pagina.set(0); this.cargar();
  }
  filtrarPorCategoria(valor: string): void {
    const id = Number(valor);
    this.categoriaFiltro.set(valor && Number.isSafeInteger(id) && id > 0 ? id : null);
  }
  darDeBaja(producto: Producto): void {
    if (!producto.estado || this.dandoBaja() !== null || !confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return;
    this.error.set(null); this.dandoBaja.set(producto.id);
    this.service.darDeBaja(producto.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.dandoBaja.set(null); this.cargar(); },
      error: err => { this.dandoBaja.set(null); this.error.set(mensajeError(err)); },
    });
  }
}
