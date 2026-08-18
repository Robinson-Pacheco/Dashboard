# 🤖 Integración con IA - Sistema de Admisión

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Configuración](#configuración)
4. [Uso](#uso)
5. [API Endpoints](#api-endpoints)
6. [Ejemplos](#ejemplos)
7. [Cambio de Proveedor](#cambio-de-proveedor)

---

## 📖 Descripción General

Este módulo proporciona capacidades de análisis con Inteligencia Artificial para el sistema de admisiones. La implementación es **genérica y switchable**, permitiendo cambiar entre diferentes proveedores de IA (OpenRouter, Ollama y OpenCode Go) sin modificar el código de negocio.

### Proveedores Soportados

- ✅ **OpenRouter** - Modelos cloud (Claude, GPT-4, Gemini, etc.)
- ✅ **Ollama** - Modelos locales (Llama 3, Mistral, etc.)
- ✅ **OpenCode Go** - Modelos cloud via OpenCode Go (DeepSeek V4, Kimi K2.6, GLM-5.1, Qwen3.7, MiniMax M3, etc.)

### Características

- ✅ **Análisis de Cuartiles** - Interpretación educativa de Q1, Q2, Q3
- ✅ **Predicciones** - Predicción de tendencias futuras basadas en datos históricos
- ✅ **Análisis de Outliers** - Recomendaciones para estudiantes con puntajes atípicos
- ✅ **Comparativas** - Análisis comparativo entre diferentes periodos
- ✅ **Reportes Narrativos** - Generación de reportes en lenguaje natural
- ✅ **Detección de Anomalías** - Identificación de patrones inusuales en datos

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION Layer                        │
│                    (Controllers & Routes)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION Layer                         │
│                    (AI Analysis Service)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE Layer                      │
│                                                             │
│              ┌──────────────────────────────┐              │
│              │     AI Provider Factory      │              │
│              └──────────────────────────────┘              │
│                         │                                  │
│         ┌───────────────┴───────────────┐                  │
│         ▼                               ▼                  │
│  ┌─────────────────┐          ┌─────────────────┐          │
│  │   OpenRouter    │          │     Ollama      │          │
│  │   Provider      │          │    Provider     │          │
│  └─────────────────┘          └─────────────────┘          │
│                                                             │
│         ▼                                                  │
│  ┌─────────────────┐                                       │
│  │    OpenCode     │                                       │
│  │    Provider     │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

Copia las siguientes variables en tu archivo `.env`:

```bash
# ============ AI PROVIDER CONFIGURATION ============

# AI Provider Selection: 'openrouter', 'ollama', or 'opencode'
AI_PROVIDER=openrouter

# Fallback provider (optional): will be used if primary fails
AI_FALLBACK_PROVIDER=ollama

# ============ OPENROUTER CONFIGURATION ============
# Get your API key at https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet:beta

# ============ OLLAMA CONFIGURATION ============
# Ollama must be running locally. Download from https://ollama.ai/
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1

# ============ OPENCODE GO CONFIGURATION ============
# Subscribe at https://opencode.ai/go
OPENCODE_API_KEY=your_opencode_api_key_here
OPENCODE_BASE_URL=https://opencode.ai/zen/go/v1
OPENCODE_DEFAULT_MODEL=deepseek-v4-flash
```

### 2. Instalación de Dependencias

Las dependencias ya están incluidas en `package.json`:
- `axios` - Para llamadas HTTP a APIs de IA
- `dotenv` - Para configuración de variables de entorno

### 3. Configuración de Proveedores

#### Opción A: OpenRouter (Recomendado para Producción)

1. Obtén tu API key en [OpenRouter](https://openrouter.ai/keys)
2. Configura las variables de entorno:
   ```bash
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=sk-or-v1-...
   OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet:beta
   ```

**Modelos disponibles en OpenRouter:**
- `anthropic/claude-3.5-sonnet:beta` - Recomendado (mejor calidad)
- `openai/gpt-4` - GPT-4
- `google/gemini-pro-1.5` - Google Gemini
- `meta-llama/llama-3.1-70b-instruct` - Llama 3.1 (económico)

#### Opción B: Ollama (Para Desarrollo Local)

1. Descarga e instala [Ollama](https://ollama.ai/)
2. Inicia Ollama: `ollama serve`
3. Descarga un modelo: `ollama pull llama3.1`
4. Configura las variables de entorno:
   ```bash
   AI_PROVIDER=ollama
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_DEFAULT_MODEL=llama3.1
   ```

**Modelos disponibles en Ollama:**
- `llama3.1` - Recomendado (8B parameters)
- `llama3.1:70b` - Más potente (requiere más recursos)
- `mistral` - Modelo compacto y rápido
- `codellama` - Especializado en código

#### Opción C: OpenCode Go (Modelos Cloud por Suscripción)

[OpenCode Go](https://opencode.ai/go) es un plan de suscripción de bajo costo ($5 primer mes, $10/mes) que da acceso a modelos open-source populares. Usa un endpoint compatible con OpenAI.

1. Suscríbete en [OpenCode Go](https://opencode.ai/go)
2. Copia tu API key desde la consola
3. Configura las variables de entorno:
   ```bash
   AI_PROVIDER=opencode
   OPENCODE_API_KEY=sk-...
   OPENCODE_DEFAULT_MODEL=deepseek-v4-flash
   ```

> **IMPORTANTE**: Los modelos se usan con su ID simple (`deepseek-v4-flash`), sin prefijos. El prefijo `opencode-go/` solo se usa en la configuración del CLI de OpenCode, no en las llamadas API.

**Modelos disponibles en OpenCode Go:**
- `deepseek-v4-flash` - Recomendado (rápido y económico)
- `deepseek-v4-pro` - Mayor calidad
- `kimi-k2.6` - Kimi K2.6
- `kimi-k2.5` - Kimi K2.5
- `glm-5.1` - GLM-5.1
- `glm-5` - GLM-5
- `qwen3.7-max` - Qwen3.7 Max
- `qwen3.7-plus` - Qwen3.7 Plus
- `qwen3.6-plus` - Qwen3.6 Plus
- `mimo-v2.5` - MiMo-V2.5
- `mimo-v2.5-pro` - MiMo-V2.5 Pro
- `minimax-m3` - MiniMax M3
- `minimax-m2.7` - MiniMax M2.7
- `minimax-m2.5` - MiniMax M2.5

**Endpoint:** `https://opencode.ai/zen/go/v1/chat/completions`

**Límites del plan Go:**
| Período | Límite en USD |
|---------|--------------|
| 5 horas | $12 |
| Semanal | $30 |
| Mensual | $60 |

---

## 🚀 Uso

### En el Backend (Node.js)

```javascript
const aiAnalysisService = require('./application/services/ai-analysis/AIAnalysisService');

// Analizar cuartiles
const result = await aiAnalysisService.analyzeQuartiles({
  component: 'Razonamiento Abstracto',
  q1: 40,
  q2: 60,
  q3: 80,
  iqr: 40,
  min: 0,
  max: 100
});

console.log(result.analysis);
```

### Desde el Frontend (Angular)

```typescript
// En tu servicio Angular
async analyzeQuartiles(statistics: any) {
  return this.http.post(`${this.apiUrl}/ai/quartiles`, {
    component: 'Razonamiento Abstracto',
    period: '2025-2',
    year: 2025,
    statistics
  }).toPromise();
}
```

---

## 📡 API Endpoints

### 1. Analizar Cuartiles

**POST** `/api/ai/quartiles`

```json
{
  "component": "Razonamiento Abstracto",
  "period": "2025-2",
  "year": 2025,
  "statistics": {
    "q1": 40,
    "median": 60,
    "q3": 80,
    "iqr": 40,
    "min": 0,
    "max": 100
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "component": "Razonamiento Abstracto",
    "analysis": "Análisis educativo detallado...",
    "metadata": {
      "provider": "openrouter",
      "model": "anthropic/claude-3.5-sonnet",
      "usage": {
        "promptTokens": 350,
        "completionTokens": 500,
        "totalTokens": 850
      }
    }
  }
}
```

### 2. Generar Predicciones

**POST** `/api/ai/predictions`

```json
{
  "component": "Razonamiento Abstracto",
  "periodsToPredict": 3,
  "historicalData": [
    { "period": "2024-1", "mean": 50.5, "count": 5200 },
    { "period": "2024-2", "mean": 52.3, "count": 5400 },
    { "period": "2025-1", "mean": 51.8, "count": 5300 }
  ]
}
```

### 3. Analizar Outliers

**POST** `/api/ai/outliers`

```json
{
  "component": "Razonamiento Abstracto",
  "outliers": [
    {
      "studentName": "UNIDAD EDUCATIVA A",
      "score": 0,
      "zScore": -2.5
    }
  ],
  "statistics": {
    "mean": 52.55,
    "standardDeviation": 25.07
  }
}
```

### 4. Comparar Periodos

**POST** `/api/ai/compare-periods`

```json
{
  "component": "Razonamiento Abstracto",
  "period1": {
    "period": "2024-2",
    "mean": 50.2,
    "median": 58,
    "standardDeviation": 24.5,
    "count": 5400
  },
  "period2": {
    "period": "2025-1",
    "mean": 52.55,
    "median": 60,
    "standardDeviation": 25.07,
    "count": 5596
  }
}
```

### 5. Generar Reporte Narrativo

**POST** `/api/ai/narrative-report`

```json
{
  "data": {
    "component": "Razonamiento Abstracto",
    "totalStudents": 5596,
    "statistics": { ... },
    "normalDistribution": { ... }
  }
}
```

### 6. Detectar Anomalías

**POST** `/api/ai/anomalies`

```json
{
  "currentData": [...],
  "historicalData": [...]
}
```

### 7. Verificar Estado del Proveedor

**GET** `/api/ai/status`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "provider": "OpenRouter",
    "availableModels": [
      "anthropic/claude-3.5-sonnet",
      "openai/gpt-4",
      "google/gemini-pro-1.5"
    ],
    "message": "Connected to OpenRouter"
  }
}
```

---

## 💡 Ejemplos

### Ejemplo 1: Integración con Análisis Existente

```javascript
// En tu controlador de distribución estadística existente
const aiAnalysisService = require('../application/services/ai-analysis/AIAnalysisService');

async getDistributionWithAIAnalysis(req, res) {
  // ... obtener datos estadísticos ...

  // Agregar análisis de IA
  const aiAnalysis = await aiAnalysisService.analyzeQuartiles({
    component: req.query.componente,
    q1: statistics.q1,
    q2: statistics.median,
    q3: statistics.q3,
    iqr: statistics.iqr,
    min: statistics.min,
    max: statistics.max
  });

  res.json({
    success: true,
    data: {
      statistics,
      aiAnalysis: aiAnalysis.analysis
    }
  });
}
```

### Ejemplo 2: Streaming de Respuestas

```javascript
// Para respuestas en tiempo real (futuro)
const stream = await aiAnalysisService.provider.streamChatCompletion({
  messages: [...],
  onChunk: (chunk) => {
    console.log('Received chunk:', chunk);
    // Enviar al cliente vía WebSocket o SSE
  }
});
```

---

## 🔄 Cambio de Proveedor

### Cambio entre Proveedores

Simplemente cambia la variable de entorno:

```bash
# Usar OpenRouter
AI_PROVIDER=openrouter

# Usar Ollama (local)
AI_PROVIDER=ollama

# Usar OpenCode
AI_PROVIDER=opencode
```

### Configuración con Fallback

El sistema puede intentar con un proveedor secundario si el primario falla:

```bash
AI_PROVIDER=openrouter
AI_FALLBACK_PROVIDER=ollama
```

Si OpenRouter no está disponible, el sistema intentará usar Ollama automáticamente.

**Combinaciones de fallback recomendadas:**
- `openrouter` → `ollama` (cloud → local)
- `opencode` → `openrouter` (alternativa cloud)
- `opencode` → `ollama` (cloud → local)

### Cambio en Tiempo de Ejecución

```javascript
const aiProviderFactory = require('./infrastructure/ai-providers/AIProviderFactory');

// Limpiar caché y crear nuevo proveedor
aiProviderFactory.clearCache();
const newProvider = aiProviderFactory.createProvider({
  provider: 'ollama',
  ollama: {
    baseURL: 'http://localhost:11434',
    defaultModel: 'llama3.1'
  }
});
```

---

## 📊 Análisis Disponibles

| Análisis | Endpoint | Descripción |
|----------|----------|-------------|
| Cuartiles | `POST /api/ai/quartiles` | Interpretación de Q1, Q2, Q3 y recomendaciones educativas |
| Predicciones | `POST /api/ai/predictions` | Predicción de tendencias futuras |
| Outliers | `POST /api/ai/outliers` | Análisis de estudiantes con puntajes atípicos |
| Comparativas | `POST /api/ai/compare-periods` | Comparación entre diferentes periodos |
| Reportes | `POST /api/ai/narrative-report` | Generación de reportes narrativos completos |
| Anomalías | `POST /api/ai/anomalies` | Detección de patrones inusuales en datos |

---

## 🛡️ Seguridad

- Todos los endpoints requieren autenticación JWT
- Las API keys de OpenRouter se almacenan en variables de entorno
- Rate limiting configurado (100 requests por 15 minutos)
- Los prompts del sistema están diseñados para evitar inyecciones

---

## 🔧 Troubleshooting

### Error: "Cannot connect to Ollama"

**Solución:**
1. Verifica que Ollama esté ejecutándose: `ollama serve`
2. Verifica la URL: `curl http://localhost:11434/api/tags`
3. Descarga un modelo: `ollama pull llama3.1`

### Error: "OpenRouter API key is required"

**Solución:**
1. Obtén una API key en https://openrouter.ai/keys
2. Configura `OPENROUTER_API_KEY` en tu archivo `.env`
3. Reinicia el servidor

### Error: "OpenCode API key is required"

**Solución:**
1. Suscríbete a OpenCode Go en https://opencode.ai/go
2. Copia tu API key desde la consola
3. Configura `OPENCODE_API_KEY` en tu archivo `.env`
4. Reinicia el servidor

### Error: OpenCode devuelve 500 Internal Server Error (chat completions)

**Causa posible:** El plan Go no tiene saldo o ha alcanzado el límite de uso.

**Solución:**
1. Verifica tu uso en https://opencode.ai/auth
2. Si alcanzaste el límite, espera al próximo período o agrega crédito Zen como respaldo
3. Si usas un modelo gratis (ej. `deepseek-v4-flash-free`), verifica que el endpoint sea correcto

### Error: "Failed to initialize AI provider"

**Solución:**
1. Verifica que la variable `AI_PROVIDER` esté configurada
2. Si usas OpenRouter, verifica tu API key
3. Si usas Ollama, verifica que esté ejecutándose

---

## 📚 Recursos Adicionales

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [OpenCode Go Documentation](https://opencode.ai/docs/go/)
- [OpenCode Zen Documentation](https://opencode.ai/docs/zen/)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)

---

## 🧪 Dev Testing (Endpoints para pruebas con curl)

Cuando `NODE_ENV=development`, los siguientes endpoints están disponibles para probar proveedores de IA directamente con curl:

### Listar proveedores disponibles

**GET** `/api/dev/ai/providers`

```bash
curl http://localhost:3000/api/dev/ai/providers
```

### Probar conexión con un proveedor

**GET** `/api/dev/ai/connection?provider=opencode`

```bash
curl "http://localhost:3000/api/dev/ai/connection?provider=opencode"
```

### Chat de prueba (respuesta completa)

**POST** `/api/dev/ai/chat`

```bash
curl -X POST http://localhost:3000/api/dev/ai/chat \
  -H "Content-Type: application/json" \
  -d "{\"provider\": \"opencode\", \"model\": \"deepseek-v4-flash\", \"message\": \"Analiza estos datos de admisión: media=52.5, mediana=58, desv=25.07, n=5596\"}"
```

### Chat de prueba (streaming)

**POST** `/api/dev/ai/chat/stream`

```bash
curl -X POST http://localhost:3000/api/dev/ai/chat/stream \
  -H "Content-Type: application/json" \
  -d "{\"provider\": \"opencode\", \"message\": \"Hola, ¿cómo estás?\"}" \
  --no-buffer
```

### Parámetros del body:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `provider` | string | `openrouter`, `ollama`, `opencode` (default: `AI_PROVIDER` env) |
| `model` | string | Model ID (default: según proveedor) |
| `message` | string | Mensaje de prueba |

---

## 📝 Notas

- Los prompts están optimizados para generar respuestas en español
- Los modelos de IA pueden generar diferentes respuestas para la misma entrada (no-determinismo)
- Para producción, se recomienda usar OpenRouter con Claude 3.5 Sonnet
- Para desarrollo local, Ollama con Llama 3.1 es una excelente opción gratuita
- **OpenCode Go** usa suscripción mensual ($5 primer mes, luego $10/mes) con modelo `deepseek-v4-flash` como default
- Los IDs de modelo en OpenCode NO usan el prefijo `opencode-go/` en las llamadas API; ese prefijo es solo para el archivo de configuración del CLI de OpenCode
