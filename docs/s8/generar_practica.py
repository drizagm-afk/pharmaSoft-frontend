from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / 'evidencias-practica'
OUTPUT = ROOT / 'DelCarpio_LP2_S8_Practica.pdf'
W, H = landscape(A4)
NAVY = colors.HexColor('#12325b')
BODY = ParagraphStyle('body', fontName='Helvetica', fontSize=11, leading=15)
SMALL = ParagraphStyle('small', fontName='Helvetica', fontSize=9, leading=12)
c = canvas.Canvas(str(OUTPUT), pagesize=(W, H))
c.setTitle('Del Carpio - LP II - Sesión 8 - Práctica: Productos')
c.setAuthor('Del Carpio')
page = 0

def paragraph(text, y, style=BODY):
    p = Paragraph(escape(text), style)
    _, height = p.wrap(W - 64, H)
    p.drawOn(c, 32, y - height)
    return y - height - 12

def header(title):
    global page
    page += 1
    c.setFillColor(NAVY)
    c.rect(0, H - 62, W, 62, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 17)
    c.drawString(32, H - 36, title)
    c.setFillColor(colors.black)
    c.setFont('Helvetica', 8)
    c.drawString(32, 18, 'Del Carpio | LP II | Sesión 8 | Práctica | 06/10/2026')
    c.drawRightString(W - 32, 18, str(page))

