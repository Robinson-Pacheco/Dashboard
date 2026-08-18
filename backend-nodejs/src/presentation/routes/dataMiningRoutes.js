const express = require('express');
const router = express.Router();
const dataMiningController = require('../controllers/dataMiningController');
const auth = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Data Mining
 *   description: Data mining and insights generation endpoints
 */

/**
 * @swagger
 * /api/data-mining/component-analysis:
 *   get:
 *     summary: Get component performance analysis with recommendations
 *     tags: [Data Mining]
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
 *         description: Component analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/component-analysis', dataMiningController.getComponentPerformanceAnalysis);

/**
 * @swagger
 * /api/data-mining/institution-analysis:
 *   get:
 *     summary: Get institution performance analysis with recommendations
 *     tags: [Data Mining]
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
 *         description: Institution analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/institution-analysis', dataMiningController.getInstitutionPerformanceAnalysis);

/**
 * @swagger
 * /api/data-mining/geographic-analysis:
 *   get:
 *     summary: Get geographic performance analysis (IRP - Risk Index by Origin)
 *     tags: [Data Mining]
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
 *         description: Geographic analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/geographic-analysis', dataMiningController.getGeographicPerformanceAnalysis);

/**
 * @swagger
 * /api/data-mining/difficulty-analysis:
 *   get:
 *     summary: Get difficulty index analysis per component
 *     tags: [Data Mining]
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
 *         description: Difficulty analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/difficulty-analysis', dataMiningController.getDifficultyIndexAnalysis);

/**
 * @swagger
 * /api/data-mining/career-analysis:
 *   get:
 *     summary: Get career performance analysis with competitiveness metrics
 *     tags: [Data Mining]
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
 *         description: Career analysis retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/career-analysis', dataMiningController.getCareerPerformanceAnalysis);

module.exports = router;
