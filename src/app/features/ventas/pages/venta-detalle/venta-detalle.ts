import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { mensajeError } from '../../../../core/utils/http-error';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-detalle',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './venta-detalle.html',
})
export class VentaDetalle implements OnInit {
  readonly id = input.required<string>();
  readonly nueva = input<string>();
  private readonly service = inject(VentaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly venta = signal<Venta | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly cargando = signal(true);

  ngOnInit(): void {
    if (!/^\d+$/.test(this.id()) || !Number.isSafeInteger(Number(this.id())) || Number(this.id()) <= 0) {
      this.error.set('El identificador de la venta no es válido.');
      this.cargando.set(false);
      return;
    }
    this.service.obtener(Number(this.id())).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: venta => { this.venta.set(venta); this.cargando.set(false); },
      error: err => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }
}
