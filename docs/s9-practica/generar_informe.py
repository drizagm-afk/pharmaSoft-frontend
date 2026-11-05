"""Build the practical S9 report with all supplied evidence grouped by aspect."""
from pathlib import Path
from io import BytesIO
from html import escape
import json,hashlib,shutil
from PIL import Image as PILImage
from pypdf import PdfReader,PdfWriter,Transformation
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,Image,PageBreak,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib import colors

ROOT=Path(__file__).resolve().parents[2];SOURCE=Path(r'C:/Users/DRIZA/Documents/UNI/Evidence')
DEST=ROOT/'docs/s9-practica/evidencias';DEST.mkdir(parents=True,exist_ok=True)
NAVY=colors.HexColor('#12325b');GOLD=colors.HexColor('#eda900');NAME='Kevin Eduardo Del Carpio Alegría'
pdfmetrics.registerFont(TTFont('PArial',r'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('PArialBold',r'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('PArial',normal='PArial',bold='PArialBold',italic='PArial',boldItalic='PArialBold')
def st(size=9,bold=False,color=colors.black):return ParagraphStyle('s',fontName='PArialBold' if bold else 'PArial',fontSize=size,leading=size+3,textColor=color,spaceAfter=7)
body=st(9.5);small=st(8);heading=st(13,True,NAVY)

# Captions are based on visible contents, not names or inferred keystrokes.
DATA=[
('Formulario y buscadores','P01 · Formulario vacío','Los mensajes exigen cliente y al menos un producto. No aparece confirmación y Red no registra peticiones.'),
('Formulario y buscadores','P02 · Búsqueda sin tilde','La búsqueda huaman encuentra a Huamán Flores, María Elena, DNI 90000001.'),
('Formulario y buscadores','P02 · Cliente inactivo excluido','Guevara no produce coincidencias activas en el buscador de ventas.'),
('Formulario y buscadores','P02 · Estado del cliente','El catálogo confirma que Guevara Salmón está inactivo y María Elena está activa.'),
('Líneas y cálculos','P03 · Cantidad y subtotal','Vitamina D por S/12.50, cantidad 3: subtotal y total S/37.50.'),
('Líneas y cálculos','P04 · Tres productos','Vitamina D x3, Protector solar x1 y Vitamina C x1: S/57.60; sin POST visible.'),
('Líneas y cálculos','P04 · Quitar una línea','Al retirar Vitamina C quedan dos productos y total S/56.40.'),
('Líneas y cálculos','P05 · Producto ya seleccionado','El resultado de Vitamina D indica En la venta: 3 y stock 24.'),
('Líneas y cálculos','P05 · Incrementar sin duplicar','Una sola fila de Vitamina D pasa a cantidad 4; total S/68.90.'),
('Validación y confirmación','P06 · Stock excedido','Cantidad 25 con stock 24 genera Supera el stock; no aparece confirmación ni POST.'),
('Validación y confirmación','P07 · Datos corregidos','Vitamina D x3 y Protector solar x2: dos productos, cinco unidades, S/75.30.'),
('Validación y confirmación','P07 · Resumen de confirmación','El resumen muestra cliente, dos productos y S/75.30. La impresión al registrar está marcada.'),
('Validación y confirmación','P08 · Volver sin registrar','El formulario conserva sus dos líneas, se cierra el resumen y Red sigue sin solicitudes.'),
('Registro y comprobante','P09-P10 · Venta guardada','La venta 47 queda REGISTRADA por S/75.30, con mensaje de éxito y POST 201 visible en Red.'),
('Registro y comprobante','P09 · Request de registro','Payload contiene clienteId 11 y detalles con productoId y cantidad, sin precios ni total.'),
('Registro y comprobante','P09 · Detalles enviados','El Payload expandido muestra Vitamina D (133) x3 y Protector solar (134) x2.'),
('Registro y comprobante','P09-P10 · Importes del servidor','Response de la venta 47 muestra total 75.30 y subtotales 37.50 y 37.80, iguales al cálculo manual.'),
('Impresión y consulta','P12 · Venta anulada en la consulta','Filtro ANULADA devuelve venta 46, total S/12.50, con acción de impresión por fila y GET 200.'),
('Impresión y consulta','P12 · Vista previa anulada','La ruta incluye imprimir=1. El comprobante tiene DNI, sello ANULADA y pie, sin controles de la SPA.'),
('Impresión y consulta','P13 · Consulta filtrada','Cliente María Elena, estado REGISTRADA y fechas 11-12 de octubre: seis ventas, incluida la 47.'),
('Impresión y consulta','P13 · Vista previa de consulta','La impresión presenta filtros, tabla y total registrado S/234.60, sin menú ni botones de la aplicación.'),
('Consistencia del stock','P14 · Stock después de la venta','Vitamina D queda en 21 y Protector solar en 19; Vitamina C permanece en 40.'),
('Conflicto entre cajas','P15 · Precondición de stock','Gel antibacterial se repuso a dos unidades; precio S/4.35 y estado activo.'),
('Conflicto entre cajas','P15 · Primera caja preparada','La primera pestaña contiene Gel antibacterial x2, total S/8.70.'),
('Conflicto entre cajas','P15 · Segunda caja preparada','La segunda pestaña conserva la misma cantidad y total antes de registrar.'),
('Conflicto entre cajas','P15 · Confirmación de primera caja','Resumen de Gel antibacterial x2 por S/8.70, sin impresión automática.'),
('Conflicto entre cajas','P15 · Primera caja registra','Comprobante 48, REGISTRADA, total S/8.70; Headers del POST muestran 201 Created.'),
('Conflicto entre cajas','P15 · Segunda caja confirma','La segunda pestaña mantiene su resumen de S/8.70 después de vender en la primera.'),
('Conflicto entre cajas','P15 · Conflicto 409','Headers muestran POST 409 Conflict; el formulario conserva los datos y avisa stock insuficiente, disponible 0.'),
('Conflicto entre cajas','P15 · Payload del intento rechazado','La segunda solicitud envió cliente 11 y producto 22, cantidad 2.'),
('Conflicto entre cajas','P15 · Respuesta del conflicto','Response contiene estado 409 y mensaje Stock insuficiente para Gel antibacterial, disponible 0, solicitado 2.'),
('Conflicto entre cajas','P15 · Respuesta conservada','Vista adicional del Response 409 y del formulario corregible; no representa otra venta registrada.'),
('Conflicto entre cajas','P15 · Stock agotado','El catálogo confirma Gel antibacterial en stock 0 después del único registro válido.'),
('Conflicto entre cajas','P15 · Consulta después del conflicto','Las ventas REGISTRADAS muestran la 48 y la 47; el listado contiene siete registros, sin otra venta por el rechazo.'),
('Filtros y fechas','P16 · Parámetros enviados','GET 200 con clienteId 11 y fechas 2026-10-11 a 2026-10-12; Estado Todos no añade estado a la URL.'),
('Filtros y fechas','P16 · Respuesta paginada','Response incluye contenido y metadatos: pagina 0, tamanio 10, totalElementos 8, totalPaginas 1 y ultima true.'),
('Filtros y fechas','P17 · Rango inválido','Desde 13/10/2026 y hasta 12/10/2026: mensaje en la SPA y Red sin solicitudes nuevas.'),
]
files=sorted(f for f in SOURCE.glob('*.png') if '135946' not in f.stem);assert len(files)==len(DATA)==37
manifest=[]
for i,(f,(group,title,desc)) in enumerate(zip(files,DATA),1):
 if group=='Material adicional':continue
 target=DEST/f'captura-{i:02}.png';shutil.copy2(f,target)
 manifest.append(dict(original=str(f),archivo=target.name,grupo=group,titulo=title,descripcion=desc,sha256=hashlib.sha256(f.read_bytes()).hexdigest(),orden=i))
for filename,title,desc in [('S9_P_Anulada.pdf','P12 · Comprobante anulado conservado','Impresión de la venta 46: total S/12.50, DNI 90000001, sello y pie.'),('S9_P_Consulta.pdf','P13 · Consulta impresa conservada','Seis ventas REGISTRADAS, filtros de cliente y fechas, total S/234.60. Corresponde al momento anterior a la venta 48.')]:
 f=SOURCE/filename;shutil.copy2(f,DEST/filename)
 manifest.append(dict(original=str(f),archivo=f.name,grupo='Impresión y consulta',titulo=title,descripcion=desc,sha256=hashlib.sha256(f.read_bytes()).hexdigest(),orden=100 if 'Anulada' in filename else 101))
(DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def footer(c,d):
 c.setFillColor(NAVY);c.setFont('PArialBold',8);c.drawString(42,812,'LP II · Guía práctica · Sesión 9');c.setStrokeColor(GOLD);c.line(42,804,A4[0]-42,804)

story=[]
def p(t,s=body):story.append(Paragraph(t,s))
def h(t):p(t,heading)
def figure(filename,caption,width=440):
 path=DEST/filename
 with PILImage.open(path) as im:iw,ih=im.size
 img=Image(str(path),width=width,height=width*ih/iw);img.hAlign='CENTER'
 story.append(KeepTogether([img,Paragraph(caption,small)]))
story.extend([Image(str(ROOT/'docs/s8/assets/upeu-logo.png'),width=110,height=39.6),Spacer(1,12)])
p('Actividad práctica - Sesión 9',st(20,True,NAVY));p('Informe de implementación y verificación de ventas',st(12,True,NAVY));p(NAME+' · 12 de octubre de 2026',small)
h('1. Objetivo y alcance')
p('Implementar y verificar en PharmaSoft el registro de ventas cabecera-detalle, la confirmación, el comprobante imprimible y la consulta paginada. Se documentan las 17 pruebas del paso 10 de la guía práctica; los resultados se contrastan con cálculos, respuestas HTTP y cambios de stock.')
figure('captura-11.png','Figura 1. Formulario cabecera-detalle: dos productos, cinco unidades y total estimado S/75.30.',440)
story.append(PageBreak());h('2. Arquitectura y persistencia')
p('<b>Frontend:</b> Angular 22, formularios reactivos y FormArray para líneas; controles separados para búsquedas; normalización de tildes; toSignal y computed para importes redondeados. VentaForm revisa, confirma y conserva datos ante errores. VentaDetalle presenta el resultado del servidor. VentaList aplica filtros, paginación e impresión. El feature tiene rutas con carga diferida y entrada en el menú.')
p('<b>Backend:</b> Spring Boot expone POST /api/v1/ventas, GET /ventas/{id} y GET /ventas/buscar. El request contiene solo identificadores y cantidades. VentaServiceImpl.create verifica actividad, reserva stock mediante UPDATE condicional y calcula con BigDecimal a precios vigentes. @Transactional revierte cabecera, detalles y reservas si una línea falla.')
p('<b>Base de datos:</b> Oracle almacena ventas y detalle_ventas, relacionadas con clientes y productos. La cabecera conserva cliente, fecha, estado y total; las líneas, producto, cantidad, precio y subtotal. Venta.agregarDetalle establece la relación; cascade ALL persiste sus líneas. El total estimado de la SPA no se usa como importe definitivo.')
figure('captura-17.png','Figura 2. La respuesta del servidor contiene precios, subtotales y total de la venta 47.',440)
h('3. Precondiciones y cálculos manuales')
p('Cliente: María Elena Huamán Flores, id 11, DNI 90000001. A: Vitamina D, id 133, S/12.50 y stock inicial 24. B: Protector solar, id 134, S/18.90 y stock inicial 21. C: Vitamina C, id 19, S/1.20 y stock 40. El stock inicial A/B procede de la lectura previa de API del mismo día y del catálogo cargado; las capturas posteriores confirman 21/19.')
p('A x3 = <b>37.50</b>. Con B x1 y C x1: <b>57.60</b>; al quitar C: <b>56.40</b>. Al repetir A, A x4 + B x1 = <b>68.90</b>. Para registrar se corrigió a A x3 + B x2 = 37.50 + 37.80 = <b>75.30</b>. Venta 47 coincide con ese importe. Gel x2 = 4.35 x2 = <b>8.70</b>, venta 48. La consulta impresa anterior a la 48 suma 159.30 + 75.30 = <b>234.60</b>.')
story.append(PageBreak());h('4. Verificación de las 17 pruebas')
p('La tabla resume los resultados observables; las capturas y las impresiones conservadas se presentan después, agrupadas por aspecto. Una evidencia puede respaldar varios pasos sin implicar una nueva ejecución.',small)
results=[
('P01','Vacío bloqueado','Cliente y detalle obligatorios; sin confirmación ni POST.'),
('P02','Búsqueda y exclusión','huaman encuentra Huamán; guevara no coincide por inactividad. '),
('P03','Subtotal','Cantidad 3 de A: S/37.50.'),
('P04','Agregar y quitar','Tres líneas S/57.60; al quitar C, S/56.40.'),
('P05','Sin duplicados','A pasa de 3 a 4 en una fila; total S/68.90.'),
('P06','Stock por línea','25 supera 24; aviso y ausencia de confirmación/POST.'),
('P07','Resumen','Cliente, dos productos y S/75.30; impresión marcada.'),
('P08','Volver','Conserva líneas y cierra resumen sin petición visible.'),
('P09','Registrar','POST 201; venta 47, éxito; Payload y Response conservados.'),
('P10','Comparar total','Estimado S/75.30 = total del servidor S/75.30.'),
('P11','Configuración de impresión','Opción Imprimir el comprobante al registrar seleccionada en el resumen.'),
('P12','Imprimir anulada','Consulta y ruta imprimir=1; vista previa y PDF con sello, DNI y pie.'),
('P13','Imprimir consulta','Filtros, seis ventas y S/234.60; vista previa y PDF.'),
('P14','Descontar stock','A 24 a 21; B 21 a 19; C se mantiene en 40.'),
('P15','Dos cajas','Gel repuesto a 2; primera 201/venta 48; segunda 409; stock 0, una venta válida.'),
('P16','Filtros opcionales','Cliente y fechas en URL, sin estado; 200 con ocho ventas y metadatos paginados.'),
('P17','Rango inválido','13/10 > 12/10: mensaje y ausencia de GET nuevo.'),
]
cells=[[Paragraph(t,st(8,True,colors.white)) for t in ['Caso','Aspecto','Resultado observado']]]
cells += [[Paragraph(escape(t),st(8)) for t in row] for row in results]
t=Table(cells,colWidths=[38,115,358],repeatRows=1)
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f8')]),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#bacce5')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]));story.append(t)
story.append(PageBreak());h('5. Resultados de la operación')
p('La venta 47 registra Vitamina D x3 y Protector solar x2 por S/75.30. El request utiliza identificadores y cantidades; la respuesta incorpora los precios vigentes y subtotales calculados. El importe coincide con la revisión previa. La impresión al registrar se selecciona en el resumen y el comprobante presenta cliente, DNI y detalle de productos.')
figure('captura-14.png','Figura 3. Comprobante registrado de la venta 47 por S/75.30, con cliente, DNI y detalle.',440)
p('La consulta impresa contiene seis ventas REGISTRADAS por S/234.60, con sus filtros de cliente, estado y fechas. Este resultado corresponde a la consulta realizada antes del registro 48. El comprobante de la venta 46 mantiene el sello ANULADA y su pie de impresión.')
h('6. Consistencia y consulta')
p('El registro 47 descuenta tres unidades de Vitamina D y dos de Protector solar. En la prueba entre cajas, Gel antibacterial dispone inicialmente de dos unidades: la primera caja registra la venta 48 por S/8.70 y la segunda recibe 409, con disponibilidad cero. Se conservan cliente y detalle para corregir la operación. El rechazo esperado protege el stock y evita otra venta.')
p('La consulta usa cliente y fechas y omite estado cuando se selecciona Todos. La respuesta presenta ocho ventas con página 0, tamaño 10 y una página total. Un rango con fecha inicial posterior a la final muestra el mensaje correspondiente antes de realizar una nueva petición.')
h('7. Conclusiones')
p('El formulario organiza una venta con líneas dinámicas, calcula importes durante la edición y solicita confirmación antes de registrar. El servidor valida disponibilidad y mantiene la consistencia de cabecera, detalles y stock. El comprobante y la consulta facilitan la revisión de los importes y su impresión. Las evidencias siguientes se agrupan según el aspecto verificado.')
b=BytesIO();SimpleDocTemplate(b,pagesize=A4,leftMargin=42,rightMargin=42,topMargin=52,bottomMargin=40).build(story,onFirstPage=footer,onLaterPages=footer);b.seek(0)
writer=PdfWriter();writer.append(PdfReader(b),import_outline=False);writer.add_outline_item('Informe técnico y verificación',0)
GROUPS=['Formulario y buscadores','Líneas y cálculos','Validación y confirmación','Registro y comprobante','Impresión y consulta','Consistencia del stock','Conflicto entre cajas','Filtros y fechas']
ordered=sorted(manifest,key=lambda v:(GROUPS.index(v['grupo']),v['orden']))
parent=writer.add_outline_item('Evidencias',len(writer.pages));current=None;pages={}
for index,item in enumerate(ordered):
 new=item['grupo']!=current;w,h=landscape(A4) if item['archivo'].endswith('.png') else A4
 buf=BytesIO();c=canvas.Canvas(buf,pagesize=(w,h));y=h-30;c.setFillColor(NAVY)
 if index==0:c.setFont('PArialBold',24);c.drawString(28,y,'Evidencias');y-=34
 if new:
  current=item['grupo'];group_parent=writer.add_outline_item(current,len(writer.pages),parent=parent)
  c.setFont('PArialBold',18);c.drawString(28,y,current);y-=29
 c.setFont('PArialBold',11);c.drawString(28,y,item['titulo']);y-=10;c.setStrokeColor(GOLD);c.setLineWidth(1.3);c.line(28,y,w-28,y);y-=12
 desc=Paragraph(escape(item['descripcion']),st(9));_,ph=desc.wrap(w-56,80);desc.drawOn(c,28,y-ph);top=y-ph-12
 path=DEST/item['archivo'];pages[item['archivo']]=len(writer.pages)+1
 if path.suffix=='.png':
  with PILImage.open(path) as im:iw,ih=im.size
  scale=min((w-80)/iw,(top-52)/ih);dw,dh=iw*scale,ih*scale
  c.drawImage(str(path),(w-dw)/2,40+(top-40-dh)/2,width=dw,height=dh,preserveAspectRatio=True)
 c.save();buf.seek(0);page=PdfReader(buf).pages[0]
 if path.suffix=='.pdf':
  source=PdfReader(path);assert len(source.pages)==1
  original=source.pages[0];scale=min((w-56)/float(original.mediabox.width),(top-38)/float(original.mediabox.height));x=(w-float(original.mediabox.width)*scale)/2
  page.merge_transformed_page(original,Transformation().scale(scale).translate(x,38))
 writer.add_outline_item(item['titulo'],len(writer.pages),parent=group_parent);writer.add_page(page)
total=len(writer.pages)
for n,page in enumerate(writer.pages,1):
 w=float(page.mediabox.width);buf=BytesIO();c=canvas.Canvas(buf,pagesize=(w,float(page.mediabox.height)));c.setFont('PArial',7);c.setFillColor(colors.black);c.drawString(28,16,NAME);c.drawRightString(w-28,16,f'Página {n} de {total}');c.save();buf.seek(0);page.merge_page(PdfReader(buf).pages[0])
output=ROOT/'docs/DelCarpio_LP2_S9_Practica.pdf';writer.add_metadata({'/Title':'S9 · Informe de práctica: ventas y evidencias','/Author':NAME});writer.write(output)
(ROOT/'docs/s9-practica/paginacion.json').write_text(json.dumps({'paginas':total,'evidencias':pages},indent=2)+'\n',encoding='utf-8')
print(f'Created {output}: {total} pages; 37 screenshots and 2 preserved printouts.')
