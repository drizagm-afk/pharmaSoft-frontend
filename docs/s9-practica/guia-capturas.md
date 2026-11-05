# Capturas para la práctica S9 - las 17 pruebas

## Preparación

Duración orientativa: 30-45 minutos. La fecha de esta ejecución es 12/10/2026. Guarda el bundle en una carpeta separada de las evidencias autónomas. Los nombres P01, P02a, etc. son opcionales, pero ayudan a clasificar; no se mostrarán como nombres de archivo en el informe.

Abre `http://localhost:4200/ventas/nueva` y F12 > Network/Red. Activa Preserve log/Conservar registro y el filtro Fetch/XHR. Deja terminar la carga inicial. Para demostrar que una acción no envía peticiones, limpia Red justo antes de la acción, nunca después. Para peticiones reales, guarda Headers (URL y estado), Payload y Response mientras la solicitud todavía exista. Pueden ser capturas separadas: es preferible conservar texto legible que comprimir todo en una sola imagen. No reutilices la pestaña eliminando las respuestas antes de capturarlas; exportar HAR es opcional.

Mantén visible la SPA en capturas de interacción. Las vistas previas de impresión pueden ocupar toda la pantalla. Activa gráficos de fondo si se necesitan para el sello y formato; los encabezados del navegador son opcionales. No fotografíes contraseñas ni cadenas de conexión.

Usa cliente 11, María Elena Huamán Flores. A = Vitamina D, S/12.50, stock inicial 24. B = Protector solar, S/18.90, stock inicial 21. C = Vitamina C, S/1.20, stock inicial 40. Estos valores fueron leídos de la API el 12/10/2026. Guarda una captura inicial del catálogo de Productos donde se vean A y B, para compararla en P14.

Las pruebas P01-P08 se hacen en el mismo formulario, sin registrar nada. P09-P11 pueden compartir UNA venta, con impresión automática activada. P15 registra otra venta válida y rechaza la segunda. Anota los identificadores reales: no asumir 47 o 48.

## Grupo 1. Formulario y buscadores

### P01 - Formulario vacío
1. Sin seleccionar cliente ni agregar productos, limpia Red y pulsa Revisar venta.
2. Captura el formulario con mensajes de cliente obligatorio y al menos un producto, sin confirmación y sin POST en Red.

### P02 - Búsqueda normalizada y ausencia de coincidencias
1. Escribe `huaman`, sin tilde. Captura el resultado María Elena Huamán Flores.
2. Reemplaza por `zzzzcliente`. Captura el mensaje sin coincidencias.
3. Busca `guevara`. Captura que el cliente inactivo no aparece. Luego vuelve a `huaman` y selecciona a María Elena.

### P03 - Primera línea y cálculo
1. Busca `vitamina d`, agrega A y cambia cantidad a 3.
2. Captura producto, cantidad 3, precio S/12.50, subtotal y total S/37.50.

### P04 - Enter, tres líneas y eliminación
1. Busca `protector` y pulsa Enter. Debe agregarse B con cantidad 1, sin confirmación ni POST.
2. Busca `vitamina c` y pulsa Enter. Captura las tres líneas: 37.50 + 18.90 + 1.20 = S/57.60.
3. Quita la línea C. Captura dos líneas y total S/56.40. Red debe seguir sin POST.

### P05 - Producto repetido
1. Busca A otra vez, antes de agregarlo. Captura el resultado indicando En la venta: 3.
2. Agrégalo. Captura UNA fila de A con cantidad 4 y subtotal S/50.00; B sigue con cantidad 1 y total S/68.90.

### P06 - Exceso de stock
1. Pon cantidad 25 en A, cuyo stock cargado es 24. Limpia Red y pulsa Revisar venta.
2. Captura Supera el stock, sin confirmación ni POST.
3. Corrige A a 3 y cambia B a 2. El total vuelve a S/75.30.

## Grupo 2. Confirmación, registro y comprobante

### P07 - Resumen previo
1. Mantén A x3 y B x2. Deja marcada Imprimir el comprobante al registrar.
2. Pulsa Revisar venta. Captura cliente, dos productos, cinco unidades y total estimado S/75.30, con Volver y Confirmar.

### P08 - Volver no registra
1. Con el resumen abierto, limpia Red y pulsa Volver.
2. Captura las dos líneas conservadas, resumen cerrado y Red sin solicitudes nuevas. Si aparecen solicitudes ajenas, el dato relevante es que no exista POST /ventas.

### P09 - Confirmar y POST 201
1. Revisa nuevamente. Captura el resumen con la casilla de impresión marcada (también sirve P07).
2. Confirma UNA vez. Se abrirá automáticamente impresión, que documentarás en P11; después ciérrala/cancélala, sin registrar otra venta.
3. Captura el comprobante y mensaje Venta registrada correctamente. Anota su número.
4. En Red selecciona el POST /ventas. Captura Headers con 201, Payload y Response. El request solo debe contener clienteId y detalles con productoId/cantidad; el response debe mostrar identificador, total 75.30 y detalles calculados.

### P10 - Total estimado y definitivo
1. Usa el resumen de P07 y el comprobante/Response de P09 como pareja de evidencia.
2. Confirma 12.50 x 3 = 37.50; 18.90 x 2 = 37.80; suma = 75.30 en ambos. No hace falta otra venta ni repetir la misma captura.

### P11 - Impresión AUTOMÁTICA al registrar
1. En el diálogo que se abre por P09, captura la vista previa: DNI 90000001, detalles, total y pie; sin menú ni botones de la aplicación.
2. Guarda como PDF el comprobante registrado. Documenta que el diálogo se abrió al confirmar, sin pulsar manualmente Imprimir.
3. Cierra impresión para capturar después el POST de P09. No limpies Red entre ambas acciones.

