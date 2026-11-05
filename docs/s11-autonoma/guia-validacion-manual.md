# Sesión 11 autónoma - secuencia de validación y capturas

## Antes de comenzar

La implementación está lista para ejecutar la matriz de 26 casos: 16 base, cuatro propios (L-05, S-05, G-03, M-03), cuatro de aviso y dos de perfil. Los resultados en `docs/matriz-seguridad-spa-s11.md` quedan pendientes hasta comprobarlos manualmente. No hay que insertar datos, registrar ventas ni crear productos.

1. Oracle y backend activos; frontend en **http://localhost:4200** con `npm start`. No arranques otro servidor si ese puerto ya está ocupado. Se necesita la compilación de desarrollo para las dos comprobaciones con `ng` en consola.
2. Comienza con duración normal del JWT, 60 minutos. Solo B-01 a B-04 requieren tres minutos; más abajo está la restauración. No cambies JWT_SECRET.
3. Credenciales: admin/Admin2026*, vendedor/Vendedor2026*, almacen/Almacen2026*, supervisor/Supervisor2026*, inactivo/Inactivo2026*.
4. Abre F12 > Network/Red, marca Conservar registro y desactiva caché. Ten a mano Application/Aplicación > Session storage > localhost:4200. El login está fuera del layout y Mi cuenta está junto al nombre, en el encabezado.
5. Usa una carpeta nueva, por ejemplo Evidence/S11Autonoma, y nombres con el ID: L-02_inactivo, B-02_contador, etc. Si un caso tiene varias peticiones, conserva varias capturas.

**En esta actividad no se permite ningún JWT completo en capturas ni archivos.** Antes de guardar una captura, colapsa el campo token y evita mostrar toda la columna Value. Si necesitas enseñar Authorization, deja solo `Bearer eyJ...` visible y tapa el resto con un rectángulo opaco en Recortes o Paint. Haz lo mismo con los tokens de Swagger, respuestas de login y valores de Session storage. No sirve un resaltador transparente. No exportes JWTs a documentos, Markdown o servicios externos.

## 1. Login - L-01 a L-05

| Caso | Qué hacer | Resultado y captura |
|---|---|---|
| L-01 | Sin sesión, enviar vacío; después escribir solo vendedor y enviar otra vez. | Errores locales de campos; ninguna petición nueva POST login en ambos intentos. Captura formulario y Network vacío. |
| L-02 | Enviar usuario inexistente, admin con clave incorrecta e inactivo con Inactivo2026*. | Tres 401 con Usuario o contraseña incorrectos. Password se borra y username se conserva. Guarda las tres respuestas, sin tokens. |
| L-03 | Preparar credenciales de vendedor; en Network usar temporalmente Slow 3G y hacer doble clic rápido en Ingresar. | Una sola petición POST auth/login y botón deshabilitado durante la carga. Quita después la limitación de red. |
| L-04 | Cerrar sesión; abrir `/login?returnUrl=https://sitio-falso.com`; iniciar como vendedor. | Permanece en localhost y termina en /inicio. Captura antes y después. |
| L-05 propio | Cerrar sesión; usuario ` VENDEDOR ` con espacios exteriores y Vendedor2026*. | 200; username canónico vendedor. Captura la entrada y la respuesta con token oculto. |

## 2. Sesión - S-01 a S-05

| Caso | Qué hacer | Resultado y captura |
|---|---|---|
| S-01 | Abrir Productos con sesión; F5. Después cerrar la ventana de prueba y abrir otra nueva, sin restaurar pestañas. | F5 conserva sesión. En una ventana nueva pide login. Si el navegador restaura sesiones, usa una ventana privada de prueba y ciérrala por completo; no cierres tus otras ventanas de trabajo. |
| S-02 | Login; en el JSON pharmasoft.sesion cambiar solo expiraEn a `1`; confirmar Enter y F5 en Productos. | Descarta sesión y presenta login. No necesita un 401 del backend: el descarte ocurre localmente. |
| S-03 | Login; sustituir el valor completo de pharmasoft.sesion por `esto no es JSON`; Enter y F5. | Muestra login sin romper la SPA. Captura almacenamiento de prueba y resultado. |
| S-04 | Abrir dos pestañas A y B. Iniciar sesión en cada una si hace falta. Cerrar sesión en A; navegar en B. | A va al login; B normalmente conserva su sesión independiente. Registra el resultado real. Usa las dos ventanas lado a lado en la captura. |
| S-05 propio | Login; sustituir el valor por el JSON válido de abajo y F5. | Descarta la estructura incorrecta y muestra login, sin excepción que rompa la aplicación. |

