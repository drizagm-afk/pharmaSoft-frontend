# Sesión 11 autónoma - implementación y preparación

## Alcance

Rama: `feature/seguridad-spa-pruebas-delcarpio`, desde la práctica. No se han realizado commits, push ni PR. El backend existente conserva sus endpoints y configuración; no hace falta una migración ni insertar datos nuevos.

La actividad requiere una matriz de ocho columnas con 16 casos base, cuatro propios de grupos diferentes y cuatro casos de aviso. Se prepararon además dos casos de Mi cuenta: 26 casos con resultados registrados tras la validación manual del 25 de octubre. El caso propio L-05 corresponde al username con espacios finales que se observa en la captura. La fecha de entrega indicada es el 28 de octubre de 2026 a las 23:59, America/Lima.

## Cambios

- AuthService mantiene segundosRestantes y porVencer. El intervalo se actualiza cada segundo y se limpia junto con el timeout al cerrar sesión, cambiar de sesión o destruir el servicio.
- AvisoSesion aparece cuando quedan 120 segundos o menos, encima del contenido y con role=status. Muestra mm:ss y ofrece Cerrar sesión ahora y ×. Ocultarlo no cambia el vencimiento ni renueva el token. El descarte se conserva tras F5 en esa sesión; se restablece al iniciar otra.
- MiCuenta es una ruta lazy dentro del layout, con authGuard heredado y sin permisoGuard. Consume AuthService.obtenerPerfil() y presenta carga, error, reintento, nombre, usuario, roles y ocho permisos en cinco módulos.
- El backend existente usa empleadoNombre en /auth/me. El servicio adapta ese campo a nombreCompleto, admitiendo también el nombre de campo de la guía. No se cambió el contrato del backend.
- La comparación de permisos usa conjuntos, sin depender de su orden. Un cambio muestra el aviso de volver a entrar; no sobrescribe la sesión guardada ni sus permisos. La interfaz sigue mostrando sus permisos de inicio hasta cerrar sesión e ingresar otra vez.
- Mi cuenta está enlazada junto al nombre en el encabezado y disponible para cualquier rol autenticado.
- Se conserva el comportamiento independiente de sessionStorage entre pestañas. No se agregó sincronización de logout ni renovación de JWT.

## Dos detalles de la especificación

Con un token de tres minutos y un umbral de dos minutos restantes, el aviso aparece al transcurrir aproximadamente un minuto. La referencia a «aparece a los 2 minutos» se interpreta como «cuando quedan dos minutos», conforme a la regla de 120 segundos y la lista de cotejo.

Un navegador puede restaurar las pestañas y su sessionStorage al recuperar una sesión anterior. S-01 debe comprobarse en una ventana de prueba nueva, sin restauración. S-04 documenta el estado real de cada pestaña; no se fuerza un logout global para cambiar artificialmente ese resultado.

## Validación y documentos

Los resultados automatizados se guardan en validacion-implementacion.json. La matriz manual está en ../matriz-seguridad-spa-s11.md y la secuencia está en guia-validacion-manual.md. Las comprobaciones automáticas usan HTTP simulado y reloj controlado para no cambiar roles, datos, secreto JWT ni duración del backend antes de las capturas.

Los documentos generados son ../informe-s11.pdf (3 páginas; copia para el aula virtual en ../DelCarpio_LP2_S11_Autonoma.pdf) y ../DelCarpio_LP2_S11_Matriz_Evidencias.pdf (matriz de ocho columnas y evidencias por aspecto). El informe contiene C1, C2 y los cuatro párrafos de C3, con ejemplos inline. La matriz registra 26 casos Pasa y cero Falla para los comportamientos observados.

manifest-evidencias.json conserva el orden por CreationTime, dimensiones y hashes de origen y copia. Las copias publicables están en evidencias/, nombradas con el ID del caso. Se conservan las 83 capturas y se ocultan las regiones con tokens en 24 copias mediante redacción de PDF y renderizado a la resolución original. Los archivos de origen no se modificaron. El registro validacion-implementacion.json conserva su carácter histórico anterior a la validación manual; el resultado documental está en validacion-documentos.json.

Para reproducir generar_documentos.py se necesitan reportlab, Pillow y PyMuPDF, además de las fuentes Arial de Windows y las capturas de origen. En esta sesión PyMuPDF se instaló únicamente en tmp/pdfdeps, carpeta ignorada por Git. No se hicieron cambios al código de la aplicación durante la documentación.

El versionamiento y la entrega se hacen personalmente: al menos tres commits, PR hacia develop y el informe DelCarpio_LP2_S11_Autonoma.pdf. La excepción comunicada de commits el mismo día se conserva; no se fabrican fechas. Los comandos sugeridos están en commits.md.
