import { DATOS_VENTA, expect, iniciarSesion, test } from './apoyo';

test('flujo principal: el vendedor registra una venta y el stock baja', async ({ page }, testInfo) => {
  await iniciarSesion(page, 'vendedor', '/ventas/nueva');
  await page.getByTestId('buscar-cliente').fill(DATOS_VENTA.cliente);
  await page.getByTestId('opcion-cliente').filter({ hasText: DATOS_VENTA.cliente }).first().click();
  await page.getByTestId('buscar-producto').fill(DATOS_VENTA.producto);
  const opcion = page.getByTestId('opcion-producto').filter({ hasText: DATOS_VENTA.producto }).first();
  await expect(opcion).toBeVisible();
  const stockAntes = Number(await opcion.getAttribute('data-stock'));
  expect(stockAntes, 'El producto necesita al menos dos unidades disponibles').toBeGreaterThanOrEqual(2);
  await opcion.click();
  await page.getByTestId('cantidad').last().fill('2');
  await expect(page.getByTestId('total-venta')).not.toHaveText(/S\/\s*0\.00/);
  await page.getByRole('button', { name: 'Revisar venta', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Imprimir el comprobante al registrar' }).uncheck();
  const registro = page.waitForResponse(
    (r) => new URL(r.url()).pathname === '/api/v1/ventas' && r.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Confirmar venta', exact: true }).click();
  const respuesta = await registro;
  expect(respuesta.status()).toBe(201);
  const venta = await respuesta.json();
  await expect(page.getByText('Venta registrada correctamente.', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(new RegExp('/ventas/' + venta.id + '\\?nueva=1$'));
  await testInfo.attach('venta-registrada', { body: await page.screenshot(), contentType: 'image/png' });
  // Router navigation, without F5: this must request fresh stock after cache invalidation.
  await page.getByRole('link', { name: 'Productos', exact: true }).click();
  const fila = page.getByTestId('tabla-productos').locator('tbody tr', { hasText: DATOS_VENTA.producto });
  await expect(fila).toHaveCount(1);
  await expect(fila.locator('td').nth(3)).toHaveText(String(stockAntes - 2));
  await testInfo.attach('stock-actualizado', { body: await page.screenshot(), contentType: 'image/png' });
  await testInfo.attach('resultado-venta', {
    body: JSON.stringify({
      ventaId: venta.id,
      producto: DATOS_VENTA.producto,
      stockAntes,
      stockDespues: stockAntes - 2,
      requestId: respuesta.headers()['x-request-id'],
    }, null, 2),
    contentType: 'application/json',
  });
});
