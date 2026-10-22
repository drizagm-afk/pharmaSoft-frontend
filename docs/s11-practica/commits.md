# Sesión 11 - commits para ejecutar personalmente

Ejecuta estos comandos **desde PharmaFrontend**, en `feature/seguridad-frontend-delcarpio`. Se usan rutas concretas para no incluir los documentos antiguos de S9 ni los cambios pendientes de PharmaBackend. No se ha ejecutado ninguno de estos commits.

```powershell
git branch --show-current
git status --short
```

## 1. Sesión y expiración

```powershell
git add -- src/app/core/auth/auth.model.ts src/app/core/auth/auth-service.ts src/app/core/auth/auth-service.spec.ts
git commit -m "feat(auth): sesión en sessionStorage con expiración automática"
```

## 2. Interceptores

```powershell
git add -- src/app/core/auth/api-url.ts src/app/core/interceptors src/app/app.config.ts
git commit -m "feat(auth): interceptores de token y manejo de errores 401"
```

## 3. Login y navegación protegida

```powershell
git add -- src/app/core/guards src/app/features/auth src/app/shared/pages/acceso-denegado src/app/app.routes.ts src/app/features/categorias/categorias.routes.ts src/app/features/productos/productos.routes.ts src/app/features/clientes/clientes.routes.ts src/app/features/ventas/ventas.routes.ts
git commit -m "feat(auth): login y guards de sesión y permisos"
```

## 4. Menú, acciones y pruebas de integración

```powershell
git add -- angular.json src/app/core/config/menu.ts src/app/layout src/app/shared/directives src/app/features/categorias/pages/categoria-list src/app/features/productos/pages/producto-list src/app/features/clientes/pages/cliente-list src/app/features/ventas/pages/venta-list src/app/core/auth/auth.fixture.spec-helper.ts src/app/core/auth/security-navigation.spec.ts src/app/app.routes.spec.ts docs/s11-practica
git commit -m "feat(auth): menú y acciones según permisos con pruebas de integración"
```

Revisa los archivos preparados con `git diff --cached --stat` antes de cada commit si quieres comprobar su alcance. Los cuatro grupos corresponden a la guía; las pruebas de integración quedan en el cuarto, cuando ya están todos los componentes conectados.

## Verificación antes de subir

```powershell
npm run build
npm test -- --watch=false
git log -4 --oneline
git status --short
```

Los archivos antiguos de documentación pueden seguir sin seguimiento: no pertenecen a estos cuatro commits. Cuando decidas subir la rama:

```powershell
git push -u origin feature/seguridad-frontend-delcarpio
```

Después abre el PR hacia `develop`. La entrega práctica también pide el PDF con las capturas de sus 16 pruebas; se generará al revisar la evidencia. Estos comandos no crean commits en el backend ni dan por presentada la actividad.
