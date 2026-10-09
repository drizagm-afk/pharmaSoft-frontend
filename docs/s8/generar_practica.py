from pathlib import Path
from formato_institucional import institutional_header, institutional_footer
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from xml.sax.saxutils import escape
from formato_institucional import clean_report_text
ROOT=Path(__file__).resolve().parent
OUTPUT=ROOT/'DelCarpio_LP2_S8_Practica.pdf'
styles=getSampleStyleSheet()
styles['BodyText'].fontSize=9
styles['BodyText'].leading=12
styles['BodyText'].allowWidows=0
styles['BodyText'].spaceAfter=5
styles['Heading1'].fontSize=14
styles['Heading1'].fontName='Times-Bold'
styles['Heading1'].textColor=colors.HexColor('#12325b')
styles['Heading2'].fontSize=11
styles['Heading1'].spaceBefore=12
styles['Heading1'].spaceAfter=8
from reportlab.lib.styles import ParagraphStyle
ParagraphStyleSmall=ParagraphStyle('caption',fontName='Helvetica',fontSize=6,leading=7,spaceAfter=3)
story=[]
def h(t): story.append(Paragraph(clean_report_text(t),styles['Heading1']))
def p(t): story.append(Paragraph(clean_report_text(t),styles['BodyText']))
def page(): story.append(PageBreak())
def table(rows,widths):
 t=Table([[Paragraph(escape(clean_report_text(str(v))),styles['BodyText']) for v in r] for r in rows],colWidths=widths)
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8eef6')),('GRID',(0,0),(-1,-1),.3,colors.lightgrey),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6)]))
 story.append(t);story.append(Spacer(1,10))
institutional_header(story, 'practica')
p('Se documentan la implementación y la verificación de doce escenarios del módulo Productos: listado, registro, edición, selección de categoría y baja lógica.')
h('B1. Resumen de la ejecución')
p('Se verificaron doce escenarios en la SPA de localhost:4200 y la API de localhost:8080/api/v1, con datos QA. En la primera ejecución, once escenarios resultaron satisfactorios y uno falló. Tras corregir la eliminación de categorías referenciadas, la repetición del caso 12 resultó satisfactoria. Se mantuvieron separadas las evidencias históricas y las posteriores a la corrección.')
table([['Grupo de escenarios','Casos','Pasan inicialmente','Fallan inicialmente'],['Listado, orden, paginación y filtro','4','4','0'],['Alta y validación del formulario','4','4','0'],['Edición y cambio de categoría','2','2','0'],['Baja y eliminación de categoría','2','1','1'],['Total','12','11','1']],[195,45,115,125])
p('La clasificación corresponde a la práctica. CategoriaDeletionTest (3 pruebas) y ProductoContractTest (4 pruebas) finalizaron sin fallos. El módulo se integró en la rama "develop". Las verificaciones complementarias de Codex están identificadas en sus registros.')

