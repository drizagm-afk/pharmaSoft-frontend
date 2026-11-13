# S14 - Paso 8: matriz de integración

Fecha: 13 de noviembre de 2026.

Se recorrieron los ocho casos con las cuentas administrador y vendedor, utilizando Angular en localhost:4200, la API en localhost:8080 y Oracle de desarrollo. Las comprobaciones visibles se acompañan con respuestas reales de API para reportes y auditoría.

## Datos de la ejecución

- Cliente registrado: Elena Patricia Rojas Medina, DNI de ejemplo 74623185.
- Producto registrado: Aceite de almendras 60 ml, ID 5160, categoría Higiene.
- Precio inicial S/ 12.90; precio actualizado por admin S/ 13.50.
- Stock inicial 30; stock después de vender dos unidades 28.
- Venta 20077, registrada por vendedor, por S/ 27.00.
- RequestId de la venta: 0f96b8b8. RequestId del cambio de precio: d040fa14.

Los nombres y datos de contacto se usan como datos de ejemplo de la actividad. El correo utiliza example.com.

## Matriz

| Caso | Integración | Resultado observado | Estado |
|---|---|---|---|
| I-01 | Clientes a Venta | El cliente recién registrado aparece al buscar su DNI y puede seleccionarse en Nueva venta; comprobado también al iniciar como vendedor. | Cumple |
| I-02 | Catálogo a Venta | La opción muestra S/ 13.50 y stock 30. El mismo producto se excluye con stock cero y también al estar inactivo con stock 28. Se restaura activo con stock 28 al terminar. | Cumple para el catálogo cargado; ver INC-01 |
| I-03 | Venta a Catálogo | Tras vender dos unidades, abrir Productos por el menú muestra stock 28 sin F5. | Cumple |
| I-04 | Venta a Reportes | El reporte de productos más vendidos del día pasa de vacío a una fila del producto: cantidad 2, total S/ 27.00. Comprobado mediante API autenticada como administrador. | Cumple en API |
| I-05 | Venta a Auditoría | Evento VENTA_REGISTRADA para Venta 20077, usuario vendedor, total 27.0 e items 1. El requestId 0f96b8b8 coincide con el registro HTTP POST /api/v1/ventas, respuesta 201. | Cumple |
| I-06 | Catálogo a Auditoría | Evento PRECIO_MODIFICADO para Producto 5160, usuario admin y detalle 12.9 -> 13.5. El producto devuelve modificadoPor=admin. | Cumple |
| I-07 | Seguridad a módulos | Durante una venta sin confirmar vence la sesión real. La SPA abre login?expirada=1&returnUrl=%2Fventas%2Fnueva y, tras autenticar, regresa a /ventas/nueva. No se confirma otra venta. | Cumple |
| I-08 | Paginación a filtros | Desde Página 5 de 1001, aplicar desde=hasta=2026-11-13 cambia la URL a pagina=0 y muestra Página 1 de 1 con la venta del día. | Cumple |

I-04 verifica el reporte solicitado en el backend. La ruta visual Reportes de esta rama muestra Ventas por categoría; no se presenta esa pantalla como si fuese el ranking de productos más vendidos.

## Incidencia para el paso 10

| ID | Observación | Evidencia y alcance | Pendiente |
|---|---|---|---|
| INC-01 | Nueva venta carga solo la primera página de 100 clientes y 100 productos y busca localmente. | VentaForm.cargarCatalogo y 08-api-catalogo.json: 100 productos cargados de 5012. Los registros fuera de esa página no pueden encontrarse con este buscador. | Sustituir el límite fijo por búsqueda paginada en servidor, conservando la exclusión de inactivos y productos sin stock. Aplicar el mismo criterio a clientes. |

Los casos positivos de la matriz no demuestran que el buscador cubra todo el catálogo. INC-01 queda registrada para la etapa de correcciones.

## Evidencias

Las capturas están en evidencias-integracion/. El manifiesto resultados/08-manifiesto-evidencias.json registra creación, última modificación, dimensiones y SHA-256. Las dos imágenes del producto actualizado/restaurado se recapturaron al finalizar la carga de la tabla.

| Aspecto | Capturas o datos |
|---|---|
| Cliente en nueva venta | I-01-cliente-en-venta.jpg |
| Disponibilidad y precio | I-02-producto-vigente.jpg, I-02-sin-stock-excluido.jpg, I-02-inactivo-excluido.jpg, I-02-producto-restaurado.jpg |
| Venta y stock | I-03-venta-confirmada.jpg, I-03-stock-sin-recarga.jpg |
| Reporte y auditoría | resultados/08-api-antes.json, resultados/08-api-despues.json |
| Precio actualizado | I-06-precio-actualizado.jpg y evento en 08-api-despues.json |
| Expiración y retorno | I-07-venta-sesion-por-vencer.jpg, I-07-sesion-expirada.jpg, I-07-regreso-a-venta.jpg |
| Página y fechas | I-08-pagina-cinco.jpg, I-08-filtro-reinicia-pagina.jpg |

Los JSON de API se obtuvieron con un cliente Python. No se presentan como capturas de Postman. Los tokens permanecen únicamente en memoria y no forman parte de los archivos. Las consultas autenticadas generan los eventos normales de login.

## Configuración y estado final

Para I-07 se inició temporalmente el backend con --app.jwt.expiracion-minutos=1, sin editar archivos de configuración. Después se retiró ese argumento y se reinició con perfil dev y la duración normal de 60 minutos. La nueva sesión del navegador confirma la duración restaurada.

El producto queda activo, precio S/ 13.50 y stock 28. Permanecen el cliente, el producto y la venta creados, junto con sus eventos. Las variaciones temporales de stock/estado usadas en I-02 se revirtieron al estado posterior a la venta.

Se agregaron los seis data-testid solicitados en la plantilla de Nueva venta: buscar-cliente, opcion-cliente, buscar-producto, opcion-producto con data-stock, cantidad y total-venta.

Validación técnica del frontend: 141 pruebas aprobadas en 33 archivos y compilación de producción correcta. Logs locales en tmp/s14/paso08-tests.log y tmp/s14/paso08-build.log.

Backend y Angular quedan ejecutándose. La salida del backend restaurado está en logs/s14-dev-restaurado-console.log dentro del proyecto backend; la correlación de la venta ejecutada antes del reinicio está en logs/s14-dev-console.log.

## Siguiente etapa

Después del commit de este paso se implementará la suite Playwright del paso 9. La estabilización y la resolución de INC-01 corresponden al paso 10.
