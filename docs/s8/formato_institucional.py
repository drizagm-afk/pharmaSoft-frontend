from pathlib import Path
from reportlab.platypus import Paragraph, Image, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
NAVY=colors.HexColor('#12325b')
GOLD=colors.HexColor('#eda900')
NAME='Kevin Eduardo Del Carpio Alegría'
def institutional_header(story,kind):
 center=ParagraphStyle('institution',fontName='Helvetica',fontSize=8.5,leading=11,alignment=1,textColor=colors.HexColor('#697386'))
 course=ParagraphStyle('course',parent=center,fontName='Helvetica-Bold',textColor=NAVY)
 title=ParagraphStyle('title',fontName='Times-Bold',fontSize=19,leading=23,alignment=1,textColor=NAVY)
 subtitle=ParagraphStyle('subtitle',fontName='Times-Italic',fontSize=11,leading=14,alignment=1,textColor=colors.HexColor('#285e9c'))
 small=ParagraphStyle('metadata',fontName='Helvetica',fontSize=7.5,leading=9)
 logo=Path(__file__).resolve().parent/'assets/upeu-logo.png'
 story.extend([Image(str(logo),width=174,height=62.6),Spacer(1,5),Paragraph('Facultad de Ingeniería y Arquitectura · EP Ingeniería de Sistemas',center),Paragraph('Lenguaje de Programación II',course),Spacer(1,6),HRFlowable(width='100%',thickness=2,color=GOLD),Spacer(1,7),Paragraph(('Actividad Autónoma' if kind=='autonoma' else 'Actividad Práctica')+' - Sesión 8',title),Paragraph('Pruebas de dependencias entre Categorías y Productos' if kind=='autonoma' else 'Integración del módulo Productos con Categorías',subtitle),Spacer(1,8)])
 rows=[['Dato','Detalle','Dato','Detalle'],['Unidad','II. Frontend SPA empresarial seguro','Sesión','8 · 1 de octubre de 2026'],['Modalidad','Individual, sin acompañamiento docente','Plazo','7 de octubre de 2026, 23:59'],['Entrega','Aula virtual + repositorio Git','Puntaje','20 puntos (evaluación de sesión)'],['Docente','Reyna Barreto Benjamin David','Ciclo','IV · Semestre 2026-2'],['Estudiante',NAME,'Proyecto','PharmaSoft']]
 if kind=='practica':
  rows[2]=['Modalidad','Individual, en laboratorio','Duración','2 horas prácticas']
  rows[3]=['Tecnologías','Angular 22 · TypeScript · Spring Boot 4','Proyecto base','PharmaSoft (sesión 7) + PharmaBackend']
 rows=[[Paragraph(v,small) for v in row] for row in rows]
 t=Table(rows,colWidths=[64,176,62,178])
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f1f4f8')]),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#bacce5')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
 # Paragraph text colors must be set explicitly for the blue heading cells.
 white=ParagraphStyle('metadata-white',parent=small,textColor=colors.white,fontName='Helvetica-Bold')
 for i,v in enumerate(['Dato','Detalle','Dato','Detalle']):t._cellvalues[0][i]=Paragraph(v,white)
 story.extend([t,Spacer(1,10)])
def institutional_footer(c,d,kind):
 c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#697386'))
 label='LP II · '+('Actividad autónoma' if kind=='autonoma' else 'Actividad práctica')+' · Sesión 8'
 if d.page>1:
  c.drawString(48,811,label)
  c.setStrokeColor(colors.HexColor('#bacce5'));c.setLineWidth(.4);c.line(48,800,547,800)
 c.drawString(48,24,NAME)
 c.drawRightString(547,24,'Página '+str(d.page))



def clean_report_text(text):
 import re
 # Preserve class and component names while stripping source-file suffixes.
 text=re.sub(r'\b([A-Za-z][A-Za-z0-9_-]*)\.(?:java|ts|html)\b',r'\1',text)
 for source,label in [('producto-form','el formulario de productos'),('producto-list','el listado de productos'),('categoria-list','el listado de categorías'),('app.config','la configuración de la aplicación')]:
  text=text.replace(source,label)
 text=re.sub(r'\b(?:docs/|postman/|src/)[^ <;,)]*','',text)
 text=re.sub(r'\b[A-Za-z0-9_-]+\.(?:json|png|jpg|jpeg|pdf|md|xlsx)\b','',text)
 text=re.sub(r'\s*\([0-9a-f]{7,40}\)','',text)
 text=re.sub(r'(?<![A-Za-z0-9])(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}(?![A-Za-z0-9])','',text)
 text=re.sub(r'(?<![\w"/])((?:feature|fix|docs|test)/[a-zA-Z0-9_-]+)',r'"\1"',text)
 return text
