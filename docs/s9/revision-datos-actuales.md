# Revisión de datos actuales — PharmaSoft / S9

Consulta realizada: **11 de octubre de 2026, 16:20 (-05:00, Lima)**.

Fuente: respuestas completas de la API local `http://localhost:8080/api/v1`. Clientes y productos devolvieron una sola página, con `tamanio=100` y `ultima=true`; por tanto, este inventario incluye todos los registros expuestos por esos endpoints. Es una fotografía del estado actual, no una sincronización automática ni una auditoría de tablas internas de Oracle.

## Qué se insertó durante la revisión anterior

- Tú ejecutaste la carga inicial de categorías, clientes y productos, ajustando nombres y datos.
- Durante las pruebas de integración inserté categorías, clientes, productos, ventas y detalles **temporales**, necesarios para comprobar cálculos, rollback, concurrencia y operaciones de catálogo.
- Las pruebas eliminaron sus propios registros al terminar. No quedó ningún cliente con DNI `99999999`, ni categoría o producto con nombre `TEST ...`.
- No añadí registros permanentes al catálogo ni ventas permanentes. Los stocks actuales coinciden con los valores de partida registrados antes de las pruebas.
- Los identificadores generados pueden haber avanzado durante las pruebas. Los huecos en una secuencia no significan que queden registros temporales ni que falten datos.
- El script de venta anulada preparado anteriormente no se ejecutó sobre una venta permanente.

## Resumen

| Entidad / estado | Cantidad |
|---|---:|
| Categorías totales | 4 |
| Categorías activas / inactivas | 3 / 1 |
| Clientes totales | 5 |
| Clientes activos / inactivos | 4 / 1 |
| Productos totales | 8 |
| Productos activos / inactivos | 7 / 1 |
| Productos activos con stock positivo | **6** |
| Productos activos sin stock | 1 |
| Ventas | **0** |
| Filas del reporte de ventas por categoría | **0** |

Todas las categorías, clientes y productos tienen `fechaCreacion = 2026-10-11T19:29:44` y `fechaModificacion = null`. La API devuelve estas fechas sin zona horaria; no deben interpretarse como UTC sin verificar la configuración.

## Categorías

| ID | Nombre | Descripción | Estado | Productos vinculados |
|---:|---|---|---|---:|
| 9 | Analgésicos | Analgésicos para el dolor | Activo | 2 |
| 10 | Vitaminas | Vitaminas que fortalecen | Activo | 2 |
| 11 | Higiene | Productos de Higiene | Activo | 4 |
| 12 | Medicamentos Fuertes | Medicamentos Fuertes (Desabilitado Temporalmente) | Inactivo | 0 |

La descripción de la categoría 12 contiene literalmente **«Desabilitado»**. Si deseas corregirla, sería **«Deshabilitado»**; no se modificó.

## Clientes

### Identificación y estado

| ID | DNI | Nombres | Apellidos | Correo | Estado |
|---:|---|---|---|---|---|
| 11 | 90000001 | María Elena | Huamán Flores | maria.huaman@gmail.com | Activo |
| 12 | 90000002 | José Luis | Pérez Soto | jose.perez@gmail.com | Activo |
| 13 | 90000003 | Ana Lucía | Quispe Díaz | ana.quispe@gmail.com | Activo |
| 14 | 90000004 | Carlos | Ramírez Vega | carlos.ramirez@gmail.com | Activo |
| 15 | 90000005 | Martín | Guevara Salmón | martin.quevara@gmail.com | Inactivo |

### Datos opcionales

| ID | Teléfono | Dirección |
|---:|---|---|
| 11 | 900000001 | Por Lurigancho Chosica, Alameda |
| 12 | 900000002 | Por Lurigancho Chosica, Betania |
| 13 | `null` | `null` |
| 14 | 900000004 | Por Lurigancho Chosica, cerca de la UPeU |
| 15 | `null` | `null` |

Revisión de formato y consistencia:

- Los cinco DNI tienen ocho dígitos y no se repiten.
- Los cinco correos son distintos y tienen formato aparente válido. No se verificó que las cuentas existan.
- Los teléfonos presentes tienen nueve dígitos; `null` es válido para los campos opcionales.
- Hay apellidos con tildes para comprobar búsquedas sin acentos: `Huamán`, `Pérez`, `Ramírez`.
- El cliente inactivo para B-01 y M-02 es el **15**, DNI **90000005**.
- El correo del cliente 15 dice **`quevara`**, mientras que el apellido dice **Guevara**. Puede ser intencional; conviene revisarlo y no se corrigió automáticamente.

