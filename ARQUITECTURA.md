# Arquitectura, Patrones de Diseño y Metodologías

Este documento describe en detalle la arquitectura del sistema, los patrones de diseño implementados y las metodologías de desarrollo empleadas en el proyecto Edu Analytics BI.

---

## 1. ARQUITECTURA GENERAL

### 1.1 Visión Global

El sistema sigue una arquitectura **Cliente-Servidor** dividida en dos capas principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│              (Angular 21 + Tailwind CSS)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Core      │  │  Features   │  │      Shared         │  │
│  │  (Auth)     │  │ (Analytics) │  │ (Components/Pipes)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│              (Node.js + Express + MongoDB)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │Presentation │  │  Domain     │  │   Infrastructure    │  │
│  │  (REST API) │  │  (Models)   │  │  (DB/AI Providers)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA DEL BACKEND

### 2.1 Arquitectura Hexagonal (Ports & Adapters)

El backend implementa **Arquitectura Hexagonal** (también conocida como Ports and Adapters o Clean Architecture), que separa claramente las responsabilidades:

#### Estructura de Capas

```
src/
├── domain/                    # Capa de Dominio (Core)
│   └── models/               # Entidades de negocio
│       ├── User.js          # Usuario con roles
│       └── AdmissionData.js # Datos de admisión
│
├── application/              # Capa de Aplicación
│   └── services/            # Lógica de negocio
│       ├── biService.js                # Inteligencia de negocios
│       ├── dataMiningService.js        # Minería de datos
│       ├── advancedAnalyticsService.js # Análisis avanzado
│       ├── statisticalDistributionService.js # Distribuciones
│       └── ai-analysis/                # Análisis con IA
│           └── AIAnalysisService.js
│
├── infrastructure/          # Capa de Infraestructura
│   ├── database/           # Adaptador de base de datos
│   │   └── connection.js  # Conexión MongoDB
│   └── ai-providers/      # Adaptadores de IA
│       ├── AIProviderInterface.js      # Puerto (Port)
│       ├── AIProviderFactory.js        # Factory pattern
│       ├── OpenRouterProvider.js       # Adaptador OpenRouter
│       └── OllamaProvider.js           # Adaptador Ollama
│
└── presentation/           # Capa de Presentación
    ├── controllers/       # Manejadores HTTP
    ├── routes/           # Definición de rutas
    └── middleware/       # Middleware (auth, errores)
```

#### Flujo de Dependencias

```
Presentation ──────► Application ──────► Domain
      │                                       ▲
      └──────── Infrastructure ───────────────┘
```

**Regla de Oro**: Las dependencias solo apuntan hacia el centro (Dominio). El dominio no conoce detalles de implementación externos.

### 2.2 Patrones de Diseño Backend

#### 2.2.1 Strategy Pattern (AI Providers)

El sistema de IA implementa el patrón **Strategy** para permitir intercambiar proveedores de IA sin modificar el código de negocio:

```javascript
// Puerto (Interface)
class AIProviderInterface {
  async chatCompletion({ messages, model, temperature }) {
    throw new Error('Must be implemented');
  }
  async streamChatCompletion({ messages, onChunk, model }) {
    throw new Error('Must be implemented');
  }
}

// Estrategias Concretas
class OpenRouterProvider extends AIProviderInterface { }
class OllamaProvider extends AIProviderInterface { }
```

**Beneficios:**
- Intercambio runtime de OpenRouter ↔ Ollama
- Testing aislado con mocks
- Extensibilidad para nuevos proveedores

#### 2.2.2 Factory Pattern

La `AIProviderFactory` crea instancias de proveedores con caching y fallback:

```javascript
class AIProviderFactory {
  createProvider(config) {
    // Cache key para reuso de instancias
    const cacheKey = `${providerName}-${JSON.stringify(config)}`;
    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey);
    }
    // Crear nueva instancia según configuración
    switch (providerName) {
      case 'openrouter': return new OpenRouterProvider(config);
      case 'ollama': return new OllamaProvider(config);
    }
  }
}
```

