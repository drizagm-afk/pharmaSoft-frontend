# Documentación técnica - práctica S9

Autor: Kevin Eduardo Del Carpio Alegría.

## Alcance y entrega

La guía práctica S9 desarrolla el registro transaccional cabecera-detalle, el comprobante y la consulta de ventas. Su producto documental es `DelCarpio_LP2_S9_Practica.pdf`, con capturas de las 17 pruebas del paso 10. No establece el límite de tres páginas, la matriz de 21 casos ni las preguntas C1-C3 de la actividad autónoma. El reporte por categoría pertenece a aquella actividad y no sustituye estas pruebas.

La guía también pide la rama `feature/ventas-delcarpio`, al menos cuatro commits convencionales y una solicitud de incorporación hacia develop. La rama y commits de implementación existen; el estado de la solicitud debe comprobarse antes de declarar completa la entrega. No se crea ni publica ninguna solicitud como parte de la preparación documental actual.

## Frontend

- `features/ventas/models/venta.model.ts` separa Venta, DetalleVenta, VentaRequest y FiltroVentas.
- `features/ventas/services/venta-service.ts` implementa registrar, obtener y buscar con HttpClient. buscar añade únicamente filtros con valor, página, tamaño y orden por fecha descendente.
- `features/ventas/ventas.routes.ts` ofrece consulta, nueva venta y detalle por identificador. La aplicación carga el feature de forma diferida y lo integra en el menú.
- VentaForm usa un FormArray inicialmente vacío, requerido. Cada línea contiene productoId y cantidad entera positiva. Los buscadores son controles independientes y no forman parte del request.
- coincide normaliza mayúsculas y tildes y exige coincidencia de todas las palabras. El formulario muestra hasta seis coincidencias; excluye clientes inactivos y productos inactivos o sin stock.
- agregarProducto combina productos repetidos incrementando la cantidad. agregarPrimero previene el submit por Enter. quitarLinea elimina la fila.
- toSignal(valueChanges), lineas y total recalculan los importes con redondeo a dos decimales. El total de la SPA es estimado, no una autoridad de facturación.
- revisar valida y abre el resumen; volver lo cierra sin POST; confirmar envía solo identificadores y cantidades. guardando impide doble envío. Ante 409 se conserva el formulario y se actualiza el catálogo.
- VentaDetalle presenta el importe del servidor, DNI y pie. El mensaje de registro exige estado REGISTRADA y nueva=1. imprimir=1 permite impresión automática; los estilos de impresión ocultan menú y botones.
- VentaList valida desde <= hasta antes de solicitar datos, conserva los filtros efectivamente aplicados y cancela solicitudes anteriores. La página tiene tamaño 10. totalPagina suma únicamente ventas REGISTRADAS. La impresión presenta filtros aplicados, fecha, listado y total de esa página, no el total global.

## Backend y contrato

Base local: `http://localhost:8080/api/v1`.

| Operación | Endpoint | Respuestas relevantes |
|---|---|---|
| Registro | POST /ventas | 201; 400 datos inválidos; 404 recursos inexistentes; 409 inactividad o stock |
| Detalle | GET /ventas/{id} | 200; 404 venta inexistente |
| Consulta | GET /ventas/buscar | 200 paginado; 409 rango invertido |

Request de ejemplo, con los identificadores actuales:

```json
{"clienteId":11,"detalles":[{"productoId":133,"cantidad":3},{"productoId":134,"cantidad":2}]}
```

VentaServiceImpl.create es transaccional. Verifica cliente activo, ordena productos por identificador para reservar stock en orden consistente y usa ProductoRepository.descontarStock, un UPDATE condicionado al estado y disponibilidad. Refresca la entidad tras el UPDATE y calcula importes con BigDecimal a partir del precio vigente. Si una línea falla, se revierte la venta y los descuentos anteriores. La respuesta incluye detalles e importes calculados por el servidor.

## Base de datos

Venta se mapea a `ventas`, con id, fecha, total decimal (12,2), estado y cliente_id obligatorio. DetalleVenta se mapea a `detalle_ventas`, con venta_id, producto_id, cantidad, precio decimal (10,2) y subtotal decimal (12,2). La relación venta-detalles aplica cascade ALL y orphanRemoval; agregarDetalle establece ambos lados de la asociación.

La consulta se puede verificar mediante la API sin exponer credenciales de Oracle. En esta preparación solo se hicieron lecturas HTTP: no se insertaron ventas ni se modificó stock.

## Datos verificados el 12/10/2026

- Cliente activo de trabajo: 11, María Elena Huamán Flores, DNI 90000001. Inactivo: 15, Martín Guevara Salmón. Hay cuatro clientes activos.
- Vitamina D: 133, S/12.50, stock 24. Protector solar: 134, S/18.90, stock 21. Vitamina C: 19, S/1.20, stock 40.
- Gel antibacterial: 22, S/4.35, stock 0; no puede usarse en una nueva prueba de concurrencia sin reponer previamente sus unidades.
- Ventas 41-45 REGISTRADAS; venta 46 ANULADA. La consulta contiene seis ventas, por lo que la SPA aún presenta una sola página de tamaño 10. No declarar probado manualmente el cambio de página en SPA sin disponer de más de diez resultados.
- Registrar nuevas ventas cambia estos valores y los reportes. El informe usará los valores y códigos realmente observados en el nuevo bundle, sin asumir el siguiente identificador.

## Estructura prevista del informe

1. Identificación, objetivo y arquitectura frontend/API/base de datos.
2. Datos y precondiciones de la ejecución, cálculos manuales y alcance real.
3. Diecisiete pruebas en el orden de la guía, agrupadas por aspecto: acción, esperado, obtenido y capturas junto al texto.
4. Impresión de comprobante registrado, anulado y consulta; incluir los PDFs conservados como evidencia cuando corresponda.
5. Cotejo de los 13 criterios de la guía, con resultados y pendientes explícitos, incluida la solicitud de incorporación.
6. Conclusiones y limitaciones, si existieran.

Estilo: párrafos negros; encabezados azules y separadores dorados. Sin índice de evidencias ni nombres de archivos en los títulos de las capturas. Se conserva separada la documentación de la actividad autónoma. Los resultados de esta nueva ejecución quedan pendientes hasta revisar el bundle del estudiante.
