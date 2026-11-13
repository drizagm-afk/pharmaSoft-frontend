import { expect, iniciarSesion, test } from './apoyo';

test.describe('Autenticación', () => {
  test('una ruta protegida sin sesión lleva al login con returnUrl', async ({ page }) => {
    await page.goto('/ventas');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fventas$/);
  });

  test('credenciales incorrectas muestran el mensaje del backend', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Usuario', { exact: true }).fill('admin');
    await page.getByLabel('Contraseña', { exact: true }).fill('incorrecta');
    const respuesta = page.waitForResponse(
      (r) => new URL(r.url()).pathname === '/api/v1/auth/login' && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    expect((await respuesta).status()).toBe(401);
    await expect(page.getByRole('alert')).toHaveText('Usuario o contraseña incorrectos');
  });

  test('tras iniciar sesión vuelve a la página pedida', async ({ page }) => {
    await iniciarSesion(page, 'vendedor', '/ventas');
    await expect(page).toHaveURL(/\/ventas$/);
    await expect(page.getByRole('heading', { name: 'Consulta de ventas', exact: true })).toBeVisible();
  });
});
