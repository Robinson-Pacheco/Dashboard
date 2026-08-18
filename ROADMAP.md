# ROADMAP - Edu Analytics BI

Este documento detalla las iteraciones para implementar los nuevos requisitos del sistema de Inteligencia de Negocios.

## Reglas del Proceso

1. Cada iteración debe ser aprobada manualmente antes de pasar a la siguiente
2. Cada iteración incluye cambios en backend y frontend
3. Se documentarán errores y soluciones encontrados
4. No se hará commit hasta finalizar y aprobar cada iteración

---

## Iteración 1: Dashboard Analytics - Distribución Normal y Mediana

### Objetivo
Implementar la distribución normal y la mediana (574.18) para segmentar estudiantes en grupos de rendimiento, identificando cuántos están por debajo y por encima de la mediana.

### Backend Cambios
- [x] **Servicio**: `statisticalDistributionService.js`
  - [x] Agregar endpoint para calcular distribución normal
  - [x] Calcular mediana de los puntajes totales
  - [x] Segmentar estudiantes: por encima/por debajo de la mediana
  - [x] Retornar métricas: media, mediana, desviación estándar, conteo por segmento

- [x] **Controlador**: `statisticalDistributionController.js`
  - [x] Nuevo endpoint: `GET /api/statistical/median-distribution`
  - [x] Parámetros: `period`, `year`

- [x] **Rutas**: `statisticalDistributionRoutes.js`
  - [x] Agregar ruta para distribución por mediana

### Frontend Cambios
- [x] **Servicio**: `statistical-distribution.service.ts`
  - [x] Método para obtener distribución por mediana

- [x] **Componente**: `dashboard/dashboard.component.ts`
  - [x] Nueva tarjeta de métricas de distribución
  - [x] Gráfico de distribución normal (usando Chart.js)
  - [x] Indicadores visuales: estudiantes sobre/bajo mediana
  - [x] Icono de información (i) con tooltip explicativo

- [x] **Modelo**: `statistical-distribution.models.ts`
  - [x] Interface para distribución de mediana

### Archivos a Modificar/Agregar
```
backend-nodejs/src/
├── application/services/statisticalDistributionService.js (modificar)
├── presentation/controllers/statisticalDistributionController.js (modificar)
└── presentation/routes/statisticalDistributionRoutes.js (modificar)

frontend-angular/src/app/
├── features/dashboard/
│   ├── dashboard.component.ts (modificar)
│   ├── dashboard.component.html (modificar)
│   └── models/bi.model.ts (modificar)
└── features/statistical-distribution/
    └── services/statistical-distribution.service.ts (modificar)
```

### Criterios de Aprobación
- [x] Se muestra la mediana calcul correctamente
- [x] Segmentación visual clara de estudiantes sobre/bajo mediana
- [x] Gráfico de distribución normal visible
- [x] Icono de información funcional con tooltip

---

### Errores/ Soluciones - Iteración 1

| Error | Solución | Fecha |
|-------|----------|-------|
| | | |

---

## Iteración 2: Tipos de Discapacidad - Clasificación de Rendimiento

### Objetivo
Clasificar si estudiantes con discapacidad se desempeñaron bien o mal en comparación con personas sin discapacidad.

### Backend Cambios
- [x] **Servicio**: `advancedAnalyticsService.js`
  - [x] Modificar endpoint `/disability` existente
  - [x] Comparar promedios: con discapacidad vs sin discapacidad
  - [x] Calcular diferencia porcentual
  - [x] Clasificar como: "Mejor desempeño", "Peor desempeño", "Similar"

- [x] **Controlador**: `advancedAnalyticsController.js`
  - [x] Actualizar respuesta del endpoint `GET /api/advanced/disability`

### Frontend Cambios
- [x] **Componente**: `advanced-analytics/components/disability-impact/disability-impact.component.ts`
  - [x] Mostrar clasificación comparativa de rendimiento
  - [x] Indicador visual del desempeño (flecha o color)
  - [x] Tarjeta con métricas comparativas
  - [x] Icono de información explicando la clasificación

- [x] **Modelo**: `advanced-analytics/models/advanced-analytics.model.ts`
  - [x] Interface para clasificación de discapacidad

