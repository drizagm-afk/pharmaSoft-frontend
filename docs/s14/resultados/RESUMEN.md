# S14 - Resultados de los pasos 1 a 4

Fecha: 12 de noviembre de 2026. Backend en perfil dev; frontend en localhost:4200. No se ejecutaron pasos 5 en adelante ni se hicieron commits.

## Volumen confirmado

DBeaver: 5011 productos totales, 5000 de carga S14, 20012 ventas totales. Última página base cero con tamaño 20: 250. Las capturas de los conteos fueron proporcionadas tras ejecutar la carga; no se volvió a insertar volumen.

## Mediciones HTTP de la línea base

Cliente Python urllib secuencial; una muestra por URL, sin compresión. El tiempo incluye la solicitud HTTP completa. Los bytes corresponden al cuerpo, sin cabeceras; no son transferencia de DevTools ni resultados de Postman. Se eliminó únicamente la clave de productos correspondiente antes de cada medida.

| Caso | HTTP | ms | Bytes del cuerpo | Filas | Resultado |
|---|---:|---:|---:|---:|---|
| productos-20 | 200 | 1437.005 | 5620 | 20 | Correcto |
| productos-100 | 200 | 132.093 | 27719 | 100 | Correcto |
| productos-249 | 200 | 110.594 | 5560 | 20 | Correcto |
| productos-ultima | 200 | 100.885 | 3081 | 11 | Correcto |
| productos-500 | 409 | 73.376 | 208 | - | Correcto |
| ventas-fechas | 200 | 190.225 | 1734 | 10 | Correcto |

La página 249 contiene 20 filas y no es la última en este esquema. La 250 contiene 11 filas y ultima=true. El filtro de ventas del 1 al 12 de noviembre devuelve 607 ventas; el endpoint utiliza su tamaño predeterminado de 10 al omitir tamanio. La SPA pide 20 por defecto.

La primera solicitud de productos duró 1437.005 ms. No se presenta esta única muestra como promedio ni como una mejora estadística frente a las demás URLs.

## SQL real de desarrollo

Se observan OFFSET/FETCH y COUNT de productos, además de consultas de autenticación y categoría. Las ventas consultan también sus detalles. No se afirma que toda la petición ejecute únicamente dos SQL. La última página incompleta puede resolver el total sin otro COUNT.

```sql
select
        p1_0.id,
        p1_0.categoria_id,
        p1_0.descripcion,
        p1_0.estado,
        p1_0.fecha_creacion,
        p1_0.fecha_modificacion,
        p1_0.nombre,
        p1_0.precio,
        p1_0.stock 
    from
        productos p1_0 
    order by
        p1_0.nombre,
        p1_0.id 
    offset
        ? rows 
    fetch
        first ? rows only

select
        count(p1_0.id) 
    from
        productos p1_0
```

El registro completo de la ventana de medidas es sql-paginacion-dev.txt. No contiene valores de contraseñas ni cabeceras Authorization; los nombres de columnas no son valores de credenciales.

## Verificaciones de la SPA

Productos: 20 filas iniciales; segunda página en URL; F5 conserva página; tamaño 50 reinicia a cero; orden asc/desc en URL; salto a última página; categoría reinicia a cero. Última página con tamaño 20: 11 filas, resumen 5001–5011 y Siguiente deshabilitado.

Ventas: 20012 filas totales paginadas; filtros REGISTRADA y fechas devuelven 607 resultados; Buscar reinicia la página; F5 restaura filtros y página; tamaño 50 y orden por Total; Atrás/Adelante conserva la consulta; Limpiar elimina los cuatro filtros y vuelve a cero.

Durante la comprobación se detectó que el select Filas podía mostrar la primera opción al crearse, aunque la tabla usara 20. Se corrigió la selección explícita de cada option y se añadió una prueba para el valor inicial y sus actualizaciones. La captura final comprueba el valor corregido.

Las trazas DOM y URLs están en comprobaciones-spa.json. Las capturas de la SPA se guardaron desde el navegador real; no se alteraron imágenes para simular resultados.

## Alcance cerrado

Verificación final tras corregir Filas: 141 pruebas aprobadas en 33 archivos y compilación de producción correcta. La recarga real confirma tamaño seleccionado 20, página 251 de 251 y 11 filas. Se conservan 20 capturas; el manifiesto distingue las comprobaciones anteriores al ajuste visual de la captura final corregida.

Solo pasos 1 a 4. No se añadieron migraciones, auditoría, eventos, integración E2E del paso 9 ni ventas nuevas. La colección/API usada fue de lectura salvo el login. El código de backend no necesitó cambios. Backend dev y Angular se dejaron ejecutando para la revisión.
