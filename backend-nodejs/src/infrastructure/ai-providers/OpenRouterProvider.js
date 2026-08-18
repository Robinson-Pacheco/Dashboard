const axios = require('axios');
const AIProviderInterface = require('./AIProviderInterface');

/**
 * OpenRouter AI Provider
 * Connects to OpenRouter API (https://openrouter.ai/)
 * Provides access to multiple LLM models through a unified API
 */
class OpenRouterProvider extends AIProviderInterface {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
    this.defaultModel = config.defaultModel || 'anthropic/claude-3.5-sonnet';
    this.timeout = config.timeout || 60000;

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Set OPENROUTER_API_KEY in environment variables.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': config.siteURL || process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': config.siteName || process.env.SITE_NAME || 'Admission BI System',
        'Content-Type': 'application/json'
      },
      timeout: this.timeout
    });
  }

  async chatCompletion({ messages, model, temperature = 0.7, maxTokens = 4096 }) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: model || this.defaultModel,
        messages: this.formatMessages(messages),
        temperature,
        max_tokens: maxTokens
      });

      return {
        content: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage?.prompt_tokens,
          completionTokens: response.data.usage?.completion_tokens,
          totalTokens: response.data.usage?.total_tokens
        },
        model: response.data.model,
        provider: 'openrouter'
      };
    } catch (error) {
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async streamChatCompletion({ messages, onChunk, model, temperature = 0.7 }) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: model || this.defaultModel,
        messages: this.formatMessages(messages),
        temperature,
        stream: true
      }, {
        responseType: 'stream'
      });

      let fullContent = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(message);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        });

        response.data.on('end', () => {
          resolve({
            content: fullContent,
            provider: 'openrouter'
          });
        });

        response.data.on('error', (error) => {
          reject(new Error(`OpenRouter stream error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`OpenRouter streaming error: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/models');
      return response.status === 200;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error.message);
      return false;
    }
  }

  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      return response.data.data.map(model => model.id);
    } catch (error) {
      throw new Error(`Failed to fetch OpenRouter models: ${error.message}`);
    }
  }

  getProviderName() {
    return 'OpenRouter';
  }

  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}

module.exports = OpenRouterProvider;
