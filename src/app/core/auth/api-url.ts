import { environment } from '../../../environments/environment';

/** Match the API origin and path boundary, never a server with a similar prefix. */
export function esPeticionApi(url: string): boolean {
  try {
    const api = new URL(environment.apiUrl, document.baseURI);
    const destino = new URL(url, document.baseURI);
    const ruta = api.pathname.replace(/\/$/, '');
    return (
      destino.origin === api.origin &&
      (destino.pathname === ruta || destino.pathname.startsWith(`${ruta}/`))
    );
  } catch {
    return false;
  }
}

export function esLogin(url: string): boolean {
  return (
    esPeticionApi(url) &&
    new URL(url, document.baseURI).pathname.replace(/\/$/, '').endsWith('/auth/login')
  );
}
