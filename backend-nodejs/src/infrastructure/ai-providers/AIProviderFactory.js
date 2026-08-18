const OpenRouterProvider = require('./OpenRouterProvider');
const OllamaProvider = require('./OllamaProvider');
const OpenCodeProvider = require('./OpenCodeProvider');

/**
 * AI Provider Factory
 * Factory pattern implementation to create appropriate AI provider
 * based on configuration and environment variables
 */
class AIProviderFactory {
  constructor() {
    this.providers = new Map();
    this.currentProvider = null;
  }

  /**
   * Create and return an AI provider instance based on configuration
   * @param {Object} config - Configuration object
   * @param {string} [config.provider] - Provider name ('openrouter' or 'ollama')
   * @param {Object} [config.openrouter] - OpenRouter specific config
   * @param {Object} [config.ollama] - Ollama specific config
   * @returns {AIProviderInterface} AI provider instance
   */
  createProvider(config = {}) {
    // Determine provider from config, environment, or default to openrouter
    const providerName = config.provider ||
                        process.env.AI_PROVIDER ||
                        'openrouter';

    // Generate cache key
    const cacheKey = `${providerName}-${JSON.stringify(config)}`;

    // Return cached instance if available
    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey);
    }

    let provider;

    switch (providerName.toLowerCase()) {
      case 'openrouter':
        provider = new OpenRouterProvider(config.openrouter || {
          apiKey: config.apiKey || process.env.OPENROUTER_API_KEY,
          defaultModel: config.defaultModel || process.env.OPENROUTER_DEFAULT_MODEL,
          siteURL: config.siteURL || process.env.SITE_URL,
          siteName: config.siteName || process.env.SITE_NAME
        });
        break;

      case 'ollama':
        provider = new OllamaProvider(config.ollama || {
          baseURL: config.baseURL || process.env.OLLAMA_BASE_URL,
          defaultModel: config.defaultModel || process.env.OLLAMA_DEFAULT_MODEL
        });
        break;

      case 'opencode':
        provider = new OpenCodeProvider(config.opencode || {
          apiKey: config.apiKey || process.env.OPENCODE_API_KEY,
          baseURL: config.baseURL || process.env.OPENCODE_BASE_URL,
          defaultModel: config.defaultModel || process.env.OPENCODE_DEFAULT_MODEL
        });
        break;

      default:
        throw new Error(`Unknown AI provider: ${providerName}. Available providers: openrouter, ollama, opencode`);
    }

    // Cache the provider instance
    this.providers.set(cacheKey, provider);
    this.currentProvider = provider;

    return provider;
  }

  /**
   * Get the current active provider
   * @returns {AIProviderInterface|null} Current provider or null if none created
   */
  getCurrentProvider() {
    return this.currentProvider;
  }

  /**
   * Create provider with automatic fallback
   * Tries primary provider, falls back to secondary if configured
   * @param {Object} config - Configuration object
   * @param {string} config.primary - Primary provider name
   * @param {string} [config.fallback] - Fallback provider name
   * @returns {Promise<AIProviderInterface>} Working provider instance
   */
  async createProviderWithFallback(config = {}) {
    const primaryProvider = this.createProvider({ ...config, provider: config.primary });

    // Test primary provider connection
    const isConnected = await primaryProvider.testConnection();

    if (isConnected) {
      return primaryProvider;
    }

    // Primary failed, try fallback if configured
    if (config.fallback) {
      console.warn(`Primary AI provider (${config.primary}) failed, trying fallback (${config.fallback})`);
      const fallbackProvider = this.createProvider({ ...config, provider: config.fallback });
      const fallbackConnected = await fallbackProvider.testConnection();

      if (fallbackConnected) {
        return fallbackProvider;
      }
    }

    throw new Error(`Failed to connect to AI provider(s): ${config.primary}${config.fallback ? `, ${config.fallback}` : ''}`);
  }

  /**
   * Clear cached providers
   * Useful for testing or when changing configuration
   */
  clearCache() {
    this.providers.clear();
    this.currentProvider = null;
  }

  /**
   * Get list of available provider names
   * @returns {Array<string>} Array of provider names
   */
  getAvailableProviders() {
    return ['openrouter', 'ollama', 'opencode'];
  }
}

// Export singleton instance
module.exports = new AIProviderFactory();
