# Revisión de evidencias S9

## Alcance y procedencia

Se inspeccionaron las **73 capturas y 3 PDFs** de `C:\Users\DRIZA\Documents\UNI\Evidence`, creados el 11/10/2026. Se clasificaron por contenido visible y se usaron las fechas para reconstruir el orden. Los originales permanecen intactos. Las 76 copias del repositorio tienen el mismo SHA-256 que su fuente; `evidencias/manifest.json` registra la trazabilidad y `evidencias/README.md` permite abrir cada archivo.

La matriz distingue lo observado de lo reportado por el estudiante. Los 21 casos fueron reportados como aprobados; no se inventan capturas, respuestas, pulsaciones ni resultados para cubrir los huecos documentales.

## Resultados respaldados

- Búsqueda de cliente sin tilde y exclusión del inactivo; búsqueda por nombre/categoría, Enter y exclusión de productos no disponibles.
- Cálculos 37.50, 56.70, 77.70 → 75.30 y 31.40 → 43.90, con capturas antes/después.
- Ventas 41 (75.30), 42 (37.50), 43 (18.90), 44 (8.70) y 45 (18.90). HTTP 201 visibles en capturas de Postman o Network.
- Validaciones de cantidades cero/fraccionarias y detalle nulo, HTTP 400; stock e inactividad, HTTP 409.
- V-05: dos líneas del mismo producto descontaron 27 → 24. En el rechazo posterior, dos cantidades de 13 fallaron con stock transaccional 11; el catálogo volvió a 24, evidenciando rollback completo.
- M-01: primera pestaña registró Gel × 2; segunda recibió 409 con disponible 0, conservó datos y pudo revisar un producto sustituto sin registrar otra venta.
- M-03: fallo Offline sin respuesta HTTP, datos conservados y posterior registro 45 con 201.
- Reporte con 12 unidades y 159.30; Higiene 84.30 (100%), Vitaminas 75.00 (89%). Límites opcionales, rango invertido y vacío están capturados.
- I-01: tres PDFs reales de una página. Venta 46 registrada y anulada conservan DNI 90000001 y pie; la anulada tiene sello. Consulta filtrada contiene 41–45 y total 159.30. No aparecen menú ni botones de aplicación. Los encabezados/pies propios del navegador aparecen porque esa opción de impresión estaba activada; no contradice el requisito de ocultar la interfaz de la SPA.
- Después de anular 46, el reporte vuelve a 12 unidades y 159.30; la restauración de stock fue confirmada por el estudiante, pero no tiene una captura específica posterior al script.

## Cierre con las nuevas capturas

- **V-01 API:** incorporada `evidencias/V-01_api.png` (19:13:54): 400 y respuesta con cliente obligatorio y detalles vacíos. Resuelto.
- **Stock de anulación:** incorporada `evidencias/I-01_stock-restaurado.png` (19:14:15): Vitamina D stock 24, Protector solar 21 y Gel 0. Resuelto.
- **Retest UX:** `evidencias/I-01_anulada-retest.png` (19:15:07) muestra venta 46 ANULADA sin banner verde. Su URL es `/ventas/46` sin `nueva=1`; esa variante se respalda con la prueba automatizada. La vista previa adicional se conserva en `I-01_anulada-retest-impresion.png`.
- **Network histórico:** el estudiante confirmó que reutilizó la pestaña y las respuestas originales ya no están disponibles. Se mantienen las capturas de Headers con códigos, recibos, respuestas Postman y PDFs, y se declara el límite en C2. No se fabrican respuestas ni se vuelven a registrar ventas para simular evidencia histórica. Este punto no se presenta como cumplimiento literal completo de la captura de Response.
- **Postman:** se conservó la exportación recibida con IDs vacíos en `evidencias/PREP_postman-export-original.json` y se completó la colección de trabajo con IDs respaldados por capturas. Antes de repetir V-03/M-01 debe restablecerse su precondición de stock 2.
## Hallazgo UX H-01

- **Descripción:** el detalle de una venta anulada conservaba el banner verde «Venta registrada correctamente» si la URL retenía `nueva=1`.
- **Severidad:** baja; confunde el mensaje actual, pero el estado y sello ANULADA y la exclusión del reporte son correctos.
- **Evidencia:** `evidencias/I-01_anulada-spa.png` (18:53:55) y el PDF anulado, que no incluye el banner por `no-imprimir`.
- **Causa:** `src/app/features/ventas/pages/venta-detalle/venta-detalle.html`, condición basada únicamente en `nueva()`; el estado se carga en `VentaDetalle.cargar()`.
- **Corrección:** mostrar el banner solo con `nueva() === '1' && v.estado === 'REGISTRADA'`. Capa: presentación Angular; no modificar la venta ni eliminar evidencia original.
- **Verificación:** se extendió la prueba del recibo anulado para comprobar la ausencia del banner con `nueva=1`. Regresión completada: 75 pruebas frontend aprobadas en 21 archivos y build de producción correcto. Retest manual incorporado; la variante con nueva=1 permanece cubierta por automatización.

No se convierte una respuesta 400/409 esperada en un fallo funcional. H-01 es una observación adicional de UX; las deficiencias de captura son pendientes documentales, no pruebas de un error del backend.

## Entrega

La versión final utiliza párrafos negros, encabezados azules y acentos dorados, con jerarquía mediante tamaño y espaciado. El conjunto «Evidencias» agrupa las capturas por aspecto, con encabezados de grupo; las tres impresiones están junto a las capturas de I-01. Se actualizaron las referencias de página de la matriz y se verificaron nuevamente las 81 páginas.

El informe principal contiene tres páginas C1–C3 y dos capturas integradas junto al texto. Describe la verificación de los 21 casos y mantiene explícita la limitación de las respuestas históricas de Network. La copia para el aula y el informe del repositorio son idénticos.

El documento separado de matriz y evidencias contiene 78 páginas: dos de matriz, las 73 capturas y las tres impresiones originales. Cada evidencia incluye título y descripción breve; no hay índice de evidencias ni nombres de archivos visibles. Se comprobó el contenido y se inspeccionaron visualmente las 81 páginas de ambos documentos. Los originales conservan sus hashes.

La guía no fija tipografía, márgenes ni portada; se adoptó su identidad visual UPeU. No se ha creado una solicitud de incorporación ni realizado la subida al aula. Se mantiene la indicación del profesor, transmitida por el estudiante, de permitir commits el mismo día.