**Características:**
- **Caching**: Evita recrear instancias
- **Fallback**: Prueba proveedor primario, cae al secundario
- **Configuración centralizada**: Lee de variables de entorno

#### 2.2.3 Repository Pattern (Implícito)

Los modelos Mongoose actúan como repositorios:

```javascript
// domain/models/AdmissionData.js
const AdmissionDataSchema = new mongoose.Schema({...});
// Operaciones CRUD encapsuladas
AdmissionData.find(), AdmissionData.aggregate([])
```

#### 2.2.4 Service Layer Pattern

Cada servicio encapsula lógica de negocio específica:

```javascript
class BIService {
  async getAdmissionStatisticsByPeriod(period, year) {
    // Lógica de agregación compleja
    return AdmissionData.aggregate([...]);
  }
}
```

### 2.3 Patrones de Comunicación

#### Middleware Pipeline

```javascript
// Secuencia de procesamiento de requests
Request → CORS → Helmet → Rate Limit → JSON Parser → Route Handler → Error Handler → Response
```

#### Error Handling Centralizado

```javascript
// presentation/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Transforma errores en respuestas HTTP consistentes
  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
```

### 2.4 Seguridad

#### JWT Authentication Flow

```
Client ──login────► Server
                      │
                      ▼
                 Verify credentials
                      │
                      ▼
              Generate JWT Token
                      │
◄────Token────────────┘
│
│ (Subsequent requests)
▼
Authorization: Bearer <token>
         │
         ▼
    auth middleware
         │
    Verify JWT
         │
    Attach user to req
         │
    next() to controller
```

#### Rate Limiting

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,                   // 100 requests por IP
  message: 'Too many requests'
});
```

---

## 3. ARQUITECTURA DEL FRONTEND

### 3.1 Arquitectura Modular Basada en Características (Feature-Based)

El frontend sigue la arquitectura recomendada por Angular para aplicaciones empresariales:

```
src/app/
├── core/                      # Singleton services, guards, interceptors
│   ├── guards/
│   │   └── auth.guard.ts     # Protección de rutas
│   ├── interceptors/
│   │   └── auth.interceptor.ts  # JWT en requests
│   ├── interfaces/
│   │   └── auth.interface.ts    # Tipos de auth
│   └── services/
│       └── auth.service.ts      # Gestión de sesión
│
├── features/                  # Módulos de características (lazy loaded)
│   ├── auth/                 # Autenticación
│   ├── dashboard/            # Dashboard principal
│   ├── admission/            # Gestión de admisiones
│   ├── reports/              # Reportes BI
│   │   └── components/
│   │       ├── institution-analysis/
│   │       ├── career-analysis/
│   │       ├── geographic-analysis/
│   │       └── component-analysis/
│   ├── advanced-analytics/   # Análisis avanzado
│   │   └── components/
│   │       ├── disability-impact/
│   │       ├── gender-career/
│   │       └── response-strategy/
│   ├── statistical-distribution/  # Distribuciones estadísticas
│   │   └── components/
│   │       ├── distribution-view/
│   │       ├── comparative-view/
│   │       └── components-list-view/
│   ├── ai-analytics/         # Análisis con IA
│   │   └── components/
│   │       ├── narrative-report/
│   │       ├── compare-periods/
│   │       ├── outliers-analysis/
│   │       └── predictions-analysis/
│   └── users/                # Gestión de usuarios
│
├── layout/                   # Componentes de layout
│   ├── main-layout/
│   └── sub-layout/
│
└── shared/                   # Componentes reutilizables
    ├── components/
    │   ├── confirm-dialog/
    │   ├── info-tooltip/
    │   └── ai-loader/
    ├── pipes/
    │   └── markdown.pipe.ts
    └── services/
        └── streaming.service.ts
