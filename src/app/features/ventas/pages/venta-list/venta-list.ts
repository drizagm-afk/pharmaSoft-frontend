import { afterNextRender, AfterRenderRef, Component, computed, DestroyRef, inject, Injector, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
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
  imports: [RouterLink, CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly service = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private peticion?: Subscription;
  private impresionPendiente?: AfterRenderRef;
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargandoClientes = signal(true);
  protected readonly errorClientes = signal<string | null>(null);
  protected readonly filtrosAplicados = signal<FiltroVentas>({ ...SIN_FILTROS });
  protected readonly fechaImpresion = signal(new Date());
  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });
  protected readonly totalPagina = computed(() => redondear(
    (this.resultado()?.contenido ?? []).filter(v => v.estado === 'REGISTRADA')
      .reduce((suma, v) => suma + v.total, 0)));
  protected readonly resumenFiltros = computed(() => {
    const f = this.filtrosAplicados();
    const cliente = this.clientes().find(c => c.id === f.clienteId);
    const partes = [
      f.clienteId !== null ? `cliente ${cliente ? cliente.apellidos + ', ' + cliente.nombres : '#' + f.clienteId}` : '',
      f.estado ? `estado ${f.estado}` : '',
      f.desde ? `desde ${f.desde}` : '',
      f.hasta ? `hasta ${f.hasta}` : '',
    ].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'ninguno (todas las ventas)';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.impresionPendiente?.destroy());
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargar({ ...SIN_FILTROS }, 0);
  }

  protected cargarClientes(): void {
    this.cargandoClientes.set(true);
    this.errorClientes.set(null);
    this.clienteService.listar(0, 100).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: datos => {
        if (Array.isArray(datos)) this.errorClientes.set('El servidor debe devolver clientes paginados.');
        else this.clientes.set(datos.contenido);
        this.cargandoClientes.set(false);
      },
      error: err => { this.errorClientes.set(mensajeError(err)); this.cargandoClientes.set(false); },
    });
  }

  buscar(): void {
    if (this.cargando()) return;
    const filtro = this.filtros.getRawValue();
    if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.cargar(filtro, 0);
  }

  limpiar(): void {
    if (this.cargando()) return;
    this.filtros.reset();
    this.buscar();
  }

  irA(pagina: number): void {
    const resultado = this.resultado();
    if (this.cargando() || !resultado || pagina < 0 || pagina >= resultado.totalPaginas) return;
    this.cargar(this.filtrosAplicados(), pagina);
  }

  private cargar(filtro: FiltroVentas, pagina: number): void {
    this.peticion?.unsubscribe();
    this.impresionPendiente?.destroy();
    this.cargando.set(true);
    this.error.set(null);
    const enviados = { ...filtro };
    this.peticion = this.service.buscar(enviados, pagina, 10)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: datos => {
          if (Array.isArray(datos)) {
            this.resultado.set(null);
            this.error.set('El servidor debe devolver un listado paginado de ventas.');
          } else {
            this.resultado.set(datos);
            this.filtrosAplicados.set(enviados);
          }
          this.cargando.set(false);
        },
        error: err => { this.resultado.set(null); this.error.set(mensajeError(err)); this.cargando.set(false); },
      });
  }

  protected imprimirConsulta(): void {
    const resultado = this.resultado();
    if (this.cargando() || !resultado?.contenido.length) return;
    this.fechaImpresion.set(new Date());
    this.impresionPendiente?.destroy();
    this.impresionPendiente = afterNextRender(() => {
      if (this.resultado() === resultado && !this.cargando()) window.print();
    }, { injector: this.injector });
  }
}
