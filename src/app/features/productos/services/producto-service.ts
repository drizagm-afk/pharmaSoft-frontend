import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { ConsultaPagina } from '../../../core/models/pagina';
import { Direccion, OrdenProducto, Producto, ProductoRequest } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;
  buscar(texto: string): Observable<PaginaResponse<Producto>> {
    return this.http.get<PaginaResponse<Producto>>(`${this.url}/buscar`, {
      params: { texto, pagina: 0, tamanio: 6 },
    });
  }
  listar(consulta: ConsultaPagina<OrdenProducto>): Observable<PaginaResponse<Producto>>;
  listar(
    pagina?: number,
    tamanio?: number,
    ordenarPor?: OrdenProducto,
    direccion?: Direccion,
  ): Observable<PaginaResponse<Producto>>;
  listar(
    consulta: number | ConsultaPagina<OrdenProducto> = 0,
    tamanio = 10,
    ordenarPor: OrdenProducto = 'nombre',
    direccion: Direccion = 'asc',
  ): Observable<PaginaResponse<Producto>> {
    const pagina = typeof consulta === 'number' ? consulta : consulta.pagina;
    if (typeof consulta !== 'number') ({ tamanio, ordenarPor, direccion } = consulta);
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);
    return this.http.get<PaginaResponse<Producto>>(this.url, { params });
  }
  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }
  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, dto);
  }
  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }
  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