```

### 3.2 Patrones de Diseño Frontend

#### 3.2.1 Standalone Components (Angular 14+)

Todos los componentes son **standalone**, eliminando la necesidad de NgModules:

```typescript
@Component({
  selector: 'app-narrative-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './narrative-report.component.html'
})
export class NarrativeReportComponent { }
```

**Ventajas:**
- Tree-shaking más eficiente
- Carga lazy más granular
- Menor boilerplate

#### 3.2.2 Dependency Injection Moderno

Uso de `inject()` function en lugar de constructor injection:

```typescript
export class NarrativeReportComponent {
  private aiAnalysisService = inject(AIAnalysisService);
  private toastr = inject(ToastrService);
}
```

#### 3.2.3 Signals (Angular 16+)

Gestión de estado reactivo con **Signals**:

```typescript
export class NarrativeReportComponent {
  // Signals para estado
  isLoading = signal<boolean>(false);
  reportData = signal<NarrativeReportData | null>(null);
  
  // Computed signals para derivados
  statistics = computed(() => this.analysisData()?.statistics);
  
  // Effects para side effects
  constructor() {
    effect(() => {
      const data = this.parentComponent.getDistributionData();
      this.analysisData.set(data);
    });
  }
}
```

**Patrones de Signals utilizados:**
- **Writable Signals**: Estado mutable (`signal()`)
- **Computed Signals**: Estado derivado (`computed()`)
- **Effects**: Side effects reactivos (`effect()`)

#### 3.2.4 Provider Pattern (Core Services)

Servicios globales con `providedIn: 'root'`:

```typescript
@Injectable({
  providedIn: 'root'
})
export class AIAnalysisService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai`;
}
```

#### 3.2.5 Interceptor Pattern

Interceptor para manejo automático de JWT y errores 401:

```typescript
export const authInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Agregar token a requests
  const token = authService.getToken();
  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  // Manejar errores 401
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/session-expired']);
      }
      return throwError(() => error);
    })
  );
};
```

#### 3.2.6 Guard Pattern

Protección de rutas con functional guards:

```typescript
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const isAuthenticated = authService.checkAuthStatus();
  
  if (isAuthenticated) {
    // Verificar expiración del token
    const tokenPayload = authService.decodeTokenPublic(token);
    if (authService.isTokenExpiredPublic(tokenPayload)) {
      return router.createUrlTree(['/session-expired']);
    }
    return true;
  }
  
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

#### 3.2.7 Facade Pattern (Component Communication)

Los componentes hijos acceden al estado del padre mediante inject:

```typescript
// Componente padre
export class StatisticalDistributionComponent {
  getDistributionData() {
    return this.distributionData();
  }
}

// Componente hijo
export class DistributionViewComponent {
  private parentComponent = inject(StatisticalDistributionComponent);
  
  constructor() {
    effect(() => {
      const data = this.parentComponent.getDistributionData();
      this.analysisData.set(data);
    });
  }
}
```

### 3.3 Patrones de UI

#### 3.3.1 Component Composition

Los componentes se componen de componentes reutilizables:

```typescript
@Component({
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,      // Chart.js
    LucideAngularModule       // Iconos
  ]
})
```

#### 3.3.2 Streaming UI Pattern

Para efectos de "typewriter" en respuestas de IA:

```typescript
@Injectable({ providedIn: 'root' })
export class StreamingService {
  streamText(
    fullText: string,
    updateSignal: (text: string) => void,
    options: { chunkSize?: number; delayMs?: number } = {}
  ): void {
    const interval = setInterval(() => {
      // Actualizar señal progresivamente
      updateSignal(fullText.substring(0, nextIndex));
    }, delayMs);
  }
}
```

---

## 4. PATRONES DE INTEGRACIÓN

### 4.1 REST API Contract

La comunicación frontend-backend sigue un contrato REST consistente:

```typescript
// Request/Response consistentes
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Uso
this.http.post<ApiResponse<ReportData>>(`${apiUrl}/ai/narrative-report`, request)
  .subscribe(response => {
    if (response.success) {
      // Procesar data
    } else {
      // Manejar error
    }
  });
