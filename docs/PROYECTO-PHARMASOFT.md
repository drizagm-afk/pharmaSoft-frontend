# PharmaSoft: documentación general del proyecto

Actualizado: 29 de octubre de 2026. Resumen del código de PharmaFrontend y PharmaBackend, incluyendo sus funcionalidades anteriores y las ampliaciones de seguridad.

## 1. Propósito y arquitectura

PharmaSoft es una aplicación para gestionar el catálogo, los clientes y las ventas de una botica. Permite consultar existencias, registrar ventas, revisar comprobantes y analizar las ventas por categoría, con acceso según los permisos del trabajador.

El flujo general es **navegador → SPA Angular → API REST Spring Boot → Oracle**. Son dos proyectos independientes: PharmaFrontend presenta la interfaz y PharmaBackend aplica las reglas de negocio, la autorización y la persistencia. Ambos intercambian DTOs JSON mediante `/api/v1`.

| Capa | Tecnologías y organización |
| --- | --- |
| Frontend | Angular 22, TypeScript 6, RxJS, componentes standalone, signals/computed, formularios reactivos y rutas con carga diferida. |
| Backend | Java 25, Spring Boot 4.0.7, Spring MVC, Spring Data JPA, Bean Validation, Spring Security, JJWT y Lombok; compilación con Maven Wrapper. |
| Base de datos | Oracle, controlador JDBC, entidades JPA y migraciones Flyway. Hibernate valida el esquema con `ddl-auto: validate`. |
| Verificación | Vitest en frontend; JUnit y pruebas de integración con Spring Boot/H2 u Oracle en backend; Swagger, Postman y matrices manuales. |

## 2. Funcionalidades

| Módulo | Funciones implementadas |
| --- | --- |
| Inicio y navegación | Layout con encabezado, menú lateral reactivo, identidad del usuario, roles, vencimiento y cierre de sesión; páginas de acceso denegado y ruta inexistente. |
| Categorías | Listar, buscar en la interfaz, consultar, crear, editar y eliminar; acceso a los productos de una categoría. Una categoría con productos asociados no puede eliminarse; puede desactivarse mediante edición. |
| Productos | Listado paginado y ordenable, filtro por categoría sobre los datos de la página cargada, creación, edición y baja lógica. Muestra categoría, precio, stock y estado. |
| Clientes | Listado paginado y ordenable, alta, edición y baja lógica; datos de identificación, contacto y estado. |
| Registro de ventas | Selección de cliente y productos disponibles, búsqueda y selección con teclado, cantidades, acumulación de productos repetidos, subtotales, total y confirmación antes de guardar. Comprueba disponibilidad y evita envíos simultáneos. |
| Consulta de ventas | Filtros por cliente, estado y fechas, paginación, detalle de cada venta e impresión del comprobante o de la consulta mediante el navegador. Puede abrir la impresión después de registrar. |
| Reportes | Pantalla de ventas por categoría con rango de fechas, unidades, importes, totales y comparación visual. El backend ofrece además productos más vendidos. Ambos reportes consideran ventas REGISTRADAS. |
| Mi cuenta | Perfil obtenido del servidor, nombre, username, etiquetas de roles y ocho permisos agrupados en cinco módulos; carga, error, reintento y aviso cuando los permisos difieren de los de la sesión. |
| Administración de cuentas | API para listar y crear usuarios, consultar empleados y roles, reemplazar roles, activar/desactivar cuentas y cambiar la contraseña propia. Estas operaciones se utilizan desde la API/Swagger; no existe una pantalla administrativa equivalente en la SPA actual. |

## 3. Reglas de negocio y validaciones

- Formularios y DTOs validan campos obligatorios, longitudes, formatos y valores numéricos. El backend rechaza entradas inválidas aunque se evite la validación del navegador.
- Se comprueban nombres repetidos al crear categorías y productos; clientes con DNI o correo duplicado se rechazan también al editar, excluyendo al propio registro. Se normalizan los datos de entrada según cada servicio.
- Productos y clientes se desactivan sin borrar su historial. La eliminación física de categorías está condicionada por sus productos asociados.
- Una venta requiere cliente activo y productos activos con stock suficiente. El servidor toma el precio vigente del producto y calcula subtotales y total con `BigDecimal`; no confía en un total enviado desde la interfaz.
- El registro de venta es transaccional: guarda cabecera y detalles y descuenta stock como una unidad. El descuento condicionado impide existencias negativas; los productos se procesan en un orden consistente para reducir conflictos concurrentes. Un error revierte la operación completa.
- Las búsquedas validan el rango de fechas y la paginación: página desde cero, tamaño entre 1 y 100, campos de orden permitidos y dirección `asc`/`desc`, con desempate por ID.
- Las cuentas se vinculan a empleados y roles existentes. La administración impide desactivar la cuenta propia o retirarse el rol ADMIN; las contraseñas se validan y almacenan con BCrypt.

