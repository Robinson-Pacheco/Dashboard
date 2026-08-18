# Edu Analytics BI

Sistema de Inteligencia de Negocios para el análisis de datos de admisiones universitarias. Este proyecto proporciona herramientas analíticas avanzadas para la toma de decisiones académicas y administrativas.

## Características

### Dashboard Analytics
- Segmentación de estudiantes mediante distribución normal y mediana
- Análisis de rendimiento por componentes con visualizaciones de box-plot
- Identificación de estudiantes por encima y por debajo de la mediana

### Análisis por Dimensiones
- **Tipos de Discapacidad**: Comparación de rendimiento con estudiantes sin discapacidad
- **Instituciones**: Análisis por tipo de sostenimiento (Fiscal, Particular, Municipal, Fiscomisional)
- **Geográfico**: Análisis por ubicación con filtros por rangos de muestra
- **Carreras**: Segmentación incluyendo estudiantes sin cupo
- **Género**: Análisis de brecha de género por carrera (Significativa, Moderada, Equitativa)

### Características Técnicas
- Autenticación JWT con control de acceso por roles
- Procesamiento de archivos Excel con datos de admisión
- API REST con documentación Swagger
- Visualizaciones interactivas con tooltips informativos
- Filtros avanzados por periodo y año académico

## Arquitectura

El proyecto sigue una arquitectura de microservicios:

```
.
+-- backend-nodejs/     # API REST con Node.js, Express y MongoDB
+-- frontend-angular/   # Dashboard web con Angular 20 y Chart.js
```

### Backend (Node.js)
- **Framework**: Express.js con arquitectura hexagonal
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Documentación**: Swagger UI
- **Procesamiento**: XLSX para archivos Excel

### Frontend (Angular)
- **Framework**: Angular 20
- **Estilos**: Tailwind CSS
- **Gráficos**: Chart.js con ng2-charts
- **Iconos**: Lucide Angular
- **Notificaciones**: ngx-toastr

## Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (v5 o superior)
- npm o yarn

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/GeoShaPoH/edu-analytics-bi
cd edu-analytics-bi
```

### 2. Configurar el Backend
```bash
cd backend-nodejs
npm install
cp .env.example .env
# Configurar las variables de entorno en .env
npm run seed  # Crear usuarios iniciales
npm run dev   # Iniciar en modo desarrollo
```

### 3. Configurar el Frontend
```bash
cd frontend-angular
npm install --legacy-peer-deps
npm start     # Iniciar servidor de desarrollo
```

## Variables de Entorno

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/admision_bi
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Usuarios por Defecto

| Rol     | Usuario  | Contraseña |
|---------|----------|------------|
| Admin   | admin    | admin123   |
| Analyst | analyst  | analyst123 |
| Viewer  | viewer   | viewer123  |

## Acceso a la Aplicación

- **Frontend**: http://localhost:4200
- **API Documentation**: http://localhost:3000/api-docs

## Stack Tecnológico

### Backend
![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)

### Frontend
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)

## Estructura del Proyecto

### Backend (Arquitectura Hexagonal)
```
backend-nodejs/
├── src/
│   ├── domain/          # Entidades y modelos de dominio
│   ├── application/     # Lógica de negocio y servicios
│   ├── infrastructure/  # Conexiones a BD y servicios externos
│   └── presentation/    # Controladores, rutas y middleware
├── docs/                # Documentación exportada
└── uploads/             # Archivos Excel cargados
```

### Frontend
```
frontend-angular/
├── src/
│   ├── app/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── services/    # Servicios HTTP
│   │   └── pages/       # Páginas del dashboard
```

## Licencia

Este proyecto es parte de una tesis académica.

## Autor

Trabajo de Tesis - Derechos reservados