```

### 4.2 Data Transfer Objects (DTOs)

Interfaces TypeScript que reflejan los modelos del backend:

```typescript
// models/ai-analysis.models.ts
export interface NarrativeReportRequest {
  data: {
    component: string;
    totalStudents: number;
    statistics: QuartilesStatistics;
    normalDistribution: NormalDistributionData;
  };
}

export interface NarrativeReportResponse {
  success: boolean;
  data: {
    component: string;
    analysis: string;
    metadata: {
      provider: string;
      model: string;
      usage: any;
    };
  };
  error?: string;
}
```

---

## 5. METODOLOGÍAS DE DESARROLLO

### 5.1 Principios SOLID Aplicados

| Principio | Aplicación |
|-----------|------------|
| **S**ingle Responsibility | Cada servicio tiene una única responsabilidad (BI, Data Mining, AI) |
| **O**pen/Closed | AI providers extensibles sin modificar código existente |
| **L**iskov Substitution | OpenRouterProvider y OllamaProvider intercambiables |
| **I**nterface Segregation | AIProviderInterface define solo métodos necesarios |
| **D**ependency Inversion | Services dependen de abstracciones (AIProviderInterface) |

### 5.2 Domain-Driven Design (DDD) Ligero

- **Entidades**: User, AdmissionData con lógica de dominio
- **Value Objects**: Statistics, Quartiles (inmutables)
- **Aggregates**: AdmissionData agrupa componentes
- **Domain Services**: BIService, DataMiningService

### 5.3 Reactive Programming

**Backend (Node.js):**
- Streams para procesamiento de archivos Excel grandes
- Async/await para operaciones de base de datos

**Frontend (Angular):**
- RxJS para HTTP requests
- Signals para estado local
- Observables para eventos de usuario

### 5.4 Mobile-First Responsive Design

Tailwind CSS con breakpoints:

```css
/* Ejemplo de componente responsive */
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards se ajustan al viewport -->
</div>
```

### 5.5 Progressive Enhancement

- Funcionalidad base sin JavaScript (formularios)
- Mejoras con JavaScript (validación)
- Experiencia premium con Angular (interactividad total)

### 5.6 Testing Strategy

| Tipo | Framework | Estado |
|------|-----------|--------|
| Unit Tests | Karma + Jasmine | Configurado (`skipTests: true` en schematics) |
| E2E Tests | No configurado | Pendiente |
| API Tests | No configurado | Pendiente |

### 5.7 Documentación de API (OpenAPI/Swagger)

Documentación automática generada desde JSDoc:

```javascript
/**
 * @swagger
 * /api/bi/statistics:
 *   get:
 *     summary: Get admission statistics
 *     tags: [Business Intelligence]
 *     security: [{ bearerAuth: [] }]
 */
```

---

## 6. PATRONES DE SEGURIDAD

### 6.1 Authentication & Authorization

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────►│  JWT Token  │────►│   Guard     │
│  (Credentials)    │  (Firmado)  │     │ (Validate)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Resource   │
                                        │   Access    │
                                        └─────────────┘
```

### 6.2 Role-Based Access Control (RBAC)

```javascript
// Modelo de roles
role: {
  type: String,
  enum: ['admin', 'analyst', 'viewer'],
  default: 'viewer'
}

// Admin: Full access
// Analyst: Read + Analysis
// Viewer: Read only
```

### 6.3 Input Validation

Validación en múltiples capas:
1. **Frontend**: Validación de formularios Angular
2. **Backend**: Validación de request body
3. **Database**: Schema validation (Mongoose)

---

## 7. OPTIMIZACIONES Y PERFORMANCE

### 7.1 Backend Optimizations

#### MongoDB Aggregation Pipeline

```javascript
// Uso de agregaciones para procesamiento en BD
await AdmissionData.aggregate([
  { $match: matchStage },           // Filtrar primero
  { $addFields: { ... } },          // Transformar
  { $group: { _id: '...', ... } },  // Agrupar
  { $sort: { ... } }                // Ordenar
]).option({ maxTimeMS: timeouts.aggregation });
```

