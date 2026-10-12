import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { FiltroReporte, VentaPorCategoria } from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte-service';

@Component({
  selector: 'app-ventas-por-categoria',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './ventas-por-categoria.html',
  styleUrl: './ventas-por-categoria.css',
})
export class VentasPorCategoria implements OnInit {
  private readonly service = inject(ReporteService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private peticion?: Subscription;
  protected readonly resultado = signal<VentaPorCategoria[] | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtrosAplicados = signal<FiltroReporte>({ desde: null, hasta: null });
  protected readonly filtros = this.fb.group({
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });
  protected readonly totalUnidades = computed(() =>
    (this.resultado() ?? []).reduce((suma, fila) => suma + fila.cantidadVendida, 0),
  );
  protected readonly totalVendido = computed(() =>
    redondear((this.resultado() ?? []).reduce((suma, fila) => suma + fila.montoTotal, 0)),
  );
  protected readonly montoMayor = computed(() =>
    (this.resultado() ?? []).reduce((mayor, fila) => Math.max(mayor, fila.montoTotal), 0),
  );

  protected porcentaje(monto: number): number {
    return this.montoMayor() > 0
      ? Math.min(100, Math.max(0, (monto / this.montoMayor()) * 100))
      : 0;
  }
  protected readonly resumenPeriodo = computed(() => {
    const { desde, hasta } = this.filtrosAplicados();
    if (desde && hasta) return `Desde ${desde} hasta ${hasta}`;
    if (desde) return `Desde ${desde}`;
    if (hasta) return `Hasta ${hasta}`;
    return 'Todo el histórico';
  });

  ngOnInit(): void {
    this.cargar({ desde: null, hasta: null });
  }

  buscar(): void {
    if (this.cargando()) return;
    const filtro = this.filtros.getRawValue();
    if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.cargar(filtro);
  }

  limpiar(): void {
    if (this.cargando()) return;
    this.filtros.reset();
    this.buscar();
  }

  private cargar(filtro: FiltroReporte): void {
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);
    const enviados = { ...filtro };
    this.peticion = this.service
      .ventasPorCategoria(enviados.desde, enviados.hasta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => {
          this.resultado.set(resultado);
          this.filtrosAplicados.set(enviados);
          this.cargando.set(false);
        },
        error: (err) => {
          this.resultado.set(null);
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }
}
