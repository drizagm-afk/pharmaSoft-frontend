import {
  afterNextRender,
  AfterRenderRef,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  effect,
  linkedSignal,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SiPermiso } from '../../../../shared/directives/si-permiso';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { idUrl, paginaUrl, tamanioUrl, TAMANIOS_PAGINA } from '../../../../core/utils/paginacion';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

const SIN_FILTROS: FiltroVentas = { clienteId: null, estado: null, desde: null, hasta: null };

@Component({
  selector: 'app-venta-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, ReactiveFormsModule, SiPermiso, Paginador],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly service = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly pagina = input(0, { transform: paginaUrl });
  readonly tamanio = input(20, { transform: tamanioUrl });
  readonly orden = input('fecha', {
    transform: (v: unknown) => (['id', 'fecha', 'total'].includes(String(v)) ? String(v) : 'fecha'),
  });
  readonly dir = input<'asc' | 'desc', unknown>('desc', {
    transform: (v) => (v === 'asc' ? 'asc' : 'desc'),
  });
  readonly clienteId = input(null, { transform: idUrl });
  readonly estado = input<EstadoVenta | null, unknown>(null, {
    transform: (v) => (v === 'REGISTRADA' || v === 'ANULADA' ? v : null),
  });
  readonly desde = input<string | null>(null);
  readonly hasta = input<string | null>(null);
  protected readonly tamanios = TAMANIOS_PAGINA;
  private impresionPendiente?: AfterRenderRef;
  protected readonly filtrosAplicados = computed<FiltroVentas>(() => ({
    clienteId: this.clienteId(),
    estado: this.estado(),
    desde: this.desde(),
    hasta: this.hasta(),
  }));
  protected readonly consulta = rxResource({
    params: () => ({
      filtro: this.filtrosAplicados(),
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      orden: this.orden(),
      dir: this.dir(),
    }),
    stream: ({ params: c }) => this.service.buscar(c.filtro, c.pagina, c.tamanio, c.orden, c.dir),
  });
  protected readonly resultado = linkedSignal<
    PaginaResponse<Venta> | undefined,
    PaginaResponse<Venta> | undefined
  >({
    source: () => (this.consulta.hasValue() ? this.consulta.value() : undefined),
    computation: (nueva, previa) => nueva ?? previa?.value,
  });
  protected readonly cargando = this.consulta.isLoading;
  private readonly errorFiltro = signal<string | null>(null);
  protected readonly error = computed(() => {
    const error = this.consulta.error();
    return (
      this.errorFiltro() ||
      (error instanceof HttpErrorResponse ? mensajeError(error) : error?.message)
    );
  });
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargandoClientes = signal(true);
  protected readonly errorClientes = signal<string | null>(null);
  protected readonly fechaImpresion = signal(new Date());
  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });
  protected readonly totalPagina = computed(() =>
    redondear(
      (this.resultado()?.contenido ?? [])
        .filter((v) => v.estado === 'REGISTRADA')
        .reduce((suma, v) => suma + v.total, 0),
    ),
  );
  protected readonly resumenFiltros = computed(() => {
    const f = this.filtrosAplicados();
    const cliente = this.clientes().find((c) => c.id === f.clienteId);
    const partes = [
      f.clienteId !== null
        ? `cliente ${cliente ? cliente.apellidos + ', ' + cliente.nombres : '#' + f.clienteId}`
        : '',
      f.estado ? `estado ${f.estado}` : '',
      f.desde ? `desde ${f.desde}` : '',
      f.hasta ? `hasta ${f.hasta}` : '',
    ].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'ninguno (todas las ventas)';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.impresionPendiente?.destroy());
    effect(() => {
      this.filtros.reset(this.filtrosAplicados(), { emitEvent: false });
      this.errorFiltro.set(null);
      this.impresionPendiente?.destroy();
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  protected cargarClientes(): void {
    this.cargandoClientes.set(true);
    this.errorClientes.set(null);
    this.clienteService
      .listar(0, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          if (Array.isArray(datos))
            this.errorClientes.set('El servidor debe devolver clientes paginados.');
          else this.clientes.set(datos.contenido);
          this.cargandoClientes.set(false);
        },
        error: (err) => {
          this.errorClientes.set(mensajeError(err));
          this.cargandoClientes.set(false);
        },
      });
  }

  buscar(): void {
    if (this.cargando()) return;
    const filtro = this.filtros.getRawValue();
    if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) {
      this.errorFiltro.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.errorFiltro.set(null);
    this.navegar({ ...filtro, pagina: 0 });
  }

  limpiar(): void {
    if (this.cargando()) return;
    this.filtros.reset();
    this.errorFiltro.set(null);
    this.navegar({ ...SIN_FILTROS, pagina: 0 });
  }

  irA(pagina: number): void {
    const resultado = this.resultado();
    if (this.cargando() || !resultado || pagina < 0 || pagina >= resultado.totalPaginas) return;
    this.navegar({ pagina });
  }

  cambiarTamanio(tamanio: number): void {
    if (TAMANIOS_PAGINA.includes(tamanio)) this.navegar({ tamanio, pagina: 0 });
  }

  ordenarPor(orden: string): void {
    this.navegar({
      orden,
      dir: this.orden() === orden && this.dir() === 'asc' ? 'desc' : 'asc',
      pagina: 0,
    });
  }

  private navegar(cambios: Record<string, string | number | null>): void {
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: cambios,
        queryParamsHandling: 'merge',
      })
      .then((navego) => {
        // Permite reintentar la misma búsqueda sin cambiar sus filtros.
        if (!navego) this.consulta.reload();
      });
  }

  protected imprimirConsulta(): void {
    const resultado = this.resultado();
    if (this.cargando() || this.consulta.error() || !resultado?.contenido.length) return;
    this.fechaImpresion.set(new Date());
    this.impresionPendiente?.destroy();
    this.impresionPendiente = afterNextRender(
      () => {
        if (this.resultado() === resultado && !this.cargando()) window.print();
      },
      { injector: this.injector },
    );
  }
}
