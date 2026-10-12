import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VentaPorCategoria } from '../models/reporte.model';

// The existing backend uses shorter field names; adapt them at the HTTP boundary.
interface VentaPorCategoriaApi {
  categoriaId: number;
  categoria: string;
  cantidad: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  ventasPorCategoria(desde: string | null, hasta: string | null): Observable<VentaPorCategoria[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http
      .get<VentaPorCategoriaApi[]>(`${this.url}/ventas-por-categoria`, { params })
      .pipe(
        map((filas) =>
          filas.map((fila) => ({
            categoriaId: fila.categoriaId,
            categoriaNombre: fila.categoria,
            cantidadVendida: fila.cantidad,
            montoTotal: fila.total,
          })),
        ),
      );
  }
}
