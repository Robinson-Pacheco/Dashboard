const express = require('express');
const router = express.Router();
const aiAnalysisController = require('../../controllers/ai/AIAnalysisController');
const auth = require('../../middleware/auth');

/**
 * AI Analysis Routes
 * All routes require authentication by default
 */

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route   POST /api/ai/quartiles
 * @desc    Analyze quartiles with AI insights
 * @access  Private
 */
router.post('/quartiles', aiAnalysisController.analyzeQuartiles.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/predictions
 * @desc    Generate predictions for future admission periods
 * @access  Private
 */
router.post('/predictions', aiAnalysisController.predictAdmissions.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/outliers
 * @desc    Analyze outliers with educational recommendations
 * @access  Private
 */
router.post('/outliers', aiAnalysisController.analyzeOutliers.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/compare-periods
 * @desc    Compare performance between different periods
 * @access  Private
 */
router.post('/compare-periods', aiAnalysisController.comparePeriods.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/narrative-report
 * @desc    Generate comprehensive narrative report
 * @access  Private
 */
router.post('/narrative-report', aiAnalysisController.generateNarrativeReport.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/anomalies
 * @desc    Detect anomalies in admission data
 * @access  Private
 */
router.post('/anomalies', aiAnalysisController.detectAnomalies.bind(aiAnalysisController));

/**
 * @route   GET /api/ai/status
 * @desc    Get AI provider connection status
 * @access  Private
 */
router.get('/status', aiAnalysisController.getProviderStatus.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/quartiles/stream
 * @desc    Streaming quartiles analysis via SSE
 * @access  Private
 */
router.post('/quartiles/stream', aiAnalysisController.streamQuartiles.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/generate-chart
 * @desc    Generate chart from natural language prompt
 * @access  Private
 */
router.post('/generate-chart', aiAnalysisController.generateChart.bind(aiAnalysisController));

/**
 * @route   POST /api/ai/generate-chart/stream
 * @desc    Streaming chart generation via SSE
 * @access  Private
 */
router.post('/generate-chart/stream', aiAnalysisController.streamGenerateChart.bind(aiAnalysisController));

module.exports = router;
