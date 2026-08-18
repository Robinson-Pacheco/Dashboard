const dataMiningService = require('../../application/services/dataMiningService');

/**
 * Data Mining Controller
 */
class DataMiningController {
  /**
   * Get component performance analysis with recommendations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getComponentPerformanceAnalysis(req, res, next) {
    try {
      const { period, year } = req.query;
      const analysis = await dataMiningService.getComponentPerformanceAnalysis(period, year);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get institution performance analysis with recommendations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getInstitutionPerformanceAnalysis(req, res, next) {
    try {
      const { period, year, sampleSize } = req.query;
      const analysis = await dataMiningService.getInstitutionPerformanceAnalysis(period, year, sampleSize);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get geographic performance analysis (IRP - Risk Index by Origin)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getGeographicPerformanceAnalysis(req, res, next) {
    try {
      const { period, year, sampleSize } = req.query;
      const analysis = await dataMiningService.getGeographicPerformanceAnalysis(period, year, sampleSize);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get difficulty index analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getDifficultyIndexAnalysis(req, res, next) {
    try {
      const { period, year } = req.query;
      const analysis = await dataMiningService.getDifficultyIndexAnalysis(period, year);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get career performance analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async getCareerPerformanceAnalysis(req, res, next) {
    try {
      const { period, year } = req.query;
      const analysis = await dataMiningService.getCareerPerformanceAnalysis(period, year);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DataMiningController();