### Archivos a Modificar
```
backend-nodejs/src/
├── application/services/advancedAnalyticsService.js (modificar)
└── presentation/controllers/advancedAnalyticsController.js (modificar)

frontend-angular/src/app/features/advanced-analytics/
├── components/disability-impact/
│   ├── disability-impact.component.ts (modificar)
│   └── disability-impact.component.html (modificar)
└── models/advanced-analytics.model.ts (modificar)
```

### Criterios de Aprobación
- [x] Clasificación clara: mejor/peor/similar desempeño
- [x] Métricas comparativas visibles (promedios)
- [x] Indicador visual del desempeño
- [x] Icono de información funcional

---

### Errores/ Soluciones - Iteración 2

| Error | Solución | Fecha |
|-------|----------|-------|
| Iconos TrendingUp/TrendingDown no se cargan con binding dinámico | lucide-icon v0.553.0 requiere referencias directas a iconos, no strings dinámicos. Se cambió de `[name]="getPerformanceIcon(...)"` a condicionales directos `@if (item.performanceClassification === 'Mejor desempeño')` con `[name]="TrendingUp"` | 2026-02-03 |

---

## Iteración 3: Rendimiento por Componente - Gráfico de Bigotes (Box Plot)

### Objetivo
Reemplazar el gráfico actual por un box plot que muestre nota mínima, máxima, mediana y cuartiles.

### Backend Cambios
- [x] **Servicio**: `dataMiningService.js`
  - [x] Modificar endpoint `/component-analysis`
  - [x] Calcular: mínimo, máximo, Q1, Q2 (mediana), Q3, outliers
  - [x] Retornar datos estructurados para box plot por componente

- [x] **Controlador**: `dataMiningController.js`
  - [x] Actualizar endpoint `GET /api/datamining/component-analysis`

### Frontend Cambios
- [x] **Componente**: `reports/components/component-analysis/component-analysis.component.ts`
  - [x] Implementar box plot usando Chart.js (usando plugin de box plot o custom)
  - [x] Mostrar: mínimo, máximo, mediana, cuartiles
  - [x] Identificar outliers visualmente
  - [x] Icono de información explicando el box plot

- [x] **Configuración Chart.js**
  - [x] Agregar configuración para box plot o implementar custom

### Archivos a Modificar
```
backend-nodejs/src/
├── application/services/dataMiningService.js (modificar)
└── presentation/controllers/dataMiningController.js (modificar)

frontend-angular/src/app/features/reports/components/
└── component-analysis/
    ├── component-analysis.component.ts (modificar)
    └── component-analysis.component.html (modificar)
```

### Criterios de Aprobación
- [x] Box plot visible con todos los componentes
- [x] Mostrar mínimo, máximo, mediana claramente
- [x] Outliers identificados visualmente
- [x] Icono de información explicativo

---

### Errores/ Soluciones - Iteración 3

| Error | Solución | Fecha |
|-------|----------|-------|
| Box plot se ve como "gráfico de barras de 2 colores" con Chart.js | Chart.js plugin `@sgratzl/chartjs-chart-boxplot` no funciona correctamente con ng2-charts. Se cambió a AG Charts Enterprise que tiene soporte nativo para box plot | 2026-02-03 |
| El gráfico de AG Charts se ve entrecortado/cortado | AG Charts necesita estilos explícitos de width/height y `display: block`. Se agregó `style="width: 100%; height: 100%; display: block"` y `autoSize: true` | 2026-02-03 |
| Mini box plot en Data Cards muy pequeño y no visible | Se cambió de orientación vertical a horizontal con altura de 80px (h-20), elementos más grandes y etiquetas visibles | 2026-02-03 |

---

## Iteración 4: Análisis de Instituciones - Tipo de Sostenimiento y Filtros

### Objetivo
Mostrar tipo de sostenimiento (Fiscal, Particular, Municipal, Fiscomisional) y filtrar por tamaño de muestra.

