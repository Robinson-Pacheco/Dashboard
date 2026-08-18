# Métricas del Sistema Edu Analytics BI

## Documento Comparativo: Métricas Documentadas vs Implementadas

Este documento compara las métricas que aparecen en la documentación formal con las que están realmente implementadas en el código del sistema.

---

## 1. Métricas Base Documentadas vs Implementadas

### 1.1 Índice de Dificultad (ID)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | ID = 100 - ((Preguntas_Correctas / Total_Preguntas) * 100) |
| **Estado** | ✅ IMPLEMENTADO |
| **Ubicación** | `dataMiningService.js` - método `getDifficultyIndexAnalysis()` |
| **Notas** | Calculado por componente. Incluye clasificación: Fácil (≥70%), Moderado (50-70%), Difícil (30-50%), Muy Difícil (<30%) |

**Campos utilizados:**
- `preguntas_correctas`
- `nro_preguntas`
- `componente`

---

### 1.2 Tasa de Admisión (TA)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | TA = (Admisiones / Postulantes) * 100 |
| **Estado** | ✅ IMPLEMENTADO (con nombre diferente) |
| **Nombre en Sistema** | `quotaRate` (Tasa de Cupo) |
| **Ubicación** | `dataMiningService.js` - método `getCareerPerformanceAnalysis()` |
| **Notas** | Calculado por carrera. Formula: (conCupo='SI' / Total_Postulantes) * 100 |

**Campos utilizados:**
- `conCupo`
- `conCupoCarrera`

---

### 1.3 Índice de Riesgo por Procedencia (IRP)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | IRP = (1 - (Promedio_Colegio / Promedio_General)) * 100 |
| **Estado** | ✅ IMPLEMENTADO (con variación en fórmula) |
| **Ubicación** | `dataMiningService.js` - método `_calculateRiskIndex()` y `getGeographicPerformanceAnalysis()` |
| **Fórmula Real** | IRP = ((Promedio_General - Puntaje_Grupo) / Promedio_General) * 100 |
| **Notas** | Implementado para ubicaciones geográficas. Clasificación: Sin Riesgo (<0%), Bajo (0-10%), Medio (10-20%), Alto (>20%) |

**Campos utilizados:**
- `provinciaReside`
- `cantonReside`
- `puntaje_obtenido_componente`

---

### 1.4 Porcentaje de Discapacidad (PD)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | PD = (N_Con_Discapacidad / N_Total) * 100 |
| **Estado** | ✅ IMPLEMENTADO |
| **Ubicación** | `biService.js` - método `getDisabilityStatistics()` |
| **Notas** | Adicionalmente calcula desglose por tipo de discapacidad |

**Campos utilizados:**
- `cierreCarnetDiscapacidad`
- `cierreTipoDiscapacidad`

---

## 2. Métricas Complementarias Documentadas vs Implementadas

### 2.1 Distribución por Género (DG)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | DG = (N_Genero / N_Total) * 100 |
| **Estado** | ✅ IMPLEMENTADO |
| **Ubicación** | `biService.js` - método `getDemographicBreakdown()` |
| **Notas** | Retorna desglose por género con conteos y porcentajes |

**Campos utilizados:**
- `sexo`

---

### 2.2 Brecha de Rendimiento (BRG)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | BRG = Promedio_Hombres - Promedio_Mujeres |
| **Estado** | ✅ IMPLEMENTADO (con análisis más completo) |
| **Ubicación** | `advancedAnalyticsService.js` - método `getGenderCareerAnalysis()` |
| **Notas** | Calculado por carrera. Incluye: brecha porcentual, clasificación (Significativa >50pts, Moderada 20-50pts, Equitativa <20pts), y recomendaciones |

**Campos utilizados:**
- `sexo`
- `conCupoCarrera`
- `puntaje_obtenido_componente`

---

