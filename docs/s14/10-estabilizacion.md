# S14 - Paso 10: corrección y estabilidad

Fecha: 13 de noviembre de 2026.

## INC-01: búsqueda en todo el catálogo

Se reemplaza la carga inicial de 100 clientes y productos por búsquedas paginadas del servidor. La SPA espera 250 ms desde el último cambio de texto y cancela la consulta anterior al escribir de nuevo. Las sugerencias antiguas se vacían inmediatamente, y cada buscador tiene estado de carga y error independiente.

Las selecciones se conservan separadas de las sugerencias: cambiar o limpiar una búsqueda no elimina el cliente ni las líneas de la venta. Al recibir un conflicto, se vuelven a consultar por ID únicamente los registros seleccionados para actualizar stock, precio y estado.

La API filtra por todo el conjunto de registros antes de paginar. Ofrece seis coincidencias por defecto, excluye clientes inactivos y productos inactivos o sin stock, y permite buscar sin distinguir mayúsculas ni tildes españolas. Los listados de Productos y Clientes conservan sus contratos anteriores.

## Regresión

| Comprobación | Resultado |
|---|---|
| Backend antes del cambio | Las dos pruebas nuevas fallan en las rutas aún inexistentes. |
| Más de 100 registros | Las pruebas aisladas encuentran producto y cliente que no estaban en la primera página de 100. |
| Disponibilidad | Los registros inactivos y los productos sin stock quedan excluidos. |
| Búsqueda | Categoría, nombres completos, DNI, tildes, términos vacíos y caracteres literales comprobados. |
| Oracle de desarrollo | Vitamina D, ID 133, fuera de la primera página anterior, aparece en el endpoint nuevo; huaman encuentra Huamán. |
| SPA | Conserva selección y total al buscar, cancela peticiones antiguas, limpia sugerencias, recupera búsquedas tras error y refresca selección después de 409. |
| Pruebas frontend | 145 aprobadas en 33 archivos, sin errores no manejados. |
| Pruebas backend | 86 aprobadas; 18 opcionales omitidas; sin fallos ni errores. |
| Regresión final de búsqueda y Redis | 9 aprobadas, sin fallos, errores ni omisiones. |
| Compilación de producción | Correcta. |

La búsqueda de un producto fuera de la ventana anterior también se incorporó al E2E del flujo principal, sin aumentar el conjunto de siete casos.

## Tres repeticiones sin reintentos

Comando:

```text
npm run e2e:estable
```

Equivale a playwright test --repeat-each=3, con un worker y retries=0.

| Repetición | Aprobadas | Fallidas | Venta | Stock antes | Stock después |
|---|---:|---:|---:|---:|---:|
| 1 | 7/7 | 0 | 20080 | 24 | 22 |
| 2 | 7/7 | 0 | 20081 | 22 | 20 |
| 3 | 7/7 | 0 | 20082 | 20 | 18 |

Playwright informa 21 aprobadas, cero fallidas, cero omitidas y cero flaky en 23.6 segundos. No se usan esperas fijas de Playwright ni reintentos. Los 250 ms son el debounce de la búsqueda de la aplicación, no una espera artificial del test.

Cada flujo encuentra Vitamina D por la búsqueda remota, selecciona Aceite de almendras 60 ml, vende dos unidades y comprueba el stock al abrir Productos mediante el menú sin F5.

Los tres diagnósticos del flujo principal registran cero errores de consola, cero errores JavaScript y cero respuestas HTTP 500. Los requestId 161dde8a, dd10476c y a91486a6 aparecen en el log del backend junto a POST /api/v1/ventas -> 201 y al evento VENTA_REGISTRADA. No se encontraron respuestas 500 con esos requestId.

## Evidencias y estado

- resultados/10-busqueda-oracle.json: búsqueda real en Oracle y comprobación del límite anterior.
- resultados/10-e2e-estabilidad.json: casos, repeticiones, diagnósticos y correlación de las ventas.
- evidencias-estabilidad/: búsqueda remota, comprobante y stock de cada repetición.
- playwright-report/index.html: reporte completo de la corrida triple, mantenido localmente fuera de Git.
- Logs locales: tmp/s14/paso10-unit-tests.log, paso10-build.log y paso10-e2e-triple.log.

El producto queda activo, precio S/ 13.50 y stock 18. Se conservan las tres ventas de esta etapa. Los datos de las pruebas backend de volumen usan H2 aislado y rollback; no añaden clientes ni productos a Oracle.

INC-02 queda cerrada con el commit frontend 8af65ed. INC-01 está corregida y verificada en ambos proyectos; sus hashes se completarán después de los commits de esta etapa.

## Siguiente etapa

Después de los commits se completarán los hashes del registro de incidencias y se preparará la documentación de entrega de la sesión, con su tabla de evidencias, matriz e informe de Playwright.
