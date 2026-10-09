# Matriz de pruebas S8 Autónoma

Línea base en feature/pruebas-dependencias-delcarpio: 18 casos comprobados a nivel API, 12 pasan y 6 fallan. Los primeros diez se ejecutaron manualmente; Codex completó las verificaciones restantes el 6 de octubre. La primera tabla conserva la ejecución histórica; la tabla de cierre registra la evidencia SPA posterior. Los medios exigidos varían por caso y los JSON de Codex se distinguen de las capturas manuales.
Rama creada desde develop, commit 4745d56, tras fusionar la práctica mediante PR #2.

## Línea base: resultados antes de corregir

Políticas esperadas: impedir desactivar categorías con productos activos; impedir eliminar categorías con cualquier producto, incluso inactivo, para preservar referencias e historia.

| ID | Operación | Precondición | Datos | Esperado | Obtenido SPA / HTTP | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| A-01 | Alta válida | Categoría 46 activa; nombre nuevo | Aceite de Segunda Mano; categoría 46 activa; precio 5.50; stock 10 | 201 y fila con categoría | SPA: fila visible; POST 201, id 87, categoriaId 46; GET posterior confirma datos y fechaModificacion null | Pasa | docs/s8/evidencias-autonoma/A-01_headers.png / A-01_response.png |
| A-02 | Alta sin categoría | Formulario nuevo sin categoría seleccionada | QA S8 AUTO A02; precio 5.50; stock 10; sin categoría | SPA no envía; API 400 | SPA: Seleccione una categoría, Network vacío; Postman: 400, validationErrors.categoriaId indica categoría obligatoria | Pasa | docs/s8/evidencias-autonoma/A-02_spa.png / A-02_postman.png |
| A-03 | Alta en categoría inexistente | Categoría 999 inexistente | QA S8 AUTO A03; categoriaId 999 inexistente; precio 5.50; stock 10 | 404 | Postman: 404, Categoria no encontrada con id: 999 | Pasa | docs/s8/evidencias-autonoma/A-03_postman.png |
| A-04 | Alta en categoría inactiva | Categoría 49 inactiva | QA S8 AUTO A04; categoriaId 49 inactiva; precio 5.50; stock 10 | SPA no ofrece; API 409 | SPA: categoría inactiva ausente; Postman: 201, producto 88 activo creado en categoría 49 inactiva | Falla (H-01) | docs/s8/evidencias-autonoma/A-04_spa.png / A-04_postman.png |
| A-05 | Alta duplicada | Producto 87 ya registrado con otra capitalización | aceite de segunda mano; categoría 46; precio 5.50; stock 10 | 409 | SPA muestra mensaje de duplicado; POST 409 con mensaje del backend | Pasa | docs/s8/evidencias-autonoma/A-05_headers.png / A-05_response.png |
| A-06 | Alta con números inválidos | Categoría 46 activa | QA S8 AUTO A06; categoría 46; precio 0; stock -1 | SPA bloquea; API 400, dos campos | SPA muestra ambos errores y Network vacío; Postman 400 con validationErrors.precio y validationErrors.stock | Pasa | docs/s8/evidencias-autonoma/A-06_spa.png / A-06_postman.png |
| A-07 | Alta con stock fraccionario (propio) | Categoría 46 activa; nombre único en el intento calificado | SPA QA S8 AUTO A07; API QA S8 AUTO A99 (nombre cambiado tras colisión); categoría 46; precio 5.50; stock 1.5 | SPA bloquea; API 400 | SPA: error de entero, Network vacío; API: 201, producto 90, stock devuelto 1 en vez de 1.5 | Falla (H-02) | docs/s8/evidencias-autonoma/A-07_spa.png / A-07_postman.png |
| C-01 | Cambio a categoría activa | Producto 87 en categoría 46; destino 47 activo | Producto 87 Aceite de Segunda Mano; categoría 46 a 47; precio 5.50, stock 10 conservados | 200 y categoría nueva | SPA fila en Activa B; PUT /productos/87 devuelve 200 y categoriaId 47 | Pasa | docs/s8/evidencias-autonoma/C-01_headers.png / C-01_response.png |
| C-02 | Cambio a categoría inactiva | SPA producto de prueba 73 en categoría inactiva; API producto 87 en 47 | SPA: producto de prueba 73 con categoría original inactiva; API: producto 87, categoría 47 a 49 inactiva | SPA bloquea; API 409 | SPA: aviso y Network vacío; API: PUT 200, producto 87 activo reasignado a categoriaId 49 | Falla (H-03) | docs/s8/evidencias-autonoma/C-02_spa.png / C-02_postman.png |
| C-03 | Desactivar categoría con productos activos | Categoría 66 activa con producto 91 activo | Categoría 66 QA S8 AUTO C03; producto 91 activo | API 409; conservar categoría y producto activos | SPA PUT /categorias/66 devuelve 201 y estado false; GET posterior confirma producto 91 aún activo en categoría 66 | Falla (H-04) | docs/s8/evidencias-autonoma/C-03_headers.png / C-03_response.png |
| C-04 | Formulario obsoleto en dos pestañas | Categoría 67 activa al cargar; desactivada en otra pestaña antes de enviar | Producto QA S8 CODEX C04 20261006; categoriaId 67; precio 5.50; stock 10; estado true | API 409, no crear | SPA acepta y crea producto 92 tras desactivar categoría 67; GET confirma vínculo. Prueba API complementaria: POST 201 crea producto 93 en categoría 67 inactiva | Falla (H-06, causa compartida con H-01) | C-04_formulario-obsoleto.png; C-04_categoria-inactiva.png; C-04_producto92.json; C-04_api.json |
| C-05 | Cambio a categoría inexistente (propio) | Producto 87 existente; categoría 999 inexistente | Producto 87; categoriaId 999 | 404 y producto sin cambios | Postman 404; GET conserva nombre, estado y categoriaId 49 previos | Pasa | C-05_postman.png; C-05_verificacion.json |
| C-06 | Cambio a nombre duplicado (propio) | Producto 88 ya usa QA S8 AUTO A04; editar producto 87 | Producto 87; nombre qa s8 auto a04, existente en producto 88; categoría activa 46 | 409 y datos sin cambios | SPA acepta; Postman PUT 200, assertion 0/1; GET confirma nombres iguales ignorando mayúsculas en productos 87 y 88 | Falla (H-05) | C-06_formulario.png; C-06_spa-duplicados.png; C-06_postman.png; C-06_producto87.json; C-06_producto88.json |
| B-01 | Baja lógica | Producto 87 activo tras C-06 | Producto 87 activo, nombre cambiado por C-06 | 204 y fila Inactivo | Intento SPA: confirmación tuvo timeout; GET mostró activo, se completó por API DELETE 204. GET posterior estado false; DOM de SPA recargada muestra Inactivo y botón deshabilitado. Captura de ese intento no disponible; repetición posterior documentada abajo | Pasa (API; SPA parcial en ese intento) | B-01_antes.json; B-01_api.json; B-01_despues.json; cobertura-spa.md |
| B-02 | Repetir baja | Producto 87 inactivo tras B-01 | Producto 87 inactivo tras B-01 | 409 | API DELETE 409: El producto ya se encuentra inactivo. GET conserva datos | Pasa (API) | B-02_api.json; B-02_despues.json |
| B-03 | Eliminar categoría vacía | Categoría 68 sin productos | Categoría QA exclusiva 68 creada sin productos | 204; desaparece listado/select actualizado | API DELETE 204 y GET 404. Vista del listado y selector de ese intento no capturados; repetición posterior documentada abajo | Pasa (API; evidencia SPA de ese intento incompleta) | B-03_preparacion.json; B-03_api.json; B-03_despues.json |
| B-04 | Eliminar categoría con productos inactivos | Categoría 66; producto 91 inactivo y sin productos activos | Categoría 66; su único producto 91 dado de baja por API 204 | 409, conservar referencias | API DELETE /categorias/66 devuelve 409; GET conserva categoría y producto 91 inactivo. Captura de SPA/Network de ese intento no disponible; repetición posterior documentada abajo | Pasa (API; evidencia SPA de ese intento incompleta) | B-04_api.json; B-04_producto-inactivo.json; B-04_categoria-conservada.json; B-04_producto-conservado.json |
| B-05 | Eliminar categoría con producto activo (propio) | Categoría 67 con producto 92 activo | Categoría 67; producto 92 activo | 409, categoría y producto conservados | API DELETE 409; GET conserva categoría y producto activo. Captura de SPA/Network de ese intento no disponible; repetición posterior documentada abajo | Pasa (API; evidencia SPA de ese intento incompleta) | B-05_api.json; B-05_categoria-conservada.json; B-05_producto-conservado.json |

