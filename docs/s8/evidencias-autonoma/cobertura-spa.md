# Cobertura SPA realizada por Codex

C-04: dos pestañas, formulario original seleccionado con categoría 67 activa; segunda pestaña desactiva 67; original guarda producto 92. Capturas reales del formulario y categoría guardadas.
C-06: formulario producto 87 renombra a qa s8 auto a04 y asigna categoría 46; SPA vuelve a lista; siguiente página muestra ambos nombres duplicados. Capturas reales guardadas.
B-01: click Dar de baja del producto 87 abre confirm. El intento de aceptar tuvo timeout; GET aún mostraba activo. La baja se completó mediante API y se abrió una nueva pestaña de productos: página 2 muestra producto 87 Inactivo y Dar de baja deshabilitado. Screenshot de esta vista falló con timeout, por lo que no se afirma disponer de captura ni de DELETE originado por SPA.
B-03, B-04, B-05: petición y verificación API completas; interacción SPA y capturas Network pendientes.

El helper Windows terminó el control por no poder verificar con confianza la URL del navegador. No es un fallo del backend ni evidencia de una prueba fallida.

## Regresión tras las correcciones del backend

Capturas reales de la SPA guardadas:
- A-02: categoria obligatoria (`regresion-A-02_spa.png`).
- A-06: precio cero y stock negativo bloqueados (`regresion-A-06_spa.png`).
- A-07: stock 1.5 bloqueado (`regresion-A-07_spa.png`).
- C-02: aviso de categoria inactiva en el formulario (`regresion-C-02_spa.png`); esta captura por si sola no acredita un PUT rechazado.
- C-03: intento de desactivar categoria 46 rechazado por productos activos (`regresion-C-03_spa.png`).
- C-04: categoria 71 activa seleccionada en formulario; otra pestaña la desactiva; registro desde formulario obsoleto rechazado. Evidencia: `regresion-C-04_formulario.png`, `regresion-C-04_categoria-inactiva.png`, `regresion-C-04_spa-rechazo.png`.
- C-06: cambio de nombre del producto 94 a `qa s8 auto a04` rechazado (`regresion-C-06_spa.png`).

Estas capturas muestran la SPA y no el panel Network. Las capturas Network y los flujos SPA B-01/B-03/B-04/B-05 siguen pendientes. La regresión API independiente está documentada en `../regresion-api-s8.json`.

## Evidencia aportada por el estudiante después de la regresión
Se incorporaron 18 capturas originales sin edición. B-01: DELETE producto 95, 204, fila Inactivo y botón deshabilitado. B-03: DELETE categoría 71, 204; categoría ausente del selector de alta recargado. B-04: DELETE categoría 69, 409, referencia conservada; Response tiene mensaje cortado horizontalmente y el banner queda fuera del encuadre. B-05: DELETE categoría 67, 409, mensaje completo en la SPA y categoría conservada; Response parcialmente cortada.
A-02/A-06/A-07/C-02: mensajes preventivos y Network vacío. C-03: PUT categoría 46, 409 y listado posterior conserva Activo. C-06: PUT producto 94, 409 por duplicado, mensaje completo en SPA. C-04: categoría nueva 72 My Lil Category desactivada por PUT 200; formulario previo envía POST productos y recibe 409 por categoría inactiva. Las capturas no muestran el formulario antes de desactivar; la secuencia es compatible con la repetición en dos pestañas. Parte C: filtro categoría 69, tamaño 100, GET 200 y fila de producto 94 inactivo.
La evidencia HTTP esencial de los casos pendientes está cubierta. Para presentación completa faltan Response de C-03/C-06/C-04 y una captura B-04 con banner completo visible. No es necesario repetir las escrituras: capturar la respuesta seleccionada si permanece disponible. Los 204 no tienen cuerpo; no hace falta solicitar una respuesta JSON para ellos. El PDF anterior conserva un estado pendiente anterior a estas capturas y debe actualizarse antes del commit documental final.

## Actualización final con ocho capturas adicionales
Se incorporan originales sin edición, con sufijo adicional para preservar los intentos anteriores. C-03/C-06/C-04 ahora incluyen Response: 409 y mensajes de negocio concordantes con la SPA. C-04 incluye además la respuesta de categoría 72 con estado false y fecha de modificación. B-04 aporta Headers/Response de otro intento DELETE categoría 69: 409 y referencia conservada. El mensaje largo sigue cortado y el banner fuera del encuadre; se documenta ese límite, sin pedir repetir la operación. Los JSON API registran el texto completo.
La petición anterior de capturas complementarias queda supersedida por esta incorporación. La evidencia esencial disponible está reunida; no se afirma que cada captura muestre todas las precondiciones o el texto JSON íntegro. Informe de cuatro páginas actualizado. Commits del estudiante verificados: 8b4e9af, fae118a y backend 79f0dd4.