### 2.3 Demanda por Carrera (DC)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | DC = (Postulantes_Carrera / N_Total) * 100 |
| **Estado** | ✅ IMPLEMENTADO (con nombre diferente) |
| **Nombre en Sistema** | `applicantCount` en análisis de carreras |
| **Ubicación** | `dataMiningService.js` - método `getCareerPerformanceAnalysis()` |
| **Notas** | Incluye nivel de competitividad: Muy Alta (≥100), Alta (50-99), Media (20-49), Baja (<20) |

**Campos utilizados:**
- `conCupoCarrera`
- `usuario_id`

---

### 2.4 Tasa de Cupo por Carrera (TCC)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | TCC = (Cupos_Asignados / Postulantes_Carrera) * 100 |
| **Estado** | ✅ IMPLEMENTADO (misma que TA) |
| **Nombre en Sistema** | `quotaRate` |
| **Ubicación** | `dataMiningService.js` - método `getCareerPerformanceAnalysis()` |
| **Notas** | Misma métrica que Tasa de Admisión (TA) pero específica por carrera |

**Campos utilizados:**
- `conCupo`
- `conCupoCarrera`

---

### 2.5 Rendimiento Institucional (RI)

| Aspecto | Detalle |
|---------|---------|
| **Fórmula Documentada** | RI = Promedio_Puntaje_Institucion |
| **Estado** | ✅ IMPLEMENTADO (con análisis extendido) |
| **Ubicación** | `dataMiningService.js` - método `getInstitutionPerformanceAnalysis()` |
| **Notas** | Incluye: puntaje promedio, mínimo, máximo, desviación estándar, y nivel de desempeño. Además segmenta por tipo de institución (Fiscal, Municipal, Particular, Fiscomisional) |

**Campos utilizados:**
- `unidadEducativa`
- `tipoUnidadEducativa`
- `puntaje_obtenido_componente`

---

## 3. Métricas ADICIONALES Implementadas (No Documentadas)

### 3.1 Distribución Normal y Mediana

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Median Distribution |
| **Ubicación** | `statisticalDistributionService.js` - método `getMedianDistribution()` |
| **Descripción** | Calcula la mediana de puntajes totales y segmenta estudiantes por encima/por debajo de la mediana |
| **Métricas incluidas** | Mediana, Media, Desviación Estándar, Varianza, Rangos, Distribución normal teórica |
| **Segmentación** | Above median, Below median, Equal to median |

**Fórmulas:**
- Mediana: Valor central de puntajes ordenados
- Media: Promedio aritmético de puntajes
- Desviación Estándar: √(Σ(xi - μ)² / N)

---

### 3.2 Análisis de Componentes (Box Plot)

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Component Performance Analysis |
| **Ubicación** | `dataMiningService.js` - método `getComponentPerformanceAnalysis()` |
| **Descripción** | Análisis estadístico completo por componente usando box plots |
| **Métricas incluidas** | Min, Q1, Mediana, Q3, Max, IQR, Outliers, Desviación Estándar |

**Fórmulas:**
- Q1 (Cuartil 1): Percentil 25
- Q2 (Mediana): Percentil 50
- Q3 (Cuartil 3): Percentil 75
- IQR = Q3 - Q1
- Outliers: Valores < (Q1 - 1.5×IQR) o > (Q3 + 1.5×IQR)

---

### 3.3 Índice de Dificultad por Componente

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Difficulty Index Analysis |
| **Ubicación** | `dataMiningService.js` - método `getDifficultyIndexAnalysis()` |
| **Descripción** | Mide la dificultad de cada componente basado en tasa de éxito |
| **Fórmula** | DI = 100 - Tasa_Éxito_Promedio |

---

### 3.4 Análisis de Impacto por Discapacidad

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Disability Impact Analysis |
| **Ubicación** | `advancedAnalyticsService.js` - método `getDisabilityImpactAnalysis()` |
| **Descripción** | Compara rendimiento de estudiantes con/sin discapacidad |
| **Métricas incluidas** | Brecha de puntajes, Brecha porcentual, Clasificación de desempeño, Tasa de cupo |

