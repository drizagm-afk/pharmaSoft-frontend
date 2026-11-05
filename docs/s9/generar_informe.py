"""Create a concise S9 report with inline figures and a separate evidence document."""
from pathlib import Path
import shutil
from PIL import Image as PILImage
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,Image,HRFlowable,PageBreak,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
from anexar_evidencias import build_evidence

ROOT=Path(__file__).resolve().parents[2];OUTPUT=ROOT/'docs/informe-s9.pdf'
NAME='Kevin Eduardo Del Carpio Alegría';NAVY=colors.HexColor('#12325b');GOLD=colors.HexColor('#eda900')
pdfmetrics.registerFont(TTFont('S9Arial',r'C:\Windows\Fonts\arial.ttf'));pdfmetrics.registerFont(TTFont('S9ArialBold',r'C:\Windows\Fonts\arialbd.ttf'))
pdfmetrics.registerFontFamily('S9Arial',normal='S9Arial',bold='S9ArialBold',italic='S9Arial',boldItalic='S9ArialBold')
styles={
 'body':ParagraphStyle('body',fontName='S9Arial',fontSize=9.5,leading=12.7,spaceAfter=7,textColor=colors.black),
 'small':ParagraphStyle('small',fontName='S9Arial',fontSize=8.2,leading=10.8,spaceAfter=6),
 'h':ParagraphStyle('h',fontName='S9ArialBold',fontSize=12,leading=15.5,spaceBefore=8,spaceAfter=6,textColor=NAVY),
 'center':ParagraphStyle('center',fontName='S9Arial',fontSize=8,leading=10.5,alignment=1,textColor=colors.black),
 'course':ParagraphStyle('course',fontName='S9ArialBold',fontSize=8.5,leading=11,alignment=1,textColor=NAVY),
 'title':ParagraphStyle('title',fontName='Times-Bold',fontSize=18,leading=21,alignment=1,spaceAfter=4,textColor=NAVY),
 'subtitle':ParagraphStyle('subtitle',fontName='Times-Italic',fontSize=11,leading=14,alignment=1,spaceAfter=5,textColor=colors.HexColor('#285e9c')),
 'white':ParagraphStyle('white',fontName='S9ArialBold',fontSize=8.2,leading=10.8,textColor=colors.white),
 'caption':ParagraphStyle('caption',fontName='S9Arial',fontSize=8,leading=10.5,spaceBefore=4,spaceAfter=8,textColor=colors.black),
}
story=[]
def p(text,s='body'):story.append(Paragraph(text,styles[s]))
def h(text):p(text,'h')
def table(rows,widths):
 cells=[[Paragraph(str(v),styles['white'] if i==0 else styles['small']) for v in row] for i,row in enumerate(rows)]
 t=Table(cells,colWidths=widths,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f8')]),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#bacce5')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]));story.extend([t,Spacer(1,7)])
def figure(file,caption,width=465):
 path=ROOT/'docs/s9/evidencias'/file
 with PILImage.open(path) as image:iw,ih=image.size
 img=Image(str(path),width=width,height=width*ih/iw);img.hAlign='CENTER'
 story.append(KeepTogether([img,Paragraph(caption,styles['caption'])]))
def footer(c,d):
 c.saveState();c.setFont('S9Arial',7.5);c.setFillColor(colors.black)
 if d.page>1:c.drawString(42,812,'LP II · Actividad autónoma · Sesión 9');c.setStrokeColor(GOLD);c.setLineWidth(1.3);c.line(42,804,A4[0]-42,804)
 c.drawString(42,24,NAME);c.drawRightString(A4[0]-42,24,f'Página {d.page} de 3');c.restoreState()