Las ventas admiten los estados REGISTRADA y ANULADA para consulta y reportes. La API actual no expone una operación para anular ventas desde la aplicación.

## 4. Seguridad de extremo a extremo

El login emite un JWT Bearer firmado y una duración de sesión. Spring Security trabaja sin sesión HTTP de servidor; el filtro valida el token y consulta el usuario y sus permisos actuales en cada petición. Desactivar una cuenta o modificar sus roles afecta la autorización del backend aunque exista un token emitido anteriormente.

| Cuenta de demostración | Alcance por roles |
| --- | --- |
| `admin` / ADMIN | Catálogo, clientes, ventas, reportes y administración de usuarios. |
| `vendedor` / VENDEDOR | Lectura del catálogo, gestión de clientes y consulta/registro de ventas. |
| `almacen` / ALMACENERO | Lectura y escritura del catálogo. |
| `supervisor` / VENDEDOR + ALMACENERO | Unión de los permisos de vendedor y almacén. |
| `inactivo` | Login rechazado. |

Los ocho permisos son `CATALOGO_LEER`, `CATALOGO_ESCRIBIR`, `CLIENTES_LEER`, `CLIENTES_ESCRIBIR`, `VENTAS_LEER`, `VENTAS_REGISTRAR`, `REPORTES_VER` y `USUARIOS_ADMINISTRAR`. Su correspondencia con los roles está definida en el código del backend; los roles y sus asignaciones a usuarios se guardan en Oracle.

En Angular, `AuthService` conserva la sesión en un signal y en `sessionStorage`: F5 la recupera y los datos vencidos, corruptos o con estructura incorrecta se descartan. El almacenamiento es independiente por pestaña. El aviso aparece cuando quedan 120 segundos o menos, muestra `mm:ss`, permite ocultarlo durante esa sesión o cerrarla inmediatamente, y limpia sus temporizadores al finalizar. No renueva el token.

`authInterceptor` agrega Bearer solamente a la API protegida, excluyendo login y dominios externos. `errorInterceptor` cierra una sesión ante un 401 de la API protegida y conserva la ruta de retorno; un 403 o un fallo de conexión no la elimina. Los guards protegen rutas y `*appSiPermiso` controla acciones visibles. El menú reacciona al cambio de sesión sin F5. El login valida `returnUrl` para aceptar destinos internos y evitar redirecciones externas.

Mi cuenta usa `/auth/me` sin exigir un permiso de módulo adicional. Si el servidor devuelve permisos diferentes, muestra la advertencia de volver a ingresar sin reemplazar silenciosamente el token ni los permisos guardados. CORS define los orígenes permitidos y admite las solicitudes de preflight. El backend mantiene la autorización efectiva aunque se fuerce una acción oculta en la SPA.

## 5. Base de datos

| Tablas | Relaciones principales |
| --- | --- |
| `categorias`, `productos` | Una categoría agrupa varios productos; cada producto tiene precio, stock y estado. |
| `clientes`, `ventas`, `detalle_ventas` | Un cliente tiene varias ventas; cada venta tiene detalles que referencian productos y conservan cantidad, precio y subtotal. |
| `empleados`, `usuarios` | Una cuenta se asocia a un empleado; username y empleado asignado tienen restricciones de unicidad. |
| `roles`, `usuario_roles` | Relación de varios roles por usuario, con claves foráneas y clave compuesta en la tabla de unión. |

Flyway mantiene el historial del esquema: `V1__esquema_ventas.sql` crea el modelo comercial en un esquema nuevo y `V2__seguridad.sql` incorpora empleados, usuarios, roles y cuentas de demostración. El perfil dev permite establecer una baseline en versión 1 para esquemas anteriores. Los scripts de `docs/s9/` aportan datos comerciales de prueba; son independientes de las migraciones.

