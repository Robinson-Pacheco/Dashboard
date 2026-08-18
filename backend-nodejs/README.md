# Edu Analytics BI - Backend API

REST API del sistema de Inteligencia de Negocios para análisis de datos de admisiones universitarias. Construido con Node.js, Express.js y MongoDB siguiendo arquitectura hexagonal.

![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-%23404d59.svg?style=flat&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)

## Características

### Seguridad
- Autenticación JWT (JSON Web Tokens)
- Control de acceso basado en roles (admin, analyst, viewer)
- Rate limiting para prevención de ataques
- Headers de seguridad con Helmet
- Protección CORS configurada

### Procesamiento de Datos
- Carga y procesamiento de archivos Excel
- Almacenamiento de datos de admisión
- Filtrado por periodo y año académico
- Análisis estadísticos avanzados

### Endpoints BI
- Dashboard con indicadores principales
- Análisis por instituciones (tipo de sostenimiento, tamaño de muestra)
- Análisis geográfico con filtros por rangos
- Análisis por carreras (incluyendo sin cupo)
- Análisis de brecha de género
- Distribuciones estadísticas (normal, mediana, cuartiles)
- Análisis de impacto por discapacidad

### Inteligencia Artificial
- Análisis predictivo con IA (OpenRouter, Ollama, OpenCode Go)
- Detección de outliers y anomalías
- Comparación de periodos
- Generación de reportes narrativos con streaming

## Arquitectura

El proyecto sigue **arquitectura hexagonal** (también conocida como puertos y adaptadores):

```
src/
├── domain/              # Capa de Dominio
│   └── models/          # Entidades de negocio (User, AdmissionData)
├── application/         # Capa de Aplicación
│   └── services/        # Lógica de negocio y casos de uso
├── infrastructure/      # Capa de Infraestructura
│   ├── database/        # Conexión a MongoDB
│   └── ai-providers/    # Proveedores de IA
└── presentation/        # Capa de Presentación
    ├── controllers/     # Manejo de HTTP requests
    ├── routes/          # Definición de rutas
    └── middleware/      # Auth, error handling
```

## Instalación

### Requisitos Previos
- Node.js >= 18.x
- MongoDB >= 5.x
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/GeoShaPoH/edu-analytics-bi.git
   cd edu-analytics-bi/backend-nodejs
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```

   Editar `.env` con tus configuraciones:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/admision_bi

   # JWT Configuration
   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:4200

   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads

   # AI Configuration (opcional)
   AI_PROVIDER=opencode  # 'openrouter', 'ollama', o 'opencode'
   AI_FALLBACK_PROVIDER=ollama  # Fallback si el primario falla

   # OpenRouter
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet:beta

   # Ollama (local)
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_DEFAULT_MODEL=llama3.1

   # OpenCode Go (https://opencode.ai/go)
   OPENCODE_API_KEY=your_opencode_api_key
   OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
   OPENCODE_DEFAULT_MODEL=deepseek-v4-flash
   ```

4. **Iniciar MongoDB**
   ```bash
   # En Linux/Mac con systemd
   sudo systemctl start mongod

   # En Windows
   net start MongoDB

   # O usando Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Sembrar base de datos con usuarios iniciales**
   ```bash
   npm run seed
   ```

## Desarrollo

### Iniciar servidor en desarrollo
```bash
npm run dev
```
El servidor se reiniciará automáticamente con cada cambio.

### API Documentation
En desarrollo, la documentación Swagger está disponible en:
```
http://localhost:3000/api-docs
```

## Producción

### Variables de Entorno para Producción

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
# Usar MongoDB Atlas o instancia con autenticación
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/admision_bi?retryWrites=true&w=majority

# JWT Configuration
# Usar una clave secreta fuerte y aleatoria (mínimo 32 caracteres)
JWT_SECRET=generate_with_openssl_rand_base64_32
JWT_EXPIRES_IN=7d

# CORS Configuration
# Reemplazar con el dominio real del frontend
CORS_ORIGIN=https://your-frontend-domain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# AI Configuration (opcional)
AI_PROVIDER=opencode
AI_FALLBACK_PROVIDER=ollama

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet:beta

# Ollama (local)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1

# OpenCode Go (https://opencode.ai/go)
OPENCODE_API_KEY=your_opencode_api_key
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_DEFAULT_MODEL=deepseek-v4-flash
```

### Generar JWT Secret Seguro
```bash
openssl rand -base64 32
```

### Build y Start

```bash
# Instalar dependencias de producción
npm ci --only=production

# Iniciar en modo producción
npm start
```

### Opciones de Despliegue

#### 1. PM2 (Recomendado para servidores Linux)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
pm2 start src/index.js --name edu-analytics-bi

# Configurar para inicio automático
pm2 startup
pm2 save

