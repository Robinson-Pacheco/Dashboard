const express = require('express');
const router = express.Router();
const advancedAnalyticsController = require('../controllers/advancedAnalyticsController');
const auth = require('../middleware/auth');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Advanced Analytics
 *   description: Advanced analytics and correlation analysis endpoints
 */

/**
 * @swagger
 * /api/advanced-analytics/gender-career:
 *   get:
 *     summary: Get gender-career correlation analysis with gap detection
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Academic period (e.g., 2025-2)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Academic year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Gender-career analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/gender-career', advancedAnalyticsController.getGenderCareerAnalysis);

/**
 * @swagger
 * /api/advanced-analytics/disability-impact:
 *   get:
 *     summary: Get disability impact analysis on performance
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Academic period (e.g., 2025-2)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Academic year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Disability impact analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/disability-impact', advancedAnalyticsController.getDisabilityImpactAnalysis);

/**
 * @swagger
 * /api/advanced-analytics/response-strategy:
 *   get:
 *     summary: Get response strategy analysis (answer patterns)
 *     tags: [Advanced Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Academic period (e.g., 2025-2)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Academic year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Response strategy analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/response-strategy', advancedAnalyticsController.getResponseStrategyAnalysis);

module.exports = router;
