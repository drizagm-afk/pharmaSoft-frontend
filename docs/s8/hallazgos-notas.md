# Hallazgos S8 - notas verificadas

Las fichas iniciales describen la línea base antes de corregir. El estado vigente se indica en Implementación posterior y Resultado de regresión; no son propuestas pendientes hoy.

## H-01 - Alta de producto en categoría inactiva

- Caso: A-04.
- Severidad: alta; permite datos inconsistentes con la regla de categoría activa.
- Resultado esperado: API 409; la SPA no ofrece categorías inactivas.
- Resultado observado: la SPA oculta la categoría 49, pero POST /api/v1/productos acepta categoriaId 49 y devuelve 201. Crea producto 88, QA S8 AUTO A04, estado true.
- Evidencia: evidencias-autonoma/A-04_spa.png y A-04_postman.png, aportadas por el estudiante.
- Causa: backend src/main/java/com/edu/upeu/PharmaBackend/service/impl/ProductoServiceImpl.java, create(). El método comprueba unicidad y existencia de la categoría, pero no su estado antes de mapear y guardar.
- Corrección propuesta: después de findById, comprobar Boolean.TRUE.equals(categoria.getEstado()); si no, lanzar ReglaNegocioException con mensaje claro. GlobalExceptionHandler.handleBusinessRule ya transforma esa excepción en 409. Aplicar también a update(), y conservar el filtro preventivo y los mensajes de la SPA. La regla debe verificarse en el backend al guardar, incluso si la SPA cargó las opciones antes de un cambio de estado.
- Estado en la línea base: propuesta, todavía no implementada; conservar la línea base de pruebas. Producto 88 identificado como dato QA de este caso.
## H-02 - Stock fraccionario aceptado y truncado

- Caso: A-07 (propio).
- Severidad: alta; modifica silenciosamente un dato de inventario recibido sin rechazarlo.
- Esperado: SPA bloquea; API 400 para stock 1.5.
- Observado: SPA muestra validación de entero y no envía. Postman envía QA S8 AUTO A99 con stock 1.5; API devuelve 201, id 90, stock 1.
- Evidencia: evidencias-autonoma/A-07_spa.png y A-07_postman.png.
- Incidencia: el estudiante cambió el nombre tras un rechazo por duplicado con QA S8 AUTO A07. El resultado calificado corresponde al intento nuevo mostrado; no se atribuye un ID al intento anterior sin evidencia.
- Causa probable: ProductoRequestDTO.stock es Integer con @Min(0). La deserialización JSON convierte 1.5 a 1 antes de Bean Validation; @Min solo comprueba el entero resultante. No se encontró configuración explícita de coerción numérica en src/main.
- Corrección propuesta: backend, deserialización estricta de stock que rechace fracciones antes de convertir a Integer (o configuración Jackson equivalente compatible con la versión usada); convertir el error de lectura de JSON en una respuesta 400 clara desde GlobalExceptionHandler. Mantener la validación de entero de la SPA. Verificar con pruebas que 1.5 se rechace, que 0 y enteros positivos se admitan, y que no se guarde un producto ante un error.
- Estado en la línea base: propuesta sin implementar; preservar producto QA 90 y línea base.

## H-03 - Cambio de producto a categoría inactiva

- Caso: C-02.
- Severidad: alta; permite un producto activo en una categoría inactiva.
- Esperado: SPA bloquea; API 409 y conserva la categoría original del producto.
- Observado: SPA bloquea guardar el fixture 73 y muestra la categoría original inactiva; Postman modifica producto 87 desde categoría 47 a 49, devuelve 200 y conserva estado true.
- Evidencia: evidencias-autonoma/C-02_spa.png y C-02_postman.png. La prueba SPA y la prueba API usan productos distintos, identificado expresamente en la matriz.
- Causa: backend ProductoServiceImpl.update(), src/main/java/com/edu/upeu/PharmaBackend/service/impl/ProductoServiceImpl.java. Comprueba existencia de categoría, pero no estado antes de guardar.
- Corrección propuesta: compartir con create() una validación de categoría activa; lanzar ReglaNegocioException antes de modificar o guardar para obtener 409. Agregar prueba de rechazo y conservación de los datos, además del caso válido. Mantener la prevención visual del frontend.
- Estado en la línea base: propuesta sin implementar. Producto 87 queda en categoría 49 como evidencia de la ejecución; no restaurado todavía.

