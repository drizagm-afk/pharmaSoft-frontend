import { expect, iniciarSesion, test } from './apoyo';

test('productos se paginan en el servidor con la página en la URL', async ({ page }) => {
  await iniciarSesion(page, 'admin', '/productos');
  const tabla = page.getByTestId('tabla-productos');
  const filas = tabla.locator('tbody tr');
  await expect(filas).toHaveCount(20);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 1 de \d+/);
  const primeraFila = await filas.first().innerText();
  const respuesta = page.waitForResponse((r) => {
    const url = new URL(r.url());
    return url.pathname === '/api/v1/productos' && url.searchParams.get('pagina') === '1';
  });
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  expect((await respuesta).status()).toBe(200);
  await expect(page).toHaveURL(/[?&]pagina=1(?:&|$)/);
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await expect(filas.first()).not.toHaveText(primeraFila);
  await page.reload();
  await expect(page.getByTestId('pagina-actual')).toHaveText(/Página 2 de/);
  await expect(filas).toHaveCount(20);
});