**Clasificación de Desempeño:**
- Mejor desempeño: Brecha ≤ -5% (estudiantes con discapacidad puntúan más alto)
- Similar: Brecha entre -5% y +5%
- Peor desempeño: Brecha ≥ +5% (estudiantes con discapacidad puntúan más bajo)

---

### 3.5 Análisis de Estrategias de Respuesta

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Response Strategy Analysis |
| **Ubicación** | `advancedAnalyticsService.js` - método `getResponseStrategyAnalysis()` |
| **Descripción** | Clasifica estrategias de respuesta de estudiantes |
| **Estrategias** | Conservadora (>5 sin contestar), Agresiva (más incorrectas que sin contestar), Balanceada |

---

### 3.6 Análisis de Distribución Normal por Componente

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Distribution by Component |
| **Ubicación** | `statisticalDistributionService.js` - método `getDistributionByComponent()` |
| **Descripción** | Análisis de distribución normal con estadísticas completas |
| **Métricas incluidas** | Z-scores, Percentiles, Distribución dentro de 1/2/3 desviaciones estándar, Outliers, Valores atípicos |

---

### 3.7 Análisis Comparativo entre Períodos

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Comparative Analysis |
| **Ubicación** | `statisticalDistributionService.js` - método `getComparativeAnalysis()` |
| **Descripción** | Compara estadísticas entre dos períodos académicos |
| **Métricas incluidas** | Diferencia de medias, Cambio porcentual, Diferencia de desviación estándar, Diferencia de conteos |

---

### 3.8 Concentración de Riesgo por Sector

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Risk Concentration |
| **Ubicación** | `dataMiningService.js` - método `getInstitutionPerformanceAnalysis()` |
| **Descripción** | Analiza concentración de riesgo entre sector público y privado |
| **Clasificación** | Sector Público: Fiscal, Municipal. Sector Privado: Particular, Fiscomisional |
| **Métricas** | Promedio por sector, Nivel de riesgo, Brecha entre sectores |

---

### 3.9 Segmentación "Sin Cupo"

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | No Quota Segment Analysis |
| **Ubicación** | `dataMiningService.js` - método `getCareerPerformanceAnalysis()` |
| **Descripción** | Análisis independiente de estudiantes que no obtuvieron cupo |
| **Métricas** | Ranking de carreras donde "sin cupo" tuvo mejor/peor desempeño |

---

### 3.10 Análisis de Tendencias

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Admission Trends |
| **Ubicación** | `biService.js` - método `getAdmissionTrends()` |
| **Descripción** | Tendencias de admisión a lo largo del tiempo |
| **Métricas** | Total postulantes, Aprobados, Rechazados, Tasa de aprobación por período |

---

## 4. Resumen de Estado

### Métricas Documentadas que SÍ existen en el sistema:

| # | Métrica | Estado | Notas |
|---|---------|--------|-------|
| 1 | Índice de Dificultad (ID) | ✅ Implementado | Por componente con clasificación |
| 2 | Tasa de Admisión (TA) | ✅ Implementado | Como `quotaRate` |
| 3 | Índice de Riesgo por Procedencia (IRP) | ✅ Implementado | Para ubicaciones geográficas |
| 4 | Porcentaje de Discapacidad (PD) | ✅ Implementado | Con desglose por tipo |
| 5 | Distribución por Género (DG) | ✅ Implementado | Desglose simple |
| 6 | Brecha de Rendimiento (BRG) | ✅ Implementado | Por carrera con clasificación |
| 7 | Demanda por Carrera (DC) | ✅ Implementado | Como `applicantCount` |
| 8 | Tasa de Cupo por Carrera (TCC) | ✅ Implementado | Mismo que TA |
| 9 | Rendimiento Institucional (RI) | ✅ Implementado | Con análisis por tipo |