Orden sugerido: altas, cambios, bajas. Crear datos QA independientes para C-03, C-04, B-03, B-04 y B-05; no modificar productos reales. Verificar por GET después de cada rechazo. No ejecutar toda la colección indiscriminadamente: varios casos requieren estados y capturas de la SPA.

La inspección del código sugiere brechas en ProductoServiceImpl.create/update (categoría activa y unicidad en update) y CategoriaServiceImpl.update (desactivación con productos). Las brechas fueron reproducidas antes de iniciar la corrección. Los resultados anteriores se conservan como línea base; la regresión ejecutada posteriormente se registra por separado.
## Incidencia de ejecución
Se envió A-01 por error desde Postman y se obtuvo 409 Conflict. No se cuenta con captura de esa petición; no se usa para calificar A-01 ni A-05. El código comprueba el nombre duplicado antes de guardar; GET /productos/87 confirmó el registro válido sin modificaciones. No se ejecutó una petición de escritura adicional para verificarlo.

## Alcance histórico de evidencia y estado de datos
Las evidencias nuevas están en docs/s8/evidencias-autonoma. Los JSON contienen peticiones/respuestas HTTP reales capturadas por Codex; no son capturas de Postman. Las dos capturas Postman nuevas son C-05 y C-06. El control de escritorio se detuvo por no poder verificar la URL de Brave; el navegador también tuvo timeouts de confirmación y captura. Las capturas faltantes no se sustituyen con imágenes simuladas.

