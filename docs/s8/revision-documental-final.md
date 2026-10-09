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

## Segunda revisión: redacción y correspondencia con la guía
La documentación principal se revisó con redacción impersonal en las decisiones y la metodología. Se mantiene la atribución explícita de las verificaciones complementarias a Codex.

- B1: describe alcance, casos propios, resultados originales y regresión posterior. Se retiraron instrucciones de commit/entrega y estados temporales del cuerpo académico; permanecen en el checklist operativo.
- B2: cada ficha identifica caso, severidad, descripción, causa probable/capa, archivo/método, corrección y evidencia. H-06 conserva ficha independiente para C-04, aunque comparte causa con H-01.
- B3: se corrigió la clasificación de validaciones. El nombre único y la protección de eliminación se validan en la API; la SPA muestra sus rechazos. Mostrar un error no equivale a validar la regla localmente.
- B4: explica el alcance del filtro local y propone endpoint, consulta paginada y servicio frontend. La propuesta global permanece explícitamente sin implementar, como permite la guía.
- B5: cinco preguntas visibles y un párrafo por respuesta; la respuesta 4 cita ProductoServiceImpl.java y CategoriaServiceImpl.java. La respuesta 5 explica que el manejo actual ya soporta el 409 y que deben actualizarse las pruebas.
- Matriz: se corrigieron expresiones incorrectas y la tabla posterior, que mezclaba IDs antiguos con nuevos. Línea base: ocho columnas/18 filas; repetición SPA: cuatro columnas con IDs propios de cada intento.
- Notas: H-06 ampliado con los mismos campos del informe; H-01 a H-06 diferenciados de su implementación posterior.
- Validación: todas las referencias de evidencia de matriz e informe existen; tablas con número uniforme de columnas; PDF de cinco páginas renderizado y revisado completo; git diff --check sin errores. No se ejecutaron nuevos tests ni escrituras API durante esta revisión.

La correspondencia del contenido A/B/C es satisfactoria dentro de los límites de evidencia ya descritos. El texto no demuestra requisitos administrativos: días distintos de commits, PR y aula deben verificarse por sus propios registros. Las variables vacías de la colección y el recorte visual de B-04 siguen declarados; no se presentan como resueltos mediante cambios de redacción.


## Revisión de capturas, redacción y uso de IA


La actividad autónoma, página 6, sección 3 (Criterios de entrega), dice: "Puedes usar asistentes de inteligencia artificial para consultar dudas, pero la matriz debe reflejar pruebas que ejecutaste tú; el docente podrá pedirte que repitas cualquier caso en clase." Esta autorización se refiere a consultar dudas. No autoriza explícitamente generar código con IA, ni establece en esa frase una prohibición general. La misma página permite implementar una corrección del backend en una rama propia y mencionarla en el informe; esa posibilidad no amplía por sí sola el permiso de uso de IA.

La guía práctica exige, en la página 16, un PDF con las capturas de las 12 pruebas. La actividad autónoma pide registrar evidencia por caso en la página 3 y, para las fichas, captura y petición de Postman en la página 4. Aunque no exige expresamente insertar todas las capturas en el informe breve, se incorporaron figuras al PDF y las capturas disponibles a la matriz para facilitar su revisión.


## Ajuste de estructura y voz

Los dos informes usan redacción impersonal. El PDF de práctica adopta B1–B5 y conserva los doce escenarios prácticos y sus capturas. Los análisis que citan casos autónomos se identifican como correspondientes a la etapa posterior. El registro B-02 conserva sus referencias a JSON sin un apartado de ausencia de captura.


## Presentación institucional

Se reprodujo el encabezado UPeU con el logotipo original extraído de la guía, facultad, escuela profesional, curso, divisor dorado, título, subtítulo y tabla de identificación. Se incorporó el nombre Kevin Eduardo Del Carpio Alegría. Los datos de modalidad, duración y tecnologías de la práctica proceden de su guía; el plazo y puntaje de la autónoma proceden de la actividad autónoma. Ambos informes conservan cinco páginas, capturas y secciones B1–B5.


## Revisión de identidad y ubicación de las evidencias

La práctica corresponde al Reto 01 y conserva doce escenarios. El informe autónomo corresponde al Reto 02 y conserva 18 casos, seis fichas de hallazgos y B1–B5. Se generó DelCarpio_LP2_S8_Autonoma.pdf como copia idéntica de docs/informe-hallazgos-s8.pdf para la entrega.

Las 18 apariciones de capturas de la práctica se trasladaron a los apartados P01–P12; la evidencia histórica y la repetición de P12 se presentan junto al hallazgo. El informe práctico tiene ahora nueve páginas para conservar los casos y su evidencia en contexto. La extensión de 3 a 5 páginas pertenece al informe autónomo, que conserva cinco. Se revisaron visualmente todas las páginas y se comprobó la identidad binaria de la copia autónoma. Los resultados históricos, regresiones y propuestas pendientes permanecen separados.


## Revisión final de ambos informes

Se revisaron el texto completo y todas las páginas renderizadas de la práctica y la autónoma. Se verificaron identificación, secciones B1–B5, separación de resultados históricos y regresiones, referencias de evidencia y ubicación de las capturas junto a los casos. Se eliminó el apartado Fuentes y lectura de las capturas de la práctica. La práctica conserva nueve páginas y 18 apariciones de capturas; la autónoma conserva cinco páginas y siete figuras. Los conteos excluyen el logotipo institucional. La copia de entrega autónoma coincide exactamente con el informe del repositorio. Esta revisión documental no equivale a una nueva ejecución de pruebas ni confirma la entrega al aula virtual.
