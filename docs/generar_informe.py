from pathlib import Path
from xml.sax.saxutils import escape
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
NAVY = colors.HexColor('#12325b')
BODY = ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#203047'))
SMALL = ParagraphStyle('small', parent=BODY, fontSize=8, leading=10)
TITLE = ParagraphStyle('title', parent=BODY, fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=NAVY)
SUB = ParagraphStyle('sub', parent=BODY, fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=NAVY)

class Report:
    def __init__(self, path, pagesize=A4):
        self.c = canvas.Canvas(str(path), pagesize=pagesize)
        self.c.setTitle('PharmaSoft - Arquitectura y evidencias - Del Carpio')
        self.c.setAuthor('Del Carpio')
        self.w, self.h = pagesize
        self.page = 0
    def new(self, title):
        if self.page: self.c.showPage()
        self.page += 1
        self.c.setFillColor(NAVY)
        self.c.rect(0, self.h-43, self.w, 43, fill=1, stroke=0)
        self.c.setFillColor(colors.white)
        self.c.setFont('Helvetica-Bold', 10)
        self.c.drawString(35, self.h-27, 'PHARMASOFT  /  LP II - SESIÓN 7  /  DEL CARPIO')
        self.c.setFillColor(NAVY)
        self.c.setFont('Helvetica', 8)
        self.c.drawString(35, 22, 'Código y capturas del proyecto propio | 03 de octubre de 2026 (Lima)')
        self.c.drawRightString(self.w-35, 22, str(self.page))
        self.y = self.h-62
        self.text(title, TITLE)
    def text(self, text, style=BODY):
        p = Paragraph(text, style)
        _, height = p.wrap(self.w-70, self.y-45)
        if self.y-height < 42: raise ValueError(f'Overflow page {self.page}: {text[:50]}')
        p.drawOn(self.c, 35, self.y-height)
        self.y -= height+9
    def table(self, rows, widths):
        data = [[Paragraph(escape(str(v)), SMALL) for v in row] for row in rows]
        t = Table(data, colWidths=widths)
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6edf6')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),0.3,colors.HexColor('#cbd5e1')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
        _, height = t.wrap(self.w-70, self.h)
        if self.y-height < 42: raise ValueError(f'Table overflow page {self.page}')
        t.drawOn(self.c,35,self.y-height)
        self.y -= height+12
    def code(self, text):
        self.text('<font face="Courier" size="8">'+escape(text).replace('\n','<br/>').replace(' ','&#160;')+'</font>', SMALL)
    def save(self): self.c.save()

r = Report(DOCS/'informe-arquitectura.pdf')
r.new('Informe técnico de arquitectura de la SPA')
r.text('Módulo Clientes integrado a PharmaSoft. Autor: Del Carpio. Rama de trabajo: <b>feature/clientes-delcarpio</b>. El informe explica el código actual; el anexo independiente conserva las capturas originales de los once casos A7.', SMALL)
r.text('B1. Estructura del proyecto', SUB)
r.code('src/app/\n  core/\n    config/menu.ts\n    models/{error-response,pagina-response}.ts\n    utils/http-error.ts\n  shared/pages/no-encontrado/\n  layout/{main-layout,header,sidebar}/\n  features/\n    inicio/\n    categorias/\n      models/  services/  pages/{categoria-list,categoria-form}/\n      categorias.routes.ts\n    clientes/\n      models/  services/  pages/{cliente-list,cliente-form}/\n      clientes.routes.ts\n  app.ts  app.config.ts  app.routes.ts')
r.text('Árbol resumido de carpetas reales: se omiten estilos, plantillas y pruebas para facilitar la lectura. <b>core</b> concentra configuración, contratos y utilidades transversales; <b>shared</b> aloja presentación reutilizable, actualmente la página 404; <b>layout</b> compone la estructura persistente; <b>features</b> agrupa cada dominio con sus modelos, servicio, páginas y rutas. Clientes reproduce la organización de Categorías.', SMALL)
r.text('B2. Mapa completo de rutas', SUB)
r.table([['URL','Componente / padre','Carga','Título'],['/','Redirección bajo MainLayout','redirectTo inicio','Hereda Inicio'],['/inicio','Inicio / MainLayout','loadComponent','Inicio'],['/categorias','CategoriaList / MainLayout','loadChildren del feature','Categorías'],['/categorias/nuevo','CategoriaForm / MainLayout','Dentro del feature diferido','Nueva categoría'],['/categorias/:id/editar','CategoriaForm / MainLayout','Dentro del feature diferido','Editar categoría'],['/clientes','ClienteList / MainLayout','loadChildren del feature','Clientes'],['/clientes/nuevo','ClienteForm / MainLayout','Dentro del feature diferido','Nuevo cliente'],['/clientes/:id/editar','ClienteForm / MainLayout','Dentro del feature diferido','Editar cliente'],['/**','NoEncontrado / sin layout padre','loadComponent','Página no encontrada']],[133,155,130,107])
r.text('Fuentes: src/app/app.routes.ts:4-33; features/clientes/clientes.routes.ts:5-9; features/categorias/categorias.routes.ts:5-9. Los componentes de cada feature se importan en su archivo de rutas; no se difieren individualmente.', SMALL)

