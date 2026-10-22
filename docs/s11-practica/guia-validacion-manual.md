# Sesión 11 - las 16 pruebas y sus capturas

Estas son las pruebas del paso 11 de la guía práctica. Hazlas en el orden indicado. No hace falta crear productos, registrar ventas ni borrar datos. Usa una carpeta nueva `Evidence/S11Practica` y nombres `S11-01`, `S11-02`, etc.; un caso puede tener dos capturas.

## Preparación

1. Backend y Oracle en ejecución. Duración JWT normal: 60 minutos. Frontend en `http://localhost:4200`; si ya está levantado, no arranques otro servidor en ese puerto. Si no está, ejecuta `npm start` desde PharmaFrontend.
2. Abre F12. En **Network/Red** activa Preserve log/Conservar registro; selecciona Fetch/XHR. En **Application/Aplicación > Session storage/Almacenamiento de sesión** elige `http://localhost:4200`.
3. Usa una pestaña sin sesión o pulsa Cerrar sesión. Solo para preparar el caso 1 puedes eliminar la clave `pharmasoft.sesion` y recargar; no borres almacenamiento de otros sitios.
4. Credenciales de clase: admin/Admin2026*, vendedor/Vendedor2026*, almacen/Almacen2026*, supervisor/Supervisor2026*, inactivo/Inactivo2026*. Son las cuentas existentes del backend.

## Grupo 1 - acceso y formulario (casos 1-5)

| N.º | Acción exacta | Qué debe pasar y qué capturar |
|---|---|---|
| 1 | Sin sesión, escribe `http://localhost:4200/ventas`. | Login sin menú ni encabezado privado. La barra de URL muestra `/login?returnUrl=%2Fventas`. Captura la URL y formulario. |
| 2 | Limpia la lista de Network y pulsa Ingresar con ambos campos vacíos. | Mensajes Ingrese su usuario / Ingrese su contraseña; ninguna petición nueva de login. Captura formulario y Network. |
| 3 | Usuario admin y contraseña incorrecta, por ejemplo Incorrecta2026. | POST auth/login 401 y Usuario o contraseña incorrectos; sigues en la misma página y password se limpia. Captura formulario y, si hace falta, respuesta de Network. |
| 4 | Login inactivo con Inactivo2026*. | El mismo 401 y mensaje genérico. No muestra una explicación de cuenta deshabilitada. Captura el resultado. |
| 5 | Login vendedor con Vendedor2026*. No cambies returnUrl. | Vuelve a `/ventas`. Encabezado con Lucia Ramos Cutipa, VENDEDOR y hora de expiración. Captura URL, encabezado y listado. |

## Grupo 2 - token, F5 y permisos de vendedor (casos 6-11)

| N.º | Acción exacta | Qué debe pasar y qué capturar |
|---|---|---|
| 6 | Abre Productos. En Network selecciona el GET `/api/v1/productos?...`; abre Headers > Request Headers. Revisa también el POST auth/login conservado. | El GET lleva Authorization: Bearer seguido del JWT. El login no lleva Authorization. Guarda dos capturas si es necesario. |
| 7 | Application > Session storage > localhost:4200. Selecciona `pharmasoft.sesion`. | JSON con token, expiraEn, username, nombreCompleto, roles y permisos; sin password. Captura nombre de la clave y contenido. |
| 8 | Estando en `/productos`, pulsa F5. | Sigue en Productos con la misma cuenta y expiración; se recarga el catálogo. Captura URL y encabezado después del F5. |
| 9 | Mira Productos como vendedor. | No hay Nuevo producto, Acciones, Editar ni Dar de baja. Captura el encabezado y la tabla. Opcionalmente comprueba también Categorías: lectura, sin edición. |
| 10 | Escribe `http://localhost:4200/productos/nuevo`. | `/acceso-denegado`, título 403 · Acceso denegado; el encabezado sigue mostrando vendedor. No es un 403 recibido del endpoint: es una navegación rechazada por permisoGuard. |
| 11 | Con esa sesión, escribe `http://localhost:4200/login`. | Redirige a `/inicio`. Captura la URL y el encabezado. |

## Grupo 3 - logout y otras cuentas (casos 12-14)

| N.º | Acción exacta | Qué debe pasar y qué capturar |
|---|---|---|
| 12 | Pulsa Cerrar sesión y revisa Session storage. | Login y la clave pharmasoft.sesion ya no existe. Captura ambos; no confundas Local storage con Session storage. |
| 13 | Login almacen/Almacen2026*. Comprueba el menú y escribe `/ventas`. | No hay Ventas, Clientes ni Reportes en el menú; URL directa a Ventas muestra Acceso denegado conservando ALMACENERO. Captura ese estado. Además puedes abrir Productos para mostrar Nuevo/Editar/Dar de baja, sin ejecutarlos. |
| 14 | Cierra sesión. Login supervisor/Supervisor2026*. Abre Productos. | Encabezado con ALMACENERO y VENDEDOR; Ventas en el menú y botones de escritura en Productos. Captura ambos aspectos juntos. No registres ventas ni cambies productos. |