def evidence(title, filename, note):
    header(title)
    y = paragraph(note, H - 77, SMALL)
    img = ImageReader(str(EVIDENCE / filename))
    iw, ih = img.getSize()
    scale = min((W - 64) / iw, (y - 49) / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(img, (W - dw) / 2, 43 + (y - 49 - dh) / 2,
                width=dw, height=dh, preserveAspectRatio=True)
    c.showPage()

header('Práctica S8: módulo Productos')
y = H - 90
for text in [
    'Estudiante: Del Carpio. Proyecto: PharmaSoft. Rama de trabajo: feature/productos-delcarpio.',
    'Objetivo: integrar Productos con Categorías, con listado paginado y ordenable, filtro local, registro, edición, validación de categoría y baja lógica.',
    'Entorno: SPA http://localhost:4200 y API http://localhost:8080/api/v1; capturas de Brave con DevTools Network. Las pruebas se ejecutaron con datos QA separados de los registros habituales.',
    'Este documento presenta los doce escenarios del paso 9 de la guía práctica, con capturas de interfaz y solicitudes HTTP cuando corresponde. Incluye evidencia complementaria cuando una captura Network no muestra la fila resultante.',
    'Corrección del caso 12: la primera ejecución devolvió 500 al alcanzar la restricción de integridad de Oracle. El servicio ahora consulta existsByCategoriaId antes de borrar y lanza ReglaNegocioException; el manejador existente devuelve 409. La repetición manual confirma mensaje claro y conservación de la categoría.',
    'Verificación automatizada del backend: CategoriaDeletionTest (3 pruebas) y ProductoContractTest (4 pruebas), sin fallos. El rechazo incluye referencias de productos inactivos, porque su baja lógica conserva la relación.',
    'Versionado: tres commits del módulo ya registrados; el commit de documentación y la solicitud de incorporación hacia develop quedan por realizar por el estudiante. No se presenta el proceso Git como completado.',
    'Fuente: s8_lp2_guia_practica_okrbb6xr6o.pdf, paso 9 y Producto esperado, páginas 15-17. La matriz de dependencias y el informe de la actividad autónoma corresponden a la siguiente etapa.'
]:
    y = paragraph(text, y)
c.showPage()

cases = [
('01. Listado inicial', 'P01-network.png', 'GET /productos con pagina=0, tamanio=10, ordenarPor=nombre y direccion=asc: 200. La tabla muestra categorías y Productos está seleccionado en el menú.'),
('02. Ordenar precio: ascendente', 'P02-precio-asc-network.png', 'GET con ordenarPor=precio y direccion=asc: 200. Los precios visibles aumentan desde S/ 0.20.'),
('02. Ordenar precio: descendente', 'P02-precio-desc-network.png', 'GET con ordenarPor=precio y direccion=desc: 200. El mayor precio visible encabeza el listado.'),
('03. Tamaño de página y navegación', 'P03-paginacion-network.png', 'Tras elegir tamaño 5 y pulsar Siguiente, GET con pagina=1 y tamanio=5: 200. El índice enviado es cero-basado.'),
('03. Complemento: paginador', 'P03-paginacion.jpg', 'Captura anterior de la misma funcionalidad: tamaño 5 y Página 2 de 4. El total depende de los datos existentes en el momento de cada ejecución.'),
('04. Filtro por categoría', 'P04-filtro-network.png', 'Categoría Lácteos: la página muestra solo su producto. Network vacío después de limpiar y cambiar el filtro: el filtrado se aplica localmente a la página actual.'),
('05. Categorías activas en el formulario', 'P05-categorias-activas-network.png', 'GET /categorias: 200. El select desplegado ofrece categorías activas; QA S8 DelCarpio Inactiva (49) no aparece para un registro nuevo.'),
('06. Validación sin petición HTTP', 'P06-validacion-network.png', 'Registrar un formulario vacío muestra errores de categoría, nombre y precio. Network permanece vacío: la SPA bloquea el envío.'),
('07. Registro válido: respuesta HTTP', 'P07-registro-network.png', 'POST /productos: 201 Created. Esta captura demuestra la respuesta de creación; la fila nueva queda fuera del área visible.'),
('07. Complemento: registro en el listado', 'P10-cambio-categoria.jpg', 'Producto creado durante la ejecución previa: QA S8 Brave DelCarpio 20261006 aparece en el listado con categoría activa, tras su edición. Confirma la presencia del registro; no se atribuye a la misma petición Network del estudiante.'),
('08. Nombre duplicado: conflicto HTTP', 'P08-duplicado-network.png', 'POST /productos: 409 Conflict y mensaje de duplicado. Esta captura usa la capitalización original; la siguiente documenta el intento con minúsculas solicitado por la guía.'),
('08. Complemento: nombre en minúsculas', 'P08-duplicado.jpg', 'La ejecución anterior intentó registrar el nombre existente en minúsculas y mostró el mensaje de duplicado. El control compara nombres sin distinguir mayúsculas y minúsculas.'),
('09. Categoría original inactiva', 'P09-categoria-inactiva-network.png', 'Al editar el producto 73, el select conserva la categoría original con (inactiva). El aviso explica que debe elegirse una activa; Actualizar no envía una petición.'),
('10. Cambio de categoría: respuesta HTTP', 'P10-cambio-categoria-network.png', 'PUT /productos/75: 200 OK. La fila actualizada queda fuera del área visible de esta captura; el complemento muestra una reasignación previa del mismo producto.'),
('10. Complemento: categoría actualizada', 'P10-cambio-categoria.jpg', 'Ejecución anterior: producto 75 reasignado de categoría 46 a 47. En una edición posterior del estudiante se cambió a Aceites; esta categoría se observa en el caso 11.'),
('11. Baja lógica del producto', 'P11-baja-network.png', 'DELETE /productos/75: 204 No Content. La fila permanece, muestra Inactivo y el botón Dar de baja está deshabilitado.'),
('12. Categoría referenciada: retest correcto', 'P12-categoria-referenciada-409-network.png', 'DELETE /categorias/47: 409 Conflict. El mensaje explica la dependencia y pide reasignar productos. La categoría 47 permanece en la tabla. Resultado final del caso: pasa.'),
('Anexo. Caso 12 antes de la corrección', 'P12-categoria-referenciada-500-network.png', 'Evidencia histórica del defecto: DELETE /categorias/47 devolvía 500 aunque la SPA mostraba un mensaje claro. Este resultado fue reemplazado por el retest 409; no representa el comportamiento final.')
]
for args in cases:
    evidence(*args)
c.save()
print(f'{OUTPUT}: {page} páginas')
