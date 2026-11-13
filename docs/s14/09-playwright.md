# S14 - Paso 9: pruebas end-to-end

Fecha de ejecución: 13 de noviembre de 2026.

## Configuración

Se incorporó Playwright Test 1.65.0 y Chromium. La suite contiene exactamente siete pruebas en cuatro archivos. Cada prueba utiliza un contexto de navegador nuevo y autentica mediante el formulario visible cuando corresponde.

La ejecución usa un worker, sin paralelismo completo y con retries=0. No utiliza waitForTimeout, respuestas simuladas ni sesiones precargadas. Las esperas se basan en elementos visibles, respuestas HTTP y aserciones de Playwright.

playwright.config.ts levanta Angular con npm start cuando localhost:4200 no está disponible. Backend, Oracle y Redis deben estar iniciados. Se generan un reporte HTML y otro JSON. Ante fallos se conservan captura, traza y video. Las carpetas playwright-report, test-results y blob-report quedan fuera de Git.

## Casos

| Archivo | Caso y comprobación |
|---|---|
| autenticacion.spec.ts | Ruta protegida sin sesión: login con returnUrl. |
| autenticacion.spec.ts | Credenciales incorrectas: respuesta real 401 y mensaje del backend. |
| autenticacion.spec.ts | Login correcto: regreso a la página solicitada. |
| permisos.spec.ts | Almacenero: Ventas ausente del menú y URL directa redirigida a acceso denegado. |
| permisos.spec.ts | Vendedor: Productos visible, sin alta, edición ni baja. |
| paginacion.spec.ts | Veinte filas, respuesta de página 1 desde servidor, cambio de contenido y URL; F5 conserva página 2. |
| flujo-venta.spec.ts | Vendedor selecciona cliente y producto, lee stock actual, vende dos unidades, recibe 201 y ve stock descontado al navegar por el menú sin F5. |

El flujo utiliza Elena Patricia Rojas Medina y Aceite de almendras 60 ml, registrados en el paso 8. Se sustituyen los nombres Mamani y Paracetamol del ejemplo por datos existentes de esta base, como permite la guía. La prueba lee el stock antes de cada venta; no presupone una cifra fija.

El registro respeta la confirmación existente: Revisar venta, desmarcar impresión automática y Confirmar venta. Desmarcar la impresión evita abrir el diálogo del sistema durante la automatización.

## Ejecución y resultado

| Corrida | Aprobadas | Fallidas | Reintentos | Observación |
|---|---:|---:|---:|---|
| Inicial | 6 | 1 | 0 | INC-02: selector del encabezado denegado demasiado exacto. |
| Después de corregir INC-02 | 7 | 0 | 0 | 6.8 segundos de ejecución total informados por Playwright. |

INC-02 se registró en docs/incidencias.md antes de modificar el selector. La pantalla real muestra 403 · Acceso denegado. Se usa una coincidencia parcial para el texto y se comprueba también la ruta /acceso-denegado. No se modificó la autorización del sistema.

Las dos corridas registraron las ventas 20078 y 20079. En la última, el producto pasó de stock 26 a 24. El requestId 90b83c9f coincide con POST /api/v1/ventas -> 201 y con el evento VENTA_REGISTRADA del log del backend.

El diagnóstico del flujo principal registra cero errores de consola, cero errores JavaScript y cero respuestas HTTP 500. Tampoco se encontró una respuesta 500 con el requestId de la venta en el log del backend.

El resumen exportado, sin tokens ni contraseñas, está en resultados/09-e2e.json. Las dos capturas del último flujo están en evidencias-e2e/. El reporte completo de la corrida más reciente está en playwright-report/index.html y el JSON original en test-results/resultados.json.

Los artefactos completos de Playwright son archivos locales de revisión: una traza de fallo puede incluir datos de peticiones y sesiones. El resumen exportado y las capturas seleccionadas son los archivos preparados para versionar.

## Comandos desde la raíz del frontend

```text
npm run e2e
npm run e2e:ui
npm run e2e:report
npm run e2e:estable
```

e2e:estable ejecuta playwright test --repeat-each=3. Esa comprobación se hará después de corregir INC-01 en el paso 10. Una única corrida de 7/7 no se presenta como tres corridas ni como cierre de la estabilización.

## Datos y condiciones para repetir

- El producto necesita al menos dos unidades por corrida; cada prueba del flujo crea una venta real en el esquema de desarrollo.
- Los datos predeterminados se declaran en e2e/apoyo.ts. Se pueden ajustar con E2E_CLIENTE y E2E_PRODUCTO.
- Las cuentas demostrativas de la guía son admin, vendedor y almacen. Las contraseñas locales pueden configurarse con E2E_ADMIN_PASSWORD, E2E_VENDEDOR_PASSWORD y E2E_ALMACEN_PASSWORD.
- El producto utilizado actualmente aparece en la primera página de Productos y en la página cargada por Nueva venta. INC-01 continúa abierta; esta suite no demuestra que el buscador cubra los registros fuera de su límite de 100.
- Para instalar el navegador en otro equipo después de instalar dependencias: npx playwright install chromium.

## Siguiente etapa

El paso 10 corregirá INC-01, agregará la comprobación de regresión que corresponda y volverá a ejecutar los siete E2E tres veces sin reintentos. Los hashes de corrección se completarán después de los commits.

Referencia de ejecución y reportes: [CLI de Playwright](https://playwright.dev/docs/test-cli), [reporters de Playwright](https://playwright.dev/docs/test-reporters).
