# Sesión 11 - cómo funciona la seguridad del frontend

## Qué quedó terminado

La rama actual es `feature/seguridad-frontend-delcarpio`. Se conservó el trabajo iniciado y se completaron las conexiones entre sesión, navegación y permisos. Clientes y Reportes, que ya existían antes de copiar el ejemplo, vuelven a estar disponibles con sus permisos. No se realizaron commits ni cambios en el backend o los datos comerciales.

## El recorrido de una petición

1. **Login** usa un formulario reactivo. Los campos vacíos muestran errores sin llamar al servidor. `AuthService.login` envía usuario y contraseña una sola vez mientras está pendiente la respuesta. Un 401 se muestra en el formulario y limpia la contraseña.
2. **AuthService** transforma la respuesta en una sesión: token, perfil, roles, permisos y `expiraEn = Date.now() + expiraEnSegundos * 1000`. Nunca guarda la contraseña. El signal es el estado usado por la pantalla; `sessionStorage` permite recuperar ese estado tras F5.
3. **Restauración y temporizador**: al arrancar se descarta JSON dañado, datos incompletos o sesiones vencidas. Para una sesión válida se programa el cierre al llegar a `expiraEn`. Cerrar sesión limpia el signal, el almacenamiento y el temporizador.
4. **authInterceptor** clona cada petición de la API para añadir `Authorization: Bearer ...`. No adjunta el token al login ni a servidores externos. La comparación comprueba el origen y el límite de la ruta; `/api/v1-other` no cuenta como `/api/v1`.
5. **Backend** valida el JWT y los permisos. Si devuelve 401 en una petición protegida con sesión, `errorInterceptor` la cierra y conserva la URL para volver después. Un 401 del login o de otro servidor no dispara ese cierre. Un 403 se propaga al componente y conserva la sesión.
6. **Guards**: `authGuard` protege el layout y sus hijos; `invitadoGuard` evita abrir login cuando ya hay un token vigente; `permisoGuard` lee `data.permiso`. No solo se protegen los listados: las rutas nuevo/editar exigen escritura.
7. **Menú y botones**: `computed` filtra el menú. `*appSiPermiso` crea o retira elementos al cambiar el signal. Es necesario importar `SiPermiso` en cada componente que la utiliza y escribir `menu()` al leer el signal en HTML.

Ocultar un botón y bloquear una ruta mejora la experiencia; el backend sigue decidiendo si permite la operación. Cambiar la información del navegador no concede permisos en Oracle.

## Ejemplo concreto: vendedor en Productos

El vendedor tiene `CATALOGO_LEER`, pero no `CATALOGO_ESCRIBIR`. Puede abrir el listado y filtrar. No aparece Nuevo ni Acciones. Si escribe `/productos/nuevo`, el guard lo lleva a Acceso denegado antes de cargar el formulario. Conserva su sesión. En cambio, un JWT alterado llega al backend, produce 401 y hace volver al login con el aviso de sesión expirada.

## Cambios principales sobre lo que estaba copiado

- Sidebar: `menu()` y no `menu`.
- Productos: importación de la directiva que ya aparecía en HTML.
- Categorías: directiva en alta/edición/eliminación y guards en rutas de escritura. Ver productos queda disponible como lectura.
- Ventas: Nueva venta depende de `VENTAS_REGISTRAR`.
- Clientes y Reportes: rutas y opciones restauradas y protegidas; escritura de clientes diferenciada de lectura.
- Sesión guardada: validación de estructura completa y cancelación del temporizador al destruir el servicio.
- Interceptores: límite real de URL de API, exclusión del login y conservación de sesión ante 403.
- Login: evita solicitudes duplicadas y rechaza destinos externos o con barras invertidas.
- Encabezado y layout: se evita que nombres largos y tablas ensanchen toda la página.

## Verificación realizada

- Compilación de producción aprobada.
- 120 pruebas aprobadas en 30 archivos. Incluyen almacenamiento/expiración, JSON dañado, interceptores, 401/403, URL externa o con prefijo parecido, redirects seguros, navegación protegida, permisos reactivos y regresión de módulos existentes.
- Verificación real desde navegador con el backend en ejecución: login incorrecto, cuenta inactiva, vendedor y retorno a Ventas, Productos en lectura, F5, bloqueo de creación, login de invitado, logout, almacén sin Ventas y con edición, supervisor con unión de permisos y administrador con Reportes.
- No se alteraron tokens guardados del usuario ni la duración del backend para estas comprobaciones. Las pruebas automatizadas usan HTTP simulado; los logins del navegador solo autentican y las consultas no cambian datos comerciales.

La secuencia de las 16 pruebas y sus capturas está en `guia-validacion-manual.md`. Los cuatro commits para ejecutar personalmente están en `commits.md`. El PDF final se prepara después de esas capturas.