r.new('B3. Separación de responsabilidades')
r.table([['Pieza / tipo','Responsabilidad','Qué no hace'],['ClienteService / servicio','Concentra cinco operaciones HTTP; HttpParams y Observables tipados.','No dibuja alertas, valida formularios ni navega.'],['ClienteList / componente','Signals de página, tamaño, orden y estados; filtro computed; confirmación y recarga tras baja.','No construye URLs ni llama HttpClient directamente.'],['ClienteForm / componente','Validadores, carga por ID, normalización de opcionales, creación/edición y navegación.','No consulta Oracle ni decide unicidad de DNI/correo.'],['CategoriaService / servicio','CRUD tipado sobre environment.apiUrl/categorias.','No conserva estado visual ni presenta errores.'],['CategoriaList / componente','Carga y filtro local, estados de pantalla y eliminación con mensaje contextual.','No implementa transporte HTTP ni reglas de integridad SQL.'],['CategoriaForm / componente','Formulario reactivo, precarga, validación y guardar/navegar.','No persiste directamente ni gestiona rutas globales.'],['MainLayout / componente','Compone Header, Sidebar y router-outlet; alterna menú colapsado.','No contiene CRUD ni solicitudes de datos del dominio.'],['Header / componente','Identidad visual, enlaces superiores y evento toggleMenu.','No carga clientes ni define opciones del sidebar.'],['Sidebar / componente','Renderiza MENU con RouterLink y RouterLinkActive.','No define endpoints ni administra permisos de backend.']],[125,204,196])
r.text('Evidencia del código', SUB)
r.code('ClienteService (services/cliente-service.ts:8-19):\n  private readonly http = inject(HttpClient);\n  private readonly url = `${environment.apiUrl}/clientes`;\n  return this.http.get<PaginaResponse<Cliente>>(this.url, { params });\n\nClienteList (pages/cliente-list/cliente-list.ts:29-34):\n  const texto = this.filtro().trim().toLowerCase();\n  return (this.respuesta()?.contenido ?? []).filter(c => ...);\n\nMainLayout (layout/main-layout/main-layout.html:2-5):\n  <app-header ... (toggleMenu)="alternarMenu()" />\n  <app-sidebar ... />\n  <main ...><router-outlet /></main>')
r.text('Las rutas de archivos de los fragments se resuelven desde src/app/features/clientes y src/app respectivamente. Categorías usa el mismo patrón de servicio/página, con un arreglo simple; Clientes adapta la presentación a PaginaResponse&lt;Cliente&gt; y a la baja lógica.', SMALL)

r.new('B4. Flujo de Registrar cliente')
r.text('Recorrido verificado en ClienteForm.guardar(), ClienteService.crear() y ClienteList.cargar(). Los números remiten al código propio, no a una implementación propuesta.', BODY)
r.table([['Paso','Operación y estado'],['1. Clic Registrar','ngSubmit llama guardar(); ClienteForm limpia espacios y valida. Si es inválido, marca campos touched y no envía HTTP.'],['2. DTO y signal','telefono/direccion vacíos se convierten en null; guardando.set(true) evita envíos duplicados.'],['3. Servicio y HTTP','ClienteService.crear(dto) devuelve Observable<Cliente>; HttpClient envía POST /api/v1/clientes.'],['4. Backend','Controller valida DTO; servicio comprueba unicidad y guarda mediante repository/JPA en Oracle.'],['5a. Respuesta 201','Callback next navega a /clientes; finalize devuelve guardando a false.'],['6a. Nueva lista','ClienteList.ngOnInit llama cargar(); GET paginado 200; respuesta.set(datos), pagina.set(datos.pagina), cargando=false; la tabla muestra contenido.'],['5b. Respuesta 409','Callback error conserva el formulario y fija error.set(mensajeError(err)); finalize devuelve guardando a false. No navega ni crea una nueva fila.']],[115,410])
r.text('Diagrama de secuencia', SUB)
r.code('Registrar\n    |\nClienteForm.guardar() -- inválido --> campos touched / sin POST\n    | válido: DTO + guardando=true\nClienteService.crear(dto)\n    | POST /api/v1/clientes\nPharmaBackend -> ClienteServiceImpl -> JPA -> Oracle\n    |\n    +-- 201 --> next -> Router /clientes\n    |                  -> ClienteList -> GET 200\n    |                  -> respuesta.set(datos) -> tabla\n    |\n    +-- 409 --> error.set(mensajeError(err)) -> alerta en formulario\n\nEn ambas respuestas: finalize -> guardando=false')
r.text('Fuentes: features/clientes/pages/cliente-form/cliente-form.ts:62-79; services/cliente-service.ts:26-28; pages/cliente-list/cliente-list.ts:37-59. Backend: ClienteServiceImpl.create comprueba DNI/correo antes de guardar. Las capturas A5 y A6 muestran respectivamente POST 201 y POST 409.', SMALL)

