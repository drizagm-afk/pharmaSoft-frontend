# Commits sugeridos - ejecutar personalmente

Ejecutar desde C:\Users\DRIZA\Documents\UNI\(IV - Class) PharmaFrontend. Son comandos Git directos. Revisar el índice antes de confirmar; no usar git add . porque quedan archivos de evidencias de otra sesión.

## Modelo, servicios y componente compartido - paso 3

```text
git add -- src/app/core/models/pagina.ts src/app/core/models/pagina-response.ts src/app/core/utils/paginacion.ts src/app/shared/components/paginador src/app/features/productos/services/producto-service.ts src/app/features/ventas/services/venta-service.ts
git diff --cached --stat
git commit -m "feat(shared): incorporar contrato paginado y paginador reutilizable"
```

## Productos y Ventas con estado en URL - paso 4

```text
git add -- src/app/features/productos/pages/producto-list src/app/features/ventas/pages/venta-list
git diff --cached --stat
git commit -m "feat(listados): conservar paginacion y filtros en la URL"
```

## SQL y guía del alcance solicitado - paso 2 y comprobación

```text
git add -- docs/sql/volumen_pruebas.sql docs/s14
git diff --cached --stat
git commit -m "docs(s14): preparar carga de volumen y validacion de pasos 1 a 4"
```

La rama feature/integracion-estabilizacion-delcarpio ya está activa en ambos repositorios. No se modificó código del backend: su API ya dispone de paginación y validaciones. Sus cambios locales anteriores permanecen sin incluir en estos comandos. No se incluyen push, solicitudes de incorporación ni cambios de fechas de commits.
