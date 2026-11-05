"""Build S11 documents from reviewed captures, preserving source metadata.

Sensitive regions are removed with native PDF image redactions, then rendered
at source resolution. Only the resulting safe copies enter final documents.
"""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from html import escape
from collections import Counter
import hashlib, json, shutil
import pymupdf as fitz
from PIL import Image as PILImage
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from preparar_matriz import CASES

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'docs/s11-autonoma'; DEST=WORK/'evidencias'; DEST.mkdir(exist_ok=True)
TMP=ROOT/'tmp/pdfs/s11a'; TMP.mkdir(parents=True,exist_ok=True)
NAVY=colors.HexColor('#12325b'); GOLD=colors.HexColor('#eda900')
for name,file in [('Arial','arial.ttf'),('ArialBold','arialbd.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='ArialBold',italic='Arial',boldItalic='ArialBold')
def style(size=9.5,bold=False,color=colors.black):
    return ParagraphStyle('text',fontName='ArialBold' if bold else 'Arial',fontSize=size,leading=size+3,spaceAfter=6,textColor=color,splitLongWords=True)
BODY=style(); SMALL=style(8); H1=style(18,True,NAVY); H2=style(12,True,NAVY)
def p(t,s=BODY): return Paragraph(t,s)
def table(rows,widths,size=7.5):
    cells=[[p(escape(str(v)),style(size,i==0,colors.white if i==0 else colors.black)) for v in row] for i,row in enumerate(rows)]
    t=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f8')]),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#bdc9d8')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
    return t
def frame(c,d):
    w,h=d.pagesize;c.setFillColor(NAVY);c.setFont('ArialBold',8)
    c.drawString(38,h-25,'LP II · Actividad autónoma · Sesión 11')
    c.setStrokeColor(GOLD);c.setLineWidth(1.5);c.line(38,h-32,w-38,h-32)
    c.setFillColor(colors.black);c.setFont('Arial',7)
    c.drawString(38,20,'Kevin Eduardo Del Carpio Alegría · 25 de octubre de 2026')
    c.drawRightString(w-38,20,str(d.page))
def build(path,story,size=A4):
    doc=SimpleDocTemplate(str(path),pagesize=size,leftMargin=38,rightMargin=38,topMargin=45,bottomMargin=36,title='PharmaSoft - Seguridad SPA S11',author='Kevin Eduardo Del Carpio Alegría')
    doc.build(story,onFirstPage=frame,onLaterPages=frame)
def logo():
    im=Image(str(ROOT/'docs/s8/assets/upeu-logo.png'),width=110,height=39.6);im.hAlign='CENTER';return im

# Index follows CreationTime, not filename sorting. Each item has a reviewed caption.
DATA=[]
def add(case,title,description): DATA.append((case,title,description))
for account in ['usuario inexistente','contraseña incorrecta de admin','cuenta inactiva']:
    add('L-02',f'Rechazo de {account}','POST auth/login responde 401; se conserva el usuario y se elimina la contraseña del formulario.')
    add('L-02',f'Credenciales de {account}','La petición permite identificar el intento de autenticación que se contrasta con el rechazo.')
    add('L-02',f'Mensaje para {account}','La respuesta mantiene el mismo mensaje genérico: Usuario o contraseña incorrectos.')
add('L-01','Formulario vacío','Los campos muestran mensajes obligatorios y Network permanece sin solicitudes de login.')
add('L-03','Preparación del doble envío','Formulario completo antes de comprobar el bloqueo de envíos simultáneos.')
add('L-03','Petición en curso','Ingresando... aparece deshabilitado mientras existe una única solicitud login pendiente.')
add('L-03','Login completado','Una petición POST login devuelve 200 y abre Inicio con la cuenta vendedor.')
add('L-04','Destino externo solicitado','La URL de login incluye returnUrl con un dominio externo de prueba.')
add('L-04','Destino interno seguro','Después del login la navegación termina en localhost:4200/inicio.')
add('L-05','Usuario con espacios finales','Se introduce vendedor con espacios al final; el cursor permite observar la separación.')
add('L-05','Identidad canónica','El login permite el acceso y devuelve username vendedor con duración normal de 3600 segundos.')
add('S-01','Catálogo con sesión','Productos se muestra con la identidad de vendedor antes de la recarga.')
add('S-01','Recarga de la aplicación','Después de F5 se conserva la identidad y las consultas vuelven a responder 200.')
add('S-01','Nueva ventana sin sesión','La nueva ventana de prueba presenta el login.')
add('S-02','Vencimiento local en el pasado','En sessionStorage se establece expiraEn: 1, manteniendo los demás datos de prueba.')
add('S-02','Sesión vencida descartada','Tras recargar aparece login y desaparece pharmasoft.sesion.')
add('S-03','Contenido que no es JSON','El valor de sesión se sustituye por HELLO, WORLD! para comprobar la recuperación ante datos dañados.')
add('S-03','Recuperación del almacenamiento inválido','La SPA muestra login y elimina el valor que no puede interpretar.')
add('S-04','Dos contextos con sesión','Ambas ventanas muestran Productos con vendedor autenticado.')
add('S-04','Logout independiente','Una ventana queda en login; la otra continúa navegando por Categorías con su propia sesión.')
add('S-05','JSON con estructura incorrecta','El JSON es válido, pero expiraEn contiene mañana en lugar de un número.')
add('S-05','Estructura inválida descartada','La recarga presenta login y limpia la entrada inválida de sessionStorage.')
add('I-01','Bearer en la API protegida','La consulta autenticada de Categorías contiene Authorization: Bearer y responde 200.')
add('I-01','Login sin Authorization','Los encabezados de POST auth/login no incluyen Authorization.')
add('I-01','Dominio externo sin Bearer','GET https://httpbin.org/get responde 200 sin Authorization entre los encabezados enviados.')
add('I-01','Petición externa desde Angular','La consola ejecuta HttpClient desde el componente y confirma que la petición externa terminó.')
add('I-02','Sesión antes de la interrupción','Inicio muestra al vendedor autenticado antes de detener el backend.')
add('I-02','Backend detenido','La consola del backend registra la detención de la aplicación.')
add('I-02','Error de conexión','Productos comunica la imposibilidad de conectar con el servidor y conserva la identidad del vendedor.')
add('I-02','Backend reiniciado','La aplicación backend vuelve a iniciar para recuperar las consultas.')
add('I-02','Recuperación de Productos','GET productos vuelve a responder 200; el catálogo está disponible y permanece el aviso independiente de Categorías.')
add('I-02','Recuperación completa del catálogo','Después de recuperar también Categorías, el listado queda sin avisos de conexión y conserva la sesión.')
add('I-03','Alteración del token','Se modifica la firma dentro de la sesión conservando el JSON y el vencimiento.')
add('I-03','Ventas rechaza el token','GET ventas/buscar responde 401 y la aplicación muestra Su sesión expiró.')
add('I-03','Respuesta de token inválido','El cuerpo del 401 identifica El token no es válido en /api/v1/ventas/buscar.')
add('I-03','Retorno a Ventas conservado','La URL del login conserva expirada=1 y returnUrl=%2Fventas.')
add('G-01','Preparación de rutas anónimas','Se preparan las tres rutas directas en ventanas privadas antes de observar las redirecciones.')
add('G-01','Edición requiere autenticación','La ruta de edición sin sesión redirige al login con su returnUrl.')
add('G-01','Nueva venta requiere autenticación','La ruta /ventas/nueva sin sesión redirige al login conservando el destino.')
add('G-01','Inicio requiere autenticación','La ruta /inicio sin sesión redirige al login con returnUrl correspondiente.')
add('G-02','Alta de categoría como vendedor','Se solicita /categorias/nuevo con una cuenta sin CATALOGO_ESCRIBIR.')
add('G-02','Categoría protegida por permiso','El guard muestra 403 · Acceso denegado dentro del layout del vendedor.')
add('G-02','Edición de producto como vendedor','Se solicita /productos/1/editar con la misma cuenta de lectura.')
add('G-02','Edición protegida por permiso','La navegación termina en Acceso denegado y conserva la sesión.')
add('G-02','Nueva venta como almacén','Se solicita /ventas/nueva con ALMACENERO, que no tiene VENTAS_REGISTRAR.')
add('G-02','Ventas protegida por permiso','Almacén recibe Acceso denegado y conserva su menú de catálogo.')
for account,desc in [('ADMIN','Menú completo, Reportes y controles de escritura del catálogo.'),('VENDEDOR','Catálogo de lectura, Clientes y Ventas; sin acciones de escritura de productos.'),('ALMACENERO','Inicio y catálogo editable; no aparecen Clientes, Ventas ni Reportes.'),('supervisor','La unión ALMACENERO y VENDEDOR permite editar catálogo y acceder a Ventas, sin Reportes.')]:
    add('M-01',f'Menú y acciones de {account}',desc)
add('M-02','Estado inicial ADMIN','La misma pestaña muestra el menú administrativo antes de cerrar la sesión.')
add('M-02','Cambio a ALMACENERO','Al entrar como almacén se retiran los módulos no permitidos y cambia la identidad sin F5.')
add('E-01','Acción Angular forzada','La consola invoca darDeBaja del componente y abre la confirmación sobre Alcohol 70%.')
add('E-01','403 comunicado en la SPA','El componente muestra No tienes permisos para realizar esta operación; el usuario continúa autenticado.')
add('E-01','Producto conservado y respuesta 403','La respuesta identifica /api/v1/productos/21 y status 403; Alcohol 70% sigue Activo con stock 25.')
add('B-01','Sesión de tres minutos','La respuesta de login indica expiraEnSegundos: 180 y todavía no se presenta el aviso.')
add('B-01','Aviso previo visible','El aviso aparece sobre Productos cuando quedan menos de dos minutos; la captura muestra 01:56.')
add('B-02','Cuenta regresiva en avance','El mismo aviso muestra 01:09, manteniendo la duración de emisión de 180 segundos.')
add('B-03','Aviso oculto','Después de pulsar × desaparece el aviso y Productos permanece disponible durante esa sesión.')
add('B-04','Cierre automático al vencer','La aplicación presenta login con aviso de expiración y sessionStorage sin pharmasoft.sesion.')
add('B-04','Aviso en una sesión nueva','Un nuevo login vuelve a habilitar el aviso y muestra el botón Cerrar sesión ahora.')
add('B-04','Cierre manual inmediato','Después del cierre manual aparece login sin aviso de expiración y el almacenamiento de sesión queda vacío.')
add('G-03','Mi cuenta sin sesión','La navegación anónima redirige al login con returnUrl=%2Fmi-cuenta.')
add('G-03','Mi cuenta para almacén','ALMACENERO accede a /mi-cuenta; GET auth/me responde 200 sin exigir permisos adicionales de módulo.')
add('C-01','Perfil ADMIN','El perfil administrativo muestra nombre, usuario, rol y los ocho permisos concedidos en cinco módulos.')
add('C-01','Perfil VENDEDOR','El perfil muestra permisos de lectura del catálogo, Clientes y Ventas; duración normal de 3600 segundos.')
add('C-01','Perfil supervisor','El perfil presenta ambos roles y la unión de permisos de Catálogo, Clientes y Ventas.')
add('C-02','Error al consultar Mi cuenta','Al bloquear auth/me aparece un mensaje de conexión y Reintentar; se mantiene la sesión de supervisor.')
add('C-02','Recuperación de Mi cuenta','Tras quitar el bloqueo, auth/me responde 200 y vuelven a mostrarse el perfil y sus permisos.')
add('M-03','Preparación de cuentas separadas','Se prepara la sesión vendedor y el acceso administrativo de Swagger en ventanas independientes.')
add('M-03','Estado inicial de la prueba','La SPA conserva vendedor; Swagger autentica al administrador para modificar roles en el servidor.')
add('M-03','Identificación del usuario','GET usuarios confirma vendedor con id 2 y su rol original VENDEDOR.')
add('M-03','Identificación de roles','GET roles identifica VENDEDOR id 2 y ALMACENERO id 3.')
add('M-03','Roles adicionales en el servidor','PUT usuarios/2/roles devuelve 200 con ambos roles; el perfil de la SPA todavía muestra su consulta anterior.')
add('M-03','Diferencia de permisos detectada','Actualizar perfil consulta auth/me con 200, muestra ambos roles y advierte que deben actualizarse mediante un nuevo ingreso; el encabezado conserva VENDEDOR.')
add('M-03','Roles originales restaurados','PUT usuarios/2/roles con [2] restaura VENDEDOR; el perfil aún conserva la respuesta previa hasta actualizar.')
add('M-03','Perfil sincronizado con la restauración','Después de actualizar, Mi cuenta vuelve a VENDEDOR y desaparece la advertencia de permisos cambiados.')
assert len(DATA)==83

# Rectangles are source-pixel coordinates, inspected on full-size captures.
MASKS={17:[(1610,350,1917,380)],21:[(1330,185,1715,212),(1280,675,1917,702)],23:[(1280,675,1917,702)],29:[(1398,620,1904,646),(1205,646,1904,742)],35:[(1430,640,1917,777)],37:[(1430,784,1917,922)],38:[(1430,784,1917,922)],39:[(1375,185,1917,216),(1280,678,1917,705)],40:[(1430,641,1917,781)],53:[(1545,325,1917,355)],54:[(1545,325,1917,355)],55:[(1545,328,1917,358)],56:[(1545,325,1917,355)],62:[(1460,426,1917,453)],63:[(1460,426,1917,453)],64:[(1460,423,1917,452)],65:[(1460,569,1917,598)],67:[(1460,433,1917,462)],72:[(1460,432,1917,459)],73:[(1460,425,1917,453)],77:[(1105,257,1858,325)],78:[(1170,219,1862,244)],79:[(1170,193,1862,218)],81:[(1036,954,1205,1018)]}

files=sorted(Path('C:/Users/DRIZA/Documents/UNI/Evidence').glob('*.png'),key=lambda f:(f.stat().st_birthtime,f.name))
assert len(files)==len(DATA), 'Inventory changed: review new captures before rebuilding.'
manifest=[]
for n,(f,(case,title,desc)) in enumerate(zip(files,DATA),1):
    target=DEST/f'{case}_{n:03}.png'
    with PILImage.open(f) as im: width,height=im.size
    masks=MASKS.get(n,[])
    if masks:
        doc=fitz.open();page=doc.new_page(width=width,height=height)
        page.insert_image(page.rect,filename=str(f))
        for rect in masks: page.add_redact_annot(fitz.Rect(rect),fill=(0,0,0))
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS)
        # Render removes underlying original image resources from the deliverable.
        page.get_pixmap(matrix=fitz.Matrix(1,1),alpha=False).save(str(target))
        doc.close()
    else: shutil.copy2(f,target)
    manifest.append(dict(numero=n,caso=case,titulo=title,descripcion=desc,archivo=target.name,original=str(f),creado=datetime.fromtimestamp(f.stat().st_birthtime,timezone(timedelta(hours=-5))).isoformat(),dimensiones=[width,height],sha256Original=hashlib.sha256(f.read_bytes()).hexdigest(),sha256Documento=hashlib.sha256(target.read_bytes()).hexdigest(),regionesOcultas=masks))
