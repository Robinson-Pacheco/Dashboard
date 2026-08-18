const axios = require('axios');
const AIProviderInterface = require('./AIProviderInterface');

/**
 * Ollama AI Provider
 * Connects to local Ollama instance (https://ollama.ai/)
 * Provides access to local LLM models
 */
class OllamaProvider extends AIProviderInterface {
  constructor(config = {}) {
    super();
    this.baseURL = config.baseURL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.defaultModel = config.defaultModel || process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1';
    this.timeout = config.timeout || 120000; // 120 seconds default for local inference

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout
    });
  }

  /**
   * Send a chat completion request to Ollama
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response from Ollama
   */
  async chatCompletion({ messages, model, temperature = 0.7, maxTokens }) {
    try {
      const response = await this.client.post('/api/chat', {
        model: model || this.defaultModel,
        messages: this.formatMessages(messages),
        options: {
          temperature,
          num_predict: maxTokens
        },
        stream: false
      });

      return {
        content: response.data.message.content,
        usage: {
          promptTokens: response.data.prompt_eval_count,
          completionTokens: response.data.eval_count,
          totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        },
        model: response.data.model,
        provider: 'ollama'
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running locally.');
      }
      throw new Error(`Ollama API error: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Send a streaming chat completion request
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Final response
   */
  async streamChatCompletion({ messages, onChunk, model, temperature = 0.7 }) {
    try {
      const response = await this.client.post('/api/chat', {
        model: model || this.defaultModel,
        messages: this.formatMessages(messages),
        options: {
          temperature
        },
        stream: true
      }, {
        responseType: 'stream'
      });

      let fullContent = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.done) {
                break;
              }
              const content = parsed.message?.content;
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
            provider: 'ollama'
          });
        });

        response.data.on('error', (error) => {
          reject(new Error(`Ollama stream error: ${error.message}`));
        });
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Ollama. Make sure Ollama is running locally.');
      }
      throw new Error(`Ollama streaming error: ${error.message}`);
    }
  }

  /**
   * Test the connection to Ollama
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection() {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      console.error('Ollama connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Get available models from Ollama
   * @returns {Promise<Array<string>>} Array of available model identifiers
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/api/tags');
      return response.data.models.map(model => model.name);
    } catch (error) {
      throw new Error(`Failed to fetch Ollama models: ${error.message}`);
    }
  }

  /**
   * Pull a model from Ollama registry
   * @param {string} modelName - Name of the model to pull
   * @param {Function} [onProgress] - Callback for download progress
   * @returns {Promise<boolean>} True if successful
   */
  async pullModel(modelName, onProgress) {
    try {
      const response = await this.client.post('/api/pull', {
        name: modelName,
        stream: true
      }, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.error) {
                reject(new Error(parsed.error));
                return;
              }
              if (parsed.status === 'success') {
                resolve(true);
              }
              if (onProgress && parsed.total && parsed.completed) {
                const progress = (parsed.completed / parsed.total) * 100;
                onProgress(progress);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        });

        response.data.on('error', (error) => {
          reject(new Error(`Ollama pull model error: ${error.message}`));
        });
      });
    } catch (error) {
      throw new Error(`Failed to pull model: ${error.message}`);
    }
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    return 'Ollama';
  }

  /**
   * Format messages for Ollama
   * Ollama uses similar format to OpenAI
   * @param {Array} messages - Array of message objects
   * @returns {Array} Formatted messages
   */
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}

module.exports = OllamaProvider;
