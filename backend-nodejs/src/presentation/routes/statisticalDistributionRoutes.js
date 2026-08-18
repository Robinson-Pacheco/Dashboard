const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDistributionAnalysis,
  getComponents,
  getComparativeReport,
  getMedianDistributionAnalysis
} = require('../controllers/statisticalDistributionController');

// All routes require authentication
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Statistical Distribution
 *   description: Statistical analysis and normal distribution reports
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DistributionAnalysis:
 *       type: object
 *       properties:
 *         componente:
 *           type: string
 *           example: "Razonamiento Abstracto"
 *         quiz:
 *           type: string
 *         totalStudents:
 *           type: integer
 *         statistics:
 *           type: object
 *           properties:
 *             mean:
 *               type: number
 *               description: Average score
 *             median:
 *               type: number
 *               description: Median score
 *             mode:
 *               type: number
 *               description: Most frequent score
 *             variance:
 *               type: number
 *               description: Variance of scores
 *             standardDeviation:
 *               type: number
 *               description: Standard deviation
 *             min:
 *               type: number
 *               description: Minimum score
 *             max:
 *               type: number
 *               description: Maximum score
 *             range:
 *               type: number
 *               description: Range of scores
 *             q1:
 *               type: number
 *               description: First quartile (25th percentile)
 *             q3:
 *               type: number
 *               description: Third quartile (75th percentile)
 *             iqr:
 *               type: number
 *               description: Interquartile range
 *         normalDistribution:
 *           type: object
 *           description: Distribution within standard deviations
 *           properties:
 *             withinOneStdDev:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 percentage:
 *                   type: number
 *             withinTwoStdDev:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 percentage:
 *                   type: number
 *             withinThreeStdDev:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 percentage:
 *                   type: number
 *         outliers:
 *           type: object
 *           description: Outliers detected using IQR method
 *           properties:
 *             total:
 *               type: integer
 *             percentage:
 *               type: number
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId:
 *                     type: string
 *                   studentName:
 *                     type: string
 *                   score:
 *                     type: number
 *                   deviationFromMean:
 *                     type: number
 *                   zScore:
 *                     type: number
 *         atypicalScores:
 *           type: object
 *           description: Atypical scores (outside 2 standard deviations)
 *           properties:
 *             total:
 *               type: integer
 *             percentage:
 *               type: number
 *             details:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   studentId:
 *                     type: string
 *                   studentName:
 *                     type: string
 *                   score:
 *                     type: number
 *                   zScore:
 *                     type: number
 *                   percentile:
 *                     type: number
 *                   deviationFromMean:
 *                     type: number
 */

// Get distribution analysis by component
router.get('/distribution', getDistributionAnalysis);

// Get all available components
router.get('/components', getComponents);

// Get comparative analysis between periods
router.get('/comparative', getComparativeReport);

// Get median distribution analysis for dashboard
router.get('/median-distribution', getMedianDistributionAnalysis);

module.exports = router;