## Grupo 3. Consulta e impresión

### P12 - Comprobante anulado desde la fila
1. En /ventas, elige Estado ANULADA y busca. La venta 46 ya está anulada; no anules otra.
2. Captura su fila y el botón de impresora que vas a utilizar.
3. Pulsa la impresora de esa fila. Captura la vista previa con sello ANULADA, DNI y pie, sin menú ni botones.
4. Guarda como PDF. No basta abrir /ventas/46 e imprimir manualmente: la prueba incluye la acción desde la consulta.

### P13 - Consulta filtrada impresa
1. Cliente María Elena; Estado REGISTRADA; Desde 11/10/2026; Hasta 12/10/2026. Pulsa Buscar y captura filtros y tabla.
2. Pulsa Imprimir consulta. Captura la vista previa con resumen de filtros, tabla, total registrado de la página y paginación; sin controles, menú ni botones.
3. Guarda como PDF. Si solo se registró P09 después de las seis ventas existentes, el total esperado es 159.30 + 75.30 = S/234.60. Si hiciste otra venta o P15 antes, recalcula: usa siempre el total real de las ventas REGISTRADAS incluidas.

### P14 - Stock después de vender
1. Abre Productos y actualiza el catálogo.
2. Captura A stock 21 y B stock 19, si solo se realizó P09 y no hubo otra operación. C debe seguir en 40.
3. Incluye la captura inicial A24/B21: descontó exactamente 3 y 2. Si el stock difiere, anota operaciones adicionales; no modifiques cifras para hacerlas coincidir.

## Grupo 4. Conflicto y filtros

### P15 - Dos cajas y últimas unidades
Este caso cambia stock y registra una venta. Gel antibacterial tiene actualmente stock 0. Para repetirlo de forma controlada, repón ese producto a 2 desde Editar en Productos (o tu herramienta habitual), conservando su precio S/4.35, categoría y estado activo. Captura el catálogo con stock 2; no cambies los productos de P09. Si prefieres conservar el catálogo sin reponer, se pueden reutilizar las evidencias históricas de M-01, indicando su fecha; no presentar una nueva ejecución ficticia.

1. Tras la reposición, abre DOS pestañas nuevas de /ventas/nueva y espera que ambas carguen stock 2.
2. En ambas elige María Elena y Gel antibacterial x2; total S/8.70. Revisa ambas antes de confirmar cualquiera. Desmarca la impresión para evitar interrupciones.
3. Confirma en la primera. Captura comprobante y POST 201; anota el número.
4. Sin recargar la segunda, confirma. Captura el mensaje de stock, formulario conservado y POST 409. Guarda Headers, Payload y Response del conflicto.
5. Actualiza Productos: Gel debe quedar en 0. En Consulta verifica que exista solo la venta de la primera caja y no otra por el intento rechazado. Captura el resultado y, si hace falta, GET /ventas/buscar con Response.

### P16 - Solo filtros con valor
1. En /ventas limpia filtros. Selecciona María Elena; Desde 11/10/2026; Hasta 12/10/2026; deja Estado Todos. Limpia Red, busca y captura tabla con la nueva venta de P09.
2. Captura Headers/Query String Parameters del GET /ventas/buscar: clienteId=11, desde=2026-10-11, hasta=2026-10-12, pagina=0, tamanio=10 y orden; NO debe aparecer estado vacío ni null.
3. Captura Response con contenido, pagina, tamanio, totalElementos, totalPaginas y ultima.
4. Como contraste, limpia todos los filtros y busca: captura URL sin clienteId/estado/desde/hasta. Los parámetros de paginación y orden sí deben permanecer.

### P17 - Rango de fechas inválido
1. Selecciona Desde 13/10/2026 y Hasta 12/10/2026. Limpia Red justo antes de Buscar.
2. Captura el mensaje de rango inválido y ausencia de nuevo GET /ventas/buscar. La tabla anterior puede seguir visible; no significa que se haya consultado el rango inválido.

## Complementos para la lista de cotejo (sin ventas adicionales)

- Paginación de API: en Postman GET `http://localhost:8080/api/v1/ventas/buscar?pagina=0&tamanio=2&ordenarPor=fecha&direccion=desc`, después pagina=1. Captura cada 200 con Response y distintos resultados. La SPA usa tamaño 10 y con menos de once ventas no permite cambiar de página; documentaremos esa precondición en vez de crear ventas únicamente para llenar páginas.
- Error 404 visible: abre `http://localhost:4200/ventas/999999999`; captura mensaje SPA y GET 404/Response. Usa un identificador confirmado inexistente si aquel existiera. Después vuelve a /ventas.
- Error 400 de contrato: Postman POST /ventas con `{"clienteId":null,"detalles":[]}`. Captura 400 y Response; no se crea una venta. Esto respalda el backend, sin atribuirle a la SPA una interacción que no ocurrió.
- Versionado: captura `git branch --show-current` y `git log --oneline -10`. La documentación distinguirá los commits existentes del PR, que permanece pendiente si aún no se ha creado.
- No hacen falta credenciales, capturas de todo el código ni el reporte por categoría para las 17 pruebas de esta práctica. La arquitectura y persistencia se documentan desde los archivos inspeccionados.

## Bundle a entregar

Envía la carpeta de capturas y los tres PDFs guardados. Adjunta una nota con: número de venta P09; número de venta P15 si lo repetiste; resultados inesperados; productos o precios cambiados; si usaste evidencia histórica en P15. Una misma captura puede respaldar varios pasos, siempre que los muestre claramente. No se inventarán resultados ni se ocultarán fallos: si algo falla, conserva la evidencia y explica lo ocurrido.