## Grupo 4 - rechazo del token y vencimiento (casos 15-16)

### Caso 15: modificar un carácter del token

1. Mantén la sesión de supervisor y abre Productos. En Application > Session storage selecciona `pharmasoft.sesion`.
2. Edita **solo el valor del campo token dentro del JSON**. Conserva comillas, comas y todo el resto. Cambia un carácter al principio de su tercer segmento (la firma, después del segundo punto) por otra letra: si es A, usa B; si no, usa A. No cambies el último carácter, porque una variación de bits de relleno podría decodificar igual.
3. Confirma la edición con Enter. Limpia Network y pulsa F5.
4. Al restaurar una sesión todavía vigente, la SPA envía el JWT alterado. El backend responde 401, se borra la sesión y aparece `/login?expirada=1&returnUrl=...` con Su sesión expiró. Inicie sesión nuevamente.
5. Captura el aviso y la URL; captura también el GET 401 y su respuesta El token no es válido desde Network.
6. Si solo vuelves al login **sin aviso ni petición 401**, revisa si rompiste el JSON o si expiraEn ya estaba vencido: eso comprueba descarte local, no el caso 15. Haz login de nuevo y repite alterando solo un carácter de la firma.

### Caso 16: expiración real de un minuto

1. Cierra sesión. Detén el backend desde su terminal con Ctrl+C o desde el IDE. No detengas Oracle ni el frontend.
2. Si lo arrancas por PowerShell, desde PharmaBackend utiliza la misma terminal para guardar/restaurar la configuración:

```powershell
$s11ExpAnterior = $env:JWT_EXPIRACION_MINUTOS
$env:JWT_EXPIRACION_MINUTOS = '1'
./mvnw.cmd spring-boot:run
```

Si lo ejecutas desde el IDE, configura `JWT_EXPIRACION_MINUTOS=1` en la configuración de ejecución y reinicia desde allí. La variable debe llegar al proceso que inicia Spring; asignarla en otra terminal no cambia un backend ya iniciado. No cambies JWT_SECRET.

3. Espera a que Spring termine de arrancar. Inicia una sesión nueva de vendedor. En Network abre auth/login y confirma **expiraEnSegundos: 60**. Si devuelve 3600, el cambio no llegó al proceso.
4. Abre `/productos` y guarda una captura del encabezado y la respuesta de login con duración 60. Mantén la pestaña activa y espera algo más de un minuto, sin pulsar Cerrar sesión ni F5.
5. El temporizador vuelve automáticamente a login con el aviso y returnUrl a Productos. Captura esa pantalla. Puede ocurrir sin un GET 401: el cierre automático local es precisamente lo que se prueba aquí.
6. Vuelve a entrar. Debe volver a `/productos`. Captura URL y encabezado.
7. Restaura el backend. En la misma terminal, Ctrl+C y:

```powershell
if ($null -eq $s11ExpAnterior) {
    Remove-Item Env:JWT_EXPIRACION_MINUTOS -ErrorAction SilentlyContinue
} else {
    $env:JWT_EXPIRACION_MINUTOS = $s11ExpAnterior
}
./mvnw.cmd spring-boot:run
```

Si el valor original era 60 o no estaba definido, el perfil dev vuelve a 60 minutos. Si utilizaste el IDE, restaura allí el valor original o retira el override y reinicia. Cierra sesión en la SPA, inicia otra nueva y confirma **expiraEnSegundos: 3600** antes de dar la prueba por terminada.

## Comprobación adicional de 403 recibido por HTTP

El caso 10 demuestra el guard; no envía una petición prohibida al backend. Para comprobar también el interceptor 403, inicia sesión como vendedor, abre F12 > Console en la SPA y ejecuta lo siguiente. Este GET no cambia datos:

```javascript
var s11Sesion = JSON.parse(sessionStorage.getItem('pharmasoft.sesion'));
fetch('http://localhost:8080/api/v1/reportes/productos-mas-vendidos', {
  headers: { Authorization: 'Bearer ' + s11Sesion.token }
}).then(async r => console.log('HTTP:', r.status, 'Body:', await r.text()));
```

Resultado: 403 y mensaje de permisos; la sesión continúa. **fetch no pasa por los interceptores de Angular**, por lo que esta captura demuestra el contrato del backend. La conservación de sesión en errorInterceptor se comprueba con la prueba automatizada dedicada (HttpClient). No la presentes como una captura de ejecución del interceptor.

## Antes de enviar las capturas

- Los 16 casos pueden requerir más de 16 imágenes. Incluye ambas vistas cuando método/código y pantalla no quepan juntos.
- Conserva las capturas originales; el orden por creación ayuda a reconstruir la secuencia.
- No hay que exportar tokens ni contraseñas a ningún servicio externo para esta actividad.
- Después se revisan las capturas y se prepara `DelCarpio_LP2_S11_Practica.pdf` con el logo y formato habitual.