cases=[('01. Listado inicial', 'P01-network.png', 'GET /productos con pagina=0, tamanio=10, ordenarPor=nombre y direccion=asc: 200. La tabla muestra categorías y Productos está seleccionado en el menú.'), ('02. Ordenar precio: ascendente', 'P02-precio-asc-network.png', 'GET con ordenarPor=precio y direccion=asc: 200. Los precios visibles aumentan desde S/ 0.20.'), ('02. Ordenar precio: descendente', 'P02-precio-desc-network.png', 'GET con ordenarPor=precio y direccion=desc: 200. El mayor precio visible encabeza el listado.'), ('03. Tamaño de página y navegación', 'P03-paginacion-network.png', 'Tras elegir tamaño 5 y pulsar Siguiente, GET con pagina=1 y tamanio=5: 200. El índice enviado es contado desde cero.'), ('03. Complemento: paginador', 'P03-paginacion.jpg', 'Captura anterior de la misma funcionalidad: tamaño 5 y Página 2 de 4. El total depende de los datos existentes en el momento de cada ejecución.'), ('04. Filtro por categoría', 'P04-filtro-network.png', 'Categoría Lácteos: la página muestra solo su producto. Network vacío después de limpiar y cambiar el filtro: el filtrado se aplica localmente a la página actual.'), ('05. Categorías activas en el formulario', 'P05-categorias-activas-network.png', 'GET /categorias: 200. El select desplegado ofrece categorías activas; QA S8 DelCarpio Inactiva (49) no aparece para un registro nuevo.'), ('06. Validación sin petición HTTP', 'P06-validacion-network.png', 'Registrar un formulario vacío muestra errores de categoría, nombre y precio. Network permanece vacío: la SPA bloquea el envío.'), ('07. Registro válido: respuesta HTTP', 'P07-registro-network.png', 'POST /productos: 201 Created. Esta captura demuestra la respuesta de creación; la fila nueva queda fuera del área visible.'), ('07. Complemento: registro en el listado', 'P10-cambio-categoria.jpg', 'Producto creado durante la ejecución previa: QA S8 Brave DelCarpio 20261006 aparece en el listado con categoría activa, tras su edición. Confirma la presencia del registro; no se atribuye a la misma petición Network documentada.'), ('08. Nombre duplicado: conflicto HTTP', 'P08-duplicado-network.png', 'POST /productos: 409 Conflict y mensaje de duplicado. Esta captura usa la capitalización original; la siguiente documenta el intento con minúsculas solicitado por la guía.'), ('08. Complemento: nombre en minúsculas', 'P08-duplicado.jpg', 'La ejecución anterior intentó registrar el nombre existente en minúsculas y mostró el mensaje de duplicado. El control compara nombres sin distinguir mayúsculas y minúsculas.'), ('09. Categoría original inactiva', 'P09-categoria-inactiva-network.png', 'Al editar el producto 73, el select conserva la categoría original con (inactiva). El aviso explica que debe elegirse una activa; Actualizar no envía una petición.'), ('10. Cambio de categoría: respuesta HTTP', 'P10-cambio-categoria-network.png', 'PUT /productos/75: 200 OK. La fila actualizada queda fuera del área visible de esta captura; el complemento muestra una reasignación previa del mismo producto.'), ('10. Complemento: categoría actualizada', 'P10-cambio-categoria.jpg', 'Ejecución anterior: producto 75 reasignado de categoría 46 a 47. En una edición posterior documentada se cambió a Aceites; esta categoría se observa en el caso 11.'), ('11. Baja lógica del producto', 'P11-baja-network.png', 'DELETE /productos/75: 204 No Content. La fila permanece, muestra Inactivo y el botón Dar de baja está deshabilitado.'), ('12. Categoría referenciada: repetición correcta', 'P12-categoria-referenciada-409-network.png', 'DELETE /categorias/47: 409 Conflict. El mensaje explica la dependencia y pide reasignar productos. La categoría 47 permanece en la tabla. Resultado final del caso: pasa.'), ('Anexo. Caso 12 antes de la corrección', 'P12-categoria-referenciada-500-network.png', 'Evidencia histórica del defecto: DELETE /categorias/47 devolvía 500 aunque la SPA mostraba un mensaje claro. Este resultado fue reemplazado por la repetición con respuesta 409; no representa el comportamiento final.')]

from reportlab.platypus import KeepTogether
caption=ParagraphStyle('case-caption',fontName='Helvetica',fontSize=7,leading=9,spaceAfter=6)
for pair in range(0,12):
 h('B1. Verificación del escenario P'+str(pair+1).zfill(2))
 for num in [pair+1]:
  group=[case for case in cases if case[0].startswith(str(num).zfill(2)+'.')]
  if num==12:group.append(cases[-1])
  for title,filename,note in group:
   if title.startswith('Anexo.'):
    title='12. Resultado histórico antes de la corrección'
   path=ROOT/'evidencias-practica'/filename
   iw,ih=ImageReader(str(path)).getSize();scale=min(480/iw,185/ih)
   elements=[Paragraph(escape(title),styles['Heading2']),Paragraph(escape(clean_report_text(note)),styles['BodyText']),Image(str(path),width=iw*scale,height=ih*scale)]
   story.extend(elements)
 if pair==11:
  h('B2. Ficha del hallazgo P12')
  p('<b>ID:</b> H-P01. <b>Severidad:</b> media. La eliminación de categoría referenciada devolvió 500 en vez de un conflicto de negocio. CategoriaServiceImpl.delete() intentaba borrar antes de comprobar las referencias. Se incorporó ProductoRepository.existsByCategoriaId y ReglaNegocioException; GlobalExceptionHandler devuelve 409. La repetición conservó la categoría, incluidos los vínculos de productos inactivos. Las dos capturas anteriores documentan el fallo y la corrección.')
