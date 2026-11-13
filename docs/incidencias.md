# Incidencias - Sesión 14

| ID | Módulo | Descripción y pasos | Severidad | Causa | Corrección (commit) | Estado |
|---|---|---|---|---|---|---|
| INC-01 | Ventas / buscadores | Con 5012 productos, abrir Nueva venta y buscar un producto fuera de la primera página cargada. El buscador no puede encontrarlo. El mismo límite afecta a clientes cuando superan 100 registros. | Alta | VentaForm carga página 0 de tamaño 100 y después filtra localmente. | Pendiente de implementación en paso 10. | Abierta |
| INC-02 | Pruebas E2E / permisos | Primera corrida del paso 9: almacenero entra a /ventas; la prueba busca un encabezado exactamente igual a Acceso denegado y falla aunque la pantalla muestra 403 · Acceso denegado. | Baja | El selector de la prueba era más restrictivo que el encabezado real de la plantilla inline. La autorización funciona. | Selector por nombre parcial y comprobación de URL /acceso-denegado. Suite final 7/7. Hash pendiente del commit del paso 9. | Corregida y verificada; pendiente de commit |

INC-01 proviene de la matriz del paso 8 (docs/s14/08-integracion.md). INC-02 es un defecto del test, no un acceso indebido al módulo de ventas. El archivo HTML con texto de plantilla no es utilizado por el componente, que declara su contenido inline.