## 6. API principal

Base local: `http://localhost:8080/api/v1`.

| Recurso | Operaciones |
| --- | --- |
| `/auth/login`, `/auth/me`, `/auth/password` | POST de autenticación, GET del perfil actual y PUT de cambio de contraseña propia. |
| `/categorias`, `/productos`, `/clientes` | GET de listados y `/{id}`; POST de alta; PUT `/{id}` de edición; DELETE `/{id}` según las reglas de eliminación o baja. Productos y clientes tienen listados paginados. |
| `/ventas`, `/ventas/{id}`, `/ventas/buscar` | POST de registro, GET de listado/detalle y GET de búsqueda paginada con filtros. |
| `/reportes/ventas-por-categoria`, `/reportes/productos-mas-vendidos` | GET de agregaciones con fechas opcionales; requieren `REPORTES_VER`. |
| `/usuarios`, `/empleados`, `/roles` | GET de consultas administrativas y POST `/usuarios` para crear cuentas. |
| `/usuarios/{id}/roles`, `/usuarios/{id}/estado` | PUT de reemplazo de roles y PATCH de activación/desactivación. |
| `/health` | Comprobación pública de disponibilidad; también existe `/api/health`. |

Las respuestas paginadas contienen `contenido`, `pagina`, `tamanio`, `totalElementos`, `totalPaginas` y `ultima`. Los errores se unifican mediante `timestamp`, `status`, `error`, `message`, `path` y `validationErrors`: 400 para entrada inválida, 401 para autenticación, 403 para permisos, 404 para recursos inexistentes y 409 para conflictos de negocio.

## 7. Ubicación del código

En **PharmaFrontend**, `src/app/core/` reúne autenticación, interceptores, guards y configuración del menú; `layout/` contiene encabezado, barra lateral y layout principal; `features/` organiza auth, inicio, categorías, productos, clientes, ventas y reportes; `shared/` contiene componentes, directivas y páginas reutilizables. `src/environments/` define la URL de la API. Los servicios HTTP adaptan los contratos del servidor cuando es necesario.

En **PharmaBackend**, bajo `src/main/java/com/edu/upeu/PharmaBackend/`, `controller/` expone HTTP, `service/` aplica reglas y transacciones, `repository/` consulta datos, `entity/` representa las tablas, `dto/` define contratos, `mapper/` transforma entidades, `security/` valida identidad y tokens y `exception/` unifica errores. `config/` configura seguridad, CORS y OpenAPI; `src/main/resources/` contiene perfiles y migraciones.

## 8. Ejecución y comprobación

Se necesita JDK 25, Node.js compatible con Angular 22 y Oracle accesible. Desde la carpeta de **PharmaBackend**, ejecutar `./mvnw.cmd spring-boot:run`; desde **PharmaFrontend**, instalar dependencias con `npm ci` y ejecutar `npm start`. Abrir `http://localhost:4200`; Swagger de desarrollo está en `http://localhost:8080/swagger-ui/index.html`.

El perfil dev del backend usa por defecto Oracle en `localhost:1522/FREEPDB1`, puerto HTTP 8080 y JWT de 60 minutos. El perfil prod obtiene `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` y `CORS_ALLOWED_ORIGINS` del entorno, desactiva Swagger y usa 30 minutos como duración predeterminada. `JWT_EXPIRACION_MINUTOS` permite configurar la duración. Las dos configuraciones de entorno del frontend apuntan actualmente a la API local.

Para verificar el frontend: `npm run build` y `npm test -- --watch=false`. Para las pruebas habituales del backend: `./mvnw.cmd test`. Las integraciones contra Oracle se habilitan expresamente con `./mvnw.cmd "-Dpharma.integration=true" test` y requieren la base de pruebas preparada; algunas comprueban operaciones de escritura. Las pruebas cubren reglas comerciales, JWT, permisos, navegación, formularios, errores y temporizadores. Los informes, matrices, evidencias y colecciones Postman disponibles en `docs/` y `postman/` complementan las pruebas automatizadas de ambos proyectos.

Este archivo resume la implementación inspeccionada; no representa una nueva ejecución de pruebas ni una comprobación del contenido actual de la base de datos.
