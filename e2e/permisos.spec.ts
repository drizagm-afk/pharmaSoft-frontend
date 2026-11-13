import { expect, iniciarSesion, test } from './apoyo';

test('el almacenero no ve Ventas y la URL directa es denegada', async ({ page }) => {
  await iniciarSesion(page, 'almacen');
  await expect(page.getByRole('link', { name: 'Ventas', exact: true })).toHaveCount(0);
  await page.goto('/ventas');
  await expect(page).toHaveURL(/\/acceso-denegado$/);
  await expect(page.getByRole('heading', { name: /Acceso denegado/ })).toBeVisible();
});

test('el vendedor ve Productos sin botones de edición', async ({ page }) => {
  await iniciarSesion(page, 'vendedor', '/productos');
  await expect(page.getByTestId('tabla-productos')).toBeVisible();
  await expect(page.getByRole('link', { name: /Nuevo Producto/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Editar', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dar de baja', exact: true })).toHaveCount(0);
});
