const aiAnalysisService = require('../../../application/services/ai-analysis/AIAnalysisService');
const aiProviderFactory = require('../../../infrastructure/ai-providers/AIProviderFactory');

/**
 * AI Analysis Controller
 * Handles HTTP requests for AI-powered analysis
 */
class AIAnalysisController {
  /**
   * Analyze quartiles with AI
   * POST /api/ai/quartiles
   */
  async analyzeQuartiles(req, res) {
    try {
      const { component, period, year, statistics } = req.body;

      // Validate required fields
      if (!statistics) {
        return res.status(400).json({
          success: false,
          message: 'Statistics data is required'
        });
      }

      const result = await aiAnalysisService.analyzeQuartiles({
        component: component || 'Componente',
        q1: statistics.q1,
        q2: statistics.median,
        q3: statistics.q3,
        iqr: statistics.iqr,
        min: statistics.min,
        max: statistics.max
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to analyze quartiles',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          component,
          period,
          year,
          analysis: result.analysis,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing quartile analysis',
        error: error.message
      });
    }
  }

  /**
   * Predict future admissions
   * POST /api/ai/predictions
   */
  async predictAdmissions(req, res) {
    try {
      const { component, periodsToPredict, historicalData } = req.body;

      if (!historicalData || !Array.isArray(historicalData)) {
        return res.status(400).json({
          success: false,
          message: 'Historical data array is required'
        });
      }

      const result = await aiAnalysisService.predictAdmissions({
        component,
        periodsToPredict: periodsToPredict || 3,
        historicalData
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate predictions',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          component,
          periodsToPredict,
          predictions: result.predictions,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing predictions',
        error: error.message
      });
    }
  }

  /**
   * Analyze outliers with AI
   * POST /api/ai/outliers
   */
  async analyzeOutliers(req, res) {
    try {
      const { component, outliers, statistics } = req.body;

      if (!outliers || !statistics) {
        return res.status(400).json({
          success: false,
          message: 'Outliers and statistics data are required'
        });
      }

      const result = await aiAnalysisService.analyzeOutliers({
        component: component || 'Componente',
        outliers,
        statistics
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to analyze outliers',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          component,
          analysis: result.analysis,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing outlier analysis',
        error: error.message
      });
    }
  }

  /**
   * Compare periods with AI
   * POST /api/ai/compare-periods
   */
  async comparePeriods(req, res) {
    try {
      const { component, period1, period2 } = req.body;

      if (!period1 || !period2) {
        return res.status(400).json({
          success: false,
          message: 'Both period data are required'
        });
      }

      const result = await aiAnalysisService.comparePeriods({
        component,
        period1,
        period2
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to compare periods',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          component,
          comparison: result.comparison,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing period comparison',
        error: error.message
      });
    }
  }

