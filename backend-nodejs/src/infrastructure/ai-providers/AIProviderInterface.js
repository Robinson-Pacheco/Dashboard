/**
 * AI Provider Interface
 * Defines the contract that all AI providers must implement
 * following the Strategy Pattern for interchangeable AI backends
 */

class AIProviderInterface {
  /**
   * Send a chat completion request to the AI provider
   * @param {Object} params - Request parameters
   * @param {Array} params.messages - Array of message objects
   * @param {string} params.model - Model identifier
   * @param {number} [params.temperature] - Temperature for response randomness (0-1)
   * @param {number} [params.maxTokens] - Maximum tokens in response
   * @returns {Promise<Object>} Response from AI provider
   */
  async chatCompletion({ messages, model, temperature = 0.7, maxTokens }) {
    throw new Error('chatCompletion() must be implemented by subclass');
  }

  /**
   * Send a streaming chat completion request
   * @param {Object} params - Request parameters
   * @param {Array} params.messages - Array of message objects
   * @param {Function} params.onChunk - Callback for each chunk
   * @param {string} params.model - Model identifier
   * @param {number} [params.temperature] - Temperature for response randomness
   * @returns {Promise<Object>} Final response
   */
  async streamChatCompletion({ messages, onChunk, model, temperature = 0.7 }) {
    throw new Error('streamChatCompletion() must be implemented by subclass');
  }

  /**
   * Test the connection to the AI provider
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by subclass');
  }

  /**
   * Get available models from the provider
   * @returns {Promise<Array<string>>} Array of available model identifiers
   */
  async getAvailableModels() {
    throw new Error('getAvailableModels() must be implemented by subclass');
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented by subclass');
  }

  /**
   * Format messages for the specific provider
   * Default implementation, can be overridden
   * @param {Array} messages - Array of message objects
   * @returns {Array} Formatted messages
   */
  formatMessages(messages) {
    return messages;
  }
}

module.exports = AIProviderInterface;