### Métricas ADICIONALES implementadas (NO documentadas):

| # | Métrica | Prioridad para Documentación |
|---|---------|------------------------------|
| 1 | Distribución Normal y Mediana | Alta |
| 2 | Análisis de Componentes (Box Plot) | Alta |
| 3 | Análisis de Impacto por Discapacidad | Alta |
| 4 | Análisis de Estrategias de Respuesta | Media |
| 5 | Análisis de Distribución Normal | Alta |
| 6 | Análisis Comparativo entre Períodos | Media |
| 7 | Concentración de Riesgo por Sector | Media |
| 8 | Segmentación "Sin Cupo" | Alta |
| 9 | Análisis de Tendencias | Media |

---

## 5. Catálogo Completo de Métricas Implementadas

### 5.1 Métricas de Dashboard (BI Service)

| Métrica | Descripción | Fórmula/Valores |
|---------|-------------|-----------------|
| `totalApplications` | Total de postulantes | COUNT(DISTINCT usuario_id) |
| `approvedCount` | Total aprobados | COUNT WHERE status='approved' |
| `rejectedCount` | Total rechazados | COUNT WHERE status='rejected' |
| `pendingCount` | Total pendientes | COUNT WHERE status='pending' |
| `averageScore` | Puntaje promedio | AVG(totalScore) |
| `maxScore` | Puntaje máximo | MAX(totalScore) |
| `minScore` | Puntaje mínimo | MIN(totalScore) |
| `approvalRate` | Tasa de aprobación | (approved / total) * 100 |

### 5.2 Métricas Demográficas

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `genderBreakdown` | Distribución por género | COUNT GROUP BY sexo |
| `provinceBreakdown` | Distribución por provincia | COUNT GROUP BY provinciaReside |
| `educationalUnitBreakdown` | Distribución por tipo de unidad | COUNT GROUP BY tipoUnidadEducativa |

### 5.3 Métricas de Rendimiento por Componente

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `averageScore` | Promedio por componente | AVG(porcentaje_componente) |
| `maxScore` | Máximo por componente | MAX(puntaje_max_componente) |
| `minScore` | Mínimo por componente | MIN(porcentaje_componente) |
| `applicantCount` | Postulantes por componente | COUNT |

### 5.4 Métricas de Discapacidad

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `withDisabilityCard` | Total con carnet de discapacidad | COUNT WHERE cierreCarnetDiscapacidad IS NOT NULL |
| `disabilityPercentage` | Porcentaje con discapacidad | (withDisability / total) * 100 |
| `disabilityTypeBreakdown` | Desglose por tipo de discapacidad | GROUP BY cierreTipoDiscapacidad |

### 5.5 Métricas de Análisis Avanzado

#### 5.5.1 Brecha de Género por Carrera

| Métrica | Descripción | Rangos |
|---------|-------------|--------|
| `genderGap.gap` | Diferencia absoluta de puntajes | En puntos |
| `genderGap.percentGap` | Diferencia porcentual | ((gap / max) * 100) |
| `gapType` | Clasificación de brecha | Significativa (>50pts), Moderada (20-50pts), Equitativa (<20pts) |

#### 5.5.2 Impacto por Discapacidad

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `avgScore` | Promedio por tipo de discapacidad | AVG(totalScore) |
| `gapVsNoDisability` | Brecha vs sin discapacidad | avgNoDisability - avgWithDisability |
| `percentGap` | Brecha porcentual | (gap / avgNoDisability) * 100 |
| `performanceClassification` | Clasificación de desempeño | Mejor/Similar/Peor basado en ±5% |

#### 5.5.3 Estrategias de Respuesta

