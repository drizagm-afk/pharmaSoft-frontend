/** Contrato de PaginaResponse del backend; la página empieza en cero. */
export interface Pagina<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  ultima: boolean;
}

export interface ConsultaPagina<Orden extends string = string> {
  pagina: number;
  tamanio: number;
  ordenarPor: Orden;
  direccion: 'asc' | 'desc';
}
