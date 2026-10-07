from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT

ROOT = Path(__file__).resolve().parents[2]
styles = getSampleStyleSheet()
styles['BodyText'].fontSize = 10
styles['BodyText'].leading = 14
styles['BodyText'].spaceAfter = 9
styles['Heading1'].textColor = colors.HexColor('#12325b')
story = []
def h(text): story.append(Paragraph(text, styles['Heading1']))
def p(text): story.append(Paragraph(text, styles['BodyText']))
def table(rows, widths):
    data = [[Paragraph(str(v), styles['BodyText']) for v in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8eef6')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.3,colors.lightgrey),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7)]))
    story.append(t); story.append(Spacer(1,12))
def page(): story.append(PageBreak())
def finding(title, case, observed, cause, correction, evidence):
    story.append(Paragraph(title, styles['Heading2']))
    p(f'<b>Caso:</b> {case}. <b>Severidad:</b> alta, por inconsistencia de datos. {observed}')
    p(f'<b>Causa y capa:</b> {cause}')
    p(f'<b>Corrección:</b> {correction}')
    p(f'<b>Evidencia:</b> {evidence}. Rutas relativas a docs/s8/evidencias-autonoma/.')

h('PharmaSoft - Informe de hallazgos S8')
p('Lenguaje de Programación II · Actividad autónoma · DelCarpio · 6 de octubre de 2026')
h('B1. Resumen de la ejecución')
p('La línea base contiene 18 casos: 14 base y cuatro propios (A-07, C-05, C-06 y B-05). El estudiante aportó las primeras pruebas y capturas; Codex completó verificaciones API y regresiones. Se conserva la autoría en los registros. El resultado HTTP no acredita por sí solo la ejecución en la SPA.')
table([['Grupo','Ejecutados API','Pasan','Fallan'],['Altas','7','5','2'],['Cambios','6','2','4'],['Bajas','5','5','0'],['Total','18','12','6']],[185,105,95,95])
p('Los seis fallos corresponden a cinco causas: A-04 y C-04 reproducen la misma brecha de categoría activa. Las peticiones y datos históricos no fueron sustituidos por resultados corregidos.')
p('<b>Regresión posterior:</b> se implementaron las correcciones en el backend. Pasan 19 pruebas automatizadas nuevas y 28 comprobaciones API reales, incluidas las reglas de los 18 casos. Documentación: regresion-backend-s8.md, regresion-unitaria-s8.json y regresion-api-s8.json.')
p('<b>Evidencia SPA complementaria:</b> el estudiante aportó capturas Network de B-01 (producto 95, DELETE 204), B-03 (categoría 71, DELETE 204 y selector actualizado), B-04 (categoría 69, DELETE 409) y B-05 (categoría 67, DELETE 409). También muestran bloqueos preventivos A-02/A-06/A-07/C-02 y respuestas de C-03/C-04/C-06. Algunas líneas JSON largas están cortadas; B-04 conserva estado y referencia, pero su banner queda fuera del encuadre. Los JSON API complementan el detalle. Quedan la exportación real de Postman y los pasos de entrega.')
p('<b>Políticas adoptadas:</b> una categoría con productos activos no puede desactivarse. Una categoría con cualquier producto, incluso inactivo, no puede eliminarse. El producto se da de baja lógicamente; se preservan referencias para consultas y ventas.')
page()
h('B2. Fichas de hallazgos: altas y cambios')
finding('H-01. Categoría inactiva aceptada', 'A-04 y C-04', 'POST devolvió 201 para categoría 49 inactiva (producto 88). En C-04, un formulario obsoleto creó producto 92 en categoría 67 desactivada; otra petición creó producto 93.', 'ProductoServiceImpl.create(), src/main/java/com/edu/upeu/PharmaBackend/service/impl/: comprobaba existencia, pero no estado.', 'Validar estado en create/update antes de mapear o guardar; lanzar ReglaNegocioException (409). Compartir bloqueo de categoría con su desactivación para coordinar escrituras.', 'A-04_postman.png; C-04_producto92.json; C-04_api.json. Regresión: regresion-A-04.json y regresion-C-04_spa-rechazo.png')
finding('H-02. Stock fraccionario truncado', 'A-07 (propio)', 'La SPA bloqueó 1.5; la API creó producto 90 (QA S8 AUTO A99) con stock 1. El nombre cambió tras una colisión; no se atribuye ese rechazo al stock.', 'ProductoRequestDTO.stock (Integer): Jackson convertía el decimal antes de @Min. JsonValidationConfig controla ahora esa coerción.', 'Deshabilitar ACCEPT_FLOAT_AS_INT con Jackson 3 y devolver 400 desde GlobalExceptionHandler.handleInvalidJson. Probar POST/PUT con fracciones y enteros válidos.', 'A-07_postman.png; regresion-A-07.json; regresion-stock-PUT.json')
finding('H-03. Reasignación a categoría inactiva', 'C-02', 'PUT del producto 87 devolvió 200 al moverlo de categoría 47 a 49, conservándolo activo. La SPA usó el fixture 73 y bloqueó el guardado.', 'ProductoServiceImpl.update(): faltaba validar estado de la categoría destino.', 'Rechazar con 409 antes de modificar la entidad y comprobar por GET que se conservan los datos anteriores.', 'C-02_postman.png; regresion-C-02.json; regresion-producto-preservado.json')
page()
h('B2. Fichas de hallazgos: consistencia')
finding('H-04. Desactivación con productos activos', 'C-03', 'PUT de categoría 66 devolvió 201 y estado false; GET confirmó que producto 91 seguía activo. La edición además usaba código de creación.', 'CategoriaServiceImpl.update() no consultaba productos activos; CategoriaController.update() devolvía 201.', 'Consultar existsByCategoriaIdAndEstadoTrue, rechazar con 409 y preservar ambos estados. Bloquear la misma categoría dentro de la transacción; devolver 200 para una edición válida.', 'C-03_headers.png; C-03_producto.png; regresion-C-03_spa.png; regresion-categoria-PUT-valida.json')
finding('H-05. Nombre duplicado al actualizar', 'C-06 (propio)', 'SPA y API aceptaron qa s8 auto a04 para producto 87, duplicando el nombre de producto 88 al ignorar capitalización.', 'ProductoServiceImpl.update() no consultaba existsByNombreIgnoreCaseAndIdNot antes de mapear.', 'Recortar y comparar el nombre sin mayúsculas, excluyendo el ID propio, y rechazar con 409 antes de guardar. La unicidad simultánea requiere además una restricción de base de datos y saneamiento de duplicados históricos; eso no se implementó.', 'C-06_postman.png; C-06_producto87.json; C-06_producto88.json; regresion-C-06_spa.png')
h('B3. Cobertura de reglas')
table([['Regla','Línea base','Tras corrección'],['Existencia de categoría','API; SPA ofrece lista','Ambas'],['Categoría activa','Solo SPA','Ambas; servidor revalida'],['Nombre único','Ambas en alta; ninguna en cambio','API en alta/cambio; SPA muestra rechazo'],['No eliminar categoría con productos','API; SPA muestra rechazo','Igual'],['Baja lógica','API; SPA deshabilita inactivos','Igual'],['No desactivar con activos','Ninguna','API; SPA muestra rechazo']],[150,165,165])
p('Referencias backend: ProductoServiceImpl, CategoriaServiceImpl, ProductoRepository y GlobalExceptionHandler. Frontend: producto-form.ts, producto-list.ts y categoria-list.ts. Los bloqueos se verificaron en ejecuciones secuenciales; no se realizó una prueba concurrente con dos transacciones.')
page()
h('B4. Filtro por categoría')
p('ProductoList filtra resultado().contenido después de recibir una página del servidor. Por tanto, oculta registros de esa página, pero no consulta productos de otras páginas; el total de la paginación sigue siendo global. Cargar 100 reduce el problema, pero no convierte el filtro en global.')
p('<b>Propuesta completa:</b> agregar categoriaId opcional a GET /api/v1/productos, conservando pagina, tamanio, ordenarPor y direccion. En ProductoRepository añadir Page&lt;Producto&gt; findByCategoriaId(Long categoriaId, Pageable pageable). El servicio backend elige findAll(pageable) cuando no hay categoría y el método filtrado cuando sí la hay; el total debe corresponder a la consulta filtrada. ProductoService.listar() del frontend añade categoriaId como parámetro HTTP opcional. ProductoList reinicia pagina a 0 al cambiar filtro y vuelve a consultar; elimina el filtrado local y presenta el total filtrado. Esta mejora global se propone, no se afirma implementada.')
p('<b>Mejora de la Parte C:</b> el enlace Ver productos usa routerLink y queryParams. ProductoList recibe categoriaId mediante input y withComponentInputBinding, selecciona el filtro y solicita tamanio 100. La nota explica los primeros 100 registros y cambia al avanzar de página. Referencias: categoria-list.html, producto-list.ts, producto-list.html y app.config.ts.')
h('B5. Análisis')
p('<b>1. Ocultar no protege:</b> A-04 y C-02 demostraron que Postman puede enviar IDs que producto-form.ts no ofrece. ProductoServiceImpl.create/update deben comprobar estado al guardar; el servidor es quien decide si una referencia es válida.')
p('<b>2. Desactivación:</b> se impide cuando existen productos activos, para evitar artículos disponibles para venta bajo una clasificación inactiva. No se desactivan productos silenciosamente. CategoriaServiceImpl.update() consulta ProductoRepository.existsByCategoriaIdAndEstadoTrue y exige una decisión explícita de reasignación o baja.')
p('<b>3. Productos inactivos:</b> sí deben impedir eliminar la categoría. La baja lógica conserva el artículo y su clasificación para reportes e historial de ventas. CategoriaServiceImpl.delete() y ProductoRepository.existsByCategoriaId preservan la referencia, sin depender del estado del artículo.')
p('<b>4. Formulario obsoleto:</b> C-04 muestra que una lista válida al cargar puede cambiar antes de enviar. La API, con transacción y bloqueo compartido de categoría, valida al guardar; la SPA no puede garantizar el estado del servidor durante ese intervalo.')
p('<b>5. SPA tras corregir A-04:</b> el filtro de categorías activas de producto-form.ts continúa igual. También conserva mensajeError y los datos del formulario para mostrar el 409 del servidor. La prueba del formulario obsoleto debe actualizar su resultado a rechazo, sin crear una fila, como muestra regresion-C-04_spa-rechazo.png.')

def footer(canvas, doc):
    canvas.setFont('Helvetica',8); canvas.setFillColor(colors.HexColor('#536174'))
    canvas.drawString(48,28,'DelCarpio · LP II · S8 · Línea base y regresión documentadas')
    canvas.drawRightString(547,28,f'{doc.page}')
dest = ROOT/'docs/informe-hallazgos-s8.pdf'
SimpleDocTemplate(str(dest),pagesize=(595,842),rightMargin=48,leftMargin=48,topMargin=42,bottomMargin=48).build(story,onFirstPage=footer,onLaterPages=footer)
print(dest)
