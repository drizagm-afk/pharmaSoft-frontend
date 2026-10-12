from pathlib import Path
from formato_institucional import institutional_header, institutional_footer, clean_report_text
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[2]
styles = getSampleStyleSheet()
styles['BodyText'].fontSize = 9
styles['BodyText'].leading = 10.5
styles['BodyText'].allowWidows = 0
styles['BodyText'].spaceAfter = 6
styles['Heading1'].textColor = colors.HexColor('#12325b')
styles['Heading1'].fontSize = 14
styles['Heading1'].fontName = 'Times-Bold'
styles['Heading1'].spaceAfter = 8
styles['Heading2'].fontSize = 12
styles['Heading2'].spaceBefore = 8
story = []
def h(text): story.append(Paragraph(clean_report_text(text), styles['Heading1']))
def p(text): story.append(Paragraph(clean_report_text(text), styles['BodyText']))
def table(rows, widths):
    data = [[Paragraph(str(v), styles['BodyText']) for v in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e8eef6')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.3,colors.lightgrey),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7)]))
    story.append(KeepTogether([t, Spacer(1,12)]))
def page(): story.append(PageBreak())

finding_start = None

def screenshot(filename, caption, max_height=185):
    path = ROOT/'docs/s8/evidencias-autonoma'/filename
    iw, ih = ImageReader(str(path)).getSize()
    scale = min(480/iw, max_height/ih)
    story.append(Image(str(path), width=iw*scale, height=ih*scale))
    p(caption)


def finding(title, case, observed, cause, correction, evidence):
    global finding_start
    finding_start = len(story)
    story.append(Paragraph(clean_report_text(title), styles['Heading2']))
    p(f'<b>Caso:</b> {case}. <b>Severidad:</b> alta, por inconsistencia de datos. <b>Descripción:</b> {observed}')
    p(f'<b>Causa probable y capa:</b> {cause}')
    p(f'<b>Corrección propuesta e incorporada:</b> {correction}')
    p('<b>Evidencia:</b> captura del caso y registros de verificación.')

institutional_header(story, 'autonoma')
h('B1. Resumen de la ejecución')
p('Se evaluaron 18 casos: 14 de la guía y cuatro propios (A-07, C-05, C-06 y B-05). Se contrastaron SPA y API. Las verificaciones y regresiones complementarias de Codex se identifican en sus registros.')
table([['Grupo','Casos API','Pasan','Fallan'],['Altas','7','5','2'],['Cambios','6','2','4'],['Bajas','5','5','0'],['Total','18','12','6']],[185,105,95,95])
p('La tabla corresponde a la línea base. Los seis fallos originaron seis fichas y cinco causas: A-04 y C-04 comparten la validación ausente del estado de la categoría. La regresión posterior se registra por separado.')
p('<b>Criterio:</b> impedir la desactivación con productos activos y la eliminación con cualquier producto asociado. La baja lógica conserva la clasificación histórica.')
p('<b>Regresión:</b> con apoyo de Codex se incorporaron validaciones en "feature/productos-delcarpio". Los registros posteriores muestran 19 pruebas automatizadas y 28 verificaciones API satisfactorias, separadas de la línea base.')
p('<b>Evidencia:</b> capturas y registros por caso; el encuadre limita la lectura de B-04. No se verificó concurrencia ni se incorporó unicidad en la base de datos.')
screenshot('parte-C_regresion_network.png', 'Parte C: acceso a productos de la categoría 69 y tamaño 100.', 185)
h('B2. Fichas de hallazgos: altas')
finding('H-01. Categoría inactiva aceptada', 'A-04', 'POST devolvió 201 para categoría 49 inactiva (producto 88), aunque la SPA la oculta. El registro activo contradice la regla de categoría activa.', 'Backend, ProductoServiceImpl.java, create(): comprobaba la existencia de la categoría, pero no su estado. Las clases citadas pertenecen al backend.', 'Validar estado en create/update antes de mapear o guardar; lanzar ReglaNegocioException (409). Compartir bloqueo de categoría con su desactivación para coordinar escrituras.', 'A-04_postman.png y A-04_spa.png; petición POST /api/v1/productos con categoriaId 49. Regresión: regresion-A-04.json')
screenshot('A-04_postman.png', 'A-04: Postman aceptó la categoría inactiva con 201.')
finding('H-02. Stock fraccionario truncado', 'A-07 (propio)', 'La SPA bloqueó 1.5; la API creó producto 90 (QA S8 AUTO A99) con stock 1. El nombre cambió tras una colisión; no se atribuye ese rechazo al stock.', 'Backend, ProductoRequestDTO.java, campo stock (Integer): Jackson convertía el decimal antes de @Min. La validación comprobaba el entero ya convertido; JsonValidationConfig.java controla ahora esa conversión.', 'Deshabilitar ACCEPT_FLOAT_AS_INT con Jackson 3 y devolver 400 desde GlobalExceptionHandler.handleInvalidJson. Probar POST/PUT con fracciones y enteros válidos.', 'A-07_postman.png; regresion-A-07.json; regresion-stock-PUT.json')
screenshot('A-07_postman.png', 'A-07: stock 1.5 enviado y stock 1 devuelto.')
h('B2. Fichas de hallazgos: cambios de categoría')
finding('H-03. Reasignación a categoría inactiva', 'C-02', 'PUT del producto 87 devolvió 200 al moverlo de categoría 47 a 49, conservándolo activo. La prueba de la SPA usó el producto de prueba 73 y bloqueó el guardado.', 'Backend, ProductoServiceImpl.java, update(): faltaba validar el estado de la categoría destino.', 'Rechazar con 409 antes de modificar la entidad y comprobar por GET que se conservan los datos anteriores.', 'C-02_postman.png; regresion-C-02.json; regresion-producto-preservado.json')
screenshot('C-02_postman.png', 'C-02: PUT aceptó el cambio a categoría inactiva.')
finding('H-04. Desactivación con productos activos', 'C-03', 'PUT de categoría 66 devolvió 201 y estado false; GET confirmó que producto 91 seguía activo. La edición además usaba código de creación.', 'Backend, CategoriaServiceImpl.java, update(), no consultaba productos activos; CategoriaController.java, update(), devolvía 201.', 'Consultar existsByCategoriaIdAndEstadoTrue, rechazar con 409 y preservar ambos estados. Bloquear la misma categoría dentro de la transacción; devolver 200 para una edición válida.', 'C-03_headers.png; C-03_producto.png; regresion-C-03_spa.png; regresion-categoria-PUT-valida.json')
screenshot('C-03_response.png', 'C-03: categoría guardada con estado false.')
h('B2. Fichas de hallazgos: nombre y formulario obsoleto')
finding('H-05. Nombre duplicado al actualizar', 'C-06 (propio)', 'SPA y API aceptaron qa s8 auto a04 para producto 87, duplicando el nombre de producto 88 al comparar sin distinguir mayúsculas y minúsculas.', 'Backend, ProductoServiceImpl.java, update(), no consultaba existsByNombreIgnoreCaseAndIdNot antes de modificar la entidad.', 'Eliminar espacios al inicio y al final y comparar sin distinguir mayúsculas y minúsculas, excluyendo el ID propio, y rechazar con 409 antes de guardar. La unicidad simultánea requiere además una restricción de base de datos y saneamiento de duplicados históricos; eso no se implementó.', 'C-06_postman.png; C-06_producto87.json; C-06_producto88.json; regresion-C-06_spa.png')
screenshot('C-06_postman.png', 'C-06: actualización duplicada aceptada con 200.')
finding('H-06. Formulario obsoleto crea vínculo inválido', 'C-04', 'La SPA cargó categoría 67 activa. Otra pestaña la desactivó y el formulario original creó producto 92; un POST complementario creó producto 93 (201).', 'Backend, ProductoServiceImpl.java, create(), validaba existencia, pero no estado al guardar. Comparte causa con H-01: producto-form.ts usa una lista local cargada antes del cambio.', 'Revalidar estado en la transacción y coordinar con CategoriaServiceImpl.update() mediante el bloqueo de categoría. Responder 409 sin guardar y mantener el formulario con mensaje claro.', 'C-04_formulario-obsoleto.png; C-04_categoria-inactiva.png; C-04_producto92.json; C-04_api.json (POST /api/v1/productos). Regresión: regresion-C-04_formulario.png; regresion-C-04_spa-rechazo.png; C04_regresion_response-adicional.png')
screenshot('C-04_formulario-obsoleto.png', 'C-04: formulario utilizado en la secuencia de dos pestañas; los JSON vinculados confirman el producto creado.')
h('B3. Cobertura de reglas')
p('Se distingue la validación que protege los datos en la API de la prevención local en la SPA. Mostrar un error recibido del servidor no constituye una segunda validación independiente.')
table([['Regla','Línea base','Tras corrección'],['Existencia de categoría','Ambas: lista/validación local y API','Ambas; API comprueba existencia'],['Categoría activa','Solo SPA','Ambas; API revalida al guardar'],['Nombre único','Solo API en alta; ninguna en cambio','Solo API en alta y cambio'],['No eliminar categoría con productos','Solo API','Solo API'],['Baja lógica / repetir baja','Ambas: API cambia estado; SPA impide repetir','Ambas; API conserva rechazo 409'],['No desactivar con activos','Ninguna','Solo API']],[150,165,165])
p('En producto-form.ts, guardar() comprueba la categoría de la lista local. En ProductoServiceImpl.java, create/update validan la referencia y el nombre. CategoriaServiceImpl.java protege la desactivación y eliminación mediante consultas de ProductoRepository.java. En producto-list.ts, darDeBaja() impide repetir la acción sobre una fila inactiva; la API mantiene esa regla aunque la petición llegue desde Postman.')

h('B4. Filtro por categoría')
p('En el listado, ProductoList filtra resultado().contenido después de recibir una página del servidor. Por tanto, oculta registros de esa página, pero no consulta productos de otras páginas; el total de la paginación sigue siendo global. Cargar 100 reduce el problema, pero no convierte el filtro en global.')
p('<b>Propuesta completa:</b> se propone agregar categoriaId opcional a GET /api/v1/productos, conservando pagina, tamanio, ordenarPor y direccion. En ProductoRepository añadir Page&lt;Producto&gt; findByCategoriaId(Long categoriaId, Pageable pageable). El servicio backend elige findAll(pageable) cuando no hay categoría y el método filtrado cuando sí la hay; el total debe corresponder a la consulta filtrada. ProductoService.listar() del frontend añade categoriaId como parámetro HTTP opcional. ProductoList reinicia pagina a 0 al cambiar filtro y vuelve a consultar; elimina el filtrado local y presenta el total filtrado. Esta mejora global es una propuesta pendiente de implementación.')
p('<b>Mejora de la Parte C:</b> se incorporó, con apoyo de Codex, el enlace Ver productos que usa routerLink y queryParams. ProductoList recibe categoriaId mediante input y withComponentInputBinding, selecciona el filtro y solicita tamanio 100. La nota explica los primeros 100 registros y cambia al avanzar de página. La navegación y la recepción del parámetro se configuran en los componentes de categorías y productos y en la configuración de rutas.')
h('B5. Análisis')
p('<b>1. ¿Por qué no basta con ocultar categorías inactivas?</b> A-04 y C-02 demostraron que Postman puede enviar referencias excluidas del formulario. ProductoServiceImpl.create/update deben validar el estado al guardar, independientemente de la selección local.')
p('<b>2. ¿Qué debe ocurrir al desactivar una categoría con productos activos?</b> Debe impedirse para conservar una clasificación válida de los artículos disponibles para venta. CategoriaServiceImpl.update() consulta ProductoRepository.existsByCategoriaIdAndEstadoTrue y exige reasignación o baja explícita.')
p('<b>3. ¿Los productos dados de baja deben impedir eliminar su categoría?</b> Sí: la baja lógica conserva la clasificación para reportes e historial de ventas. CategoriaServiceImpl.delete() y ProductoRepository.existsByCategoriaId deben preservar cualquier referencia, incluido el producto inactivo.')
p('<b>4. ¿Cuándo deben validarse las dependencias?</b> C-04 demuestra que el estado puede cambiar después de abrir el formulario. ProductoServiceImpl.create() debe revalidarlo en la transacción y coordinar su bloqueo con CategoriaServiceImpl.update(). La selección local solo orienta al usuario.')
p('<b>5. ¿Qué cambia en la SPA al corregir A-04?</b> Se mantiene el filtro de categorías activas. mensajeError y el signal error muestran el nuevo 409 sin perder los datos. Deben actualizarse los resultados esperados y verificarse el rechazo del formulario obsoleto.')


def footer(canvas, doc):
    institutional_footer(canvas, doc, 'autonoma')

dest = ROOT/'docs/informe-hallazgos-s8.pdf'
SimpleDocTemplate(str(dest),pagesize=(595,842),rightMargin=48,leftMargin=48,topMargin=46,bottomMargin=48).build(story,onFirstPage=footer,onLaterPages=footer)
print(dest)

from shutil import copyfile
copyfile(dest, ROOT/'docs/s8/DelCarpio_LP2_S8_Autonoma.pdf')