# Comandos útiles
pm2 logs edu-analytics-bi
pm2 restart edu-analytics-bi
pm2 stop edu-analytics-bi
pm2 monit
```

Crear `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'edu-analytics-bi',
    script: './src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

#### 2. Docker

Crear `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

Crear `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/admision_bi
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

Ejecutar:
```bash
docker-compose up -d
```

#### 3. Cloud Services

**Render.com**
- Crear Web Service
- Conectar repositorio GitHub
- Configurar build command: `npm install`
- Configurar start command: `node src/index.js`
- Agregar variables de entorno en el dashboard

**Railway**
- Conectar repositorio GitHub
- Detectará automáticamente Node.js
- Agregar MongoDB addon
- Configurar variables de entorno

**AWS EC2**
- Lanzar instancia Ubuntu
- Instalar Node.js y MongoDB
- Clonar repositorio
- Configurar PM2
- Configurar Nginx como reverse proxy

#### 4. Nginx como Reverse Proxy

Configuración `/etc/nginx/sites-available/edu-analytics-bi`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Health Check

El endpoint `/health` retorna el estado del servicio:

```bash
curl https://api.yourdomain.com/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-02-02T12:00:00.000Z",
  "database": "connected"
}
```

## Usuarios por Defecto

| Rol     | Usuario  | Contraseña | Permisos                               |
|---------|----------|------------|----------------------------------------|
| Admin   | admin    | admin123   | Acceso total                           |
| Analyst | analyst  | analyst123 | Lectura, upload, análisis              |
| Viewer  | viewer   | viewer123  | Solo lectura de dashboard y reportes   |

⚠️ **IMPORTANTE**: Cambiar las contraseñas por defecto en producción.

## Estructura de API

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual

### Datos de Admisión
- `POST /api/admission/upload` - Cargar archivo Excel
- `GET /api/admission/` - Listar registros (con filtros)
- `GET /api/admission/stats` - Estadísticas generales

### Business Intelligence
- `GET /api/bi/dashboard` - Indicadores del dashboard
- `GET /api/bi/institutions` - Análisis por instituciones
- `GET /api/bi/geographic` - Análisis geográfico
- `GET /api/bi/careers` - Análisis por carreras
- `GET /api/bi/gender` - Análisis de género

### Análisis Avanzado
- `GET /api/advanced/disability` - Impacto por discapacidad
- `GET /api/advanced/response-strategy` - Estrategias de respuesta

### Distribuciones Estadísticas
- `GET /api/statistical/distribution` - Distribución normal
- `GET /api/statistical/components` - Por componente
- `GET /api/statistical/comparative` - Vista comparativa

### Data Mining
- `GET /api/datamining/career-analysis` - Análisis profundo de carreras
- `GET /api/datamining/component-analysis` - Análisis por componente
- `GET /api/datamining/institution-analysis` - Análisis por institución
- `GET /api/datamining/geographic-analysis` - Análisis geográfico
- `GET /api/datamining/difficulty-analysis` - Análisis de dificultad

### Análisis con IA
- `POST /api/ai/quartiles` - Análisis de cuartiles con IA
- `POST /api/ai/predictions` - Predicciones de admisiones
- `POST /api/ai/outliers` - Detección de outliers
- `POST /api/ai/compare-periods` - Comparación de periodos
- `POST /api/ai/narrative-report` - Reporte narrativo
- `POST /api/ai/anomalies` - Detección de anomalías
- `GET /api/ai/status` - Estado del proveedor de IA

### Dev Testing IA (solo desarrollo)
- `GET /api/dev/ai/providers` - Listar proveedores disponibles
- `GET /api/dev/ai/connection` - Probar conexión con proveedor
- `POST /api/dev/ai/chat` - Chat de prueba (respuesta completa)
- `POST /api/dev/ai/chat/stream` - Chat de prueba (streaming)

## Documentación de Procesamiento Excel

La aplicación acepta archivos Excel con datos de pruebas de admisión. El archivo debe contener:

- Columna de ID del estudiante (ID, id, StudentID, CÉDULA)
- Columna de nombre (Name, StudentName, Nombre, NOMBRE)
- Columnas de notas por componente/materia

La aplicación extrae automáticamente esta información y la almacena en la base de datos, permitiendo filtrado por periodo y año.

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime de JavaScript |
| Express.js | Framework web |
| MongoDB | Base de datos NoSQL |
| Mongoose | ODM para MongoDB |
| JWT | Autenticación |
| Multer | Upload de archivos |
| XLSX | Procesamiento de Excel |
| Helmet | Seguridad HTTP |
| CORS | Cross-origin resource sharing |
| express-rate-limit | Rate limiting |
| Swagger UI Express | Documentación API |
| Axios | Cliente HTTP (para IA) |

## Repositorio

Parte del proyecto: [edu-analytics-bi](https://github.com/GeoShaPoH/edu-analytics-bi)

## Licencia

Este proyecto es parte de una tesis académica.