### Backend Cambios
- [x] **Servicio**: `dataMiningService.js`
  - [x] Modificar endpoint `/institution-analysis`
  - [x] Usar campo `tipoUnidadEducativa` del modelo de datos
  - [x] Agregar parámetro `sampleSize` con rangos: "1-10", "11-20", "21-50", "50+"
  - [x] Agrupar por tipo de sostenimiento
  - [x] Identificar concentración de riesgo por sector (público/privado)

- [x] **Controlador**: `dataMiningController.js`
  - [x] Actualizar endpoint `GET /api/datamining/institution-analysis`
  - [x] Agregar query param `sampleSize`

### Frontend Cambios
- [x] **Componente**: `reports/components/institution-analysis/institution-analysis.component.ts`
  - [x] Agregar selector de filtro por tamaño de muestra
  - [x] Gráfico de barras agrupado por tipo de sostenimiento
  - [x] Indicador de concentración de riesgo (público vs privado)
  - [x] Iconos de información explicativos

- [x] **Modelo**: Actualizar interfaces para incluir filtros

### Archivos a Modificar
```
backend-nodejs/src/
├── application/services/dataMiningService.js (modificar)
└── presentation/controllers/dataMiningController.js (modificar)

frontend-angular/src/app/features/reports/components/
└── institution-analysis/
    ├── institution-analysis.component.ts (modificar)
    └── institution-analysis.component.html (modificar)
```

### Criterios de Aprobación
- [x] Filtro de tamaño de muestra funcional
- [x] Gráfico muestra tipos de sostenimiento
- [x] Identificación clara de concentración de riesgo
- [x] Iconos informativos funcionales

---

### Errores/ Soluciones - Iteración 4

| Error | Solución | Fecha |
|-------|----------|-------|
| Error de parser: "Missing closing parentheses" en `(change)="applySampleSizeFilter(($event.target as HTMLSelectElement).value)"` | Angular no permite casting complejo en templates. Se cambió a `(change)="onSampleSizeChange($event)"` y se creó método helper que hace el casting | 2026-02-03 |
| Error de parser: "Bindings cannot contain assignments" en `sampleSizeOptions.find(...)` | Angular no permite expresiones con asignaciones en bindings. Se creó método helper `getSampleSizeLabel()` | 2026-02-03 |
| Error de parser: "Missing expected )" en expresiones complejas de `getPerformanceLevelClass` | Las expresiones ternarias anidadas causan errores de parser. Se creó método helper `getRiskLevelClass()` | 2026-02-03 |

---

## Iteración 5: Análisis Geográfico - Filtros por Rangos

### Objetivo
Agregar filtros por rangos de muestra para evitar análisis de un solo estudiante por ubicación.

### Backend Cambios
- [x] **Servicio**: `dataMiningService.js`
  - [x] Modificar endpoint `/geographic-analysis`
  - [x] Usar campos: `provinciaReside`, `cantonReside`
  - [x] Agregar parámetro `sampleSize` con rangos
  - [x] Filtrar ubicaciones con muestras mínimas

- [x] **Controlador**: `dataMiningController.js`
  - [x] Actualizar endpoint `GET /api/datamining/geographic-analysis`
  - [x] Agregar query param `sampleSize`

### Frontend Cambios
- [x] **Componente**: `reports/components/geographic-analysis/geographic-analysis.component.ts`
  - [x] Agregar selector de filtro por tamaño de muestra
  - [x] Mapa de calor o gráfico de barras geográfico
  - [x] Solo mostrar ubicaciones con muestra suficiente
  - [x] Icono de información explicativo

### Archivos a Modificar
```
backend-nodejs/src/
├── application/services/dataMiningService.js (modificar)
└── presentation/controllers/dataMiningController.js (modificar)

frontend-angular/src/app/features/reports/components/
└── geographic-analysis/
    ├── geographic-analysis.component.ts (modificar)
    └── geographic-analysis.component.html (modificar)
```

### Criterios de Aprobación
- [x] Filtro de tamaño de muestra funcional
- [x] Solo se muestran ubicaciones con muestra suficiente
- [x] Visualización geográfica clara
- [x] Icono informativo funcional

---

### Errores/ Soluciones - Iteración 5

| Error | Solución | Fecha |
|-------|----------|-------|
| | | |

---

## Iteración 6: Análisis de Carreras - Segmentación "Sin Cupo"

