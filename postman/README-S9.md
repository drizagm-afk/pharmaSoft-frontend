# PharmaSoft — colección S9 Ventas

Colección preparada: `PharmaSoft-S9-Ventas.json` (**29 solicitudes**). No se ha ejecutado para esta actividad. Importarla en Postman al comenzar la fase de validación.

## Preparación

1. Comprobar que `baseUrl` sea `http://localhost:8080/api/v1`.
2. Ejecutar las consultas de **01 - Preparación y consultas**. Los scripts resuelven cliente activo/inactivo y productos por precio/disponibilidad, sin depender de los nombres editados para los productos nuevos.
3. Revisar los valores guardados en las variables de la colección. `productoStock2Id` necesita un producto activo con stock exactamente 2; conservar esa precondición para V-03 y M-01.
4. Ajustar `desde` y `hasta` al período de las ventas que se generarán.

Las consultas de catálogo solicitan hasta 100 registros; para un catálogo mayor, resolver los IDs en las páginas correspondientes. La colección está preparada para el catálogo pequeño de esta actividad.

## Ejecución durante validación

- **02 - Validaciones API:** errores esperados 400/409/404. Comprobar stock antes y después, además del código HTTP. Para V-05 con cantidades repetidas excesivas, ejecutar inmediatamente antes su GET preparatorio; necesita stock ≥ 2.
- **03 - Registro de ventas:** las solicitudes **CREA VENTA** registran ventas y descuentan stock. Ejecutarlas manualmente por caso, no con un Runner indiscriminado. C-04 exige A de 12.50 y B de 18.90 con cantidades 3 y 2; V-05 válido exige A con stock ≥ 3. La variable `ventaId` conserva el ID obtenido por el POST C-04 de la colección.
- **04 - Reporte:** histórico, límites individuales, rango, rango invertido y período vacío. El JSON usa el contrato real del backend (`categoria`, `cantidad`, `total`); el frontend lo adapta a `categoriaNombre`, `cantidadVendida`, `montoTotal`.
- Las peticiones API de C-04 y M-01 son complementarias. No sustituyen el registro desde la SPA ni las dos pestañas exigidas por la matriz. Si se usa el ID de una venta creada desde la SPA para X-01, introducirlo manualmente en `ventaId`.
- Después de las ejecuciones, exportar la colección si se quieren conservar las variables resueltas. No exportar credenciales ni datos privados ajenos a las pruebas.

## Casos que requieren el navegador

Buscadores, cálculos visibles, confirmación/Volver, doble clic, recuperación tras 409, comparación de barras e impresión. M-03 usa **Offline** en la pestaña Red después de cargar el catálogo; volver a conexión normal antes de reintentar. El fallo inicial no tiene código HTTP de respuesta del servidor.

## Evidencias — fase posterior

Guardar capturas con ID, mostrar respuesta y HTTP cuando existan, y anotar las operaciones manuales. I-01 requiere guardar tres PDFs reales. Los scripts de Postman y las pruebas unitarias no reemplazan estas evidencias.

Consultar `docs/matriz-pruebas-s9.md` para las 21 filas y sus precondiciones. La simulación Offline y los registros de venta no se han realizado en esta preparación.