| Métrica | Descripción | Criterios |
|---------|-------------|-----------|
| `strategyType` | Tipo de estrategia | Conservative (>5 sin contestar), Aggressive (incorrectas > sin contestar), Balanced |
| `avgCorrect` | Promedio de correctas | AVG(preguntas_correctas) |
| `avgIncorrect` | Promedio de incorrectas | AVG(preguntas_incorrectas) |
| `avgUnanswered` | Promedio sin contestar | AVG(preguntas_no_contestadas) |

### 5.6 Métricas de Data Mining

#### 5.6.1 Análisis por Componente (Box Plot)

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `min` | Mínimo (sin outliers) | Q1 - 1.5×IQR |
| `q1` | Primer cuartil | Percentil 25 |
| `median` | Mediana (Q2) | Percentil 50 |
| `q3` | Tercer cuartil | Percentil 75 |
| `max` | Máximo (sin outliers) | Q3 + 1.5×IQR |
| `iqr` | Rango intercuartílico | Q3 - Q1 |
| `stdDev` | Desviación estándar | √(Σ(xi - μ)² / N) |
| `outliers` | Valores atípicos | < (Q1 - 1.5×IQR) o > (Q3 + 1.5×IQR) |

#### 5.6.2 Análisis por Institución

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `avgScore` | Promedio institucional | AVG(totalScore) |
| `minScore` | Mínimo institucional | MIN(totalScore) |
| `maxScore` | Máximo institucional | MAX(totalScore) |
| `studentCount` | Estudiantes por institución | COUNT(DISTINCT usuario_id) |
| `stdDev` | Desviación estándar | σ de puntajes |
| `performanceLevel` | Nivel de desempeño | Excelente (≥800), Bueno (600-799), Regular (400-599), Bajo (<400) |
| `type` | Tipo de institución | Fiscal, Municipal, Particular, Fiscomisional |

#### 5.6.3 Análisis Geográfico

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `riskIndex` | Índice de riesgo | ((promedio_general - puntaje) / promedio_general) * 100 |
| `riskLevel` | Nivel de riesgo | Sin Riesgo (<0%), Bajo (0-10%), Medio (10-20%), Alto (>20%) |
| `avgScore` | Promedio por ubicación | AVG(totalScore) |
| `studentCount` | Estudiantes por ubicación | COUNT(DISTINCT usuario_id) |

#### 5.6.4 Análisis por Carrera

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `avgScore` | Promedio por carrera | AVG(totalScore) |
| `applicantCount` | Postulantes | COUNT(DISTINCT usuario_id) |
| `withQuota` | Con cupo | COUNT WHERE conCupo='SI' |
| `withoutQuota` | Sin cupo | COUNT WHERE conCupo='NO' |
| `quotaRate` | Tasa de cupo | (withQuota / total) * 100 |
| `competitiveness` | Nivel de competitividad | Muy Alta (≥100), Alta (50-99), Media (20-49), Baja (<20) |

#### 5.6.5 Índice de Dificultad

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `avgSuccessRate` | Tasa de éxito promedio | AVG((correctas / total) * 100) |
| `difficultyIndex` | Índice de dificultad | 100 - avgSuccessRate |
| `difficultyLevel` | Nivel de dificultad | Fácil (≥70%), Moderado (50-70%), Difícil (30-50%), Muy Difícil (<30%) |

### 5.7 Métricas de Distribución Estadística

#### 5.7.1 Distribución por Componente

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `mean` | Media | Σxi / N |
| `median` | Mediana | Valor central ordenado |
| `mode` | Moda | Valor más frecuente |
| `variance` | Varianza | Σ(xi - μ)² / N |
| `standardDeviation` | Desviación estándar | √variance |
| `range` | Rango | max - min |
| `iqr` | Rango intercuartílico | Q3 - Q1 |
| `withinOneStdDev` | Dentro de 1σ | COUNT WHERE \|z\| ≤ 1 |
| `withinTwoStdDev` | Dentro de 2σ | COUNT WHERE \|z\| ≤ 2 |
| `withinThreeStdDev` | Dentro de 3σ | COUNT WHERE \|z\| ≤ 3 |