### Objetivo
Quitar "sin especificar" y segmentar grupo "sin cupo" para análisis independiente.

### Backend Cambios
- [x] **Servicio**: `dataMiningService.js`
  - [x] Modificar endpoint `/career-analysis`
  - [x] Filtrar registros donde `conCupo` indica carrera válida
  - [x] Crear segmento independiente para "sin cupo"
  - [x] Analizar carreras donde estudiantes sin cupo tienen mayores/menores puntajes

- [x] **Controlador**: `dataMiningController.js`
  - [x] Actualizar endpoint `GET /api/datamining/career-analysis`
  - [x] Incluir análisis de segmento "sin cupo"

### Frontend Cambios
- [x] **Componente**: `reports/components/career-analysis/career-analysis.component.ts`
  - [x] Excluir "sin especificar" de gráficos principales
  - [x] Nueva sección/tab para análisis "sin cupo"
  - [x] Mostrar ranking de carreras donde sin cupo tuvo mejor/peor desempeño
  - [x] Icono de información explicativo

### Archivos a Modificar
```
backend-nodejs/src/
├── application/services/dataMiningService.js (modificar)
└── presentation/controllers/dataMiningController.js (modificar)

frontend-angular/src/app/features/reports/components/
└── career-analysis/
    ├── career-analysis.component.ts (modificar)
    └── career-analysis.component.html (modificar)
```

### Criterios de Aprobación
- [x] "Sin especificar" excluido de análisis principal
- [x] Sección de análisis "sin cupo" visible
- [x] Ranking de carreras para grupo sin cupo
- [x] Icono informativo funcional

---

### Errores/ Soluciones - Iteración 6

| Error | Solución | Fecha |
|-------|----------|-------|
| | | |

---

## Iteración 7: Análisis de Género por Carrera - Clasificación con Tooltip

### Objetivo
Clasificar brechas como Significativa, Moderada, Equitativa con tooltip explicativo de rangos.

### Backend Cambios
- [x] **Servicio**: `advancedAnalyticsService.js`
  - [x] Modificar endpoint `/gender-career`
  - [x] Calcular brecha porcentual por carrera
  - [x] Clasificar según rangos:
    - Significativa: > 15% diferencia
    - Moderada: 5-15% diferencia
    - Equitativa: < 5% diferencia
  - [x] Retornar clasificación y porcentaje

- [x] **Controlador**: `advancedAnalyticsController.js`
  - [x] Actualizar endpoint `GET /api/advanced/gender-career`

### Frontend Cambios
- [x] **Componente**: `advanced-analytics/components/gender-career/gender-career.component.ts`
  - [x] Mostrar clasificación con badge/etiqueta (Significativa/Moderada/Equitativa)
  - [x] Icono (i) con tooltip mostrando rangos porcentuales
  - [x] Colores según clasificación (rojo/amarillo/verde)
  - [x] Tooltip interactivo al pasar cursor

- [x] **Modelo**: Actualizar interfaces para incluir clasificación

### Archivos a Modificar
```
backend-nodejs/src/
├── application/services/advancedAnalyticsService.js (modificar)
└── presentation/controllers/advancedAnalyticsController.js (modificar)

frontend-angular/src/app/features/advanced-analytics/components/
└── gender-career/
    ├── gender-career.component.ts (modificar)
    └── gender-career.component.html (modificar)
```

### Criterios de Aprobación
- [x] Clasificación visible por carrera
- [x] Colores distintivos por tipo de brecha
- [x] Tooltip con rangos porcentuales funcionando
- [x] Icono (i) interactivo

---

### Errores/ Soluciones - Iteración 7

| Error | Solución | Fecha |
|-------|----------|-------|
| | | |

---

## Iteración 8: Iconos de Información Globales

### Objetivo
Agregar iconos de información (i) con tooltips explicativos en TODOS los indicadores gráficos del sistema.

### Backend Cambios
- [ ] No requerido (solo cambios en frontend)

### Frontend Cambios
- [ ] **Componente Shared**: Crear `info-tooltip.component.ts`
  - [ ] Componente reutilizable de icono (i) con tooltip
  - [ ] Propiedades: `title`, `description`, `position`
  - [ ] Usar Lucide para icono de información

