"""Prepare manual cases without marking automatic checks as screenshot evidence."""
from pathlib import Path

CASES = [
('L-01','Login','Sin sesión','Enviar vacío; enviar solo username','Validaciones locales; cero peticiones de login'),
('L-02','Login','Inexistente, admin e inactivo','Enviar credenciales inválidas y cuenta inactiva','Mismo 401 y mensaje; password vacío y username conservado en los tres intentos'),
('L-03','Login','vendedor','Doble clic rápido en Ingresar con credenciales válidas','Una sola petición POST auth/login; botón deshabilitado mientras responde'),
('L-04','Login','vendedor','Abrir /login?returnUrl=https://sitio-falso.com e iniciar sesión','Destino /inicio; nunca un dominio externo'),
('L-05','Login (propio)',' VENDEDOR con espacios ','Login con username en mayúsculas y espacios exteriores','200; username canónico vendedor y acceso permitido'),
('S-01','Sesión','vendedor','Login; F5; cerrar la ventana de prueba y abrir una nueva sin restaurar pestañas','F5 conserva sesión; ventana nueva pide login'),
('S-02','Sesión','vendedor','Cambiar expiraEn a un instante pasado y F5','Sesión guardada descartada; login'),
('S-03','Sesión','vendedor','Reemplazar pharmasoft.sesion por texto no JSON y F5','Login sin excepción que rompa la SPA'),
('S-04','Sesión','vendedor en dos pestañas','Abrir sesión en ambas; logout en A; navegar en B','A queda sin sesión; B conserva su propia sesión; registrar y explicar independencia por pestaña'),
('S-05','Sesión (propio)','vendedor','Guardar JSON válido con expiraEn de tipo string y F5','Descarta estructura inválida; login sin fallo de la SPA'),
('I-01','Interceptor','vendedor','Inspeccionar GET productos, POST login y petición Angular a un dominio externo','Bearer solo en API protegida; sin Authorization en login ni dominio externo'),
('I-02','Interceptor','vendedor','Detener backend; abrir Productos; reiniciar backend','Error de conexión, no logout; al reintentar carga el catálogo'),
('I-03','Interceptor','vendedor','Alterar firma del JWT en storage; F5 en /ventas','GET ventas 401; login con Su sesión expiró y returnUrl=/ventas'),
('G-01','Guards','Sin sesión','Abrir /productos/1/editar, /ventas/nueva e /inicio','Login con returnUrl correcto en cada ruta'),
('G-02','Guards','vendedor y almacen','Vendedor abre /categorias/nuevo y /productos/1/editar; almacén /ventas/nueva','Acceso denegado en los tres; sesión conservada'),
('G-03','Guards (propio)','Sin sesión y almacen','Abrir /mi-cuenta sin sesión y luego con ALMACENERO','Sin sesión: login con returnUrl; autenticado: perfil 200 sin permiso de módulo adicional'),
('M-01','Menú y acciones','admin, vendedor, almacen, supervisor','Comparar menú, encabezado y controles del catálogo','ADMIN completo; vendedor lectura/ventas/clientes; almacén catálogo editable; supervisor unión sin reportes'),
('M-02','Menú y acciones','admin -> almacen','Cerrar sesión y entrar como almacén en la misma pestaña, sin F5','Menú y controles cambian reactivamente'),
('M-03','Menú y acciones (propio)','vendedor y admin','Modificar roles desde Swagger; actualizar Mi cuenta con sesión anterior; restaurar roles','Perfil refleja servidor y muestra Sus permisos cambiaron; sesión y token no se sobrescriben'),
('E-01','401 / 403','vendedor','Invocar darDeBaja desde Angular en desarrollo, aunque el control esté oculto','DELETE 403; mensaje del backend en la SPA; sesión continúa y producto no se modifica'),
('B-01','Aviso de sesión','vendedor; JWT de 3 minutos','Login nuevo y esperar a que queden 120 segundos','Aviso fijo sobre contenido con role=status y 02:00; aparece aproximadamente al minuto de iniciar'),
('B-02','Aviso de sesión','Misma sesión','Observar contador en dos instantes','mm:ss decrece cada segundo sin renovar JWT ni modificar expiraEn'),
('B-03','Aviso de sesión','Misma sesión','Pulsar ×; navegar y F5 antes de vencer','Aviso oculto en esa sesión, contador sigue; nuevo login permite mostrarlo otra vez'),
('B-04','Aviso de sesión','JWT de 3 minutos','Esperar cero; volver a entrar; en nueva sesión usar Cerrar sesión ahora','Cero: login con aviso y returnUrl; cierre manual inmediato limpia sesión y temporizadores'),
('C-01','Mi cuenta','Cuatro usuarios activos','Abrir Mi cuenta e inspeccionar GET auth/me y los cinco módulos','200; nombre, username, roles y ocho permisos marcados según respuesta del servidor'),
('C-02','Mi cuenta','vendedor','Bloquear solo auth/me; Actualizar perfil; desbloquear y Reintentar','Estados de carga/error visibles; conserva sesión ante fallo de conexión y recupera perfil'),
]

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[2]
    target = root / 'docs/matriz-seguridad-spa-s11.md'
    assert not target.exists(), 'Do not overwrite recorded manual results.'
    lines = ['# Matriz de seguridad SPA - S11', '',
             '26 casos: 16 base, cuatro propios de grupos distintos (L-05, S-05, G-03, M-03), B-01 a B-04 y dos verificaciones de Mi cuenta. Resultados manuales pendientes; no se sustituyen con las pruebas automatizadas.', '',
             '| ID | Grupo | Usuario | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia |',
             '| --- | --- | --- | --- | --- | --- | --- | --- |']
    for row in CASES:
        lines.append('| ' + ' | '.join(row + ('Pendiente de ejecución manual', 'Pendiente', 'Pendiente')) + ' |')
    target.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'{len(CASES)} manual cases prepared; no API calls made.')
