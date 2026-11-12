# Sesión 14 - Integración y estabilización

Estado: pasos 1 a 4 implementados, medidos y confirmados en Git. Paso 5 aplicado y validado en Oracle, documentado en docs/s14/paso-05.md del backend. Se recuperó también el despliegue Nginx: ver [05-nginx.md](05-nginx.md). Los pasos 6 en adelante se implementan después del siguiente checkpoint de commits.

## Alcance implementado

- Ambos repositorios están en feature/integracion-estabilizacion-delcarpio. La rama del backend se creó desde la revisión S13 actual, conservando sus cambios locales; no se hicieron pull, merges ni commits.
- Script de volumen de desarrollo: ../sql/volumen_pruebas.sql. Ejecutado personalmente en DBeaver: 5000 productos y 20000 ventas añadidos; totales confirmados 5011 y 20012.
- Modelo Pagina y ConsultaPagina; compatibilidad con los usos existentes de PaginaResponse y listar numérico.
- Paginador compartido en Productos y Ventas: rango, tamaño, primera/anterior/siguiente/última y estado deshabilitado.
- Estado de Productos en URL: pagina, tamanio, orden, dir y categoriaId. Por defecto, 20 filas.
- Estado de Ventas en URL: los cuatro anteriores más clienteId, estado, desde y hasta. Buscar aplica los filtros y vuelve a página cero; editar el formulario no cambia los filtros ya aplicados hasta buscar. Atrás/adelante restaura el formulario.
- rxResource cancela la consulta anterior; linkedSignal retiene la última página mientras llega la siguiente. Los botones de permisos, baja y consulta/impresión de ventas se conservan.
- Tamaño u orden nuevos y filtros aplicados reinician pagina a cero.
- data-testid tabla-productos, tabla-ventas, resumen-paginacion y pagina-actual preparados en los componentes correspondientes.

El filtro de categoría de Productos sigue siendo local a la página, como antes; la interfaz lo indica. El backend ya ofrece páginas y rechaza tamaños fuera de 1-100 y órdenes ajenos a sus listas permitidas. No fue necesario modificar su contrato.

La guía sitúa V4 en el paso 5, aunque el script del paso 2 la menciona como paso 4. El script adaptado usa las columnas actuales, sin creado_por. Así no introduce auditoría ni migraciones fuera del alcance solicitado. Los nombres de catálogo son nombres de farmacia con referencias numéricas para conservar unicidad.

## Comprobación técnica

Pruebas de paginador y navegación con RouterTestingHarness: URL directa, cancelación, tabla retenida, tamaños/orden, permisos, baja, historial de navegación y fechas. Resultado: **141 pruebas aprobadas en 33 archivos**; los 12 casos del paginador y los dos listados están incluidos en ese total. Compilación de producción aprobada. Los registros locales están en tmp/s14/.

La carga y la validación de los pasos 1 a 4 están comprobadas. Resumen con cifras y alcance: [resultados/RESUMEN.md](resultados/RESUMEN.md). Datos HTTP: resultados/mediciones-api.json. Verificaciones de la SPA: resultados/comprobaciones-spa.json. Capturas: evidencias/.

Las mediciones HTTP se obtuvieron con un cliente Python secuencial y se capturó su resumen identificado como tal. No se presentan como capturas de Postman. Además de las cinco URL de la guía se comprobó la página real 250, porque con los 11 productos previos la 249 no es la última.

Durante la comprobación real se corrigió la selección inicial de Filas: la opción seleccionada ahora coincide con el tamaño recibido incluso cuando se crean las opciones del select. La prueba de regresión y una recarga de la página 250 confirman el valor 20.

Backend y Angular quedaron ejecutando para revisión. El perfil dev se pasó únicamente al comando de arranque; application.yaml conserva la configuración local previa. La siguiente guía describe cómo reproducir los casos; no indica tareas adicionales pendientes.

## Guía de verificación y capturas

### 1. Carga del paso 2

1. En DBeaver abrir una conexión Oracle al esquema de desarrollo o una copia destinada a estas pruebas. Usar una sesión sin trabajo pendiente.
2. Abrir docs/sql/volumen_pruebas.sql del frontend. Revisar nombres y conexión antes de ejecutar.
3. Seleccionar el bloque completo desde `declare` hasta `end;`, incluido el punto y coma final, y pulsar **Ctrl+Enter** para ejecutar la selección como una sentencia. No seleccionar los SELECT que siguen ni añadir `/`. No usar `SET SERVEROUTPUT ON`, que es un comando de SQL*Plus. El bloque confirma la transacción si termina; ante error revierte la carga.
4. Ejecutar después los SELECT finales. **Captura S14-02-volumen:** resultados de total_productos, productos_carga_s14, total_ventas y ultima_pagina_base_cero. Los mensajes de DBMS_OUTPUT son auxiliares; la comprobación no depende de activar esa salida en DBeaver.
5. El script usa una categoría y un cliente activos ya existentes. Las ventas de carga no tienen detalle: no se usan para validar reportes ni como ventas reales. El marcador de descripción impide repetir accidentalmente la misma carga.

