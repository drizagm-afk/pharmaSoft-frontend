# Preparación S8 Autónoma

Línea base en feature/pruebas-dependencias-delcarpio: 18 casos comprobados a nivel API, 12 pasan y 6 fallan. Los primeros diez fueron ejecutados por el estudiante; Codex completó los restantes el 6 de octubre. La cobertura SPA y las capturas pendientes se indican por caso; esta matriz no representa 18 pruebas completas con Network.
Rama creada desde develop, commit 4745d56, tras fusionar la práctica mediante PR #2.

Políticas esperadas: impedir desactivar categorías con productos activos; impedir eliminar categorías con cualquier producto, incluso inactivo, para preservar referencias e historia.

| ID | Operación | Precondición / datos | Esperado | Obtenido SPA / HTTP | Estado | Evidencia |
|---|---|---|---|---|---|---|
| A-01 | Alta válida | Aceite de Segunda Mano; categoría 46 activa; precio 5.50; stock 10 | 201 y fila con categoría | SPA: fila visible; POST 201, id 87, categoriaId 46; GET posterior confirma datos y fechaModificacion null | Pasa | docs/s8/evidencias-autonoma/A-01_headers.png / A-01_response.png |
| A-02 | Alta sin categoría | QA S8 AUTO A02; precio 5.50; stock 10; sin categoría | SPA no envía; API 400 | SPA: Seleccione una categoría, Network vacío; Postman: 400, validationErrors.categoriaId indica categoría obligatoria | Pasa | docs/s8/evidencias-autonoma/A-02_spa.png / A-02_postman.png |
| A-03 | Alta en categoría inexistente | QA S8 AUTO A03; categoriaId 999 inexistente; precio 5.50; stock 10 | 404 | Postman: 404, Categoria no encontrada con id: 999 | Pasa | docs/s8/evidencias-autonoma/A-03_postman.png |
| A-04 | Alta en categoría inactiva | QA S8 AUTO A04; categoriaId 49 inactiva; precio 5.50; stock 10 | SPA no ofrece; API 409 | SPA: categoría inactiva ausente; Postman: 201, producto 88 activo creado en categoría 49 inactiva | Falla (H-01) | docs/s8/evidencias-autonoma/A-04_spa.png / A-04_postman.png |
| A-05 | Alta duplicada | aceite de segunda mano; categoría 46; precio 5.50; stock 10 | 409 | SPA muestra mensaje de duplicado; POST 409 con mensaje del backend | Pasa | docs/s8/evidencias-autonoma/A-05_headers.png / A-05_response.png |
| A-06 | Alta con números inválidos | QA S8 AUTO A06; categoría 46; precio 0; stock -1 | SPA bloquea; API 400, dos campos | SPA muestra ambos errores y Network vacío; Postman 400 con validationErrors.precio y validationErrors.stock | Pasa | docs/s8/evidencias-autonoma/A-06_spa.png / A-06_postman.png |
| A-07 | Alta con stock fraccionario (propio) | SPA QA S8 AUTO A07; API QA S8 AUTO A99 (nombre cambiado tras colisión); categoría 46; precio 5.50; stock 1.5 | SPA bloquea; API 400 | SPA: error de entero, Network vacío; API: 201, producto 90, stock devuelto 1 en vez de 1.5 | Falla (H-02) | docs/s8/evidencias-autonoma/A-07_spa.png / A-07_postman.png |
| C-01 | Cambio a categoría activa | Producto 87 Aceite de Segunda Mano; categoría 46 a 47; precio 5.50, stock 10 conservados | 200 y categoría nueva | SPA fila en Activa B; PUT /productos/87 devuelve 200 y categoriaId 47 | Pasa | docs/s8/evidencias-autonoma/C-01_headers.png / C-01_response.png |
| C-02 | Cambio a categoría inactiva | SPA: fixture 73 con categoría original inactiva; API: producto 87, categoría 47 a 49 inactiva | SPA bloquea; API 409 | SPA: aviso y Network vacío; API: PUT 200, producto 87 activo reasignado a categoriaId 49 | Falla (H-03) | docs/s8/evidencias-autonoma/C-02_spa.png / C-02_postman.png |
| C-03 | Desactivar categoría con productos activos | Categoría 66 QA S8 AUTO C03; producto 91 activo | Rechazar y conservar ambos activos | SPA PUT /categorias/66 devuelve 201 y estado false; GET posterior confirma producto 91 aún activo en categoría 66 | Falla (H-04) | docs/s8/evidencias-autonoma/C-03_headers.png / C-03_response.png |
| C-04 | Formulario obsoleto en dos pestañas | Categoría 67 activa, formulario abierto; desactivada desde segunda pestaña | API 409, no crear | SPA acepta y crea producto 92 tras desactivar categoría 67; GET confirma vínculo. Prueba API complementaria: POST 201 crea producto 93 en categoría 67 inactiva | Falla (H-01, formulario obsoleto) | C-04_formulario-obsoleto.png; C-04_categoria-inactiva.png; C-04_producto92.json; C-04_api.json |
| C-05 | Cambio a categoría inexistente (propio) | Producto 87; categoriaId 999 | 404 y producto sin cambios | Postman 404; GET conserva nombre, estado y categoriaId 49 previos | Pasa | C-05_postman.png; C-05_verificacion.json |
| C-06 | Cambio a nombre duplicado (propio) | Producto 87; nombre qa s8 auto a04, existente en producto 88; categoría activa 46 | 409 y datos sin cambios | SPA acepta; Postman PUT 200, assertion 0/1; GET confirma nombres iguales ignorando mayúsculas en productos 87 y 88 | Falla (H-05) | C-06_formulario.png; C-06_spa-duplicados.png; C-06_postman.png; C-06_producto87.json; C-06_producto88.json |
| B-01 | Baja lógica | Producto 87 activo, nombre cambiado por C-06 | 204 y fila Inactivo | Intento SPA: confirmación tuvo timeout; GET mostró activo, se completó por API DELETE 204. GET posterior estado false; DOM de SPA recargada muestra Inactivo y botón deshabilitado. Captura SPA/Network pendiente | Pasa API; SPA parcial | B-01_antes.json; B-01_api.json; B-01_despues.json; cobertura-spa.md |
| B-02 | Repetir baja | Producto 87 inactivo tras B-01 | 409 | API DELETE 409: El producto ya se encuentra inactivo. GET conserva datos | Pasa API | B-02_api.json; B-02_despues.json |
| B-03 | Eliminar categoría vacía | Categoría QA exclusiva 68 creada sin productos | 204; desaparece listado/select actualizado | API DELETE 204 y GET 404. Listado/select por SPA y captura pendientes | Pasa API; SPA pendiente | B-03_preparacion.json; B-03_api.json; B-03_despues.json |
| B-04 | Eliminar categoría con productos inactivos | Categoría 66; su único producto 91 dado de baja por API 204 | 409, conservar referencias | API DELETE /categorias/66 devuelve 409; GET conserva categoría y producto 91 inactivo. Mensaje y Network SPA pendientes | Pasa API; SPA pendiente | B-04_api.json; B-04_producto-inactivo.json; B-04_categoria-conservada.json; B-04_producto-conservado.json |
| B-05 | Eliminar categoría con producto activo (propio) | Categoría 67; producto 92 activo | 409, categoría y producto conservados | API DELETE 409; GET conserva categoría y producto activo. Mensaje y Network SPA pendientes | Pasa API; SPA pendiente | B-05_api.json; B-05_categoria-conservada.json; B-05_producto-conservado.json |

