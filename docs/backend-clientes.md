# Ajustes de PharmaBackend para Clientes

Preparado para la copia local `C:/Users/DRIZA/OneDrive/Documentos/UNI/pharmaSoft`.
El backend no se ha modificado. El parche corresponde a los archivos inspeccionados en esta sesión.

## Qué cambia

1. Crea `dto/PaginaResponseDTO.java`, un record genérico con contenido y metadatos.
2. Agrega `listar(pagina, tamanio, ordenarPor, direccion)` a `service/service/ClienteService.java`.
3. Implementa ese método en `service/impl/ClienteServiceImpl.java` con `PageRequest`, validación del campo de orden y `ClienteMapper`. Mantiene `readAll()` para no romper otros consumidores internos.
4. Modifica `ClienteController.getClientes()` para aceptar los cuatro parámetros y devolver el DTO paginado.
5. Cambia `ClienteServiceImpl.delete()` a baja lógica: valida que esté activo, asigna `estado=false` y guarda. Una segunda baja arroja `ReglaNegocioException`, que el manejador actual convierte a HTTP 409.
6. Corrige PUT para responder 200; POST conserva 201.

No requiere cambios de tablas, migraciones, CORS ni repositorio: `ClienteRepository` ya extiende `JpaRepository`, que soporta `findAll(Pageable)`.

## Aplicar desde PowerShell

Detén el backend en el IDE antes de compilar y reiniciar. Revisa primero tu trabajo local:

```powershell
Set-Location 'C:/Users/DRIZA/OneDrive/Documentos/UNI/pharmaSoft'
git status --short
git apply --check --ignore-whitespace '../frontend/pharma-frontend/docs/backend-clientes.patch'
```

Si la comprobación no muestra errores, aplica y revisa:

```powershell
git apply --ignore-whitespace '../frontend/pharma-frontend/docs/backend-clientes.patch'
git diff --stat
git diff
```

Si `git apply --check` falla, no fuerces el parche: probablemente esos archivos cambiaron. El archivo `.patch` contiene todas las líneas concretas para adaptar los cambios en el IDE.

Compila con el wrapper Maven (o `mvn` si no hay wrapper):

```powershell
./mvnw.cmd test
```

Ejecuta otra vez PharmaBackend con la misma configuración/perfil de desarrollo que usas actualmente. No necesitas reinstalar Oracle ni cambiar el esquema.

## Verificar

En Swagger ejecuta:

```text
GET /api/v1/clientes?pagina=0&tamanio=5&ordenarPor=apellidos&direccion=asc
```

La respuesta debe ser un objeto, no un arreglo:

```json
{
  "contenido": [],
  "pagina": 0,
  "tamanio": 5,
  "totalElementos": 0,
  "totalPaginas": 0,
  "ultima": true
}
```

Con datos reales, contenido y totales reflejarán tu base. Prueba `pagina=1`, orden descendente y un campo no permitido (debe responder 409).
Para verificar la baja utiliza un cliente de prueba: DELETE devuelve 204, GET por id conserva el cliente con estado false, y repetir DELETE devuelve 409. No uses un cliente real para esta prueba.

Luego abre el frontend en `/clientes`. Las capturas y las pruebas con datos reales del informe deben hacerse después de estos cambios.

## Estado de verificación

El parche fue preparado a partir del código local; no se ha aplicado, compilado ni probado contra Oracle. La comprobaci?n `git apply --check --ignore-whitespace` pas? sobre esta copia local (el flag admite sus finales de l?nea CRLF). El frontend sí fue verificado con respuestas HTTP simuladas del contrato requerido.
