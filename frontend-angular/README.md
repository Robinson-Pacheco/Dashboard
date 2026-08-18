# Edu Analytics BI - Frontend Dashboard

Dashboard web del sistema de Inteligencia de Negocios para análisis de datos de admisiones universitarias. Construido con Angular 20, Tailwind CSS y Chart.js.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)

## Características

### Módulos Principales

**Dashboard Analytics**
- Indicadores principales de admisiones
- Distribución normal con segmentación por mediana
- Visualizaciones interactivas con tooltips informativos

**Análisis por Instituciones**
- Filtrado por tipo de sostenimiento (Fiscal, Particular, Municipal, Fiscomisional)
- Filtros por tamaño de muestra (1-10, 11-20, 21-50 estudiantes)
- Identificación de concentración de riesgo por sector

**Análisis Geográfico**
- Análisis por ubicación con filtros por rangos de muestra
- Mapas de calor y visualizaciones regionales

**Análisis de Carreras**
- Segmentación completa incluyendo estudiantes sin cupo
- Análisis de carreras con mayor y menor rendimiento

**Análisis de Género**
- Clasificación de brecha: Significativa, Moderada, Equitativas
- Tooltips informativos con rangos porcentuales
- Análisis por carrera con iconos de información

**Distribuciones Estadísticas**
- Gráficos de box-plot (bigotes) para rendimiento por componente
- Vista comparativa entre periodos
- Análisis de distribuciones normales

**Análisis con Inteligencia Artificial**
- Comparación de periodos con insights generados por IA
- Detección de outliers y anomalías
- Predicciones y tendencias
- Análisis de cuartiles
- Reportes narrativos con streaming en tiempo real

### Características Técnicas

- Autenticación JWT con manejo de sesiones
- Guardas de ruta para protección de accesos
- Modo oscuro/claro con persistencia
- Responsive design para móviles y tablets
- Notificaciones toast para feedback de usuario
- Interceptor HTTP para inyección de tokens
- Streaming de respuestas de IA

## Arquitectura

El proyecto sigue una arquitectura modular con feature-based organization:

```
src/app/
├── core/                    # Servicios centrales y singleton
│   ├── guards/             # Auth guards
│   ├── interceptors/       # HTTP interceptors
│   ├── interfaces/         # Interfaces TypeScript
│   └── services/           # AuthService
├── features/               # Módulos funcionales
│   ├── auth/              # Login y session expired
│   ├── dashboard/         # Dashboard principal
│   ├── admission/         # Carga y lista de admisiones
│   ├── reports/           # Análisis BI (instituciones, geográfico, etc.)
│   ├── statistical-distribution/  # Distribuciones estadísticas
│   ├── advanced-analytics/        # Análisis avanzado (discapacidad, género)
│   ├── ai-analytics/      # Análisis con IA
│   └── users/             # Gestión de usuarios
├── layout/                 # Componentes de layout
│   ├── main-layout/       # Layout principal con sidebar
│   └── sub-layout/        # Layout secundario
├── shared/                 # Componentes compartidos
│   ├── components/        # Confirm dialog, AI loader, etc.
│   ├── pipes/             # Pipes personalizados (markdown)
│   └── services/          # Streaming service
└── services/               # Servicios globales (dark mode, menu items)
```

## Instalación

### Requisitos Previos
- Node.js >= 18.x
- npm o yarn
- Angular CLI >= 20.x

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/GeoShaPoH/edu-analytics-bi.git
   cd edu-analytics-bi/frontend-angular
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Editar `src/environments/environment.ts` para desarrollo:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api'
   };
   ```

   Editar `src/environments/environment.prod.ts` para producción:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://api.yourdomain.com/api'
   };
   ```

## Desarrollo

### Iniciar servidor de desarrollo
```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200/`

### Comandos útiles de Angular CLI

```bash
# Generar un nuevo componente
ng generate component component-name

# Generar un nuevo servicio
ng generate service service-name

# Generar un nuevo módulo
ng generate module module-name

# Ejecutar tests unitarios
ng test

# Ejecutar tests e2e
ng e2e

# Verificar con linter
ng lint
```

## Producción

### Build de Producción

```bash
ng build
```