## Productos

### Precio, stock y disponibilidad

| ID | Producto | Categoría (ID) | Precio S/ | Stock | Estado | Disponible para nueva venta |
|---:|---|---|---:|---:|---|---|
| 17 | Paracetamol | Analgésicos (9) | 2.50 | 50 | Activo | Sí |
| 18 | Ibuprofeno | Analgésicos (9) | 3.75 | 30 | Activo | Sí |
| 19 | Vitamina C | Vitaminas (10) | 1.20 | 40 | Activo | Sí |
| 20 | Multivitamínico | Vitaminas (10) | 12.90 | 20 | Activo | Sí |
| 21 | Alcohol 70% | Higiene (11) | 6.80 | 25 | Activo | Sí |
| 22 | Gel antibacterial | Higiene (11) | 4.35 | **2** | Activo | Sí |
| 23 | Guantes de Latex | Higiene (11) | 5.00 | **0** | Activo | No: sin stock |
| 24 | Jabón de mesa | Higiene (11) | 7.50 | 10 | **Inactivo** | No: inactivo |

### Descripciones almacenadas

| ID | Descripción |
|---:|---|
| 17 | Paracetamol 500 mg |
| 18 | Ibuprofeno 400 mg |
| 19 | Vitamina C 50 mg |
| 20 | Multivitamínico de Calidad |
| 21 | Alcohol 70% 250 ml |
| 22 | Gel antibacterial 10ml (Bajo Stock) |
| 23 | Guantes de Latex para protección (No Stock) |
| 24 | Jabón de mesa (Inactivo) |

Revisión de formato y consistencia:

- Todos los precios son positivos y pueden expresarse con dos decimales.
- Todos los stocks son enteros y no negativos.
- Los nombres de producto no se repiten en el inventario.
- Todos los productos referencian una categoría existente y activa.
- Hay **167 unidades** entre los productos activos con stock y **10 unidades** en el producto inactivo.
- Los productos 23 y 24 son útiles para comprobar que el buscador de ventas excluye productos sin stock o inactivos. Conviene conservar esos casos.
- «Latex» podría escribirse «látex» si deseas uniformar la redacción; es una revisión de nombre, no un error de integridad.

## Ventas y reporte

`GET /ventas` devuelve `[]`: no hay ventas permanentes.

`GET /reportes/ventas-por-categoria` devuelve `[]`: el reporte vacío es coherente con la ausencia de ventas.

Todavía no existe una venta anulada permanente para la prueba I-01. Las pruebas deberán generar ventas controladas para comprobar el reporte con resultados y, después, preparar una venta anulada para la impresión correspondiente.

## Preparación pendiente para la actividad autónoma

| Requisito | Situación actual | Trabajo pendiente |
|---|---|---|
| Al menos 3 clientes activos | Hay 4 | Cumplido |
| Al menos 1 cliente inactivo | Hay 1 | Cumplido |
| 8 productos activos con stock | Hay **6** | Añadir **2 productos activos con stock** |
| Producto con stock 2 | Gel antibacterial, ID 22 | Cumplido; reservarlo para V-03 y M-01 |
| C-01: producto de S/12.50 | No existe | Uno de los nuevos productos debe costar **12.50** |
| C-02: producto de S/18.90 | No existe | El otro nuevo producto debe costar **18.90** |
| Ventas registradas para reporte y consistencia | No existen | Generarlas durante la validación controlada |
| Venta anulada para impresión | No existe | Prepararla antes de la fase de evidencias |

Propuesta para tu revisión, **sin ejecutar**:

- Conservar los ocho productos actuales, incluidos el inactivo y el de stock cero.
- Añadir dos productos cuyos nombres puedas elegir, en categorías activas, con precios **S/12.50** y **S/18.90**.
- Darles stock suficiente para ejecutar cálculos y registro de ventas sin alterar el producto de stock 2.
- Definir una forma de restablecer únicamente el stock de los casos controlados antes de repetirlos para las evidencias.

## Qué puedes revisar ahora

- Nombres y descripciones de categorías y productos.
- DNI, apellidos, correos, teléfonos y direcciones de los clientes.
- Categoría, precio, stock y estado de cada producto.
- Si `martin.quevara@gmail.com` y las descripciones señaladas son intencionales.
- Los nombres y categorías que deseas para los dos productos adicionales.

**Esta revisión no insertó, actualizó ni eliminó datos.**
