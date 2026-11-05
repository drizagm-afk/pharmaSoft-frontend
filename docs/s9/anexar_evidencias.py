"""Create the S9 matrix and case evidence document without visible filenames."""
from pathlib import Path
from io import BytesIO
from html import escape
import json,re
from PIL import Image as PILImage
from pypdf import PdfReader,PdfWriter,Transformation
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib import colors

NAVY=colors.HexColor('#12325b');GOLD=colors.HexColor('#eda900');LANDSCAPE=landscape(A4)
ASPECTS={'PREP':'Preparación de datos', 'B':'Buscadores', 'C':'Cálculos y registro', 'V':'Validaciones', 'F':'Confirmación', 'M':'Mensajes y recuperación', 'I':'Impresión y anulación', 'X':'Consistencia del stock', 'R':'Reporte por categoría'}
ASPECT_ORDER=list(ASPECTS)
def aspect(item):return 'PREP' if item['caso']=='PREP' else item['caso'][0]
LABELS={'PREP':'Preparación de datos y consultas','B-01':'Búsqueda de clientes activos e inactivos','B-02':'Búsqueda de productos y selección con Enter','B-03':'Exclusión de productos no disponibles','C-01':'Cálculo de una línea a S/12.50','C-02':'Cálculo decimal a S/18.90','C-03':'Recalcular al quitar una línea','C-04':'Registro y comparación del total','C-05':'Recalcular al editar una cantidad','V-01':'Cliente y detalles obligatorios','V-02':'Cantidades enteras positivas','V-03':'Validación del stock disponible','V-04':'Unificar productos en el formulario','V-05':'Líneas repetidas y rollback','V-06':'Detalles nulos y cantidades fraccionarias','F-01':'Volver sin registrar la venta','F-02':'Protección ante doble confirmación','M-01':'Conflicto de stock entre dos cajas','M-02':'Rechazo de cliente inactivo','M-03':'Recuperación de una conexión fallida','I-01':'Impresión y anulación de la venta','X-01':'Consistencia entre stock y ventas','R-01':'Reporte histórico y barras comparativas','R-02':'Reporte con ambos límites de fecha','R-03':'Reporte con fecha inicial','R-04':'Reporte con fecha final','R-05':'Rechazo de un rango invertido','R-06':'Reporte de un período sin ventas','R-07':'Exclusión de la venta anulada'}
ORDER=['PREP','B-01','B-02','C-01','C-02','C-03','C-04','V-01','V-02','V-03','V-04','V-05','F-01','F-02','M-01','M-02','I-01','X-01','B-03','C-05','V-06','M-03','R-01','R-02','R-03','R-04','R-05','R-06','R-07']
def style(size=8.5,bold=False,white=False):return ParagraphStyle('evidence',fontName='S9ArialBold' if bold else 'S9Arial',fontSize=size,leading=size+2,textColor=colors.white if white else colors.black)
def header(c,title,size=LANDSCAPE):
 w,h=size;c.setFillColor(NAVY);c.setFont('S9ArialBold',11);c.drawString(28,h-25,title);c.setStrokeColor(GOLD);c.setLineWidth(1.3);c.line(28,h-32,w-28,h-32)
def evidence_heading(c,item,size,new_group=False,first=False):
 w,h=size;y=h-28;c.setFillColor(NAVY)
 if first:
  c.setFont('S9ArialBold',24);c.drawString(28,y,'Evidencias');y-=33
 if new_group:
  c.setFont('S9ArialBold',18);c.drawString(28,y,ASPECTS[aspect(item)]);y-=28
 c.setFont('S9ArialBold',11);c.drawString(28,y,item['caso']+' · '+LABELS[item['caso']]);c.setStrokeColor(GOLD);c.setLineWidth(1.3);c.line(28,y-8,w-28,y-8);return y-22

def image_page(root,item,number,new_group=False,first=False):
 b=BytesIO();c=canvas.Canvas(b,pagesize=LANDSCAPE);w,h=LANDSCAPE
 y=evidence_heading(c,item,LANDSCAPE,new_group,first)
 p=Paragraph(escape(item['contenido']),style());_,ph=p.wrap(w-56,70);p.drawOn(c,28,y-ph)
 top=y-13-ph;bottom=42
 path=root/'docs/s9/evidencias'/item['archivo']
 with PILImage.open(path) as im:iw,ih=im.size
 factor=min((w-56)/iw,(top-bottom)/ih);dw,dh=iw*factor,ih*factor
 c.drawImage(str(path),(w-dw)/2,bottom+(top-bottom-dh)/2,width=dw,height=dh,preserveAspectRatio=True,mask='auto')
 c.setFillColor(colors.black);c.setFont('S9Arial',7)
 c.drawString(28,24,f'Evidencia {number} del caso · Captura: {item["creado"][:19].replace("T"," ")} (Lima)')
 c.save();b.seek(0);return b

def print_page(root,item):
 labels={'I-01_registrada.pdf':('I-01 · Comprobante registrado','Venta 46 por S/12.50: DNI, detalle y pie de impresión.'),'I-01_anulada.pdf':('I-01 · Comprobante anulado','La misma venta conserva sus datos y muestra el sello ANULADA.'),'I-01_consulta.pdf':('I-01 · Consulta filtrada','Cliente activo, estado REGISTRADA y rango de fechas: ventas 41–45, total S/159.30.')}
 title,desc=labels[item['archivo']];b=BytesIO();c=canvas.Canvas(b,pagesize=A4);header(c,title,A4)
 p=Paragraph(desc,style());_,ph=p.wrap(A4[0]-56,50);p.drawOn(c,28,A4[1]-43-ph);c.save();b.seek(0)
 page=PdfReader(b).pages[0];original=PdfReader(root/'docs/s9/evidencias'/item['archivo']).pages[0]
 factor=.81;x=(A4[0]-float(original.mediabox.width)*factor)/2
 page.merge_transformed_page(original,Transformation().scale(factor).translate(x,38))
 return page