- [ ] **Aplicar en todos los componentes**:
  - [ ] `dashboard.component.ts` - Todas las tarjetas y gráficos
  - [ ] `institution-analysis.component.ts`
  - [ ] `geographic-analysis.component.ts`
  - [ ] `career-analysis.component.ts`
  - [ ] `component-analysis.component.ts`
  - [ ] `disability-impact.component.ts`
  - [ ] `gender-career.component.ts`
  - [ ] `distribution-view.component.ts`
  - [ ] `comparative-view.component.ts`

### Archivos a Modificar/Agregar
```
frontend-angular/src/app/shared/components/
├── info-tooltip/ (nuevo)
│   ├── info-tooltip.component.ts
│   ├── info-tooltip.component.html
│   └── info-tooltip.component.css

frontend-angular/src/app/features/
├── dashboard/dashboard.component.html (modificar)
├── reports/components/* (modificar todos)
└── advanced-analytics/components/* (modificar todos)
```

### Contenidos de Tooltips por Componente
| Componente | Tooltip |
|------------|---------|
| Dashboard Total | Número total de postulantes en el periodo seleccionado |
| Dashboard Promedio | Promedio de puntajes obtenidos en todas las pruebas |
| Dashboard Aprobados | Porcentaje de estudiantes que aprobaron |
| Distribución | Segmentación basada en la mediana del puntaje total |
| Instituciones | Análisis por tipo de sostenimiento educativo |
| Geográfico | Distribución por provincias y cantones |
| Carreras | Rendimiento por carrera universitaria |
| Género | Brecha de género por carrera |

### Criterios de Aprobación
- [ ] Componente `info-tooltip` creado y reutilizable
- [ ] Todos los gráficos tienen icono informativo
- [ ] Tooltips son claros y descriptivos
- [ ] Interacción suave al pasar cursor

---

### Errores/ Soluciones - Iteración 8

| Error | Solución | Fecha |
|-------|----------|-------|
| | | |

---

## Resumen de Iteraciones

| Iteración | Descripción | Backend | Frontend | Estado |
|-----------|-------------|---------|----------|--------|
| 1 | Distribución Normal y Mediana | ✅ | ✅ | ✅ Aprobada |
| 2 | Discapacidad Clasificación | ✅ | ✅ | ✅ Aprobada |
| 3 | Box Plot por Componente | ✅ | ✅ | ✅ Aprobada |
| 4 | Instituciones Filtros | ✅ | ✅ | ✅ Aprobada |
| 5 | Geográfico Filtros | ✅ | ✅ | ✅ Aprobada |
| 6 | Carreras Sin Cupo | ✅ | ✅ | ✅ Aprobada |
| 7 | Género Clasificación | ✅ | ✅ | ✅ Aprobada |
| 8 | Iconos Globales | - | ✅ | ✅ Aprobada |

---

## Notas Importantes

### Campos del Modelo de Datos Relevantes
```javascript
// Para Análisis de Instituciones
tipoUnidadEducativa: "Fiscal" | "Particular" | "Municipal" | "Fiscomisional"

// Para Análisis Geográfico
provinciaReside, cantonReside

// Para Discapacidad
cierreCarnetDiscapacidad, cierreTipoDiscapacidad, cierrePrcjDiscapacidad

// Para Carreras
conCupo: "SI" | "NO"
conCupoCarrera: nombre de la carrera

// Para Género
sexo: "M" | "F"

// Para Rendimiento por Componente
componente: nombre del componente
puntaje_obtenido_componente: puntaje numérico
porcentaje_componente: porcentaje 0-100
```

### Rangos para Clasificación de Brecha de Género
- **Brecha Significativa**: > 15% de diferencia
- **Brecha Moderada**: 5% - 15% de diferencia
- **Equitativa**: < 5% de diferencia

### Rangos para Filtros de Muestra
- "1-10": Muy pequeña
- "11-20": Pequeña
- "21-50": Mediana
- "50+": Grande

---

## Progreso General

```
████████████████████████████████████████████████████  100% (8/8 iteraciones completadas - Todas las iteraciones aprobadas)
```
