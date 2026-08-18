const biService = require('../../application/services/biService');

/**
 * Business Intelligence Controller
 */
class BIController {
  /**
   * Get admission statistics by period and year
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAdmissionStatistics(req, res, next) {
    try {
      const { period, year } = req.query;
      const statistics = await biService.getAdmissionStatisticsByPeriod(period, year);
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admission trends over time
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAdmissionTrends(req, res, next) {
    try {
      const trends = await biService.getAdmissionTrends();
      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get demographic breakdown of applicants
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getDemographicBreakdown(req, res, next) {
    try {
      const demographics = await biService.getDemographicBreakdown();
      res.status(200).json({
        success: true,
        data: demographics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance analysis by component
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getComponentPerformance(req, res, next) {
    try {
      const performance = await biService.getComponentPerformance();
      res.status(200).json({
        success: true,
        data: performance
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get disability statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getDisabilityStatistics(req, res, next) {
    try {
      const disabilityStats = await biService.getDisabilityStatistics();
      res.status(200).json({
        success: true,
        data: disabilityStats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available periods and years
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getAvailablePeriodsAndYears(req, res, next) {
    try {
      const availableData = await biService.getAvailablePeriodsAndYears();
      res.status(200).json({
        success: true,
        data: availableData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive dashboard data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getDashboardData(req, res, next) {
    try {
      const { period, year } = req.query;
      const dashboardData = await biService.getDashboardData(period, year);
      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get executive summary for a period
   */
  async getExecutiveSummary(req, res, next) {
    try {
      const { period, year } = req.query;
      const summary = await biService.getExecutiveSummary(period, year);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get filtered data with cross-variable filters
   */
  async getFilteredData(req, res, next) {
    try {
      const { period, year, provincia, canton, sexo, tipoInstitucion, carrera } = req.query;
      const data = await biService.getFilteredData({ period, year, provincia, canton, sexo, tipoInstitucion, carrera });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BIController();
