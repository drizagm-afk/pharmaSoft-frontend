import { signal } from '@angular/core';
import { Permiso, Sesion } from './auth.model';

/** Explicit session for component tests; never a real credential. */
export function crearAuthPrueba(
  permisos: Permiso[] = [
    'CATALOGO_LEER',
    'CATALOGO_ESCRIBIR',
    'CLIENTES_LEER',
    'CLIENTES_ESCRIBIR',
    'VENTAS_LEER',
    'VENTAS_REGISTRAR',
    'REPORTES_VER',
  ],
) {
  const sesion = signal<Sesion | null>({
    token: 'test',
    expiraEn: Date.now() + 60_000,
    username: 'prueba',
    nombreCompleto: 'Cuenta de prueba',
    roles: ['ADMIN'],
    permisos,
  });
  return {
    sesion,
    token: () => sesion()?.token ?? null,
    tienePermiso: (permiso: Permiso) => sesion()?.permisos.includes(permiso) ?? false,
    cerrarSesion: () => sesion.set(null),
  };
}
