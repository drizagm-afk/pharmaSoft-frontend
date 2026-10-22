import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { esLogin, esPeticionApi } from '../auth/api-url';

/**
 * Reacción común a los errores de seguridad:
 *
 * - 401: el token falta, venció o no es válido → se cierra la sesión y se
 * vuelve al login recordando la página actual. Se excluye el propio login:
 * allí el 401 significa «credenciales incorrectas» y lo muestra el formulario.
 * - 403: el usuario SÍ está autenticado pero no tiene el permiso. No se cierra
 * la sesión: el componente muestra el mensaje del backend.
 *
 * En ambos casos el error se vuelve a lanzar para que el componente lo reciba.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && esPeticionApi(req.url) && !esLogin(req.url) && auth.sesion()) {
        auth.cerrarSesion('expirada', router.url);
      }
      return throwError(() => err);
    }),
  );
};