Estado QA al cierre de la línea base (no inventario actual): producto 87 inactivo, nombre qa s8 auto a04, categoría 46; producto 91 inactivo en categoría 66; categoría 68 eliminada; categorías 66 y 67 inactivas conservadas; productos 92 y 93 activos en categoría 67, como evidencia del fallo. No se modificaron productos ajenos a los casos S8.

## Regresión posterior
Las correcciones pasan 19 pruebas de servicio/HTTP y 28 verificaciones API reales, incluida una comprobación por cada uno de los 18 casos. Resultados separados en docs/s8/regresion-backend-s8.md y regresion-api-s8.json. Las capturas SPA/Network posteriores completan los flujos descritos abajo; la tabla anterior conserva los fallos originales y sus límites históricos.

## Mejora Parte C y entrega
Ver productos implementado con queryParams, input de categoría y tamaño 100. Selección asíncrona y cambios del input comprobados: 53 tests frontend y build de producción pasan. Navegación real a categoría 69 verificada; captura parte-C_ver-productos.png. La paginación sigue informando el total global; el filtro global se propone en el informe.

Informe B1-B5 de cinco páginas: docs/informe-hallazgos-s8.pdf. Evidencia posterior incorporada y límites de encuadre identificados; pasos finales en docs/s8/pendientes-capturas-y-entrega.md. Commits verificados: frontend 8b4e9af y fae118a; backend 79f0dd4; documentación inicial 5112e57. La revisión inicial fue incorporada en db5dd5c; los ajustes de redacción posteriores requieren otro commit.

## Evidencia SPA posterior: datos de cada repetición
| Caso | Datos de la repetición | Evidencia que reuní | Resultado observado |
|---|---|---|---|
| B-01 | Producto 95 activo antes de la baja | B-01_regresion_headers.png | DELETE 204; fila Inactivo y acción deshabilitada |
| B-03 | Categoría 71 sin productos | B-03_regresion_headers.png; B-03_regresion_selector.png | DELETE 204; desaparece del selector actualizado |
| B-04 | Categoría 69 con producto 94 inactivo | B04_regresion_headers-adicional.png; B04_regresion_response-adicional.png | DELETE 409; categoría conservada. Mensaje recortado y aviso fuera del encuadre |
| B-05 | Categoría 67 con productos activos 92 y 93 | B-05_regresion_headers.png; B-05_regresion_response.png | DELETE 409 y mensaje visible en la SPA |
| A-02 | Alta sin categoría | A-02_regresion_network-vacio.png | Mensaje obligatorio; no envía petición |
| A-06 | Precio 0 y stock -1 | A-06_regresion_network-vacio.png | Ambos errores; no envía petición |
| A-07 | Stock 1.5 | A-07_regresion_network-vacio.png | Error de entero; no envía petición |
| C-02 | Producto 94 con categoría 69 inactiva | C-02_regresion_network-vacio.png | Aviso de categoría inactiva; no envía petición |
| C-03 | Categoría 46 con productos activos | C03_regresion_headers-adicional.png; C03_regresion_response-adicional.png; C-03_regresion_categoria-conservada.png | PUT 409; mensaje completo y categoría todavía activa |
| C-06 | Producto 94; nombre qa s8 auto a04 ya utilizado | C06_regresion_headers-adicional.png; C06_regresion_response-adicional.png | PUT 409 por nombre duplicado |
| C-04 | Categoría 72 desactivada; formulario de My Lil Product | C04_regresion_categoria-response.png; C04_regresion_response-adicional.png | Categoría inactiva con fecha de modificación; POST productos 409 |
| Parte C | Categoría 69 seleccionada; tamaño 100 | parte-C_regresion_network.png | GET 200; filtro local y producto 94 visible |