Orden sugerido: altas, cambios, bajas. Crear datos QA independientes para C-03, C-04, B-03, B-04 y B-05; no modificar productos reales. Verificar por GET después de cada rechazo. No ejecutar toda la colección indiscriminadamente: varios casos requieren estados y capturas de la SPA.

La inspección del código sugiere brechas en ProductoServiceImpl.create/update (categoría activa y unicidad en update) y CategoriaServiceImpl.update (desactivación con productos). Las brechas fueron reproducidas antes de iniciar la corrección. Los resultados anteriores se conservan como línea base; las pruebas de regresión y una futura repetición sobre el backend reiniciado se registran por separado.
## Incidencia de ejecución
El estudiante informa haber enviado por error A-01 desde Postman y obtenido 409 Conflict. No se cuenta con captura de esa petición; no se usa para calificar A-01 ni A-05. El código comprueba el nombre duplicado antes de guardar; GET /productos/87 confirmó el registro válido sin modificaciones. No se ejecutó una petición de escritura adicional para verificarlo.

## Alcance de evidencia y estado de datos
Las evidencias nuevas están en docs/s8/evidencias-autonoma. Los JSON contienen peticiones/respuestas HTTP reales capturadas por Codex; no son capturas de Postman. Las dos capturas Postman nuevas son C-05 y C-06. El control de escritorio se detuvo por no poder verificar la URL de Brave; el navegador también tuvo timeouts de confirmación y captura. Las capturas faltantes no se sustituyen con imágenes simuladas.