#### Connection Pooling

```javascript
// Configuración de pool de conexiones
connection: {
  maxPoolSize: 10,      // Máximo 10 conexiones
  minPoolSize: 2,       // Mínimo 2 conexiones mantenidas
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}
```

### 7.2 Frontend Optimizations

#### Lazy Loading

```typescript
// Rutas lazy loaded por feature
export const routes: Routes = [
  { path: 'reports', children: reportsRoutes },     // Lazy
  { path: 'ai-analytics', children: AI_ANALYTICS_ROUTES }  // Lazy
];
```

#### Change Detection Optimization

```typescript
// Zoneless change detection (Angular 18+)
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),  // Mejor performance
  ]
};
```

#### OnPush Strategy Implícita

Con signals, los componentes actualizan solo cuando los signals cambian:

```typescript
@Component({
  standalone: true,
  // No necesita changeDetection: ChangeDetectionStrategy.OnPush
  // Los signals manejan la reactividad automáticamente
})
```

---

## 8. MANEJO DE ERRORES

### 8.1 Backend Error Handling

```javascript
// Capas de manejo de errores
try {
  const result = await service.operation();
  res.json({ success: true, data: result });
} catch (error) {
  // Transformar errores de BD en errores de negocio
  res.status(500).json({
    success: false,
    message: 'User-friendly message',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

### 8.2 Frontend Error Handling

```typescript
this.aiAnalysisService.generateReport(request).subscribe({
  next: (response) => {
    if (response.success) {
      this.reportData.set(response.data);
    } else {
      this.toastr.error(response.error, 'Error');
    }
  },
  error: (error) => {
    // Errores HTTP (500, 401, etc.)
    this.toastr.error('Error de conexión', 'Error');
  }
});
```

---

## 9. RESUMEN DE PATRONES

| Capa | Patrón | Implementación |
|------|--------|----------------|
| **Backend** | Hexagonal Architecture | Ports & Adapters |
| **Backend** | Strategy | AIProviderInterface |
| **Backend** | Factory | AIProviderFactory |
| **Backend** | Singleton | Factory instance, DB connection |
| **Backend** | Middleware | Express middleware chain |
| **Frontend** | Feature-Based Modules | Estructura de carpetas |
| **Frontend** | Standalone Components | Sin NgModules |
| **Frontend** | Signals | Estado reactivo |
| **Frontend** | Dependency Injection | inject() function |
| **Frontend** | Interceptor | authInterceptor |
| **Frontend** | Guard | authGuard |
| **Frontend** | Facade | Parent-child communication |
| **Integración** | DTO | TypeScript interfaces |
| **Integración** | REST | HTTP API contract |

---

## 10. DECISIONES ARQUITECTÓNICAS CLAVE

### 10.1 ¿Por qué Arquitectura Hexagonal?

- **Testabilidad**: Lógica de negocio aislada de infraestructura
- **Flexibilidad**: Cambiar MongoDB por otra BD sin tocar dominio
- **Claridad**: Separación de responsabilidades clara

### 10.2 ¿Por qué Signals en Angular?

- **Performance**: Change detection más eficiente
- **Simplicidad**: Menos boilerplate que RxJS para estado local
- **Reactividad**: Actualizaciones automáticas en UI

### 10.3 ¿Por qué Standalone Components?

- **Tree-shaking**: Carga de código más eficiente
- **Simplicidad**: Menos archivos por componente
- **Futuro**: Dirección de Angular moderno

### 10.4 ¿Por qué Dual AI Provider?

- **Resiliencia**: Fallback si un proveedor falla
- **Flexibilidad**: Elegir local (Ollama) vs cloud (OpenRouter)
- **Costos**: Opción de uso gratuito local
- **Privacidad**: Datos sensibles pueden procesarse localmente

---

Este documento refleja el estado actual de la arquitectura y puede evolucionar conforme el proyecto crece.