Esto crea la carpeta `dist/` con los archivos optimizados listos para despliegue.

### Build con configuración específica

```bash
# Build para producción con configuración personalizada
ng build --configuration production --base-href /

# Build para producción con optimización adicional
ng build --configuration production --optimization
```

### Configurar Base HREF

Si la aplicación no se sirve en la raíz del dominio, especifica el base href:

```bash
ng build --base-href /dashboard/
```

### Opciones de Despliegue

#### 1. Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar Firebase
firebase init

# Seleccionar:
# - Hosting
# - Configure as a single-page app
# - Set up automatic builds with GitHub

# Configurar firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Deploy
firebase deploy
```

#### 2. Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy en producción
vercel --prod
```

Crear `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "ng build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 3. Netlify

Crear `netlify.toml`:
```toml
[build]
  command = "ng build --configuration production"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 4. Docker

Crear `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN ng build --configuration production

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Crear `nginx-custom.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Build y run:
```bash
docker build -t edu-analytics-bi-frontend .
docker run -p 80:80 edu-analytics-bi-frontend
```

#### 5. Servidor Linux con Nginx

```bash
# Build localmente
ng build --configuration production

# Copiar archivos al servidor
scp -r dist/* user@server:/var/www/edu-analytics-bi/

# Configurar Nginx en /etc/nginx/sites-available/edu-analytics-bi
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    root /var/www/edu-analytics-bi;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

#### 6. AWS S3 + CloudFront

```bash
# Instalar AWS CLI
pip install awscli

# Configurar credenciales
aws configure

# Subir a S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidar cache de CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Variables de Entorno en Producción

Para cambiar la URL de la API sin modificar el código, puedes usar:

1. **Archivos de environment por ambiente**
   ```bash
   ng build --configuration production
   ```

2. **Reemplazo durante el build**
   ```bash
   ng build --configuration production --prod --base-href / --deploy-url /
   ```

3. **Configuración en runtime** (avanzado)
   Crear `assets/config.json`:
   ```json
   {
     "apiUrl": "https://api.yourdomain.com/api"
   }
   ```
   Y leer este archivo en el `AppComponent`.

### HTTPS y Seguridad

En producción, siempre usar HTTPS:

- Configurar certificado SSL/TLS (Let's Encrypt es gratuito)
- Implementar CSP (Content Security Policy) headers
- Habilitar HSTS (HTTP Strict Transport Security)

Ejemplo de headers en Nginx:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 20.x | Framework frontend |
| TypeScript | 5.9.x | Lenguaje de desarrollo |
| Tailwind CSS | 3.4.x | Estilos y diseño |
| Chart.js | 4.5.x | Gráficos y visualizaciones |
| ng2-charts | 8.0.x | Wrapper de Chart.js para Angular |
| Lucide Angular | 0.553.x | Iconos |
| ngx-toastr | 19.1.x | Notificaciones toast |
| RxJS | 7.8.x | Programación reactiva |
| Marked | 17.0.x | Renderizado de Markdown (para IA) |

## Scripts Disponibles

```bash
# Desarrollo
npm start           # Inicia servidor de desarrollo

# Build
npm run build       # Build de producción

# Testing
ng test             # Ejecuta tests unitarios
ng e2e              # Ejecuta tests end-to-end

# Otros
ng lint             # Verifica código con linter
ng analytics        # Configura analytics
```

## Configuración de Proxy en Desarrollo

Para evitar problemas de CORS durante el desarrollo, crear `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Y modificar `package.json`:
```json
{
  "scripts": {
    "start": "ng serve --proxy-config proxy.conf.json"
  }
}
```

## Rendimiento y Optimización

### Lazy Loading de Módulos

Los módulos de features ya están configurados con lazy loading. Ejemplo:

```typescript
const routes: Routes = [
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component')
      .then(m => m.ReportsComponent)
  }
];
```

### Build con Optimizaciones Adicionales

```bash
ng build --configuration production --optimization --build-optimizer
```

### Bundle Analysis

Para analizar el tamaño de los bundles:

```bash
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

## Repositorio

Parte del proyecto: [edu-analytics-bi](https://github.com/GeoShaPoH/edu-analytics-bi)

## Licencia

Este proyecto es parte de una tesis académica.
