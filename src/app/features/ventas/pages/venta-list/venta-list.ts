import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './venta-list.html',
})
export class VentaList implements OnInit {
  private readonly service = inject(VentaService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void { this.cargar(); }

  cargar(pagina = 0): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    this.service.buscar({ clienteId: null, estado: null, desde: null, hasta: null }, pagina)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: datos => {
          if (Array.isArray(datos)) {
            this.resultado.set(null);
            this.error.set('El servidor debe devolver un listado paginado de ventas.');
          } else { this.resultado.set(datos); }
          this.cargando.set(false);
        },
        error: err => { this.resultado.set(null); this.error.set(mensajeError(err)); this.cargando.set(false); },
      });
  }
}