#### 5.7.2 Distribución por Mediana

| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| `median` | Mediana de puntajes totales | Mediana de SUM(puntaje_obtenido_componente) |
| `mean` | Media de puntajes totales | AVG(totalScore) |
| `aboveMedian.count` | Por encima de la mediana | COUNT WHERE totalScore > median |
| `belowMedian.count` | Por debajo de la mediana | COUNT WHERE totalScore < median |
| `aboveMedian.percentage` | % por encima | (above / total) * 100 |
| `belowMedian.percentage` | % por debajo | (below / total) * 100 |

---

## 6. Campos del Modelo de Datos Utilizados

### Identificación
- `studentId`, `studentName`, `usuario_id`

### Información Personal
- `sexo`, `paisReside`, `provinciaReside`, `cantonReside`

### Información Educativa
- `unidadEducativa`, `tipoUnidadEducativa`

### Discapacidad
- `cierreCarnetDiscapacidad`, `cierreTipoDiscapacidad`, `cierrePrcjDiscapacidad`

### Admisión
- `conCupo`, `conCupoCarrera`

### Componente/Prueba
- `componente`, `nro_preguntas`, `preguntas_correctas`, `preguntas_incorrectas`, `preguntas_no_contestadas`
- `puntaje_max_componente`, `puntaje_obtenido_componente`, `porcentaje_componente`

### Sistema
- `period`, `year`, `status`, `uploadedBy`, `uploadedAt`

---

## 7. Recomendaciones para Actualizar Documentación

### 7.1 Métricas que requieren actualización de fórmula

1. **Índice de Riesgo por Procedencia (IRP)**
   - Documentación actual: IRP = (1 - (Promedio_Colegio / Promedio_General)) * 100
   - Fórmula real: IRP = ((Promedio_General - Puntaje_Grupo) / Promedio_General) * 100

### 7.2 Métricas que requieren aclaración de nombre

1. **Tasa de Admisión (TA)** → En código aparece como `quotaRate`
2. **Demanda por Carrera (DC)** → En código aparece como `applicantCount`
3. **Tasa de Cupo por Carrera (TCC)** → Es la misma métrica que TA

### 7.3 Métricas nuevas a documentar (por prioridad)

**Alta Prioridad:**
1. Distribución Normal y Mediana
2. Análisis de Componentes (Box Plot)
3. Análisis de Impacto por Discapacidad
4. Segmentación "Sin Cupo"

**Media Prioridad:**
5. Análisis de Estrategias de Respuesta
6. Análisis Comparativo entre Períodos
7. Concentración de Riesgo por Sector
8. Análisis de Tendencias

---

## 8. Glosario de Términos del Sistema

| Término | Descripción |
|---------|-------------|
| **Componente** | Materia o área evaluada en el examen de admisión |
| **Con Cupo** | Estudiante que obtuvo lugar en una carrera (conCupo='SI') |
| **Sin Cupo** | Estudiante que no obtuvo lugar (conCupo='NO') |
| **Tipo de Unidad Educativa** | Clasificación: Fiscal, Municipal, Particular, Fiscomisional |
| **Brecha de Género** | Diferencia de rendimiento entre géneros |
| **Índice de Riesgo** | Medida de desviación inferior al promedio |
| **Outlier** | Valor atípico según método IQR |
| **Estrategia Conservadora** | Deja preguntas sin contestar |
| **Estrategia Agresiva** | Contesta todo, aunque haya errores |
| **IQR** | Rango Intercuartílico (Q3 - Q1) |

---

## Nota Final

Todas las métricas están implementadas en los servicios del backend (`backend-nodejs/src/application/services/`) y consumidas por el frontend Angular (`frontend-angular/src/app/features/`). Los endpoints de la API están documentados en Swagger UI disponible en `/api-docs` cuando el servidor está en modo desarrollo.