h('B3. Cobertura de reglas')
p('La tabla describe la cobertura observada durante la verificación del módulo Productos.')
table([['Regla','Cobertura en la práctica','Referencia y comportamiento'],['Existencia de categoría','Ambas','producto-form.ts y ProductoServiceImpl: selección y comprobación de referencia'],['Categoría activa','Solo SPA','producto-form.ts: ofrece activas y bloquea la categoría original inactiva'],['Nombre único','Solo API en alta','ProductoServiceImpl.create(): conflicto por nombre; la SPA muestra el error recibido'],['No eliminar categoría con productos','Solo API','CategoriaServiceImpl.delete(): consulta de referencias y rechazo 409 tras la corrección'],['Baja lógica','Ambas','ProductoServiceImpl cambia estado; producto-list.ts impide repetir desde la fila inactiva']],[125,100,255])
p('Mostrar un error devuelto por el servidor no constituye una validación independiente de la SPA. La prueba del nombre duplicado verifica el rechazo de la API y la presentación del mensaje en el formulario.')
h('B4. Recomendación sobre el filtro por categoría')
p('ProductoList filtra resultado().contenido después de recibir una página. Por ello, la selección oculta registros de esa página y no recupera productos de páginas distintas. Los totales siguen describiendo la consulta global; aumentar el tamaño a 100 no convierte el filtro en una consulta global.')
p('<b>Endpoint:</b> agregar categoriaId opcional a GET /api/v1/productos y conservar pagina, tamanio, ordenarPor y direccion. <b>Repositorio:</b> incorporar Page&lt;Producto&gt; findByCategoriaId(Long categoriaId, Pageable pageable) en ProductoRepository. El servicio debe usar la consulta filtrada cuando exista categoriaId y findAll(pageable) cuando no exista; el total debe corresponder a la consulta elegida.')
p('<b>Frontend:</b> ProductoService.listar() debe enviar categoriaId como parámetro opcional. ProductoList debe reiniciar pagina a 0 al cambiar la categoría, volver a consultar y eliminar el filtrado local. El total y la navegación deben representar únicamente los productos de la categoría seleccionada. La consulta global por categoría sigue siendo una propuesta de mejora.')

h('B5. Preguntas de análisis')
p('El análisis aborda la protección de las referencias entre Productos y Categorías y las responsabilidades de la SPA y la API.')
p('<b>1. ¿Por qué no basta con ocultar categorías inactivas?</b> La lista de producto-form.ts orienta la selección, pero una petición directa puede enviar cualquier ID. La ocultación local no impide enviar una referencia inactiva directamente a la API. ProductoServiceImpl.java, create() y update(), deben comprobar tanto existencia como estado al guardar.')
p('<b>2. ¿Qué debe ocurrir al desactivar una categoría con productos activos?</b> La desactivación debe rechazarse mientras existan productos activos, para conservar una clasificación válida de los artículos disponibles para venta. CategoriaServiceImpl.update() debe consultar ProductoRepository.existsByCategoriaIdAndEstadoTrue. La reasignación o baja debe ser una decisión explícita, sin desactivar productos automáticamente.')
p('<b>3. ¿Deben los productos dados de baja impedir eliminar la categoría?</b> Debe conservarse la referencia, porque la baja lógica mantiene el artículo y su clasificación histórica. Eliminar la categoría podría perder el contexto de los reportes de ventas. CategoriaServiceImpl.delete() y ProductoRepository.existsByCategoriaId deben considerar cualquier producto vinculado, incluido el inactivo.')
p('<b>4. ¿Cuándo deben validarse las dependencias?</b> Una categoría válida al abrir el formulario puede quedar inactiva antes del envío. Solo el backend puede consultar y proteger el estado actual al guardar. ProductoServiceImpl.create() debe revalidarlo dentro de la transacción y coordinar su bloqueo con CategoriaServiceImpl.update(); la lista local de producto-form.ts no garantiza ese estado.')
p('<b>5. ¿Qué cambia en la SPA al reforzar la validación de categorías activas?</b> El filtro de categorías activas de producto-form.ts debe mantenerse. El manejo mediante mensajeError y el signal error permite mostrar el nuevo 409 sin perder los datos ingresados. Deben actualizarse los resultados esperados y verificarse el rechazo de un formulario obsoleto; la prevención local y la presentación de errores siguen siendo necesarias.')

def footer(c,d):
 institutional_footer(c,d,'practica')
SimpleDocTemplate(str(OUTPUT),pagesize=(595,842),leftMargin=48,rightMargin=48,topMargin=46,bottomMargin=42).build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
