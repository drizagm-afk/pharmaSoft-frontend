import { expect, Page, test as base } from '@playwright/test';

// Demonstration accounts from the guide. Local overrides never enter the report.
const USUARIOS = {
  admin: { usuario: 'admin', clave: process.env['E2E_ADMIN_PASSWORD'] ?? 'Admin2026*' },
  vendedor: { usuario: 'vendedor', clave: process.env['E2E_VENDEDOR_PASSWORD'] ?? 'Vendedor2026*' },
  almacen: { usuario: 'almacen', clave: process.env['E2E_ALMACEN_PASSWORD'] ?? 'Almacen2026*' },
} as const;

export const DATOS_VENTA = {
  cliente: process.env['E2E_CLIENTE'] ?? 'Elena Patricia',
  producto: process.env['E2E_PRODUCTO'] ?? 'Aceite de almendras 60 ml',
};

// Every test owns a fresh context. Diagnostics observe real requests without mocking them.
export const test = base.extend<{ diagnostico: void }>({
  diagnostico: [
    async ({ page }, use, testInfo) => {
      const erroresConsola: string[] = [];
      const erroresPagina: string[] = [];
      const respuestas500: { metodo: string; ruta: string; estado: number }[] = [];
      page.on('console', (mensaje) => {
        if (mensaje.type() === 'error') erroresConsola.push(mensaje.text());
      });
      page.on('pageerror', (error) => erroresPagina.push(error.message));
      page.on('response', (respuesta) => {
        if (respuesta.status() >= 500) {
          respuestas500.push({
            metodo: respuesta.request().method(),
            ruta: new URL(respuesta.url()).pathname,
            estado: respuesta.status(),
          });
        }
      });
      await use();
      await testInfo.attach('diagnostico', {
        body: JSON.stringify({ erroresConsola, erroresPagina, respuestas500 }, null, 2),
        contentType: 'application/json',
      });
      // The invalid-login case intentionally receives 401; it is not a server failure.
      if (testInfo.title.startsWith('flujo principal:')) {
        expect(erroresConsola, 'Consola del flujo principal').toEqual([]);
        expect(erroresPagina, 'Errores de ejecución del flujo principal').toEqual([]);
        expect(respuestas500, 'Respuestas 500 del flujo principal').toEqual([]);
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';

export async function iniciarSesion(
  page: Page,
  quien: keyof typeof USUARIOS,
  ruta = '/inicio',
) {
  const { usuario, clave } = USUARIOS[quien];
  await page.goto(ruta);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Usuario', { exact: true }).fill(usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
}
