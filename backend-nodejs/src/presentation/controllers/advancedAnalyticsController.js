const advancedAnalyticsService = require('../../application/services/advancedAnalyticsService');

/**
 * Advanced Analytics Controller
 */
class AdvancedAnalyticsController {
  /**
   * Get gender-career correlation analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getGenderCareerAnalysis(req, res, next) {
    try {
      const { period, year } = req.query;
      const analysis = await advancedAnalyticsService.getGenderCareerAnalysis(period, year);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get disability impact analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getDisabilityImpactAnalysis(req, res, next) {
    try {
      const { period, year } = req.query;
      const analysis = await advancedAnalyticsService.getDisabilityImpactAnalysis(period, year);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get response strategy analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getResponseStrategyAnalysis(req, res, next) {
    try {
      const { period, year } = req.query;
      const analysis = await advancedAnalyticsService.getResponseStrategyAnalysis(period, year);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdvancedAnalyticsController();
