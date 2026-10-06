# S8 práctica: evidencias y documento

Documento final: ../DelCarpio_LP2_S8_Practica.pdf (19 páginas).
Generador reproducible: ../generar_practica.py; requiere Python y reportlab.

Los doce escenarios tienen evidencia. El caso 12 fue corregido y validado manualmente: DELETE /api/v1/categorias/47 devuelve 409 Conflict, muestra el mensaje de negocio y conserva la categoría.

| Caso | Evidencia principal | Resultado observado |
|---|---|---|
| 1 | P01-network.png | GET 200, página 0, tamaño 10, nombre asc |
| 2 | P02-precio-asc-network.png / P02-precio-desc-network.png | GET 200 en ambos sentidos |
| 3 | P03-paginacion-network.png / P03-paginacion.jpg | Página 1 del API, tamaño 5; complemento del paginador |
| 4 | P04-filtro-network.png | Filtro local, sin petición adicional |
| 5 | P05-categorias-activas-network.png | Select activo; GET categorías 200 |
| 6 | P06-validacion-network.png | Errores del formulario, sin envío |
| 7 | P07-registro-network.png / P10-cambio-categoria.jpg | POST 201; complemento de un registro previo visible |
| 8 | P08-duplicado-network.png / P08-duplicado.jpg | POST 409; complemento de intento en minúsculas |
| 9 | P09-categoria-inactiva-network.png | Categoría original inactiva visible, guardado bloqueado |
| 10 | P10-cambio-categoria-network.png / P10-cambio-categoria.jpg | PUT 200; complemento de reasignación previa |
| 11 | P11-baja-network.png | DELETE 204; Inactivo y botón deshabilitado |
| 12 | P12-categoria-referenciada-409-network.png | Retest correcto: DELETE 409, categoría conservada |

## Procedencia y límites

Las capturas PNG con Network fueron proporcionadas por el estudiante. Las JPG son capturas previas de la interfaz realizadas durante la verificación de Codex. Los complementos de los casos 3, 7, 8 y 10 provienen de ejecuciones distintas; el PDF explica esta distinción. No se atribuye una fila complementaria al POST capturado sin identificar su Payload/Response.

P12-categoria-referenciada-500-network.png conserva el defecto original como anexo histórico; no representa el resultado final.

La matriz y el informe autónomos no se han ejecutado todavía. Pendientes de versionado por el estudiante: commit de documentación y solicitud de incorporación de feature/productos-delcarpio hacia develop.