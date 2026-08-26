const express = require('express');
const router = express.Router();
const biController = require('../controllers/biController');
const auth = require('../middleware/auth');

/**
 * Business Intelligence Routes
 */

/**
 * @swagger
 * /api/bi/statistics:
 *   get:
 *     summary: Get admission statistics by period and year
 *     description: Returns statistical data about admissions for a specific period and year
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Academic period (e.g., 20252)
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Academic year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdmissionStats'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/statistics', auth, biController.getAdmissionStatistics);

/**
 * @swagger
 * /api/bi/trends:
 *   get:
 *     summary: Get admission trends over time
 *     description: Returns admission data trends across multiple periods
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdmissionTrends'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/trends', auth, biController.getAdmissionTrends);

/**
 * @swagger
 * /api/bi/demographics:
 *   get:
 *     summary: Get demographic breakdown of applicants
 *     description: Returns demographic data about applicants including gender, residence, and education type
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DemographicBreakdown'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/demographics', auth, biController.getDemographicBreakdown);

/**
 * @swagger
 * /api/bi/performance:
 *   get:
 *     summary: Get performance analysis by component
 *     description: Returns performance data broken down by test components
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComponentPerformance'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/performance', auth, biController.getComponentPerformance);

/**
 * @swagger
 * /api/bi/disability:
 *   get:
 *     summary: Get disability statistics
 *     description: Returns statistics about applicants with disabilities
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisabilityStatistics'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/disability', auth, biController.getDisabilityStatistics);

/**
 * @swagger
 * /api/bi/periods-years:
 *   get:
 *     summary: Get available periods and years
 *     description: Returns a list of available periods and years from admission data
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     periods:
 *                       type: array
 *                       items:
 *                         type: string
 *                     years:
 *                       type: array
 *                       items:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/periods-years', auth, biController.getAvailablePeriodsAndYears);

/**
 * @swagger
 * /api/bi/dashboard:
 *   get:
 *     summary: Get comprehensive dashboard data
 *     description: Returns all necessary data for the business intelligence dashboard
 *     tags: [Business Intelligence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Academic period (e.g., 20252)
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         description: Academic year (e.g., 2025)
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardData'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard', auth, biController.getDashboardData);

router.get('/executive-summary', auth, biController.getExecutiveSummary);

router.get('/filtered', auth, biController.getFilteredData);

router.get('/careers-by-gender', auth, biController.getCareersByGender);

router.get('/career-cupos-by-gender', auth, biController.getCareerCuposByGender);

module.exports = router;
