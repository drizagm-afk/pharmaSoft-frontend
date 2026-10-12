# Regresión backend S8 — 6 de octubre de 2026

La matriz principal conserva la línea base (12 pasan y 6 fallan a nivel API). Esta regresión corresponde al código corregido, no reemplaza los resultados iniciales.

## Cambios
- ProductoServiceImpl.create/update rechazan categorías inactivas antes de mapear o guardar.
- update valida nombre recortado, sin distinguir mayúsculas y excluyendo el ID propio.
- CategoriaServiceImpl.update rechaza desactivar categorías con productos activos; permite editar una categoría activa y desactivar cuando solo quedan inactivos.
- Producto y categoría toman el mismo bloqueo de escritura de categoría dentro de la transacción para coordinar alta/cambio y desactivación.
- JsonValidationConfig deshabilita ACCEPT_FLOAT_AS_INT en Jackson 3. POST y PUT con stock 1.5 devuelven 400 antes de llamar al servicio. GlobalExceptionHandler devuelve JSON de error consistente.
- CategoriaController.update devuelve 200 en ediciones válidas.

## Validación
`mvn clean test -q`: 19 pruebas nuevas pasan (10 de servicio y 9 ejecuciones HTTP). No requieren Oracle ni modifican registros. En esa ejecución los dos archivos antiguos estaban eliminados localmente; no se contabilizan. Actualmente las eliminaciones son cambios locales sin staging y no pertenecen a 79f0dd4.

API en localhost:8080 con Oracle: 28 comprobaciones pasan; detalles completos en regresion-api-s8.json y evidencias-autonoma/regresion-*.json. Incluyen los 18 casos de la matriz a nivel API, rechazo de stock fraccionario en PUT, conservación exacta del producto después de rechazos, conservación de categoría activa ante desactivación rechazada, PUT categoría 200 y baja lógica/segundo intento/eliminación de categoría vacía.

El servidor incorporó el código compilado sin reinicio manual. Datos aislados de regresión: categoría 69 y producto 94 se conservan inactivos; categoría vacía 70 fue creada y eliminada para B-03. No se limpiaron los registros de la línea base ni se restauraron silenciosamente las inconsistencias que evidencian los fallos previos.

## Límites de evidencia
C-04 se repitió por API y en dos pestañas de la SPA con categoría 71; el formulario obsoleto fue rechazado. Capturas regresion-C-04_formulario.png, regresion-C-04_categoria-inactiva.png y regresion-C-04_spa-rechazo.png. Las capturas SPA/Network posteriores están registradas en cobertura-spa.md y el informe B1-B5 fue completado. No se afirma haber probado carreras con sesiones concurrentes; los bloqueos se ejecutaron correctamente durante las pruebas secuenciales reales. La unicidad de nombre se valida en servicio; no se añadió un índice de unicidad ni migración de datos históricos.

## Commits verificados
Backend: 79f0dd4. Frontend: 8b4e9af (Parte C), fae118a (evidencia), 5112e57 (documentación inicial). Los cambios de la revisión documental posterior están pendientes de commit. No se publicaron ramas ni se creó PR durante la revisión.

## Cierre posterior de capturas y commits
El estudiante aportó 18 capturas SPA/Network y ocho complementarias. La matriz y cobertura-spa.md registran los IDs y límites de encuadre. B-01/B-03/B-04/B-05 y las respuestas C-03/C-06/C-04 cuentan ahora con evidencia posterior; las menciones anteriores a pendientes describen el estado histórico. Informe actualizado. Commits verificados: frontend 8b4e9af, fae118a y 5112e57; backend 79f0dd4. Exportación real Postman v2.1 incorporada. Quedan commit de la revisión posterior, push/PR y entrega. Dos eliminaciones locales de tests backend permanecen fuera del commit: CategoriaDeletionTest.java y ProductoContractTest.java.
