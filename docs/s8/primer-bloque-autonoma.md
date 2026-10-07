# Primer bloque de ejecución: A-01 y A-02

Ejecutar después de fusionar la práctica y crear la rama autónoma. Guía histórica de preparación, escrita antes de ejecutar. A-01 y A-02 ya fueron realizados; los resultados constan en la matriz. No ejecutar de nuevo estas instrucciones sobre los IDs actuales sin recrear precondiciones.

## Configuración

1. Mantener backend en localhost:8080 y frontend en localhost:4200.
2. Importar PharmaSoft-S8-Dependencias.json en Postman con Import > Files.
3. Abrir la colección PharmaSoft - S8 Dependencias > Variables. baseUrl debe ser http://localhost:8080/api/v1, categoriaActivaId 46, otraCategoriaActivaId 47 y categoriaInactivaId 49.
4. Elegir un nombre único para A-01 y guardarlo en nombreProducto. Ajustar nombreDuplicado a ese nombre en minúsculas. No ejecutar Run collection.
5. En Brave, abrir F12 > Network > Fetch/XHR. Activar Preserve/Keep log. Limpiar antes de cada operación probada.

## A-01: registrar producto válido

1. Productos > Nuevo producto.
2. Categoría: QA S8 DelCarpio Activa A (46).
3. Nombre: usar exactamente la variable nombreProducto de Postman.
4. Precio: 5.50; stock: 10; Activo marcado.
5. Limpiar Network y pulsar Registrar una sola vez.
6. Seleccionar POST productos. Capturar Headers (URL, método, estado) y Response (incluido id), y la fila creada con su categoría. Archivos: A-01_headers.png, A-01_response.png, A-01_spa.png.
7. Copiar el id devuelto a productoId en las variables de la colección. No ejecutar además el POST A-01 de Postman: duplicaría el alta.
8. Registrar el estado real; esperado 201. No inventar el resultado si falla.

## A-02: sin categoría, SPA y API

1. Abrir Nuevo producto; completar nombre QA S8 AUTO A02, precio 5.50 y stock 10. Dejar el select sin categoría.
2. Limpiar Network y pulsar Registrar. Capturar el mensaje y Network vacío: A-02_spa.png.
3. En Postman, abrir A-02 - Sin categoría; revisar que el body no incluya categoriaId. Pulsar Send una sola vez.
4. Capturar URL, método POST, estado HTTP y JSON de respuesta: A-02_postman.png.
5. Esperado API 400 con validationErrors.categoriaId. Si el resultado difiere, conservarlo y comunicarlo.

Al terminar enviar las capturas de estos dos casos y el id del producto de A-01. Después se ejecutan A-03 y A-04, conservando las validaciones actuales del backend para documentar los hallazgos.