## H-04 - Desactivar categoría con productos activos
- Caso C-03; severidad alta.
- Categoría 66 devuelve 201 y estado false al editar; producto 91 conserva estado true y categoriaId 66 (verificación GET realizada por Codex).
- Evidencia: C-03_headers.png y C-03_response.png. La captura GET del producto 91 está en C-03_producto.png; el posterior B-04 lo da de baja, sin alterar la evidencia previa.
- Causa: CategoriaServiceImpl.update() no comprueba productos activos antes de cambiar el estado.
- Propuesta: rechazar transición activa a inactiva con productos activos mediante ReglaNegocioException (409), consultar existsByCategoriaIdAndEstadoTrue en ProductoRepository. Coordinar la validación de alta/cambio y desactivación dentro de transacciones para evitar carreras. Corregir también CategoriaController.update() para responder 200 en una edición válida, en vez de 201.
- Estado en la línea base: corrección todavía no implementada.


## H-05 - Actualización permite nombres duplicados
- Caso C-06; severidad alta.
- SPA acepta actualizar producto 87 a qa s8 auto a04, nombre ya existente en producto 88. Postman devuelve 200; test esperado 409 falla (0/1).
- GET confirma ambos nombres; no se usa una colisión en create para calificar update.
- Evidencia: C-06_formulario.png, C-06_spa-duplicados.png, C-06_postman.png y JSON de ambos productos.
- Causa: ProductoServiceImpl.update() no consulta existsByNombreIgnoreCaseAndIdNot antes de modificar la entidad.
- Corrección: validar nombre recortado con comparación sin mayúsculas, excluir el ID actual, rechazar antes de mapear/guardar.

## H-06 - Formulario obsoleto (C-04; causa compartida con H-01)
C-04 usa dos pestañas: alta abierta con categoría 67 activa; edición en segunda pestaña desactiva 67; formulario original guarda producto 92. Un POST complementario devuelve 201 y crea producto 93. El filtro preventivo de la SPA no sustituye la validación al guardar en el servidor.

## Implementación posterior a la línea base
Se implementan las correcciones de H-01 a H-05 y PUT categoría 200 en el backend. Los resultados de la matriz siguen siendo los observados antes de esos cambios. El rechazo de stock usa Jackson 3 sin ACCEPT_FLOAT_AS_INT; create/update y desactivación usan el mismo bloqueo de categoría en transacción. Las pruebas sin Oracle comprueban rechazo sin guardar, conservación de entidades, flujos válidos y códigos HTTP. La regresión real posterior está registrada en regresion-api-s8.json; las capturas posteriores constan en cobertura-spa.md.

## Resultado de regresión
Correcciones implementadas: `mvn clean test -q` pasa 19 pruebas nuevas; 28 verificaciones API reales pasan, incluidas las 18 reglas/casos a nivel API. Véase regresion-backend-s8.md. El encuadre parcial de B-04 y la ausencia de pruebas concurrentes permanecen identificados como límites; no cambian la línea base original.

## Cierre posterior de capturas y commits
El estudiante aportó 18 capturas SPA/Network y ocho complementarias. La matriz y cobertura-spa.md registran los IDs y límites de encuadre. B-01/B-03/B-04/B-05 y las respuestas C-03/C-06/C-04 cuentan ahora con evidencia posterior; las menciones anteriores a pendientes describen el estado histórico. Informe actualizado. Commits verificados: frontend 8b4e9af, fae118a y 5112e57; backend 79f0dd4. Exportación real Postman v2.1 incorporada. Quedan commit de la revisión posterior, push/PR y entrega. Dos eliminaciones locales de tests backend permanecen fuera del commit: CategoriaDeletionTest.java y ProductoContractTest.java.