  /**
   * Generate narrative report
   * POST /api/ai/narrative-report
   */
  async generateNarrativeReport(req, res) {
    try {
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Report data is required'
        });
      }

      const result = await aiAnalysisService.generateNarrativeReport(data);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate narrative report',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          report: result.report,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating narrative report',
        error: error.message
      });
    }
  }

  /**
   * Detect anomalies in data
   * POST /api/ai/anomalies
   */
  async detectAnomalies(req, res) {
    try {
      const { currentData, historicalData } = req.body;

      if (!currentData || !historicalData) {
        return res.status(400).json({
          success: false,
          message: 'Current and historical data are required'
        });
      }

      const result = await aiAnalysisService.detectAnomalies({
        currentData,
        historicalData
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to detect anomalies',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          anomalies: result.anomalies,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error detecting anomalies',
        error: error.message
      });
    }
  }

  /**
   * Get AI provider status
   * GET /api/ai/status
   */
  /**
   * Streaming quartiles analysis via SSE
   * POST /api/ai/quartiles/stream
   */
  async streamQuartiles(req, res) {
    try {
      const { component, period, year, statistics } = req.body;

      if (!statistics) {
        return res.status(400).json({
          success: false,
          message: 'Statistics data is required'
        });
      }

      const prompt = `## Datos de Cuartiles - Componente: "${component || 'Componente'}"

- Q1 (25%): ${statistics.q1}
- Q2 (Mediana): ${statistics.q2}
- Q3 (75%): ${statistics.q3}
- Rango Intercuartil (IQR): ${statistics.iqr}
- Mínimo: ${statistics.min}
- Máximo: ${statistics.max}

## Genera este análisis estructurado en MARKDOWN:

### 1. Interpretación Educativa
[3-4 bullets con interpretación de los cuartiles]

### 2. Distribución por Nivel de Rendimiento
[Porcentajes de estudiantes en cada cuartil]

### 3. Implicaciones para la Enseñanza
[2-3 bullets con implicaciones pedagógicas]

### 4. Recomendaciones Específicas
[1-2 recomendaciones por cuartil]`;

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const provider = aiProviderFactory.getCurrentProvider();
      if (!provider) {
        res.write(`data: ${JSON.stringify({ error: 'AI provider not configured' })}\n\n`);
        res.end();
        return;
      }

      await provider.streamChatCompletion({
        messages: [
          {
            role: 'system',
            content: `Eres un analista educativo experto en interpretación de datos de admisión universitaria.

REGLAS ESTRICTAS DE FORMATO:
- Usa Markdown: ## para títulos, - para bullets, 1. 2. 3. para listas numeradas
- Máximo 3-4 bullets por sección
- Sé directo y conciso. Evita párrafos largos.
- NO uses saludos, despedidas ni frases de transición
- Responde ÚNICAMENTE con el análisis solicitado`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        onChunk: (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming quartile analysis',
          error: error.message
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * Generate AI-powered chart with analysis
   * POST /api/ai/generate-chart
   */
  async generateChart(req, res) {
    try {
      const { prompt, stream } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }

      const result = await aiAnalysisService.generateChart({ prompt });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate chart',
          error: result.error
        });
      }

      res.json({
        success: true,
        data: {
          text: result.text,
          chart: result.chart,
          metadata: result.metadata
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating chart',
        error: error.message
      });
    }
  }

  /**
   * Streaming chart generation via SSE
   * POST /api/ai/generate-chart/stream
   */
  async streamGenerateChart(req, res) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt is required'
        });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const provider = aiProviderFactory.getCurrentProvider();
      if (!provider) {
        res.write(`data: ${JSON.stringify({ error: 'AI provider not configured' })}\n\n`);
        res.end();
        return;
      }

      // Fetch context data for the AI
      const contextData = await aiAnalysisService.fetchChartContextData(prompt);

      const systemPrompt = `Eres un analista de datos educativo experto en generar visualizaciones y reportes.

Tienes acceso a los siguientes datos de admisión universitaria:

\`\`\`json
${JSON.stringify(contextData, null, 2)}
\`\`\`

Basado en el prompt del usuario, debes:
1. Generar un análisis en texto usando Markdown
2. Configurar un gráfico Chart.js válido

Responde ÚNICAMENTE con un JSON en este formato exacto (sin markdown, solo JSON):
{
  "type": "bar" | "line" | "pie" | "doughnut" | "radar" | "polarArea",
  "title": "Título del gráfico",
  "analysis": "## Análisis\\n\\n- Bullet 1\\n- Bullet 2",
  "chart": {
    "type": "bar",
    "data": {
      "labels": ["Label1", "Label2"],
      "datasets": [{
        "label": "Dataset name",
        "data": [10, 20],
        "backgroundColor": ["#4F46E5", "#7C3AED"]
      }]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "legend": { "display": true },
        "title": { "display": true, "text": "Título del gráfico" }
      },
      "scales": {
        "y": { "beginAtZero": true }
      }
    }
  }
}

Reglas para el chart:
- Usa type: "bar" | "line" | "pie" | "doughnut" | "radar" | "polarArea"
- backgroundColor debe ser un array de colores CSS válidos
- Máximo 15 items en labels
- Los datos deben venir de la información proporcionada arriba
- Si el usuario pide algo sin datos disponibles, genera un gráfico conceptual`;

      let fullText = '';

      await provider.streamChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        onChunk: (chunk) => {
          fullText += chunk;
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      });

      // Parse the final response to extract JSON
      const { text: textAnalysis, chart: chartData } = aiAnalysisService.cleanAndParseJson(fullText);

      res.write(`data: ${JSON.stringify({ done: true, chart: chartData, analysis: textAnalysis || fullText })}\n\n`);
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming chart generation',
          error: error.message
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  }

  async getProviderStatus(req, res) {
    try {
      const aiProviderFactory = require('../../../infrastructure/ai-providers/AIProviderFactory');
      const provider = aiProviderFactory.getCurrentProvider();

      if (!provider) {
        return res.json({
          success: true,
          data: {
            status: 'not_configured',
            provider: null,
            message: 'AI provider not configured. Check environment variables.'
          }
        });
      }

      const isConnected = await provider.testConnection();
      const availableModels = isConnected ? await provider.getAvailableModels() : [];

      res.json({
        success: true,
        data: {
          status: isConnected ? 'connected' : 'disconnected',
          provider: provider.getProviderName(),
          availableModels,
          message: isConnected
            ? `Connected to ${provider.getProviderName()}`
            : `Failed to connect to ${provider.getProviderName()}`
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking provider status',
        error: error.message
      });
    }
  }
}

module.exports = new AIAnalysisController();