r.new('B5. Revisión de decisiones (1-4)')
r.text('1. Archivos existentes modificados', SUB)
r.text('La integración del feature modifica <b>dos archivos existentes</b>: src/app/app.routes.ts:15-19 agrega la entrada diferida y src/app/core/config/menu.ts:10 agrega Clientes. PaginaResponse, las páginas, modelos, servicio, rutas y pruebas de Clientes son archivos nuevos; app.routes.spec.ts también es nuevo. Este conteo corresponde a la integración frontend de Clientes, no a reparaciones anteriores de Categorías ni a cambios del backend. El reducido número de puntos de integración muestra que el dominio está encapsulado.')
r.text('2. Listado sin HttpClient directo', SUB)
r.text('ClienteList inyecta ClienteService (cliente-list.ts:18) y usa listar() en la línea 42; el servicio concentra HttpClient y la URL (cliente-service.ts:8-10). Si cambia el host o prefijo común, se ajusta environment.apiUrl; si cambia el recurso o contrato, se adapta el servicio/modelo. El listado conserva su responsabilidad visual y no repite configuración HTTP.')
r.text('3. Ventaja y verificación de loadChildren', SUB)
r.text('app.routes.ts:17-18 usa import() para cargar CLIENTES_ROUTES al entrar al dominio. Sus páginas quedan fuera del punto de entrada inicial de rutas y en el chunk diferido del feature. No implica un chunk independiente por cada formulario. La compilación npm run build terminó correctamente y produjo esta línea real:')
r.code('chunk-5ZZDPHEZ.js | clientes-routes | 13.77 kB | 4.27 kB')
r.text('La última columna es el tamaño estimado de transferencia; el hash puede variar en futuras compilaciones. El output separa explícitamente Initial chunk files y Lazy chunk files.', SMALL)
r.text('4. Persistencia del encabezado y sidebar', SUB)
r.text('Categorías y Clientes son hijos del mismo MainLayout (app.routes.ts:6-24). Header y Sidebar están fuera del router-outlet interno (main-layout.html:2-5), así que el cambio entre esos hijos sustituye la página del dominio y conserva las instancias del layout. Esto no significa ausencia total de detección de cambios: RouterLinkActive actualiza el resaltado. La ruta global 404 queda fuera del layout. app.routes.spec.ts verifica la navegación integrada y la persistencia del shell.')