Estado QA final: producto 87 inactivo, nombre qa s8 auto a04, categoría 46; producto 91 inactivo en categoría 66; categoría 68 eliminada; categorías 66 y 67 inactivas conservadas; productos 92 y 93 activos en categoría 67, como evidencia del fallo. No se modificaron productos ajenos a los casos S8.

## Regresión posterior
Las correcciones pasan 19 pruebas de servicio/HTTP y 28 verificaciones API reales, incluida una comprobación por cada uno de los 18 casos. Resultados separados en docs/s8/regresion-backend-s8.md y regresion-api-s8.json. Las capturas SPA/Network posteriores del estudiante completan los flujos descritos abajo; la tabla anterior conserva los fallos originales y sus límites históricos.

## Mejora Parte C y entrega
Ver productos implementado con queryParams, input de categoría y tamaño 100. Selección asíncrona y cambios del input comprobados: 53 tests frontend y build de producción pasan. Navegación real a categoría 69 verificada; captura parte-C_ver-productos.png. La paginación sigue informando el total global; el filtro global se propone en el informe.

Informe B1-B5 de cuatro páginas: docs/informe-hallazgos-s8.pdf. Evidencia posterior incorporada y límites de encuadre identificados; pasos finales en docs/s8/pendientes-capturas-y-entrega.md. Commits del estudiante verificados: frontend 8b4e9af y fae118a; backend 79f0dd4.

## Cierre de evidencia SPA posterior
| Caso | Evidencia aportada por el estudiante | Resultado observado |
| --- | --- | --- |
| B-01 | B01_regresion_headers.png | DELETE producto 95: 204, fila Inactivo y acción deshabilitada |
| B-03 | B03_regresion_headers.png y B03_regresion_selector.png | DELETE categoría 71: 204; desaparece del selector actualizado |
| B-04 | B04_regresion_headers-adicional.png y B04_regresion_response-adicional.png | DELETE categoría 69: 409; categoría conservada. Mensaje JSON recortado y banner fuera del encuadre |
| B-05 | B05_regresion_headers.png y B05_regresion_response.png | DELETE categoría 67: 409 y mensaje visible en SPA |
| A-02/A-06/A-07/C-02 | Capturas *_regresion_network-vacio.png | SPA bloquea sin petición; no acredita por sí sola rechazo API |
| C-03 | C03_regresion_headers-adicional.png y C03_regresion_response-adicional.png | PUT categoría 46: 409 y mensaje completo en SPA; listado previo confirma que sigue activa |
| C-06 | C06_regresion_headers-adicional.png y C06_regresion_response-adicional.png | PUT producto 94: 409 por nombre duplicado |
| C-04 | C04_regresion_categoria-response.png y C04_regresion_response-adicional.png | Categoría 72 inactiva, fecha de modificación presente; POST productos: 409 |
| Parte C | parte-C_regresion_network.png | Categoría 69 seleccionada, tamaño 100, GET 200; filtro local |

Las ocho capturas adicionales se conservan sin edición. No se requieren nuevas escrituras para repetir estos resultados. La secuencia C-04 de categoría 72 no incluye una captura inicial activa; la repetición anterior de categoría 71 sí documenta esa precondición. La exportación final de Postman y la entrega siguen pendientes.