(WORK/'manifest-evidencias.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

RESULTS={
'L-01':('Dos validaciones obligatorias y Network sin solicitudes al enviar vacío.','E010'),
'L-02':('Los tres intentos responden 401 con el mismo mensaje; usuario conservado y contraseña borrada.','E001-E009'),
'L-03':('Una petición login; Ingresando... deshabilitado; respuesta 200 y acceso a Inicio.','E011-E013'),
'L-04':('El destino externo se descarta y el login termina en /inicio.','E014-E015'),
'L-05':('Acepta vendedor con espacios finales y devuelve username canónico vendedor.','E016-E017'),
'S-01':('F5 mantiene la identidad y consultas 200; la nueva ventana muestra login.','E018-E020'),
'S-02':('expiraEn: 1 se descarta al recargar; login y almacenamiento limpio.','E021-E022'),
'S-03':('Texto no JSON descartado; login operativo y entrada eliminada.','E023-E024'),
'S-04':('Logout en A; B continúa navegando con su sesión independiente.','E025-E026'),
'S-05':('expiraEn de tipo string se descarta; login sin romper la SPA.','E027-E028'),
'I-01':('Bearer en la API protegida; ausente en login y en HttpClient a httpbin.org.','E029-E032'),
'I-02':('Error de conexión sin logout; al reiniciar y reintentar se recuperan Productos y Categorías.','E033-E038'),
'I-03':('Ventas devuelve 401 por token inválido; login con aviso y returnUrl=/ventas.','E039-E042'),
'G-01':('Las tres rutas anónimas terminan en login con sus respectivos returnUrl.','E043-E046'),
'G-02':('Las tres rutas de escritura muestran Acceso denegado y conservan la identidad.','E047-E052'),
'G-03':('Anónimo vuelve a login; almacén consulta /mi-cuenta y auth/me responde 200.','E069-E070'),
'M-01':('Menú y acciones coinciden con ADMIN, VENDEDOR, ALMACENERO y la unión del supervisor.','E053-E056'),
'M-02':('De ADMIN a ALMACENERO cambia la identidad y desaparecen los módulos no concedidos.','E057-E058'),
'M-03':('Cambio [2,3] provoca aviso; encabezado conserva VENDEDOR; restaurar [2] y actualizar retira el aviso.','E076-E083'),
'E-01':('Dar de baja desde Angular devuelve 403; alerta visible, sesión conservada y producto 21 activo.','E059-E061'),
'B-01':('Login de 180 s; aviso visible con 01:56 restantes sobre Productos.','E062-E063'),
'B-02':('La misma sesión pasa de 01:56 a 01:09 sin un nuevo login en la secuencia.','E063-E064'),
'B-03':('× oculta el aviso y la pantalla Productos continúa disponible.','E064-E065'),
'B-04':('Vencimiento: login con aviso y storage vacío; nueva sesión: cierre manual inmediato sin aviso de expiración.','E066-E068'),
'C-01':('Perfiles por rol, nombres y permisos en cinco módulos; auth/me 200. Duración restaurada a 3600 s.','E070-E073'),
'C-02':('Bloqueo auth/me muestra error sin logout; al desbloquear se recupera perfil con 200.','E074-E075'),
}
cases=[]
for case,group,user,steps,expected in CASES:
    if case=='C-02': user='supervisor'
    if case=='L-05': user='vendedor con espacios finales';steps='Iniciar sesión con espacios al final del username';expected='Acceso válido; respuesta con username canónico vendedor'
    result,refs=RESULTS[case]
    cases.append([case,group,user,steps,expected,result,'Pasa',refs])
md=['# Matriz de seguridad SPA - S11','','Validación manual del 25 de octubre de 2026. 26 casos: 16 base, cuatro propios de grupos distintos, B-01 a B-04 y dos verificaciones de Mi cuenta. Los resultados describen las comprobaciones observadas.','','| ID | Grupo | Usuario | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia |','| --- | --- | --- | --- | --- | --- | --- | --- |']
for row in cases: md.append('| '+' | '.join(row)+' |')
md += ['','S-04: sessionStorage es independiente por pestaña. Cerrar sesión en A no revoca el JWT de B; una coordinación explícita mediante BroadcastChannel permitiría anunciar el logout a las demás pestañas.']
(ROOT/'docs/matriz-seguridad-spa-s11.md').write_text('\n'.join(md)+'\n',encoding='utf-8')

def figure(n,width,maxheight=None,caption=None):
    m=manifest[n-1];iw,ih=m['dimensiones'];scale=min(width/iw,(maxheight/ih) if maxheight else width/iw)
    im=Image(str(DEST/m['archivo']),width=iw*scale,height=ih*scale);im.hAlign='CENTER'
    return KeepTogether([im,Spacer(1,4)]+([p(caption,SMALL)] if caption else []))

counts=[['Grupo','Ejecutados','Pasa','Falla'],['Login',5,5,0],['Sesión',5,5,0],['Interceptores',3,3,0],['Guards',3,3,0],['Menú y acciones',3,3,0],['401 / 403',1,1,0],['Aviso de sesión',4,4,0],['Mi cuenta',2,2,0],['Total',26,26,0]]
story=[logo(),Spacer(1,8),p('Informe de seguridad del frontend',H1),p('PharmaSoft · SPA segura, aviso de expiración y Mi cuenta',H2),p('Kevin Eduardo Del Carpio Alegría · Lenguaje de Programación II · Ciclo IV · 2026-2',SMALL),p('C1. Resumen de ejecución',H2),p('La validación del 25 de octubre comprende 26 casos: los 16 base, cuatro propios de grupos distintos (L-05, S-05, G-03 y M-03), los cuatro del aviso previo y dos de Mi cuenta. Se contrastaron autenticación, sesión, solicitudes HTTP, navegación y permisos con el comportamiento esperado. Los rechazos 401 y 403 previstos se registran como Pasa.'),table(counts,[235,90,90,104],8),Spacer(1,8),p('El alcance utiliza las cuentas admin, vendedor, almacen, supervisor e inactivo. Las referencias E de la matriz identifican la secuencia de cada comprobación. La compilación de producción y las 137 pruebas automatizadas aprobadas complementan esta validación; no se cuentan como casos manuales.'),p('Aviso previo a la expiración',H2),p('AuthService.segundosRestantes se actualiza cada segundo; porVencer se activa con 120 segundos restantes o menos. AvisoSesion presenta mm:ss sobre el contenido con role="status". Las pruebas B usan un login de 180 s: se observa 01:56 y después 01:09; × oculta el aviso y el vencimiento sigue activo. Una sesión nueva vuelve a permitir el aviso y el cierre inmediato. No se renueva el token ni se prolonga expiraEn.'),figure(63,490,230,'Figura 1. B-01: aviso previo con 01:56 restantes y duración de emisión de 180 segundos. Referencia E063.'),PageBreak()]
story += [p('Perfil y resultados de seguridad',H1),p('Mi cuenta y cambios de permisos',H2),p('La ruta /mi-cuenta se carga con loadComponent dentro del layout, protegida por authGuard sin permisoGuard. AuthService.obtenerPerfil() consulta GET /api/v1/auth/me y adapta empleadoNombre al nombre mostrado. MiCuenta.cargar() gestiona carga, error y reintento. Los roles aparecen como etiquetas y los ocho permisos se distribuyen entre Catálogo, Clientes, Ventas, Reportes y Usuarios.'),p('C-01 contrasta los perfiles de los cuatro usuarios activos; C-02 bloquea auth/me, conserva la sesión y recupera el perfil al reintentar. G-03 confirma el acceso de almacén y la redirección anónima. En M-03, al añadir temporalmente ALMACENERO a vendedor, permisosCambiaron compara el servidor con la sesión anterior y muestra la advertencia; el menú y encabezado mantienen esa sesión. Restaurar VENDEDOR y actualizar el perfil elimina el aviso.'),figure(81,490,260,'Figura 2. M-03: el servidor devuelve ambos roles y Mi cuenta advierte del cambio; el encabezado mantiene VENDEDOR. Referencia E081.'),p('C2. Hallazgos de la validación',H2),p('No se observaron casos fallidos en los comportamientos registrados; por ello no corresponden fichas de defectos con severidad, causa y corrección. El error de conexión provocado en I-02, el 401 de I-03, los bloqueos de G-02 y el 403 de E-01 son resultados esperados. En I-02 se reintentan por separado Productos y Categorías hasta recuperar ambos listados.'),p('<b>Observación S-04.</b> Después de cerrar sesión en una pestaña, la otra mantiene su propia sesión y puede navegar. AuthService.cerrarSesion() elimina únicamente el sessionStorage de su contexto. Esta independencia es coherente con el almacenamiento elegido; en una computadora compartida puede dejar otra pestaña autenticada. Si se requiere logout coordinado, propondría emitir un mensaje con BroadcastChannel y hacer que cada pestaña ejecute cerrarSesion(), evitando depender del evento storage de sessionStorage entre pestañas.'),p('La duración normal se recupera tras las pruebas: C-01 muestra expiraEnSegundos: 3600. M-03 termina con vendedor restaurado al rol original y sin advertencia después de actualizar. Las evidencias del 403 también conservan Alcohol 70% activo y con stock 25.',SMALL),PageBreak()]
story += [p('C3. Análisis de seguridad',H1),p('1. Autorización efectiva en el backend',H2),p('El menú, la directiva y los guards orientan la navegación, pero el navegador está bajo control de quien lo utiliza. Es posible invocar el componente desde la consola o construir una petición aunque el botón esté oculto. En E-01 se llamó ProductoList.darDeBaja() desde Angular como vendedor: el servidor rechazó DELETE /api/v1/productos/21 con 403, la SPA mostró el mensaje y el producto siguió activo (E059-E061). La validación de permisos del backend impide que manipular la interfaz autorice una operación; *appSiPermiso y permisoGuard mejoran la experiencia, mientras el servidor decide el acceso a los datos.'),p('2. Almacenamiento del token en la botica',H2),p('sessionStorage permite conservar la sesión tras F5 y limita su persistencia al contexto de la pestaña; localStorage la mantiene entre aperturas y comparte el mismo origen entre pestañas, lo que aumenta la permanencia del acceso en equipos compartidos. Ambos son accesibles a JavaScript y un XSS podría extraer el token. Una cookie HttpOnly impide leerla desde JavaScript, aunque exige un diseño de autenticación mediante cookies, HTTPS, atributos Secure/SameSite y protección CSRF cuando corresponda. Para el backend Bearer actual mantendría sessionStorage, como implementa AuthService.leerSesionGuardada(), con vencimiento y logout explícito; para una evolución productiva elegiría una cookie HttpOnly con esos controles. S-04 demuestra la necesidad de considerar también otras pestañas abiertas.'),p('3. Diferencia entre 401 y 403',H2),p('errorInterceptor, en core/interceptors/error-interceptor.ts, cierra la sesión ante un 401 de la API protegida porque la credencial ya no permite autenticar la petición; excluye auth/login, donde el formulario debe comunicar credenciales incorrectas. I-03 evidencia ese cierre y el retorno a Ventas (E040-E042). Un 403 indica una operación no autorizada para una identidad reconocida: se propaga al componente sin limpiar la sesión, como muestra E-01. Invertirlos dejaría al usuario atrapado con una credencial inválida tras un 401 y lo expulsaría innecesariamente cada vez que intentara una acción sin permiso.'),p('4. Redirección abierta y returnUrl',H2),p('Una redirección abierta acepta un destino controlado por terceros y lleva al usuario a otro sitio después de autenticarse, facilitando el engaño. Login.destino(), en features/auth/pages/login/login.ts, acepta únicamente rutas que comienzan por / y rechaza // y barras invertidas; los demás valores caen en /inicio. L-04 solicita https://sitio-falso.com y termina en localhost:4200/inicio (E014-E015). Así se conserva el retorno a páginas internas, como /ventas, sin convertir el parámetro en una salida hacia un dominio externo.'),p('Conclusión',H2),p('Los resultados registrados son conformes con los casos de seguridad evaluados. La SPA avisa antes del vencimiento, limpia la sesión al expirar, diferencia autenticación de autorización y permite consultar el perfil vigente del servidor sin reemplazar silenciosamente la sesión. La matriz conserva los resultados de cada caso y las evidencias agrupadas permiten repetir su comprobación.')]
report=ROOT/'docs/informe-s11.pdf';build(report,story)
assert len(fitz.open(report))==3, 'Report must have 2-3 pages.'
shutil.copy2(report,ROOT/'docs/DelCarpio_LP2_S11_Autonoma.pdf')

groups={'Login':'Login y redirección segura','Sesión':'Sesión y almacenamiento','Interceptor':'Interceptores y conexión','Guards':'Rutas protegidas','Menú y acciones':'Menú, roles y cambios de permisos','401 / 403':'Autorización HTTP y conservación de sesión','Aviso de sesión':'Aviso previo y cierre de sesión','Mi cuenta':'Perfil y permisos por módulo'}
def group_for(case): return groups[next(c[1].split(' (')[0] for c in cases if c[0]==case)]
headers=['ID','Grupo','Usuario','Pasos','Resultado esperado','Resultado obtenido','Estado','Evidencia']
story=[logo(),Spacer(1,8),p('Matriz de pruebas y evidencias',H1),p('PharmaSoft · Seguridad de la SPA · Sesión 11',H2),p('26 casos manuales · 25 de octubre de 2026',SMALL)]
# Small chunks keep the full eight-column matrix legible and avoid dense pages.
for start,end in [(0,5),(5,10),(10,16),(16,20),(20,26)]:
    if start: story.append(PageBreak())
    story += [p(f'Matriz · {cases[start][0]} a {cases[end-1][0]}',H2),table([headers]+cases[start:end],[35,66,72,134,143,179,39,98],7.6)]
story.append(PageBreak());story += [p('Evidencias',H1)]
labels=list(groups.values())
categories=Table([[p('• '+labels[i],SMALL),p('• '+labels[i+4],SMALL)] for i in range(4)],colWidths=[382,382])
categories.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
story.append(categories)
ordered=[]
for group in groups.values(): ordered.extend(m for m in manifest if group_for(m['caso'])==group)
previous=None
for index,m in enumerate(ordered):
    if index:story.append(PageBreak())
    group=group_for(m['caso'])
    story += [p(group,H1 if previous!=group else H2),p(f"E{m['numero']:03} · {m['caso']} · {escape(m['titulo'])}",H2),p(escape(m['descripcion'])),figure(m['numero'],760,280 if index==0 else 400)]
    previous=group
companion=ROOT/'docs/DelCarpio_LP2_S11_Matriz_Evidencias.pdf';build(companion,story,landscape(A4))
validation={'fecha':'2026-10-25','casos':26,'pasa':26,'falla':0,'capturas':83,'paginasInforme':len(fitz.open(report)),'paginasMatrizEvidencias':len(fitz.open(companion)),'copiasConRegionesOcultas':len(MASKS),'originalesModificados':False,'commitsRealizados':False,'revisionVisual':'Pendiente'}
(WORK/'validacion-documentos.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(validation))
