# Capturas de la actividad autónoma — Del Carpio

## Estado

Las capturas de los once casos están reunidas. Codex capturó las páginas iniciales y el usuario aportó las capturas originales con Network, incluidas la edición de teléfono, las búsquedas sin solicitudes y Categorías. La evidencia de baja (9–10) muestra los estados HTTP en la lista de solicitudes, aunque no sus detalles completos de Headers.

### Network aportado para casos 1–8 y 11

Los nombres siguientes corresponden a archivos PNG originales aportados por el usuario.

| Caso | Archivos | Observación |
|---|---|---|
| 1 | `01-clientes-network` | GET 200, pagina=0, tamanio=10, apellidos asc. |
| 2 | `02-paginacion-network` | GET 200, pagina=1, tamanio=5 y Página 2 de 2. |
| 3 | `03-orden-desc-network`, `03-orden-asc-network` | GET 200 y ambos sentidos visibles. |
| 4 | `04-dni-invalido-network` | DNI de siete dígitos, validación y Network vacío. |
| 5 | `05-opcionales-network-headers`, `05-opcionales-network-payload`, `05-opcionales-network-payload-extra` | POST 201; telefono y direccion null. Las dos capturas Payload muestran el mismo contenido. |
| 6 | `06-duplicado-network` | POST 409 y mensaje de DNI duplicado 91234569. |
| 7 | `07-edicion-network-get`, `07-edicion-telefono-network-put`, `07-edicion-telefono-network-payload` | ID 43 precargado con GET 200; PUT 200 y telefono 987654323 visibles en Payload y tabla. Las capturas `07-edicion-dni-network-*` documentan una edición anterior del DNI a 98765432 y se conservan como referencia. |
| 8 | `08-busqueda-dni-network`, `08-busqueda-apellido-network` | Fila filtrada por DNI 98765432 y apellido DEL CARPIO CAPTURAS; Network vacío en ambas capturas. |
| 11 | `11-categorias-network` | Categorías seleccionado, tabla poblada y GET 200 a /api/v1/categorias. |

El usuario completó manualmente los casos 9 y 10 y aportó dos capturas originales. El cliente QA de ID 42 aparece Inactivo. Network muestra una respuesta 204 para 42, una recarga del listado con 200 y otra respuesta 409 para 42; la página muestra "El cliente ya está inactivo.". Las solicitudes no están seleccionadas y la columna Method no aparece, por lo que sus detalles completos no se ven en la captura. La evidencia de los once casos está reunida; se conserva esta limitación de detalle para baja y baja repetida.

### Capturas disponibles

- `01-clientes.jpg`: listado y navegación a Clientes.
- `02-paginacion.jpg`: segunda página con tamaño 5.
- `03-orden-desc.jpg`, `03-orden-asc.jpg`: ambos sentidos de ordenación.
- `04-dni-invalido.jpg`: validación de DNI de siete dígitos.
- `05-opcionales.jpg`: cliente registrado sin teléfono ni dirección.
- `06-duplicado.jpg`: mensaje de DNI duplicado.
- `07-edicion-precargada.jpg`, `07-edicion-guardada.jpg`: formulario precargado y teléfono actualizado.
- `08-busqueda-dni.jpg`, `08-busqueda-apellido.jpg`: búsqueda por DNI y apellido.
- `09-antes-de-baja.jpg`: estado previo a la baja, conservado como referencia.
- `09-10-baja-network.png`: captura aportada por el usuario con estado Inactivo, mensaje de baja repetida y respuestas 204/200/409 en Network.
- `10-baja-repetida.png`: captura aportada por el usuario con mensaje de cliente inactivo y fila Inactivo.
- `11-categorias.jpg`: módulo Categorías funcionando.

El cliente creado desde Brave es ID 42, DNI 91234568, nombre QA Navegador, apellido Del Carpio Evidencia. Se actualizó su teléfono a 987654322 y posteriormente el usuario lo dio de baja. No se crearon registros adicionales al probar el DNI duplicado.

`verificacion-api.json` contiene comprobaciones HTTP reales, realizadas sin modificar registros; no sustituye las capturas. Las pruebas automatizadas existentes comprueban formularios, búsqueda local, paginación y navegación, pero tampoco sustituyen la evidencia visual.

## Preparación

1. Ejecutar PharmaBackend y Oracle; ejecutar `npm start` desde `pharma-frontend`.
2. Abrir `http://localhost:4200`, F12 > Red (Network), activar conservar registro y filtrar Fetch/XHR. Borrar el registro antes de cada caso si no necesita el historial anterior.
3. Usar clientes identificados como QA para registro, edición y baja. El cliente QA de ID 41 ya está inactivo y puede servir para comprobar una baja repetida.
4. El caso 2 necesita al menos seis clientes para avanzar con tamaño 5. No se deben interpretar una tabla vacía o el botón deshabilitado como un fallo si solo existen cinco registros.

## Once casos de evidencia

| N.º | Archivo sugerido | Acción y evidencia requerida |
|---|---|---|
| 1 | 01-clientes.png | Entrar desde el sidebar. Mostrar Clientes resaltado, la tabla y GET 200 con pagina=0. |
| 2 | 02-paginacion.png | Seleccionar tamaño 5 y Siguiente. Mostrar Página 2 y GET con tamanio=5 y pagina=1. |
| 3 | 03-orden.png | Mostrar GET con ordenarPor=apellidos y ambas direcciones. El estado inicial es asc; el primer clic en ese encabezado cambia a desc y el siguiente vuelve a asc. |
| 4 | 04-dni-invalido.png | Formulario con DNI de 7 dígitos. Pulsar Registrar; mostrar validación y ausencia de POST. |
| 5 | 05-opcionales.png | Registrar cliente QA válido sin teléfono/dirección. Mostrar POST 201 y Payload con ambos campos null; verificar teléfono como —. |
| 6 | 06-duplicado.png | Intentar registrar nuevamente el DNI o correo del cliente QA. Mostrar POST 409 y el mensaje de la API. |
| 7 | 07-edicion.png | Abrir Editar del cliente QA, cambiar teléfono a 9 dígitos y guardar. Mostrar PUT 200 y resultado actualizado. |
| 8 | 08-busqueda.png | Buscar por parte del DNI y por apellido en la página actual. Mostrar filas filtradas y ausencia de nuevas peticiones. Puede requerir dos capturas para demostrar ambos filtros. |
| 9 | 09-baja.png | Dar de baja al cliente QA y confirmar. Mostrar DELETE 204, GET posterior y fila Inactivo. |
| 10 | 10-baja-repetida.png | Dar de baja otra vez al mismo cliente. Mostrar DELETE 409 y mensaje de cliente inactivo. |
| 11 | 11-categorias.png | Volver a Categorías. Mostrar módulo funcionando y GET 200. |

Guardar las imágenes reales en esta carpeta. Si una captura no alcanza para demostrar una acción, añadir sufijos a/b en lugar de ocultar el estado intermedio.

## Próximo paso

Las capturas seleccionadas están incorporadas en `../anexo-evidencias.pdf` (16 páginas). El informe B1–B5 está en `../informe-arquitectura.pdf` (5 páginas); `../DelCarpio_LP2_S7_Autonoma.pdf` reúne informe y anexo en 21 páginas para el aula. El generador editable está en `../generar_informe.py`. Se conserva la limitación de Headers de los casos 9–10. El enlace de PR sigue pendiente del paso de versionamiento.