story.extend([Image(str(ROOT/'docs/s8/assets/upeu-logo.png'),width=110,height=39.6),Spacer(1,4)])
p('Facultad de Ingeniería y Arquitectura · EP Ingeniería de Sistemas','center');p('Lenguaje de Programación II','course')
story.extend([Spacer(1,6),HRFlowable(width='100%',thickness=2,color=GOLD),Spacer(1,7)])
p('Actividad Autónoma - Sesión 9','title');p('Informe de hallazgos y experiencia de usuario','subtitle')
p(NAME+' · Ejecución: 11 de octubre de 2026 · PharmaSoft y PharmaBackend','center')
h('C1. Resumen de los casos ejecutados')
p('Se ejecutaron 21 casos: los 17 base y cuatro propios de grupos distintos (B-03, C-05, V-06 y M-03). La verificación contrastó las precondiciones, cálculos manuales, respuestas HTTP, cambios de stock y comportamiento de la SPA con el resultado esperado de cada caso. Los 21 cumplieron sus criterios; los rechazos 400 y 409 previstos son resultados correctos.')
table([['Grupo','Ejecutados','Pasa','Falla'],['Buscadores','3','3','0'],['Cálculos','5','5','0'],['Validaciones','6','6','0'],['Confirmación','2','2','0'],['Mensajes','3','3','0'],['Impresión','1','1','0'],['Consistencia','1','1','0'],['Total','21','21','0']],[253,90,84,84])
p('C-01: 12.50 × 3 = <b>37.50</b>. C-02: 18.90 × 3 = <b>56.70</b>. En C-03, 37.50 + 2.40 + 37.80 = 77.70; al retirar la línea intermedia quedaron <b>75.30</b>. C-04 registró ese mismo total en la venta 41, con dos líneas y cinco unidades (figura 1).','small')
figure('C-04_spa-network.png','Figura 1. Caso C-04: el importe del comprobante coincide con el cálculo manual; Network muestra POST 201.')
story.append(PageBreak())
h('C2. Hallazgos y correcciones')
p('No falló ninguno de los 21 casos frente al resultado esperado. La revisión de la experiencia detectó una observación adicional de presentación, que se corrigió. También se declara una limitación del registro de respuestas; no se presenta como un defecto del backend.')
h('H-01. Mensaje de registro en una venta anulada')
p('<b>Descripción y severidad:</b> baja. La venta 46 mostraba estado y sello ANULADA, pero conservaba el mensaje verde de registro exitoso cuando la URL retenía nueva=1. El comprobante impreso y la exclusión del reporte eran correctos; el mensaje de la pantalla resultaba ambiguo (figura 2).')
figure('I-01_anulada-spa.png','Figura 2. Observación de UX en I-01: la venta anulada conserva el banner de registro. La imagen documenta el estado anterior a la corrección.',440)
p('<b>Causa probable, archivo y método:</b> la plantilla HTML del componente VentaDetalle evaluaba únicamente nueva(). El método VentaDetalle.cargar() actualizaba el estado desde la API, pero el parámetro de navegación seguía presente.','small')
p('<b>Corrección y verificación:</b> en la capa de presentación se exige nueva() === "1" y v.estado === "REGISTRADA". El retest manual mostró ANULADA sin banner en la ruta de la venta 46; la variante nueva=1 quedó cubierta por prueba automatizada. La regresión aprobó 75 pruebas y el build de producción. El caso I-01 confirmó además stock restaurado a 24 y los tres formatos de impresión.','small')
h('H-02. Respuestas históricas no conservadas')
p('<b>Descripción y severidad:</b> documental, media. En C-04, F-02, M-01, M-03 e I-01 se conservaron estados HTTP y resultados visibles, pero algunas vistas de Red no incluyen el cuerpo de Response. La pestaña se reutilizó y esos cuerpos ya no están disponibles. La causa está en el procedimiento de registro, no en un archivo o método del producto. <b>Corrección propuesta:</b> capturar Response al cerrar cada caso y exportar un HAR antes de limpiar Red. Se conserva esta limitación sin fabricar respuestas.','small')
story.append(PageBreak())
h('C3. Preguntas de análisis')
h('1. Por qué el total de la SPA es estimado')
p('La SPA calcula con el catálogo que cargó, cuyos precios pueden cambiar antes de confirmar, y los datos enviados por el navegador pueden manipularse. VentaForm.confirmar() envía únicamente clienteId y detalles con productoId/cantidad; VentaServiceImpl.create() toma el precio del producto, calcula subtotales con BigDecimal y suma el total del servidor. Aceptar el total del navegador permitiría importes alterados o inconsistentes. redondear() mejora la presentación, pero no sustituye al backend como autoridad del importe. Referencias al código: VentaForm.confirmar(), redondear() y VentaServiceImpl.create()/reservarProducto().')
h('2. Regla para productos repetidos en la API')
p('Para V-05 se definió aceptar líneas repetidas si la cantidad agregada cabe en el stock. Cada línea conserva cantidad, precio y subtotal, y el descuento acumulado debe equivaler a su suma. El servicio ordena productos, reserva stock por línea dentro de una transacción y revierte toda la venta si una reserva falla. El registro válido descontó 27 → 24; dos líneas de 13 con stock 24 recibieron 409 y el stock final permaneció en 24. La SPA combina duplicados para simplificar el comprobante. Referencias: VentaForm.agregarProducto(), VentaServiceImpl.create()/reservarProducto() y ProductoRepository.descontarStock().')
h('3. Mejora de UX después del conflicto 409')
p('La mejora consiste en conservar cliente y detalles, actualizar disponibilidad y señalar la línea afectada para que el cajero pueda quitarla o elegir una alternativa sin recargar. El formulario ya aplica esta recuperación: confirmar() libera guardado/confirmación al recibir el error y llama a cargarCatalogo(true) para un 409. En M-01 se observó stock actualizado a 0, advertencia de producto no disponible y revisión de un sustituto. Como mejora adicional, se podría enfocar la línea y anunciar el stock disponible para reducir el tiempo de corrección. Referencias: VentaForm.confirmar(), cargarCatalogo() y las señales de disponibilidad.')
h('4. Por qué el reporte no necesita paginación')
p('El reporte devuelve una fila por categoría con ventas, un conjunto pequeño que permite comparar barras y calcular el total general sobre toda la respuesta. Paginarlo ocultaría categorías y volvería ambiguos el máximo y los totales si se calcularan por página. La consulta de ventas contiene transacciones que crecen continuamente y necesita límites, orden estable y navegación. El reporte observado reunió 12 unidades por 159.30: Higiene 84.30 (100%) y Vitaminas 75.00 (89%); la venta anulada quedó excluida. Referencias: VentaRepository.reporteVentasPorCategoria(), VentasPorCategoria.totalUnidades/totalVendido/montoMayor, ReporteService.ventasPorCategoria() y VentaService.buscar().')
p('La matriz completa y las evidencias por caso se presentan en un documento independiente. La limitación de las respuestas históricas permanece declarada en C2.','small')

SimpleDocTemplate(str(OUTPUT),pagesize=A4,leftMargin=42,rightMargin=42,topMargin=43,bottomMargin=43,title='S9 · Informe de hallazgos y experiencia de usuario',author=NAME).build(story,onFirstPage=footer,onLaterPages=footer)
assert len(PdfReader(OUTPUT).pages)==3,'The main report must remain three pages'
shutil.copy2(OUTPUT,ROOT/'docs/DelCarpio_LP2_S9_Autonoma.pdf')
build_evidence(ROOT,ROOT/'docs/matriz-evidencias-s9.pdf')
print('Main report: 3 pages with inline figures; evidence document generated separately.')
