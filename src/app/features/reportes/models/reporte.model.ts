export interface VentaPorCategoria {
  categoriaId: number;
  categoriaNombre: string;
  /** Total units sold, rather than the number of sales. */
  cantidadVendida: number;
  montoTotal: number;
}

export interface FiltroReporte {
  desde: string | null;
  hasta: string | null;
}
