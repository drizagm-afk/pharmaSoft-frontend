# Revisión final - actividad autónoma S7

Revisión contra el PDF suministrado por el usuario y el código local.

| Parte | Resultado |
|---|---|
| A1-A3 | Feature organizado en models/services/pages/routes; contratos nullable y PaginaResponse genérico; cinco métodos HTTP tipados. |
| A4 | Signals, computed local, tamaños 5/10/20, orden DNI/apellidos, controles y estados; baja recarga la página. |
| A5 | Registro/edición, validaciones equivalentes, opcionales vacíos a null; mensajes del backend. |
| A6 | Clientes bajo MainLayout con loadChildren y opción central en MENU. |
| A7 | Once casos con capturas guardadas; A9-A10 muestran 204/200/409 pero no Headers/Method completos. A8 usa DNI completo y apellido; búsqueda parcial está implementada con includes y cubierta por pruebas. |
| B1-B3 | Árbol resumido de carpetas reales, mapa completo de rutas y tabla de responsabilidades de ambos features y tres componentes de layout. |
| B4 | Flujo de registro con componente, servicio, HTTP, backend, signals, navegación y rama 409. |
| B5 | Siete respuestas con archivos/líneas; chunk production clientes-routes 13.77 kB comprobado. |
| C | Rama correcta feature/clientes-delcarpio. Trabajo Clientes aún sin commits; tres commits de la actividad, publicación y PR hacia develop pendientes. Enlace PR pendiente en informe. Aula virtual pendiente. |

## Validación

- npm run build: aprobado en la preparación del informe, chunk diferido real incluido.
- npm test -- --watch=false: 45 pruebas aprobadas en 14 archivos durante esta revisión.
- informe-arquitectura.pdf: cinco páginas técnicas.
- anexo-evidencias.pdf: 16 páginas de capturas originales.
- DelCarpio_LP2_S7_Autonoma.pdf: documento combinado de 21 páginas (cinco técnicas + anexo); no se presenta como informe técnico de 21 páginas.

El usuario indicó que el docente no requiere distribuir los commits en días distintos. No se inventaron commits ni fechas. No se hicieron commits, push ni entrega al aula durante esta revisión.
