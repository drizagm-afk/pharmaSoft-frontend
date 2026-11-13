import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { Pagina } from '../../../../core/models/pagina';
import {
  direccionUrl,
  idUrl,
  paginaUrl,
  tamanioUrl,
  TAMANIOS_PAGINA,
} from '../../../../core/utils/paginacion';
import { mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { OrdenProducto, Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-list',
  imports: [CurrencyPipe, RouterLink, SiPermiso, Paginador],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly service = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly categoriaId = input(null, { transform: idUrl });
  readonly pagina = input(0, { transform: paginaUrl });
  readonly tamanio = input(20, { transform: tamanioUrl });
  readonly orden = input<OrdenProducto, unknown>('nombre', {
    transform: (v) =>
      ['id', 'nombre', 'precio', 'stock'].includes(String(v)) ? (v as OrdenProducto) : 'nombre',
  });
  readonly dir = input('asc', { transform: direccionUrl });
  protected readonly tamanios = TAMANIOS_PAGINA;
  protected readonly consulta = rxResource({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: this.orden(),
      direccion: this.dir(),
    }),
    stream: ({ params }) => this.service.listar(params),
  });
  protected readonly resultado = linkedSignal<
    Pagina<Producto> | undefined,
    Pagina<Producto> | undefined
  >({
    source: () => (this.consulta.hasValue() ? this.consulta.value() : undefined),
    computation: (nueva, previa) => nueva ?? previa?.value,
  });
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly dandoBaja = signal<number | null>(null);
  private readonly errorAccion = signal<string | null>(null);
  protected readonly error = computed(() => {
    const error = this.consulta.error();
    return (
      this.errorAccion() ||
      (error instanceof HttpErrorResponse ? mensajeError(error) : error?.message)
    );
  });
  protected readonly errorCategorias = signal<string | null>(null);
  protected readonly columnasOrden = [
    { campo: 'nombre', etiqueta: 'Nombre' },
    { campo: 'precio', etiqueta: 'Precio' },
    { campo: 'stock', etiqueta: 'Stock' },
  ] as const;
  protected readonly productos = computed(() => {
    const lista = this.resultado()?.contenido ?? [];
    return this.categoriaId() === null
      ? lista
      : lista.filter((p) => p.categoriaId === this.categoriaId());
  });

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.errorCategorias.set(null);
    this.categoriaService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => this.categorias.set(datos),
        error: (err) => this.errorCategorias.set(mensajeError(err)),
      });
  }

  cargar(): void {
    this.errorAccion.set(null);
    this.consulta.reload();
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < (this.resultado()?.totalPaginas ?? 0)) this.navegar({ pagina });
  }

  cambiarTamanio(valor: number): void {
    if (TAMANIOS_PAGINA.includes(valor)) this.navegar({ tamanio: valor, pagina: 0 });
  }

  ordenar(campo: OrdenProducto): void {
    this.navegar({
      orden: campo,
      dir: this.orden() === campo && this.dir() === 'asc' ? 'desc' : 'asc',
      pagina: 0,
    });
  }

  filtrarPorCategoria(valor: string): void {
    this.navegar({ categoriaId: idUrl(valor), pagina: 0 });
  }

  private navegar(cambios: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cambios,
      queryParamsHandling: 'merge',
    });
  }

  darDeBaja(producto: Producto): void {
    if (
      !producto.estado ||
      this.consulta.isLoading() ||
      this.dandoBaja() !== null ||
      !confirm(`¿Dar de baja el producto "${producto.nombre}"?`)
    )
      return;
    this.errorAccion.set(null);
    this.dandoBaja.set(producto.id);
    this.service
      .darDeBaja(producto.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dandoBaja.set(null);
          this.cargar();
        },
        error: (err) => {
          this.dandoBaja.set(null);
          this.errorAccion.set(mensajeError(err));
        },
      });
  }
}