JSON de prueba para S-05 (no contiene credenciales reales):

```json
{"token":"prueba","expiraEn":"mañana","username":"prueba","nombreCompleto":"Prueba","roles":[],"permisos":[]}
```

S-04 no se corrige agregando logout global: sessionStorage es por pestaña. Más adelante se explicará esa consecuencia y una posible solución con BroadcastChannel, sin atribuirla al comportamiento actual.

## 3. Interceptores - I-01 a I-03

### I-01: API, login y petición externa

1. Login nuevo como vendedor. Conserva el POST login de Network.
2. Abre Productos; selecciona su GET y muestra Request Headers: Authorization lleva Bearer. En el POST login no debe aparecer Authorization. Oculta la parte completa del JWT antes de guardar.
3. Para comprobar además que **HttpClient pasa por el interceptor y no añade el token a otro dominio**, en Console de esa página ejecuta:

```javascript
var s11Lista = ng.getComponent(document.querySelector('app-producto-list'));
s11Lista.service.http.get('https://httpbin.org/get').subscribe({
  next: () => console.log('Petición externa terminada'),
  error: e => console.log('Respuesta externa:', e.status)
});
```

4. Selecciona esa petición externa en Network: **no tiene Authorization**. Su disponibilidad o política CORS puede producir un error externo; para este subcaso se inspecciona el encabezado enviado. La sesión de la SPA continúa. No pegues el token en ese comando ni lo envíes manualmente a ese dominio.

