# Revisión documental S8 — 6 de octubre de 2026

Revisión contra la guía local s8_lp2_actividad_autonoma_v4jm5dlo8u.pdf (7 páginas), la matriz, las capturas aportadas, JSON de ejecución, colección preparada, código de ambas aplicaciones e historial Git. Los resultados anteriores de tests/build se verificaron en sus registros; no se volvieron a ejecutar ni se realizaron peticiones de escritura durante esta revisión. Las capturas no se retocaron.

## Resultado por requisito
| Requisito | Verificación | Estado / límite |
| --- | --- | --- |
| A: 18 casos | 7 altas, 6 cambios, 5 bajas; los 14 base y cuatro propios A-07/C-05/C-06/B-05 | Correcto; propios distribuidos en los tres grupos |
| A: columnas | ID, Operación, Precondición, Datos, Esperado, Obtenido SPA/HTTP, Estado, Evidencia | Ocho columnas separadas tras revisión |
| A: resultados | Línea base 12 pasan/6 fallan; altas 5/2, cambios 2/4, bajas 5/0 | Correcto; no se reemplazaron fallos por regresiones exitosas |
| A: evidencia | Todas las referencias de PNG/JSON de matriz e informe resuelven a archivos presentes | Correcto; B-04 tiene texto recortado y banner fuera del encuadre |
| A: ejecución SPA | Capturas históricas y posteriores, IDs separados | JSON API no se atribuye a Postman; C-02 SPA usa otro fixture; C-04 categoría 72 no muestra inicio activo, pero la secuencia previa con 71 sí lo documenta |
| B1 | Totales por grupo y autoría diferenciada | Correcto |
| B2 | Seis fichas, una por caso fallido | H-01/A-04, H-02/A-07, H-03/C-02, H-04/C-03, H-05/C-06, H-06/C-04; dos comparten causa |
| B3 | Tabla de reglas histórica y tras corrección | Correcto; no presenta una validación de concurrencia probada |
| B4 | Endpoint categoriaId, Page/findByCategoriaId, servicio frontend y total filtrado | Propuesta completa; filtro global aún no implementado |
| B5 | Cinco párrafos, decisiones sobre ventas e historial y archivos/métodos | Correcto |
| PDF | Cinco páginas A4; B1–B5 y seis fichas; render visual de todas las páginas | Dentro de 3–5 páginas; revisión visual satisfactoria |
| Parte C | routerLink/queryParams, input categoriaId, inicialización, select asíncrono, tamanio 100 y nota | Código y captura corresponden; total sigue global y filtro es local |
| Pruebas registradas | 19 backend (10 servicio/9 HTTP), 28/28 API; registro previo frontend 53/build aprobado | Correcto como resultado previo, no nueva ejecución |
| Colección | Exportación real v2.1 incorporada sin edición: 22 peticiones, 18 casos, baseUrl correcto, A-07 usa A99 | Siete variables vacías; New Request sin URL; ninguna respuesta guardada. Requiere precondiciones antes de ejecutar |
| D: commits | 8b4e9af, fae118a, 5112e57 frontend; 79f0dd4 backend | Tres frontend, todos 6 de octubre en America/Lima; no cumple días distintos |
| D: publicación/entrega | GitHub verificado posteriormente: frontend remoto 5112e57 y backend remoto 79f0dd4 | Ambos pushes confirmados. Consulta API no encontró PR para estas ramas; aula no verificada |

## Correcciones realizadas
- Separar Precondición y Datos y corregir cinco referencias a archivos B-01/B-03/B-05 que omitían guiones.
- Añadir H-06 para C-04, manteniendo H-01 para A-04 y explicitando causa compartida.
- Distinguir estado histórico de estado vigente en matriz, notas, preparación y cobertura; actualizar los commits y número de páginas.
- Ajustar la referencia frontend: mensajeError es una función y error un signal.
- Marcar *.pdf binary en .gitattributes: evita convertir saltos de línea de un PDF como si fuera texto.
- Confirmar por SHA-256 que las ocho capturas adicionales coinciden exactamente con los originales del portapapeles.

## Puntos para la revisión del estudiante
1. La colección real ya está exportada e incorporada sin editar. Las variables vacías deben completarse antes de reutilizar, y New Request carece de URL. A-07 ahora coincide con A99 en la prueba calificada. Los nombres/IDs pueden pertenecer a ejecuciones anteriores; no ejecutar Run collection sin recrear precondiciones.
2. La guía indica que la matriz debe reflejar pruebas ejecutadas por el estudiante. Parte de las verificaciones API posteriores fue ejecutada por Codex y está identificada. El estudiante debe distinguirlas y poder reproducir los casos solicitados por el docente; esta revisión no garantiza la aceptación académica de esa autoría.
3. B-04 tiene 409 y categoría conservada, pero el texto largo está cortado. La evidencia JSON completa es complementaria y no equivale a una captura de Postman.
4. Comprobar los enlaces del PR y la entrega real; no están acreditados por archivos locales. No alterar fechas de commit para simular días distintos.
5. Dos tests backend siguen eliminados localmente fuera del commit: CategoriaDeletionTest.java y ProductoContractTest.java. No incluirlos accidentalmente.
6. Las correcciones de esta revisión aún requieren un nuevo commit; 5112e57 contiene la versión anterior del informe.

No se editó documentación S7 ni la práctica S8: pertenecen a otras entregas y sus resultados históricos se conservan.

## Verificación posterior del checklist
- git ls-remote confirmó frontend feature/pruebas-dependencias-delcarpio en 5112e572cc0a54d3a2a4624a47b35830bc7070e4 y backend feature/productos-delcarpio en 79f0dd4b42e9cc5db5272cfc2f7bff96155dd580.
- GitHub API (pulls, state=all, head de cada rama) devolvió listas vacías: no se encontró PR de estas ramas en los repositorios consultados.
- Postman abierto y colección localizada; Export collection > Other abre Tell us about this export. Start Export con campo vacío exige Add a reason to continue. No se envió texto ni se obtuvo archivo aún.
- El formato v2.1 deberá comprobarse en el JSON descargado; no se presupone a partir del menú de esta versión de Postman.

## Exportación real incorporada
El estudiante descargó PharmaSoft - S8 Dependencias.postman_collection.json. El archivo se validó como v2.1 y se copió byte por byte a postman/PharmaSoft-S8-Dependencias.json. El registro exportacion-postman-verificada.json incluye SHA-256, casos y límites. Esta actualización sustituye el estado anterior de exportación pendiente. No se rellenaron variables ni se inventaron respuestas guardadas.
