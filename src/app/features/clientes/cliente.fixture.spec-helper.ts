import { Cliente } from './models/cliente.model';
import { PaginaResponse } from '../../core/models/pagina-response';
export const cliente: Cliente = { id: 1, dni: '71234567', nombres: 'Ana', apellidos: 'Del Carpio',
  email: 'ana@example.com', telefono: null, direccion: null, estado: true,
  fechaCreacion: '2026-10-01T10:00:00', fechaModificacion: null };
export function pagina(contenido = [cliente], numero = 0): PaginaResponse<Cliente> {
  return { contenido, pagina: numero, tamanio: 10, totalElementos: 23, totalPaginas: 3, ultima: numero === 2 };
}
