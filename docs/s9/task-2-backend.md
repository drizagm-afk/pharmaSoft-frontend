# Task 2: Backend pagination (45-60 minutes)

Owner: you. Codex builds the frontend in parallel. Leave stock deduction for Task 3.

## Contract

Clients: GET /api/v1/clientes?pagina=0&tamanio=10&ordenarPor=apellidos&direccion=asc

Products: GET /api/v1/productos?pagina=0&tamanio=10&ordenarPor=nombre&direccion=asc

Sales: GET /api/v1/ventas/buscar?pagina=0&tamanio=10&ordenarPor=fecha&direccion=desc

All three return this shape (zero-based pagina):

```json
{
  "contenido": [],
  "pagina": 0,
  "tamanio": 10,
  "totalElementos": 0,
  "totalPaginas": 0,
  "ultima": true
}
```

Keep Categories as an array, single-record GET responses unchanged, and report responses as arrays. Do not filter inactive catalog records out of list endpoints: the existing management pages need them. The sale form filters selectable records itself.

## 1. Generic response DTO (5-10 minutes)

Create `dto/PaginaResponse.java` in `com.edu.upeu.PharmaBackend.dto`:

```java
import org.springframework.data.domain.Page;
import java.util.List;

public record PaginaResponse<T>(
    List<T> contenido,
    int pagina,
    int tamanio,
    long totalElementos,
    int totalPaginas,
    boolean ultima
) {
    public static <T> PaginaResponse<T> de(Page<T> page) {
        return new PaginaResponse<>(page.getContent(), page.getNumber(),
            page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
```

Include the package declaration. Return this DTO rather than serializing Spring's Page directly.

## 2. Clients and Products (15-20 minutes)

Add to ClienteService:

```java
PaginaResponse<ClienteResponseDTO> listar(int pagina, int tamanio,
                                        String ordenarPor, String direccion);
```

Add the same method to ProductoService with ProductoResponseDTO. Leave CrudService and readAll() alone; this avoids changing unrelated code.

Implement each method with `@Transactional(readOnly = true)`:

1. Validate pagina >= 0 and tamanio between 1 and 100. Reject invalid values with ReglaNegocioException (409, consistent with the existing business-rule handler).
2. Validate sorting against an allowlist; do not accept arbitrary entity properties.
   - Clients: id, dni, nombres, apellidos, email.
   - Products: id, nombre, precio, stock.
3. Accept asc/desc only. Use sensible defaults when values are omitted; trim strings and compare direction case-insensitively.
4. Build Sort and append id as a stable tie-breaker unless sorting by id already.
5. Build `PageRequest.of(pagina, tamanio, sort)`.
6. Call the existing JpaRepository's `findAll(pageable)` and use `Page.map(ClienteMapper::ConvertToResponse)` or ProductoMapper respectively.
7. Wrap the mapped page using PaginaResponse.de(...).

Update only the collection GET controller methods to return `ResponseEntity<PaginaResponse<...>>` and call listar(). Add @RequestParam defaults:

| Parameter | Clients | Products |
| --- | --- | --- |
| pagina | 0 | 0 |
| tamanio | 10 | 10 |
| ordenarPor | apellidos | nombre |
| direccion | asc | asc |

No custom repository query is necessary for these two list endpoints.

## 3. Sales search (20-25 minutes)

Change VentaService.buscar() return type to `PaginaResponse<VentaResponseDTO>` and append `int pagina, int tamanio` to its arguments. Update its implementation and controller call in the same order.

The controller retains clienteId, estado, desde, hasta, ordenarPor and direccion. Add pagina=0 and tamanio=10 defaults.

Retain the current date validation and inclusive date conversion:

```java
LocalDateTime desdeHora = desde == null ? null : desde.atStartOfDay();
LocalDateTime hastaHora = hasta == null ? null : hasta.atTime(LocalTime.MAX);
```

In VentaRepository, replace the current paginated-search candidate with a query that DOES NOT fetch the details collection:

```java
@Query(value = """
    select v from Venta v
    where (:clienteId is null or v.cliente.id = :clienteId)
      and (:estado is null or v.estado = :estado)
      and (:desde is null or v.fecha >= :desde)
      and (:hasta is null or v.fecha <= :hasta)
    """, countQuery = """
    select count(v) from Venta v
    where (:clienteId is null or v.cliente.id = :clienteId)
      and (:estado is null or v.estado = :estado)
      and (:desde is null or v.fecha >= :desde)
      and (:hasta is null or v.fecha <= :hasta)
    """)
Page<Venta> buscar(
    @Param("clienteId") Long clienteId,
    @Param("estado") EstadoVenta estado,
    @Param("desde") LocalDateTime desde,
    @Param("hasta") LocalDateTime hasta,
    Pageable pageable);
```

Add Page/Pageable imports. Retain all report queries.

In the service, keep `@Transactional(readOnly = true)`, validate pagination, use the existing construirSort(), append an id tie-breaker, and map the returned page using VentaMapper::ConvertToResponse. Map INSIDE the transaction so lazy details can load. This can make extra detail queries for each sale; acceptable for the small practice dataset. It preserves actual database pagination instead of loading every sale or paginating a collection fetch join.

## Done criteria (basic integration, not the full validation exercise)

1. Backend compiles and starts under Java 25.
2. Clients pagina=0&tamanio=2 returns two records, totalElementos=5 and totalPaginas=3.
3. Clients pagina=1&tamanio=2 returns the next two records.
4. Products pagina=0&tamanio=3 returns three records, totalElementos=8 and totalPaginas=3.
5. Sales search returns the paginated empty object above (there are no sales yet).
6. Categories and reports still return arrays; individual client/product GETs still return an object.
7. Send Codex "Task 2 ready" and any error output. Codex will inspect the diff before the integration commit.

Stage only your pagination files after review. Suggested commit:

`feat(api): paginate clients products and sales search`
