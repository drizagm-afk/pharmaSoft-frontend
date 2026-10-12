import {
  afterNextRender,
  AfterRenderRef,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, Subscription, switchMap } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-detalle',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.css',
})
export class VentaDetalle implements OnChanges {
  readonly id = input.required<string>();
  readonly nueva = input<string>();
  readonly imprimir = input<string>();
  private readonly service = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private peticion?: Subscription;
  private impresionPendiente?: AfterRenderRef;
  protected readonly venta = signal<Venta | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly cargando = signal(true);
  protected readonly fechaImpresion = signal(new Date());
  protected readonly numero = computed(() => String(this.venta()?.id ?? '').padStart(6, '0'));
  protected readonly unidades = computed(() =>
    (this.venta()?.detalles ?? []).reduce((suma, d) => suma + d.cantidad, 0),
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.impresionPendiente?.destroy());
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['id']) this.cargar();
    else if (cambios['imprimir'] && this.imprimir() === '1' && this.venta())
      this.imprimirComprobante();
  }

  private cargar(): void {
    this.peticion?.unsubscribe();
    this.impresionPendiente?.destroy();
    this.venta.set(null);
    this.cliente.set(null);
    this.error.set(null);
    this.cargando.set(true);
    const id = this.id();
    if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      this.error.set('El identificador de la venta no es válido.');
      this.cargando.set(false);
      return;
    }
    this.peticion = this.service
      .obtener(Number(id))
      .pipe(
        switchMap((venta) =>
          this.clienteService.obtener(venta.clienteId).pipe(
            catchError(() => of(null)),
            map((cliente) => ({ venta, cliente })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ venta, cliente }) => {
          this.venta.set(venta);
          this.cliente.set(cliente);
          this.cargando.set(false);
          if (this.imprimir() === '1') this.imprimirComprobante();
        },
        error: (err) => {
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  protected imprimirComprobante(): void {
    const id = this.venta()?.id;
    if (!id || this.cargando()) return;
    this.fechaImpresion.set(new Date());
    this.impresionPendiente?.destroy();
    this.impresionPendiente = afterNextRender(
      () => {
        if (this.venta()?.id === id && !this.cargando()) window.print();
      },
      { injector: this.injector },
    );
  }
}
