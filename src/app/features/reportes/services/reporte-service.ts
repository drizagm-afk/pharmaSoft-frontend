import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FiltroReporte, VentaPorCategoria } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/reportes`;

  ventasPorCategoria(filtro: FiltroReporte): Observable<VentaPorCategoria[]> {
    let params = new HttpParams();
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);
    return this.http.get<VentaPorCategoria[]>(`${this.url}/ventas-por-categoria`, { params });
  }
}
