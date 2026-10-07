# Cierre y entrega S8

## Completado
- Backend: commit del estudiante `79f0dd4 fix(productos): validar dependencias nombres y stock`.
- Frontend Parte C: `8b4e9af feat(categorias): navegar a productos por categoria`.
- Matriz/evidencia inicial: `fae118a test(dependencias): registrar matriz y evidencias S8`.
- Verificación previa: 19 pruebas backend, 28 comprobaciones API, 53 pruebas frontend y build de producción satisfactorios.
- Se incorporaron 18 capturas y ocho adicionales originales del estudiante. La matriz/cobertura indican los IDs y resultados; no repetir operaciones de escritura para obtener de nuevo estos resultados.
- Informe B1-B5 actualizado, cuatro páginas. B-04 conserva un límite visual: mensaje JSON recortado y banner fuera del encuadre. Los JSON API complementan el detalle.

## Pendiente
1. Exportar desde Postman la colección real **PharmaSoft - S8 Dependencias**, formato **Collection v2.1**, y guardar como `postman/PharmaSoft-S8-Dependencias.json`. El archivo preparado actual no se presenta como exportación verificada de la interfaz. Revisar todas las peticiones y variables tras sustituirlo.
2. Revisar y hacer el commit documental con las capturas nuevas y el informe. Desde pharma-frontend:

```powershell
git add -- docs/informe-hallazgos-s8.pdf docs/matriz-pruebas-s8.md docs/s8 postman/PharmaSoft-S8-Dependencias.json
git diff --cached --stat
git commit -m "docs: completar informe y evidencias S8"
```

3. Hacer push de las ramas y abrir PR del frontend hacia develop según la actividad. No se afirma que ese PR esté creado o enviado.
4. Entregar el PDF en aula virtual con nombre `DelCarpio_LP2_S8_Autonoma.pdf`, junto a los enlaces/archivos que exige la guía.

La guía pide tres commits en días distintos: tres commits por sí solos no acreditan ese requisito. No alterar las fechas para simularlo. El historial verificado incluye los dos commits frontend anteriores; el tercero documental aún no existe.

## Archivos backend locales ajenos al commit
`CategoriaDeletionTest.java` y `ProductoContractTest.java` aparecen eliminados en el directorio de trabajo, sin staging. Esas eliminaciones precedían las correcciones y permanecen fuera de 79f0dd4. Revisarlas por separado; no incluirlas accidentalmente con git add .
