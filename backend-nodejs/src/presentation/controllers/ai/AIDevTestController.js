const aiProviderFactory = require('../../../infrastructure/ai-providers/AIProviderFactory');

class AIDevTestController {
  async testProvider(req, res) {
    try {
      const { provider, model, message, stream } = req.body;

      const providerConfig = { provider: provider || process.env.AI_PROVIDER || 'opencode' };
      const instance = aiProviderFactory.createProvider(providerConfig);

      const messages = [
        { role: 'system', content: 'Eres un asistente útil. Responde de forma concisa.' },
        { role: 'user', content: message || 'Responde con un saludo breve.' }
      ];

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await instance.streamChatCompletion({
          messages,
          model: model || undefined,
          temperature: 0.7,
          onChunk: (chunk) => {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          }
        });

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } else {
        const response = await instance.chatCompletion({
          messages,
          model: model || undefined,
          temperature: 0.7,
          maxTokens: 1024
        });

        res.json({
          success: true,
          provider: response.provider,
          model: response.model,
          content: response.content,
          usage: response.usage
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async listProviders(req, res) {
    res.json({
      success: true,
      providers: aiProviderFactory.getAvailableProviders(),
      currentProvider: process.env.AI_PROVIDER || 'openrouter',
      environment: process.env.NODE_ENV || 'development'
    });
  }

  async testConnection(req, res) {
    try {
      const { provider } = req.query;
      const config = provider ? { provider } : {};
      const instance = aiProviderFactory.createProvider(config);
      const isConnected = await instance.testConnection();

      res.json({
        success: true,
        provider: instance.getProviderName(),
        connected: isConnected,
        message: isConnected
          ? `Connected to ${instance.getProviderName()}`
          : `Failed to connect to ${instance.getProviderName()}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AIDevTestController();
