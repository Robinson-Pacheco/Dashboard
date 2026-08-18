const axios = require('axios');
const AIProviderInterface = require('./AIProviderInterface');

class OpenCodeProvider extends AIProviderInterface {
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.OPENCODE_API_KEY;
    this.baseURL = config.baseURL || process.env.OPENCODE_BASE_URL || 'https://opencode.ai/zen/go/v1';
    this.defaultModel = config.defaultModel || process.env.OPENCODE_DEFAULT_MODEL || 'deepseek-v4-flash';
    this.timeout = config.timeout || 60000;

    if (!this.apiKey) {
      throw new Error('OpenCode API key is required. Set OPENCODE_API_KEY in environment variables.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
        provider: 'opencode'
      };
    } catch (error) {
      throw new Error(`OpenCode API error: ${error.response?.data?.error?.message || error.message}`);
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
            provider: 'opencode'
          });
        });

        response.data.on('error', (error) => {
          reject(new Error(`OpenCode stream error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`OpenCode streaming error: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/models');
      return response.status === 200;
    } catch (error) {
      console.error('OpenCode connection test failed:', error.message);
      return false;
    }
  }

  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      return response.data.data.map(model => model.id);
    } catch (error) {
      console.error('Failed to fetch OpenCode models, using fallback list:', error.message);
      return [
        'deepseek-v4-flash',
        'deepseek-v4-pro',
        'kimi-k2.6',
        'kimi-k2.5',
        'glm-5.1',
        'glm-5',
        'qwen3.7-max',
        'qwen3.7-plus',
        'qwen3.6-plus',
        'minimax-m3',
        'minimax-m2.7',
        'minimax-m2.5',
        'mimo-v2.5',
        'mimo-v2.5-pro',
        'grok-build-0.1',
        'big-pickle',
        'deepseek-v4-flash-free'
      ];
    }
  }

  getProviderName() {
    return 'OpenCode';
  }

  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}

module.exports = OpenCodeProvider;
