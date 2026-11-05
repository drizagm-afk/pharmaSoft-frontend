# Plan de trabajo — Actividad autónoma S9

## Acuerdos

- Implementar todo lo requerido y validar primero.
- Capturar evidencias y redactar el informe definitivo después de estabilizar la implementación.
- El profesor autorizó **commits el mismo día**, según la indicación del estudiante; no es necesario distribuirlos entre fechas.
- Codex realiza las tareas técnicas y entrega el alcance y mensaje de commit al finalizar cada bloque. **El estudiante hace los commits.**
- La matriz tendrá los 17 casos base y al menos 4 casos propios, de grupos distintos. Los resultados se anotarán al ejecutar las pruebas, nunca por suposición.
- Los cambios de datos se definirán a partir de `revision-datos-actuales.md`; el inventario no altera la base.
- Se conservan las grafías actuales de los datos por preferencia del estudiante.
- Aclaración posterior: terminar primero toda la preparación e implementación; ejecutar la validación en la fase 2 y recoger evidencias en la fase 3. No se hará un commit por esta preparación documental todavía: el estudiante lo hará después de incorporar los datos.

## Fase 1 — Preparación e implementación

| Tarea | Trabajo | Resultado verificable | Tiempo estimado | Commit propuesto |
|---|---|---|---|---|
| 1. Preparar ramas y datos | Comprobar la relación entre `main`, `develop` y la rama práctica en ambos repositorios; conservar lo ya realizado; preparar la rama `feature/pruebas-reporte-ventas-delcarpio`. Incorporar los dos productos adicionales acordados y definir datos reproducibles. | Base con al menos 8 productos activos con stock, clientes requeridos, precios 12.50/18.90 y producto con stock 2. | 20–35 min | `chore(s9): prepare autonomous activity fixtures` |
| 2. Completar el reporte | Resolver la diferencia entre los nombres de la respuesta real y el modelo solicitado, conservando un contrato coherente. Ajustar modelo, servicio, carpeta de página y textos a la actividad. Añadir máximo con `computed`, barras proporcionales, filtros, fila de totales y todos los estados. | Reporte completo en `/reportes/ventas-por-categoria`, sin dividir por cero cuando el máximo sea cero y sin perder carga diferida. | 40–60 min | `feat(reportes): complete comparative category sales report` |
| 3. Preparar las pruebas | Crear matriz de 21 casos aún pendientes; definir la regla de V-05; preparar colección Postman `PharmaSoft - S9 Ventas` con `baseUrl`. Añadir solicitudes que prueben directamente las reglas bloqueadas por la SPA y escenarios del reporte. | Matriz reproducible y colección importable/ejecutable. Sin resultados ni evidencias inventados. | 30–45 min | `test(ventas): prepare S9 matrix and API checks` |

Antes de la tarea 1 se comprobará el estado local/remoto de las ramas: actualmente ambos repositorios tienen `main` y la rama práctica, y no se ha encontrado una rama local `develop`. No se reiniciará ni descartará trabajo para resolverlo.

## Fase 2 — Validación y correcciones

| Tarea | Trabajo | Resultado verificable | Tiempo estimado | Commit propuesto |
|---|---|---|---|---|
| 4. Ejecutar pruebas funcionales | Ejecutar B-01 a X-01 y cuatro casos propios. Comprobar SPA y API, stock, cálculo manual, confirmación, doble clic, conflicto en dos pestañas, recuperación del formulario, filtros y contratos. | Resultados reales de los 21 casos y fallos identificados. | 50–80 min | `test(ventas): validate transactional sales scenarios` |
| 5. Corregir y cerrar regresión | Corregir los fallos en la capa correspondiente y repetir los casos afectados. Ejecutar pruebas frontend/backend y builds. Validar reporte con histórico, límites opcionales, rango válido/invertido, totales, vacío y error. Comprobar flujo de impresión antes de guardar las evidencias definitivas. | Implementación estable; resultados iniciales y retests diferenciados. | 30–60 min | `fix(s9): resolve validation findings and verify regression` |

Casos propios propuestos, sujetos a ajustar al preparar la matriz:

1. **Buscadores:** un producto activo sin stock y un producto inactivo no aparecen.
2. **Cálculos:** modificar una cantidad y comprobar subtotal y total después de la edición.
3. **Validaciones:** enviar un detalle nulo y una cantidad fraccionaria a la API; comprobar 400 y stock sin cambios.
4. **Mensajes:** provocar un fallo de conexión usando Offline en Red, restaurar la conexión y comprobar que el cajero conserva la venta y puede reintentar.

La regla de V-05 debe decidirse **antes** de registrar el resultado esperado. La actividad permite aceptar líneas repetidas si se justifica; no se cambiará esa regla solo para conseguir una fila que pase.

La colección Postman y las pruebas se construyen antes de las evidencias porque forman parte del trabajo técnico. La recopilación de capturas y archivos de impresión queda para la siguiente fase.

## Fase 3 — Evidencias y documentación, después de validar

| Tarea | Trabajo | Resultado verificable | Tiempo estimado | Commit propuesto |
|---|---|---|---|---|
| 6. Capturar los casos | Restablecer precondiciones controladas y ejecutar cada caso para sus capturas. Mostrar SPA, Network con HTTP/respuesta cuando corresponda y operaciones manuales. Guardar los tres PDFs de I-01. | Capturas nombradas por ID, tres PDFs reales y referencias completas en la matriz. | 60–100 min | `docs(s9): collect sales and printing evidence` |
| 7. Redactar el informe | Generar 2–3 páginas con C1 (resumen por grupo), C2 (fichas de fallos) y C3 (cuatro respuestas con referencias al código). Verificar que las evidencias coincidan con los resultados. | `docs/informe-s9.pdf` y matriz `docs/matriz-pruebas-s9.md` o `.xlsx`; colección en `postman/PharmaSoft-S9-Ventas.json`. | 35–55 min | `docs(s9): document findings and user experience` |
| 8. Revisión de entrega | Comprobar los 12 criterios, nombres de archivos y enlaces de evidencias; revisar historial y preparar la solicitud hacia `develop`. Preparar el informe con nombre `DelCarpio_LP2_S9_Autonoma.pdf` para el aula. | Paquete completo y revisado; el estudiante realiza la subida al aula. | 15–25 min | `docs(s9): finalize autonomous activity deliverables` |

## Criterios para pasar a las evidencias

- Código del reporte completo, incluido el gráfico de barras comparativas.
- Datos preparados y forma de repetir casos sensibles definida.
- Matriz y colección listas y ejecutadas.
- Todos los fallos conocidos tienen corrección verificada o un hallazgo explícito documentado.
- Builds y pruebas relevantes pasan.
- La impresión está lista para comprobar sus archivos reales: comprobante nuevo con DNI/pie, anulada con sello y consulta con resumen de filtros, sin menú ni botones.

## Alcance y tiempos

Los tiempos son estimaciones de trabajo activo, no una promesa de duración. Se reutilizarán las pruebas y el reporte existentes; se repetirán las ejecuciones necesarias para que las evidencias documenten exactamente el estado final.

No se incluye JWT ni el reporte de productos más vendidos, que no es obligatorio. La fecha de entrega indicada en la actividad es **14 de octubre de 2026, 23:59**.

