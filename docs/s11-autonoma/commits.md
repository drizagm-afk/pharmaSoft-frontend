# Commits sugeridos - ejecutar personalmente

No se ha preparado ni ejecutado ningún commit. Desde PharmaFrontend, confirma primero la rama:

```powershell
git branch --show-current
git status --short
```

La rama de esta actividad es `feature/seguridad-spa-pruebas-delcarpio`. Si todavía estuvieras en la práctica y la rama no existiera, se crea desde allí con `git switch -c feature/seguridad-spa-pruebas-delcarpio`.

## Aviso y temporizadores

```powershell
git add -- src/app/core/auth/auth-service.ts src/app/core/auth/auth-service.spec.ts src/app/core/auth/auth.model.ts src/app/shared/components/aviso-sesion src/app/layout/main-layout src/app/core/auth/auth.fixture.spec-helper.ts
git diff --cached --stat
git commit -m "feat(auth): aviso previo a la expiración con cuenta regresiva"
```

El servicio también incluye obtenerPerfil, que usa la página del segundo commit. La fixture se ajusta a los signals del aviso usados por el layout.

## Mi cuenta

```powershell
git add -- src/app/features/auth/pages/mi-cuenta src/app/app.routes.ts src/app/layout/header src/app/core/auth/security-navigation.spec.ts
git diff --cached --stat
git commit -m "feat(auth): página Mi cuenta con perfil y permisos del servidor"
```

## Matriz y guía

```powershell
git add -- docs/matriz-seguridad-spa-s11.md docs/s11-autonoma
git diff --cached --stat
git commit -m "test(auth): matriz y guía de validación de la SPA segura"
```

El PDF final y las evidencias se añaden después de la ejecución manual. No uses git add . para esta actividad: aún hay documentos antiguos de otras sesiones sin seguimiento. Revisa siempre los archivos preparados. Push y PR hacia develop quedan para cuando decidas hacerlos.