r.new('B5. Revisión de decisiones (5-7) y entrega')
r.text('5. Visibilidad de Clientes según usuario', SUB)
r.text('El punto central para declarar permisos o roles del menú sería src/app/core/config/menu.ts:1-11. Sidebar consume ese arreglo (layout/sidebar/sidebar.ts:3,12), evitando duplicar opciones en plantillas. Actualmente no existe filtrado por usuario: habría que extender MenuItem y derivar el menú visible desde un servicio de sesión. Una vez implementado ese mecanismo, cambiar la política de una opción bastaría en MENU. Ocultar el enlace no autoriza ni bloquea el acceso; guardas de ruta y backend deben aplicar el permiso real.')
r.text('6. Duplicación y posible reutilización', SUB)
r.text('CategoriaService y ClienteService repiten obtener/crear/actualizar/eliminar (categoria-service.ts:18-31; cliente-service.ts:22-36). Los listados repiten carga, error, confirmación y filtro; los formularios repiten guardar y navegar (categoria-form.ts:48-68; cliente-form.ts:62-79). Se puede extraer un adaptador CRUD genérico para las operaciones comunes y componentes pequeños de alerta/estado de carga. Conviene mantener la paginación y la baja lógica en Clientes, evitando que una abstracción imponga comportamiento incorrecto a Categorías.')
r.text('7. Alcance de búsqueda y alternativa global', SUB)
r.text('El computed filtra solamente respuesta().contenido (cliente-list.ts:29-34), es decir, la página que ya llegó por GET. No consulta registros de otras páginas y no genera HTTP al escribir. Para búsqueda global, el backend debe aceptar un parámetro q y filtrar antes de paginar/contar; ClienteService.listar debe añadir q a HttpParams (cliente-service.ts:12-18). El listado debe volver a página 0, consultar con debounce/cancelación y usar los totales del resultado filtrado. La evidencia A8 muestra el filtro local sin solicitudes.')
r.text('Estado de validación y entrega', SUB)
r.text('Compilación production verificada: exit 0. Revisión final: 45 pruebas aprobadas en 14 archivos (ng test --watch=false). Capturas A1-A11 reunidas en docs/evidencias y en <b>anexo-evidencias.pdf</b>. A7 registra teléfono 987654323 para ID 43. A9-A10 muestran 204/200/409 y fila Inactivo; no muestran Method ni Headers completos, limitación conservada en el anexo.', SMALL)
r.text('El informe técnico de cinco páginas queda en docs/informe-arquitectura.pdf. DelCarpio_LP2_S7_Autonoma.pdf reúne ese informe y el anexo de 16 páginas para subir un solo archivo al aula (21 páginas con anexos). El anexo también se conserva por separado. El usuario indicó que el docente eximió distribuir commits en días distintos; no se alteran fechas ni se inventa historial.', SMALL)
r.text('<b>PR hacia develop: pendiente de crear.</b> Su enlace deberá incorporarse a esta sección después del paso de versionamiento. Este documento no afirma que ya se hayan realizado tres commits, publicado la rama o entregado al aula.', SMALL)
r.save()

e = Report(DOCS/'anexo-evidencias.pdf', landscape(A4))
cases = [
('A1. Listado inicial - GET 200', ['01-clientes-network.png']),
('A2. Página 2, tamaño 5 - GET 200', ['02-paginacion-network.png']),
('A3. Orden descendente por apellidos', ['03-orden-desc-network.png']),
('A3. Orden ascendente por apellidos', ['03-orden-asc-network.png']),
('A4. DNI inválido - sin solicitud', ['04-dni-invalido-network.png']),
('A5. Registro sin opcionales - POST 201', ['05-opcionales-network-headers.png']),
('A5. Payload - teléfono y dirección null', ['05-opcionales-network-payload.png']),
('A6. DNI duplicado - POST 409', ['06-duplicado-network.png']),
('A7. Formulario precargado - GET 200', ['07-edicion-network-get.png']),
('A7. Teléfono actualizado - PUT 200', ['07-edicion-telefono-network-put.png']),
('A7. Payload con teléfono de nueve dígitos', ['07-edicion-telefono-network-payload.png']),
('A8. Búsqueda por DNI - sin solicitudes', ['08-busqueda-dni-network.png']),
('A8. Búsqueda por apellido - sin solicitudes', ['08-busqueda-apellido-network.png']),
('A9-A10. Baja y baja repetida - 204 / 200 / 409', ['09-10-baja-network.png']),
('A10. Mensaje de cliente ya inactivo', ['10-baja-repetida.png']),
('A11. Categorías continúa funcionando - GET 200', ['11-categorias-network.png']),
]
for title, files in cases:
    e.new(title)
    name=files[0]
    e.text('Captura original aportada por el usuario: docs/evidencias/'+name, SMALL)
    if title.startswith('A9'):
        e.text('Se ven respuestas 204, 200 y 409 para el flujo descrito, la fila Inactivo y el mensaje de baja repetida. La columna Method y los Headers de cada solicitud no están abiertos.', SMALL)
    img=ImageReader(str(DOCS/'evidencias'/name))
    iw,ih=img.getSize()
    scale=min((e.w-70)/iw,(e.y-45)/ih)
    w,h=iw*scale,ih*scale
    e.c.drawImage(img,(e.w-w)/2,e.y-h,width=w,height=h)
e.save()
writer = PdfWriter()
for filename in ['informe-arquitectura.pdf', 'anexo-evidencias.pdf']:
    writer.append(PdfReader(DOCS/filename))
writer.add_metadata({'/Title': 'Del Carpio - LP2 S7 - Informe y evidencias'})
with (DOCS/'DelCarpio_LP2_S7_Autonoma.pdf').open('wb') as output:
    writer.write(output)
print('Created 5-page report, 16-page appendix and 21-page combined submission.')
