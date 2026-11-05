"""Session 11 practical report: original screenshots ordered by creation metadata."""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from html import escape
import hashlib, json, shutil
from PIL import Image as PILImage
from pypdf import PdfReader, PdfWriter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'docs/s11-practica'; DEST=WORK/'evidencias'; DEST.mkdir(exist_ok=True)
TMP=ROOT/'tmp/pdfs/s11'; TMP.mkdir(parents=True,exist_ok=True)
NAVY=colors.HexColor('#12325b'); GOLD=colors.HexColor('#eda900')
for name,file in [('Arial','arial.ttf'),('ArialBold','arialbd.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='ArialBold',italic='Arial',boldItalic='ArialBold')
def st(size=9.5,bold=False,color=colors.black):
 return ParagraphStyle('text',fontName='ArialBold' if bold else 'Arial',fontSize=size,leading=size+3,spaceAfter=7,textColor=color)
BODY=st();SMALL=st(8);H1=st(18,True,NAVY);H2=st(12,True,NAVY)
def p(text,style=BODY):return Paragraph(text,style)
def table(rows,widths,size=8):
 cells=[[p(escape(str(v)),st(size,i==0,colors.white if i==0 else colors.black)) for v in row] for i,row in enumerate(rows)]
 t=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f8')]),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#bdc9d8')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
 return t
def frame(offset=0):
 def draw(c,d):
  w,h=d.pagesize;c.setFillColor(NAVY);c.setFont('ArialBold',8)
  c.drawString(38,h-25,'LP II · Guía práctica · Sesión 11')
  c.setStrokeColor(GOLD);c.setLineWidth(1.5);c.line(38,h-32,w-38,h-32)
  c.setFillColor(colors.black);c.setFont('Arial',7)
  c.drawString(38,20,'Kevin Eduardo Del Carpio Alegría · 22 de octubre de 2026')
  c.drawRightString(w-38,20,str(d.page+offset))
 return draw
def build(path,story,size=A4,offset=0):
 doc=SimpleDocTemplate(str(path),pagesize=size,leftMargin=38,rightMargin=38,topMargin=45,bottomMargin=36,title='PharmaSoft - Seguridad frontend S11',author='Kevin Eduardo Del Carpio Alegría')
 doc.build(story,onFirstPage=frame(offset),onLaterPages=frame(offset))

# group, case, title, description, matched to creation-time sequence.
DATA=[
('Acceso y formulario','01','Ruta protegida sin sesión','La URL de Ventas redirige al login con returnUrl=%2Fventas. El formulario aparece fuera del layout privado.'),
('Acceso y formulario','02','Validación de campos obligatorios','Usuario y contraseña vacíos muestran sus mensajes; Network permanece sin solicitudes de login.'),
('Acceso y formulario','03','Contraseña incorrecta','POST auth/login devuelve 401; el formulario muestra Usuario o contraseña incorrectos y conserva el login.'),
('Acceso y formulario','04','Cuenta inactiva','Login de inactivo devuelve 401 y el mismo mensaje genérico de credenciales.'),
('Acceso y formulario','04','Cuenta inactiva: comprobación adicional','Se confirma el rechazo 401 sin revelar al usuario que la cuenta existe o está deshabilitada.'),
('Sesión y peticiones HTTP','05','Login y retorno a Ventas','Login 200; se abre Consulta de ventas y el encabezado identifica a Lucia Ramos Cutipa, VENDEDOR, con su hora de expiración.'),
('Sesión y peticiones HTTP','05','Respuesta de autenticación','La respuesta de login incluye token, expiración, nombre, roles y permisos del vendedor.'),
('Sesión y peticiones HTTP','06','Consulta autenticada del catálogo','GET productos devuelve 200 desde la SPA con sesión iniciada.'),
('Sesión y peticiones HTTP','06','Encabezado Authorization','El GET productos muestra Authorization: Bearer seguido del JWT en Request Headers.'),
('Sesión y peticiones HTTP','07','Sesión almacenada en el navegador','Session storage contiene pharmasoft.sesion y sus datos de perfil, permisos y token. No contiene la contraseña de acceso.'),
('Sesión y peticiones HTTP','08','Persistencia después de F5','Productos se mantiene con la cuenta del vendedor; las consultas del catálogo vuelven a responder 200 después de recargar.'),
('Permisos y rutas protegidas','09','Productos en modo lectura','VENDEDOR ve el catálogo completo sin Nuevo producto ni columna Acciones.'),
('Permisos y rutas protegidas','09','Categorías en modo lectura','El vendedor conserva Ver productos, pero no tiene controles para crear, editar o eliminar categorías.'),
('Permisos y rutas protegidas','10','Creación bloqueada por el guard','La navegación sin CATALOGO_ESCRIBIR termina en /acceso-denegado, con título 403 · Acceso denegado y sesión vigente.'),
('Permisos y rutas protegidas','10','Bloqueo de ruta y sesión conservada','El mensaje de acceso denegado se presenta dentro del layout del vendedor. Es una decisión del guard, no un error HTTP del formulario de alta.'),
('Permisos y rutas protegidas','11','Login inaccesible con sesión iniciada','invitadoGuard lleva a /inicio; el encabezado y el menú permanecen asociados al vendedor.'),
('Cierre de sesión y roles','12','Logout y eliminación del almacenamiento','La aplicación vuelve al login y Session storage ya no contiene pharmasoft.sesion.'),
('Cierre de sesión y roles','13','Almacén no puede acceder a Ventas','ALMACENERO no tiene Ventas en el menú y la navegación directa muestra Acceso denegado sin cerrar la sesión.'),
('Cierre de sesión y roles','13','Menú de almacén','El menú de Pedro Quispe Mamani contiene Inicio, Categorías y Productos; no expone Clientes, Ventas ni Reportes.'),
('Cierre de sesión y roles','13','Catálogo editable para almacén','La cuenta ALMACENERO muestra Nuevo producto, Editar y Dar de baja. La comprobación no ejecuta esas operaciones.'),
('Cierre de sesión y roles','14','Supervisor con unión de permisos','Ana Torres Vilca presenta ALMACENERO y VENDEDOR: Ventas aparece en el menú y el catálogo muestra controles de edición.'),
('Integridad del token y manejo de 401','15','Sesión antes de alterar el token','La sesión de supervisor se inspecciona en Session storage antes de modificar el JWT.'),
('Integridad del token y manejo de 401','15','Edición controlada del token','Se edita el token dentro del JSON de pharmasoft.sesion, manteniendo los demás datos de la sesión.'),
('Integridad del token y manejo de 401','15','Rechazo del token alterado','GET categorías responde 401 tras la recarga; la SPA vuelve al login con expirada=1, returnUrl a Productos y el aviso Su sesión expiró.'),
('Expiración automática y retorno','16','Emisión de un token de un minuto','Login de vendedor devuelve expiraEnSegundos: 60. Productos permanece disponible antes de que venza el temporizador.'),
('Expiración automática y retorno','16','Cierre automático al vencer','La SPA vuelve al login con el aviso de expiración y returnUrl=%2Fproductos. Se conserva la respuesta de login con duración 60 segundos.'),
('Autorización HTTP adicional','AD','Reporte prohibido sin cerrar sesión','Una consulta GET al reporte con fetch devuelve 403 y el mensaje No tiene permisos para realizar esta operación; el vendedor sigue en Productos. La petición usa fetch y no atraviesa los interceptores de Angular.'),
]
files=sorted(Path('C:/Users/DRIZA/Documents/UNI/Evidence').glob('*.png'),key=lambda f:(f.stat().st_birthtime,f.name))
assert len(files)==len(DATA)==27
manifest=[]
for n,(f,(group,case,title,description)) in enumerate(zip(files,DATA),1):
 target=DEST/f'S11-{case}_{n:02}.png';shutil.copy2(f,target)
 with PILImage.open(f) as im: dimensions=list(im.size)
 manifest.append(dict(numero=n,grupo=group,caso=case,titulo=title,descripcion=description,archivo=target.name,original=str(f),creado=datetime.fromtimestamp(f.stat().st_birthtime,timezone(timedelta(hours=-5))).isoformat(),dimensiones=dimensions,sha256=hashlib.sha256(f.read_bytes()).hexdigest()))
(WORK/'manifest-evidencias.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def figure(n,width,caption=None):
 m=manifest[n-1];iw,ih=m['dimensiones']
 im=Image(str(DEST/m['archivo']),width=width,height=width*ih/iw);im.hAlign='CENTER'
 return KeepTogether([im,Spacer(1,5)]+([p(caption,SMALL)] if caption else []))

logo=Image(str(ROOT/'docs/s8/assets/upeu-logo.png'),width=110,height=39.6);logo.hAlign='CENTER'
story=[logo,Spacer(1,10),p('Seguridad frontend en PharmaSoft',H1),p('Login, sesión, interceptores, guards y permisos',H2),p('Kevin Eduardo Del Carpio Alegría · Lenguaje de Programación II · Ciclo IV · 2026-2',SMALL),p('1. Objetivo y alcance',H2),p('Integrar la SPA Angular 22 con PharmaBackend seguro mediante autenticación JWT, persistencia temporal de sesión, vencimiento automático y autorización por permisos. La verificación sigue los 16 casos de la sesión 11: formulario, rutas, envío de token, F5, menú, controles por rol, cierre de sesión, token alterado y expiración.'),p('La pantalla de login queda fuera del layout privado. Después de entrar, el encabezado muestra nombre, roles y hora de expiración. VENDEDOR usa el catálogo en lectura y consulta Ventas; ALMACENERO mantiene el catálogo sin acceder a Ventas; supervisor combina ambos conjuntos de permisos. Clientes y Reportes conservan sus rutas con CLIENTES_LEER y REPORTES_VER.'),figure(21,470,'Figura 1. Supervisor: ambos roles en el encabezado, Ventas en el menú y acciones de edición del catálogo.'),p('El criterio de éxito es que cada operación coincida con su regla. Un rechazo esperado de 401 o 403 demuestra que la restricción se aplica; no representa un fallo de la prueba.',SMALL),p('2. Flujo de autenticación',H2),p('El formulario valida los campos antes de enviar POST /api/v1/auth/login. AuthService guarda token, expiraEn, nombre, roles y permisos en un signal y en sessionStorage; la contraseña solo se envía para autenticar y no forma parte de la sesión almacenada. El login devuelve a la ruta interna indicada en returnUrl y descarta destinos externos.'),PageBreak()]
story.extend([p('Sesión, navegación y errores',H1),p('3. Componentes de la solución',H2),p('<b>AuthService.</b> Calcula expiraEn con la duración recibida, recupera la sesión tras F5 y descarta datos dañados o vencidos. Un temporizador limpia signal y sessionStorage al llegar al vencimiento; la navegación al login incorpora expirada=1 y la página actual como returnUrl. El cierre manual también cancela el temporizador.'),p('<b>Interceptores.</b> authInterceptor añade Authorization: Bearer únicamente a la API, comprobando origen y límite de ruta, y excluye auth/login. errorInterceptor cierra una sesión ante un 401 de la API protegida, sin convertir un 401 de credenciales en una redirección. Un 403 se propaga al componente y conserva la sesión.'),p('<b>Guards.</b> authGuard protege el layout y sus hijos; invitadoGuard impide volver al login con sesión vigente. permisoGuard usa data.permiso y presenta Acceso denegado. Las rutas de alta y edición exigen escritura además de los permisos del listado.'),p('<b>Interfaz reactiva.</b> Sidebar filtra MENU con computed. La directiva *appSiPermiso incorpora o retira botones y columnas según los permisos del signal. Nuevo/Editar/Eliminar en categorías y productos requieren CATALOGO_ESCRIBIR; Nueva venta requiere VENTAS_REGISTRAR. El backend mantiene la protección efectiva aunque alguien modifique el navegador.'),figure(24,470,'Figura 2. JWT alterado: respuesta 401, cierre de sesión y retorno al login conservando la ruta de Productos.'),p('4. Diferencia entre 401 y 403',H2),p('El caso 15 prueba el rechazo HTTP de un JWT alterado y la reacción del interceptor. El caso 10 prueba un bloqueo de navegación del guard antes de abrir el formulario. La consulta adicional de reportes devuelve 403 por falta de REPORTES_VER y conserva la pantalla del vendedor. Esa consulta se ejecuta con fetch; el comportamiento de errorInterceptor ante 403 se verifica además en la prueba automatizada de HttpClient.'),p('La compilación de producción terminó correctamente y la regresión ejecutó 120 pruebas aprobadas en 30 archivos. Estos resultados automatizados complementan las comprobaciones manuales; no se cuentan como casos adicionales de la guía.',SMALL),PageBreak()])
cases=[
('01','URL /ventas sin sesión','Login con returnUrl=%2Fventas.','E01'),
('02','Formulario vacío','Dos mensajes obligatorios y ninguna petición de login.','E02'),
('03','Contraseña incorrecta de admin','401 y mensaje genérico; permanece en login.','E03'),
('04','Login de cuenta inactiva','401 con el mismo mensaje de credenciales.','E04-E05'),
('05','Login de vendedor','200; vuelve a Ventas con nombre, rol y expiración.','E06-E07'),
('06','Token en peticiones','GET productos 200 con Authorization Bearer; login separado del envío del token.','E06, E08-E09'),
('07','Session storage','pharmasoft.sesion con token, expiraEn y permisos; sin password.','E10'),
('08','Recarga F5 en Productos','Conserva sesión y página; consultas del catálogo 200.','E11'),
('09','Catálogo del vendedor','Sin Nuevo producto ni Acciones; categorías también en lectura.','E12-E13'),
('10','Ruta /productos/nuevo','Acceso denegado dentro del layout; conserva la sesión.','E14-E15'),
('11','Visitar /login con sesión','Redirección a /inicio.','E16'),
('12','Cerrar sesión','Login y eliminación de pharmasoft.sesion.','E17'),
('13','Cuenta ALMACENERO','Ventas oculta y URL directa denegada; catálogo editable.','E18-E20'),
('14','Cuenta supervisor','Unión de roles: Ventas y edición del catálogo.','E21'),
('15','Alterar JWT y recargar','401; aviso de expiración y returnUrl a Productos.','E22-E24'),
('16','Duración JWT de un minuto','Login con duración 60 s; cierre automático y retorno al login. Sesión posterior en Productos.','E25-E27'),
]
story.extend([p('Resultados de las 16 pruebas',H1),p('Los 16 casos presentan resultados conformes con las reglas comprobadas. Las referencias E enlazan cada caso con las figuras agrupadas de las páginas siguientes. Las vistas adicionales de lectura y del reporte 403 amplían la evidencia sin aumentar el número de casos base.',SMALL),table([['Caso','Comprobación','Resultado obtenido - Pasa','Evidencia']]+cases,[34,112,278,83],7.7),Spacer(1,10)])
groups=list(dict.fromkeys(m['grupo'] for m in manifest))
story.append(p('Conclusión',H2))
story.append(p('La SPA aplica autenticación, persistencia temporal y vencimiento de sesión, protege la navegación y adapta sus acciones a los permisos. El token alterado provoca cierre con 401, mientras que un acceso no autorizado conserva la identidad y se comunica como 403. Las restricciones del frontend se complementan con la validación del backend.'))
story.append(p('Evidencias',H1))
for group in groups:story.append(p('• '+group,SMALL))
build(TMP/'contenido.pdf',story)
offset=len(PdfReader(TMP/'contenido.pdf').pages)
story=[]
previous=None
for m in manifest:
 if story:story.append(PageBreak())
 # The grouping headings change only at an aspect boundary; case captions remain per capture.
 story.extend([p(m['grupo'],H1 if m['grupo']!=previous else H2),p(f"E{m['numero']:02} · Caso {m['caso']} · {escape(m['titulo'])}",H2),p(escape(m['descripcion'])),figure(m['numero'],740)])
 previous=m['grupo']
build(TMP/'evidencias.pdf',story,landscape(A4),offset)
writer=PdfWriter();writer.append(TMP/'contenido.pdf');writer.append(TMP/'evidencias.pdf')
writer.add_metadata({'/Title':'PharmaSoft - Seguridad frontend - Práctica S11','/Author':'Kevin Eduardo Del Carpio Alegría'})
final=ROOT/'docs/DelCarpio_LP2_S11_Practica.pdf'
with final.open('wb') as f:writer.write(f)
rows=['# Sesión 11 - resultados de validación manual','', '| Caso | Comprobación | Resultado obtenido | Estado | Evidencia |','| --- | --- | --- | --- | --- |']
rows += ['| '+' | '.join([n,title,result,'Pasa',refs])+' |' for n,title,result,refs in cases]
(WORK/'resultados-manuales.md').write_text('\n'.join(rows)+'\n',encoding='utf-8')
print(json.dumps({'pages':len(PdfReader(final).pages),'contentPages':offset,'captures':len(manifest),'cases':len(cases),'bytes':final.stat().st_size}))