def matrix_pdf(root,pages):
 st=style(7.5);head=style(7.5,True,True)
 title=ParagraphStyle('title',fontName='S9ArialBold',fontSize=15,leading=19,textColor=NAVY,spaceAfter=9)
 story=[Paragraph('Matriz de pruebas de ventas y evidencias',title),Paragraph('21 casos ejecutados: 17 base y cuatro propios. A = Vitamina D (133), S/12.50; B = Protector solar (134), S/18.90; C = Vitamina C (19), S/1.20; G = Gel antibacterial (22), S/4.35 y stock inicial 2. La columna Evidencia remite a los casos y páginas de este documento.',style()),Spacer(1,10)]
 rows=[]
 for line in (root/'docs/matriz-pruebas-s9.md').read_text(encoding='utf-8').splitlines():
  if re.match(r'\| [BCVFMIX]-\d{2} \|',line):
   fields=[v.strip() for v in line.split('|')[1:-1]];assert len(fields)==8
   linked=[Path(v).name for v in re.findall(r'\]\(([^)]+)\)',fields[7])]
   refs=sorted({pages.get(v,0) for v in linked})
   fields[7]='Caso '+fields[0]+'<br/>Páginas '+', '.join(f'{v:03d}' for v in refs)
   rows.append([Paragraph(fields[7] if i==7 else escape(re.sub(r'\*\*(.*?)\*\*',r'\1',f).replace('`','')),st) for i,f in enumerate(fields)])
 assert len(rows)==21
 headings=['ID','Grupo','Precondición','Datos','Resultado esperado','Resultado obtenido','Estado','Evidencia']
 t=Table([[Paragraph(s,head) for s in headings]]+rows,colWidths=[36,60,92,110,145,165,42,136],repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f8')]),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#bacce5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.append(t)
 b=BytesIO();SimpleDocTemplate(b,pagesize=LANDSCAPE,leftMargin=28,rightMargin=28,topMargin=48,bottomMargin=40).build(story,onFirstPage=lambda c,d:header(c,'Matriz de pruebas · S9'),onLaterPages=lambda c,d:header(c,'Matriz de pruebas · continuación'));b.seek(0);return b

def build_evidence(root,output):
 manifest=json.loads((root/'docs/s9/evidencias/manifest.json').read_text(encoding='utf-8'))
 images=sorted([v for v in manifest if v['archivo'].endswith('.png')],key=lambda v:(ORDER.index(v['caso']),v['creado']))
 prints=[v for v in manifest if v['archivo'].endswith('.pdf')]
 assert len(images)==73 and len(prints)==3
 ordered=sorted(images+prints,key=lambda v:(ASPECT_ORDER.index(aspect(v)),v['caso'],v['archivo'].endswith('.pdf'),v['creado']));pages={};matrix_count=0
 for _ in range(4):
  matrix=matrix_pdf(root,pages);matrix_count=len(PdfReader(matrix).pages)
  computed={v['archivo']:matrix_count+i+1 for i,v in enumerate(ordered)}
  if computed==pages:break
  pages=computed
 else:raise RuntimeError('Matrix pagination did not converge')
 writer=PdfWriter();writer.append(PdfReader(matrix),import_outline=False);writer.add_outline_item('Matriz de 21 casos',0)
 current=None;parent=None;n=0;current_aspect=None;aspect_parent=None
 evidence_parent=writer.add_outline_item('Evidencias',len(writer.pages))
 for index,item in enumerate(ordered):
  new_group=aspect(item)!=current_aspect
  if new_group:
   current_aspect=aspect(item);aspect_parent=writer.add_outline_item(ASPECTS[current_aspect],len(writer.pages),parent=evidence_parent)
  if item['caso']!=current:
   current=item['caso'];n=0;parent=writer.add_outline_item(current+' · '+LABELS[current],len(writer.pages),parent=aspect_parent)
  n+=1;assert len(writer.pages)+1==pages[item['archivo']]
  writer.add_outline_item('Evidencia '+str(n),len(writer.pages),parent=parent)
  if item['archivo'].endswith('.pdf'):writer.add_page(print_page(root,item))
  else:writer.append(PdfReader(image_page(root,item,n,new_group,index==0)),import_outline=False)
 total=len(writer.pages)
 for i,page in enumerate(writer.pages,1):
  b=BytesIO();c=canvas.Canvas(b,pagesize=(float(page.mediabox.width),float(page.mediabox.height)));c.setFont('S9Arial',7);c.setFillColor(colors.black);c.drawCentredString(float(page.mediabox.width)/2,8,f'Matriz y evidencias · {i} / {total}');c.save();b.seek(0);page.merge_page(PdfReader(b).pages[0])
 writer.add_metadata({'/Title':'S9 · Matriz de pruebas y evidencias por caso','/Author':'Kevin Eduardo Del Carpio Alegría'});writer.write(output)
 (root/'docs/s9/paginacion-informe.json').write_text(json.dumps({'informe_principal_paginas':3,'evidencias_paginas':total,'matriz_paginas':matrix_count,'archivos':pages},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f'Matrix and evidence document: {total} pages, 21 cases, 73 screenshots and 3 original printouts.')