Este acceso de diagnóstico funciona en desarrollo y no añade código de prueba a la aplicación. getComponent obtiene la instancia del componente asociado al elemento: [documentación oficial de Angular](https://angular.dev/api/core/globals/getComponent). Los nombres service/http corresponden a las propiedades del código actual.

### I-02: backend detenido

1. Conserva la sesión de vendedor; sal a Inicio. Detén solo el backend desde su terminal o IDE; Oracle y el frontend siguen activos.
2. Abre Productos. Debe aparecer el mensaje de conexión y mantenerse el encabezado del usuario. Captura mensaje, URL y solicitud fallida.
3. Reinicia el backend con su configuración normal. Pulsa Reintentar en Productos y captura la recuperación. No fuerces la eliminación de sessionStorage: un error de red no es 401.

### I-03: token alterado en Ventas

1. Con login vigente, abre `/ventas`. En Session storage edita **solo un carácter al principio del tercer segmento del token**, después del segundo punto; conserva JSON y expiraEn.
2. Confirma y pulsa F5 estando en Ventas. El servicio debe restaurar el JSON válido y enviar el token alterado, no descartarlo por JSON roto.
3. GET ventas responde 401; login muestra Su sesión expiró y la URL contiene returnUrl=%2Fventas. Captura URL, aviso y respuesta 401, con JWT cubierto.
4. Haz login para continuar. Si la sesión se descartó sin emitir un GET, comprueba que no rompiste el JSON ni venció expiraEn y repite.

## 4. Guards y menú - G-01, G-02, M-01 y M-02

| Caso | Qué hacer | Resultado y captura |
|---|---|---|
| G-01 | Sin sesión, escribir por separado `/productos/1/editar`, `/ventas/nueva`, `/inicio`. | Login y returnUrl correcto en los tres. El producto 1 no necesita existir: el guard actúa antes de solicitarlo. |
| G-02 | Vendedor abre `/categorias/nuevo` y `/productos/1/editar`; almacén abre `/ventas/nueva`. | Acceso denegado en las tres rutas, conservando su respectiva sesión. |
| M-01 | Comparar admin, vendedor, almacen y supervisor en Productos. | ADMIN ve todos los módulos; vendedor ve catálogo en lectura, Clientes y Ventas; almacén solo Inicio/catálogo con escritura; supervisor combina vendedor y almacén sin Reportes. Mi cuenta está disponible en el encabezado de todos. Guarda cuatro capturas. |
| M-02 | En la misma pestaña, logout admin y login almacen sin F5. | Se retiran Clientes/Ventas/Reportes y cambian nombre, roles y controles. Captura los dos estados. |

## 5. E-01 - 403 real en una acción Angular

Un fetch prohibido demostraría el rechazo del backend, pero **no** la reacción del interceptor ni del componente Angular. Para este caso invoca la acción existente desde la consola de desarrollo, sin cambiar las plantillas:

1. Login como **vendedor**, con sus roles originales y sin CATALOGO_ESCRIBIR. Abre Productos.
2. Ejecuta este comando en Console. Selecciona un producto activo de la página sin asumir un id específico:

```javascript
var s11Sesion = JSON.parse(sessionStorage.getItem('pharmasoft.sesion'));
if (s11Sesion.username !== 'vendedor' || s11Sesion.permisos.includes('CATALOGO_ESCRIBIR')) {
  throw new Error('Esta prueba requiere vendedor sin permiso de escritura.');
}
var s11Lista = ng.getComponent(document.querySelector('app-producto-list'));
var s11Producto = s11Lista.productos().find(p => p.estado);
if (!s11Producto) throw new Error('No hay un producto activo visible para la prueba.');
s11Lista.darDeBaja(s11Producto);
```

3. Acepta la confirmación de esa acción de prueba. El backend seguro debe rechazar DELETE con **403** antes de modificar datos. La pantalla muestra No tiene permisos para realizar esta operación y mantiene vendedor autenticado.
4. Captura la alerta en Productos y el DELETE 403 de Network; confirma que el producto sigue activo. Si antes modificaste los roles del vendedor, restáuralos antes de este caso.

## 6. Aviso previo - B-01 a B-04

No se cambia la clave de firma y no se renueva el token desde Angular. Estos casos necesitan **un login nuevo** tras arrancar el backend con tres minutos.

1. Cierra sesión y detén el backend. Desde PharmaBackend, en la misma terminal PowerShell que usarás para arrancarlo:

```powershell
$s11aExpAnterior = $env:JWT_EXPIRACION_MINUTOS
$env:JWT_EXPIRACION_MINUTOS = '3'
./mvnw.cmd spring-boot:run
```

Si utilizas el IDE, configura temporalmente JWT_EXPIRACION_MINUTOS=3 en la ejecución de Spring y reiníciala. Una variable puesta en otra terminal no cambia el proceso ya iniciado.

2. Login vendedor y abre Productos. En la respuesta de login verifica **expiraEnSegundos: 180**. Oculta el JWT antes de guardar la captura.
3. **B-01:** al inicio no hay aviso. Tras aproximadamente un minuto, quedan dos minutos y aparece **02:00** encima del contenido. Captura antes y después. El umbral es tiempo restante, no dos minutos transcurridos.
4. **B-02:** captura el contador en dos momentos, por ejemplo 01:47 y 01:42. Network no debe mostrar otro POST login ni una renovación de token. Puedes comparar expiraEn antes/después sin mostrar el campo token.
5. **B-03:** pulsa ×. El aviso desaparece; navegar a Mi cuenta o hacer F5 antes del vencimiento no debe volver a mostrarlo. Sigue siendo la misma sesión y su vencimiento no cambia. Captura el estado oculto.
6. **B-04a:** vuelve a Productos antes de vencer y espera. Aunque ocultaste el aviso, al llegar a cero regresa a login con Su sesión expiró y returnUrl a Productos. Captura la pantalla y Session storage sin la clave. No hace falta un GET 401: el temporizador local cierra la sesión.
7. **B-04b:** vuelve a entrar. Regresa a Productos; esta es una sesión nueva y el aviso podrá mostrarse otra vez. Cuando aparezca, pulsa **Cerrar sesión ahora**. Debe limpiar la sesión y abrir login inmediatamente, sin esperar a cero. Captura el botón antes y el resultado después.
8. Restaura el backend: Ctrl+C en esa terminal y ejecuta:

```powershell
if ($null -eq $s11aExpAnterior) {
    Remove-Item Env:JWT_EXPIRACION_MINUTOS -ErrorAction SilentlyContinue
} else {
    $env:JWT_EXPIRACION_MINUTOS = $s11aExpAnterior
}
./mvnw.cmd spring-boot:run
```

Si utilizaste el IDE, restaura allí el valor original o retira el override. El perfil dev usa 60 por defecto. Login nuevo y confirma **expiraEnSegundos: 3600**. Si tu configuración original era otra, restablécela conscientemente; para la entrega se espera la duración normal de 60 minutos.

## 7. Mi cuenta - G-03, C-01 y C-02

| Caso | Qué hacer | Resultado y captura |
|---|---|---|
| G-03 propio | Sin sesión abrir /mi-cuenta; después entrar como almacén y abrirla desde el encabezado. | Sin sesión: login con returnUrl. Con ALMACENERO: GET auth/me 200 y perfil sin exigir permiso de módulo. |
| C-01 | Abrir Mi cuenta con los cuatro usuarios activos; inspeccionar respuesta auth/me y la pantalla. | Nombre, usuario, roles como etiquetas; Catálogo, Clientes, Ventas, Reportes y Usuarios con los ocho permisos marcados ✔/✘ conforme al servidor. |
| C-02 | En Network, clic derecho en auth/me > bloquear URL de solicitud. Pulsar Actualizar perfil. Luego quitar el bloqueo y Reintentar. | Carga y error visibles, sin logout ante el fallo de conexión. Al reintentar vuelve el perfil. Para capturar la carga, usa temporalmente Slow 3G y restaura luego No throttling. |

El backend devuelve empleadoNombre, adaptado por AuthService a nombreCompleto. No cambies el backend para hacer coincidir los nombres del ejemplo.

## 8. M-03 propio - cambio de permisos en el servidor

Haz este caso al final, con duración normal. Usa una pestaña A para vendedor y otra B para Swagger como admin. Mantén los tokens locales y ocultos en las capturas.

1. A: inicia como vendedor y abre Mi cuenta. Captura roles y permisos iniciales. No renueves esa sesión durante el cambio.
2. B: en Swagger autentícate como admin. GET usuarios identifica el id real de vendedor; GET roles identifica los ids reales de VENDEDOR y ALMACENERO. Anota el conjunto original de rolIds para restaurarlo; no asumas que siempre es [2].
3. B: PUT `/api/v1/usuarios/{idVendedor}/roles` con el conjunto original más ALMACENERO. Es una modificación temporal de prueba del usuario correcto, nunca del propio administrador.
4. A: pulsa Actualizar perfil. Debe mostrar el perfil actual del servidor y el aviso **Sus permisos cambiaron. Cierre sesión y vuelva a ingresar para actualizarlos.** El encabezado/menú conserva los permisos de su sesión anterior; no hay login nuevo ni token nuevo. Captura perfil, aviso y GET auth/me 200.
5. B: restaura exactamente el conjunto original de roles de vendedor mediante PUT. A: vuelve a Actualizar perfil. El aviso debe desaparecer si el conjunto coincide de nuevo. Captura la restauración.
6. Cierra sesión y entra otra vez para terminar con una sesión normal. No dejes permisos adicionales ni duración de tres minutos activados.

## Al terminar

- Entrega las capturas **ya sin tokens completos**. Si las tomaste con tokens visibles, ocúltalos con rectángulos opacos antes de conservar los archivos de evidencia de esta actividad.
- Conserva las respuestas necesarias de casos compuestos: L-02 son tres intentos, G-01/G-02 tres rutas cada uno, M-01 cuatro cuentas y B-04 dos formas de cierre.
- La matriz permanece pendiente hasta revisar los resultados; un rechazo esperado no se marca como fallo solo por ser 401/403.
- Después se prepara el informe de 2-3 páginas y las evidencias agrupadas. Los commits, push y PR los realizas personalmente.
