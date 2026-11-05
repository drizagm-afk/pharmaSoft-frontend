# Sesión 11 - resultados de validación manual

| Caso | Comprobación | Resultado obtenido | Estado | Evidencia |
| --- | --- | --- | --- | --- |
| 01 | URL /ventas sin sesión | Login con returnUrl=%2Fventas. | Pasa | E01 |
| 02 | Formulario vacío | Dos mensajes obligatorios y ninguna petición de login. | Pasa | E02 |
| 03 | Contraseña incorrecta de admin | 401 y mensaje genérico; permanece en login. | Pasa | E03 |
| 04 | Login de cuenta inactiva | 401 con el mismo mensaje de credenciales. | Pasa | E04-E05 |
| 05 | Login de vendedor | 200; vuelve a Ventas con nombre, rol y expiración. | Pasa | E06-E07 |
| 06 | Token en peticiones | GET productos 200 con Authorization Bearer; login separado del envío del token. | Pasa | E06, E08-E09 |
| 07 | Session storage | pharmasoft.sesion con token, expiraEn y permisos; sin password. | Pasa | E10 |
| 08 | Recarga F5 en Productos | Conserva sesión y página; consultas del catálogo 200. | Pasa | E11 |
| 09 | Catálogo del vendedor | Sin Nuevo producto ni Acciones; categorías también en lectura. | Pasa | E12-E13 |
| 10 | Ruta /productos/nuevo | Acceso denegado dentro del layout; conserva la sesión. | Pasa | E14-E15 |
| 11 | Visitar /login con sesión | Redirección a /inicio. | Pasa | E16 |
| 12 | Cerrar sesión | Login y eliminación de pharmasoft.sesion. | Pasa | E17 |
| 13 | Cuenta ALMACENERO | Ventas oculta y URL directa denegada; catálogo editable. | Pasa | E18-E20 |
| 14 | Cuenta supervisor | Unión de roles: Ventas y edición del catálogo. | Pasa | E21 |
| 15 | Alterar JWT y recargar | 401; aviso de expiración y returnUrl a Productos. | Pasa | E22-E24 |
| 16 | Duración JWT de un minuto | Login con duración 60 s; cierre automático y retorno al login. Sesión posterior en Productos. | Pasa | E25-E27 |