Las ocho capturas adicionales se conservan sin edición. No se requieren nuevas escrituras para repetir estos resultados. La secuencia C-04 de categoría 72 no incluye una captura inicial activa; la repetición anterior de categoría 71 sí documenta esa precondición. La exportación real de Postman v2.1 fue incorporada sin edición; la entrega sigue pendiente.

Las fichas del informe cubren los seis casos fallidos: H-01/A-04, H-02/A-07, H-03/C-02, H-04/C-03, H-05/C-06 y H-06/C-04. H-01 y H-06 comparten causa. Todas las referencias de evidencia sin directorio se resuelven en docs/s8/evidencias-autonoma/.

## Capturas visibles por caso

Conservo los archivos originales en evidencias-autonoma. Las imágenes siguientes se muestran dentro de la matriz; sus nombres y los JSON enlazados permiten distinguir la ejecución inicial de la repetición posterior.

### A-01

![A-01: A-01_headers.png](s8/evidencias-autonoma/A-01_headers.png)

![A-01: A-01_response.png](s8/evidencias-autonoma/A-01_response.png)


### A-02

![A-02: A-02_regresion_network-vacio.png](s8/evidencias-autonoma/A-02_regresion_network-vacio.png)

![A-02: A-02_postman.png](s8/evidencias-autonoma/A-02_postman.png)


### A-03

![A-03: A-03_postman.png](s8/evidencias-autonoma/A-03_postman.png)


### A-04

![A-04: A-04_spa.png](s8/evidencias-autonoma/A-04_spa.png)

![A-04: A-04_postman.png](s8/evidencias-autonoma/A-04_postman.png)


### A-05

![A-05: A-05_headers.png](s8/evidencias-autonoma/A-05_headers.png)

![A-05: A-05_response.png](s8/evidencias-autonoma/A-05_response.png)


### A-06

![A-06: A-06_regresion_network-vacio.png](s8/evidencias-autonoma/A-06_regresion_network-vacio.png)

![A-06: A-06_postman.png](s8/evidencias-autonoma/A-06_postman.png)


### A-07

![A-07: A-07_regresion_network-vacio.png](s8/evidencias-autonoma/A-07_regresion_network-vacio.png)

![A-07: A-07_postman.png](s8/evidencias-autonoma/A-07_postman.png)


### C-01

![C-01: C-01_headers.png](s8/evidencias-autonoma/C-01_headers.png)

![C-01: C-01_response.png](s8/evidencias-autonoma/C-01_response.png)


### C-02

![C-02: C-02_regresion_network-vacio.png](s8/evidencias-autonoma/C-02_regresion_network-vacio.png)

![C-02: C-02_postman.png](s8/evidencias-autonoma/C-02_postman.png)


### C-03

![C-03: C-03_headers.png](s8/evidencias-autonoma/C-03_headers.png)

![C-03: C-03_response.png](s8/evidencias-autonoma/C-03_response.png)


### C-04

![C-04: C-04_formulario-obsoleto.png](s8/evidencias-autonoma/C-04_formulario-obsoleto.png)

![C-04: C-04_categoria-inactiva.png](s8/evidencias-autonoma/C-04_categoria-inactiva.png)

![C-04: C04_regresion_response-adicional.png](s8/evidencias-autonoma/C04_regresion_response-adicional.png)


### C-05

![C-05: C-05_postman.png](s8/evidencias-autonoma/C-05_postman.png)


### C-06

![C-06: C-06_postman.png](s8/evidencias-autonoma/C-06_postman.png)

![C-06: C06_regresion_response-adicional.png](s8/evidencias-autonoma/C06_regresion_response-adicional.png)


### B-01

![B-01: B-01_regresion_headers.png](s8/evidencias-autonoma/B-01_regresion_headers.png)


### B-03

![B-03: B-03_regresion_headers.png](s8/evidencias-autonoma/B-03_regresion_headers.png)

![B-03: B-03_regresion_selector.png](s8/evidencias-autonoma/B-03_regresion_selector.png)


### B-04

![B-04: B04_regresion_headers-adicional.png](s8/evidencias-autonoma/B04_regresion_headers-adicional.png)

![B-04: B04_regresion_response-adicional.png](s8/evidencias-autonoma/B04_regresion_response-adicional.png)


### B-05

![B-05: B-05_regresion_headers.png](s8/evidencias-autonoma/B-05_regresion_headers.png)

![B-05: B-05_regresion_response.png](s8/evidencias-autonoma/B-05_regresion_response.png)


### Parte C

![Parte C: parte-C_regresion_network.png](s8/evidencias-autonoma/parte-C_regresion_network.png)


### B-02: repetición de baja

La respuesta DELETE 409 está registrada en [B-02_api.json](s8/evidencias-autonoma/B-02_api.json), ejecutada por Codex.