### 2. Perfil y caché antes de medir

1. Iniciar el backend con perfil dev y conexión al mismo esquema donde se cargaron los datos. Verificar visualmente la conexión; el perfil por sí solo no selecciona una copia aislada.
2. El archivo de dev ya configura org.hibernate.SQL en DEBUG. La consola de Java permitirá observar las consultas paginadas y count.
3. Como el script escribe directamente en Oracle, invalidar las entradas de productos que se medirán. Estos comandos solo eliminan claves concretas del Redis local de este proyecto:

```text
docker exec pharma-redis redis-cli DEL productos::0-20-nombre-asc productos::0-100-nombre-asc productos::249-20-nombre-asc productos::0-500-nombre-asc
```

4. Si la última página calculada en SQL no es 249, eliminar también su clave siguiendo el mismo formato, por ejemplo productos::250-20-nombre-asc para la página 250. No hace falta FLUSHALL sobre otras cachés.

### 3. Cinco peticiones de línea base

En Postman, usar un token válido del login existente en Authorization -> Bearer Token. La base es http://localhost:8080/api/v1. Mantener el mismo cliente y criterio de tamaño en todas las mediciones.

| Petición GET | Qué registrar |
|---|---|
| /productos?pagina=0&tamanio=20 | HTTP, tiempo, tamaño y metadatos de página. |
| /productos?pagina=0&tamanio=100 | HTTP 200 y tamaño 100 admitido. |
| /productos?pagina=249&tamanio=20 | Petición literal de la guía. Si SQL da otra última página, medir también esa página real y etiquetarla correctamente. |
| /productos?pagina=0&tamanio=500 | HTTP 409 por tamaño fuera del rango. |
| /ventas/buscar?desde=2026-11-01&hasta=2026-11-12&pagina=0 | Página de ventas filtradas por fechas. |

Después de cada respuesta, **capturar S14-02-GET-01 a GET-05** mostrando URL, HTTP, tiempo y tamaño de Postman. No mostrar el token. Guardar el valor de tamaño que se use (respuesta/cuerpo); no equipararlo después a transferencia comprimida del navegador.

Para productos con caché fría, **captura S14-02-SQL:** consola Java con OFFSET/FETCH y COUNT de la petición. Una respuesta de caché caliente puede evitar esas consultas, por eso se invalidan las claves antes de medir. Una página vacía o la optimización de la última página pueden omitir COUNT; describir lo que realmente aparece.

La página 249 solo es la última si hay exactamente 5000 productos. La carga agrega 5000 a los ya existentes. Conservar ambos datos sin inventar un resultado para coincidir con el ejemplo.

### 4. Productos - paso 4

1. Iniciar el frontend con npm start y entrar como administrador.
2. Abrir http://localhost:4200/productos. Confirmar 20 filas cuando exista volumen suficiente, resumen 1–20 y primera página.
3. **Captura S14-04-productos-inicio:** tabla y paginador completos.
4. Pulsar Siguiente. La URL debe incluir pagina=1 y la tabla mostrar la segunda página. **Captura S14-04-productos-pagina-2**, con la URL visible.
5. Pulsar F5. Deben conservarse página, tamaño y orden. **Captura S14-04-productos-F5.**
6. Cambiar Filas a 50: pagina vuelve a cero y tamanio=50 queda en la URL. Ordenar por Precio y volver a pulsarlo para alternar asc/desc. **Captura S14-04-productos-orden**, mostrando URL y encabezado.
7. Usar Última página: debe verse el rango final y Siguiente/Última deshabilitados. Primera página vuelve al inicio.
8. Cambiar la categoría desde una página posterior: vuelve a pagina=0 y conserva categoriaId en la URL. Este filtro se aplica únicamente a los productos de la página cargada.

### 5. Ventas - también incluido al final del paso 4

1. Abrir http://localhost:4200/ventas y pasar a una página posterior.
2. Elegir Estado y fechas; pulsar Buscar. La URL debe contener los filtros y pagina=0. **Captura S14-04-ventas-filtros.**
3. Si el filtro tiene más de una página, pulsar Siguiente. Sus filtros deben mantenerse. Cambiar Filas u ordenar por Fecha/Total debe reiniciar la página.
4. Pulsar F5: se conservan URL, resultados y campos del formulario. **Captura S14-04-ventas-F5.**
5. Usar Atrás/Adelante del navegador: el formulario y la consulta vuelven a los valores de cada URL. Limpiar elimina los cuatro filtros y vuelve a la primera página.

Estos puntos cierran el alcance de los pasos 1 a 4. No incluyen migración V4, columnas de auditoría, bitácora, Playwright, matriz de integración de pasos posteriores ni PDF de entrega de la sesión completa.
