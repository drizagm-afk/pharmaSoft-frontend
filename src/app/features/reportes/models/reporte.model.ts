export interface VentaPorCategoria {
  categoriaId: number;
  categoria: string;
  /** Total units sold, rather than the number of sales. */
  cantidad: number;
  total: number;
}

export interface FiltroReporte {
  desde: string | null;
  hasta: string | null;
}
