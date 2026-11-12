# Recuperación del despliegue Nginx

El contenedor no podía arrancar porque deploy/nginx.conf era un directorio vacío, mientras el destino /etc/nginx/conf.d/default.conf requiere un archivo. La rama actual no incluía los archivos de despliegue de S13.

Se restauraron nginx.conf y docker-compose.yml a partir del contenido de la rama feature/optimizacion-produccion-delcarpio. Se conservó el nombre de proyecto Compose pharmasoft-s13 para reutilizar los contenedores existentes. Ambos bind mounts ahora usan create_host_path: false: Docker debe informar un archivo/directorio fuente ausente en lugar de crear una ruta incompatible.

Se comprobó que el directorio nginx.conf estaba vacío antes de sustituirlo por el archivo. Se recreó únicamente el servicio web, conservando Oracle, Redis y los datos cargados.

## Resultado comprobado

- pharma-web: healthy.
- nginx -t: sintaxis y configuración correctas.
- GET /index.html en localhost:8081: 200, text/html y Cache-Control no-cache.
- GET /productos?pagina=250&tamanio=20: 200; fallback de Angular operativo.
- GET /api/v1/productos?pagina=0&tamanio=20 sin token: 401 JSON del backend, con no-store. El proxy alcanza el backend y conserva su control de acceso.

Las respuestas están en resultados/nginx-restaurado.json. El montaje del build sigue siendo de solo lectura. Si falta dist/pharma-frontend/browser, compilar antes de arrancar web. Si cambia de rama, los archivos de deploy deben existir también en esa revisión.
