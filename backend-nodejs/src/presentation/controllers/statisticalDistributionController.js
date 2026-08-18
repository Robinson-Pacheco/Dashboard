const {
  getDistributionByComponent,
  getAvailableComponents,
  getComparativeAnalysis,
  getMedianDistribution
} = require('../../application/services/statisticalDistributionService');

/**
 * @swagger
 * /api/statistical/distribution:
 *   get:
 *     summary: Get normal distribution analysis by component (dimension)
 *     tags: [Statistical Distribution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Filter by academic period (e.g., 2025-2)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by academic year
 *       - in: query
 *         name: componente
 *         schema:
 *           type: string
 *         description: Filter by specific component/dimension (e.g., "Razonamiento Abstracto")
 *     responses:
 *       200:
 *         description: Distribution analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       componente:
 *                         type: string
 *                         example: "Razonamiento Abstracto"
 *                       quiz:
 *                         type: string
 *                       totalStudents:
 *                         type: integer
 *                       statistics:
 *                         type: object
 *                         properties:
 *                           mean:
 *                             type: number
 *                           median:
 *                             type: number
 *                           mode:
 *                             type: number
 *                           variance:
 *                             type: number
 *                           standardDeviation:
 *                             type: number
 *                           min:
 *                             type: number
 *                           max:
 *                             type: number
 *                           range:
 *                             type: number
 *                           q1:
 *                             type: number
 *                           q3:
 *                             type: number
 *                           iqr:
 *                             type: number
 *                       normalDistribution:
 *                         type: object
 *                         properties:
 *                           withinOneStdDev:
 *                             type: object
 *                             properties:
 *                               count:
 *                                 type: integer
 *                               percentage:
 *                                 type: number
 *                           withinTwoStdDev:
 *                             type: object
 *                             properties:
 *                               count:
 *                                 type: integer
 *                               percentage:
 *                                 type: number
 *                           withinThreeStdDev:
 *                             type: object
 *                             properties:
 *                               count:
 *                                 type: integer
 *                               percentage:
 *                                 type: number
 *                       outliers:
 *                         type: object
 *                         properties:
 *                           total:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                           details:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 studentId:
 *                                   type: string
 *                                 studentName:
 *                                   type: string
 *                                 score:
 *                                   type: number
 *                                 deviationFromMean:
 *                                   type: number
 *                                 zScore:
 *                                   type: number
 *                       atypicalScores:
 *                         type: object
 *                         properties:
 *                           total:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                           details:
 *                             type: array
 *                             items:
 *                               type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
const getDistributionAnalysis = async (req, res, next) => {
  try {
    const { period, year, componente } = req.query;

    const filters = {
      period,
      year: year ? parseInt(year) : undefined,
      componente
    };

    const analysis = await getDistributionByComponent(filters);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/statistical/components:
 *   get:
 *     summary: Get all available components/dimensions with statistics
 *     tags: [Statistical Distribution]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieves a list of all components (dimensions) available in the database along with their basic statistics including record count, average score, min and max scores. Can be filtered by period and year.
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Filter by academic period (e.g., "2025-2")
 *         example: "2025-2"
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by academic year
 *         example: 2025
 *     responses:
 *       200:
 *         description: Components retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       componente:
 *                         type: string
 *                         example: "Razonamiento Abstracto"
 *                         description: Name of the component/dimension
 *                       count:
 *                         type: integer
 *                         example: 150
 *                         description: Number of records for this component
 *                       averageScore:
 *                         type: number
 *                         example: 75.5
 *                         description: Average score for this component
 *                       maxScore:
 *                         type: number
 *                         example: 100
 *                         description: Maximum score obtained
 *                       minScore:
 *                         type: number
 *                         example: 45
 *                         description: Minimum score obtained
 *                       quiz:
 *                         type: string
 *                         example: "Prueba de Admisión"
 *                         description: Associated quiz name
 *                       period:
 *                         type: string
 *                         example: "2025-2"
 *                         description: Academic period
 *                       year:
 *                         type: integer
 *                         example: 2025
 *                         description: Academic year
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getComponents = async (req, res, next) => {
  try {
    const { period, year } = req.query;

    const filters = {
      period,
      year: year ? parseInt(year) : undefined
    };

    const components = await getAvailableComponents(filters);

    res.status(200).json({
      success: true,
      data: components
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/statistical/comparative:
 *   get:
 *     summary: Get comparative analysis between two periods for a component
 *     tags: [Statistical Distribution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: componente
 *         schema:
 *           type: string
 *         required: true
 *         description: Component/dimension to analyze
 *       - in: query
 *         name: period1
 *         schema:
 *           type: string
 *         required: true
 *         description: First period (e.g., 2025-1)
 *       - in: query
 *         name: period2
 *         schema:
 *           type: string
 *         required: true
 *         description: Second period (e.g., 2025-2)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by academic year
 *     responses:
 *       200:
 *         description: Comparative analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     componente:
 *                       type: string
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         period1:
 *                           type: object
 *                         period2:
 *                           type: object
 *                         differences:
 *                           type: object
 */
const getComparativeReport = async (req, res, next) => {
  try {
    const { componente, period1, period2, year } = req.query;

    if (!componente || !period1 || !period2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide componente, period1, and period2 parameters'
      });
    }

    const filters = {
      componente,
      period1,
      period2,
      year: year ? parseInt(year) : undefined
    };

    const comparison = await getComparativeAnalysis(filters);

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/statistical/median-distribution:
 *   get:
 *     summary: Get median distribution analysis for dashboard
 *     tags: [Statistical Distribution]
 *     security:
 *       - bearerAuth: []
 *     description: Calculates the median of total scores and segments students into above/below median groups. Includes normal distribution curve data for visualization.
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *         description: Filter by academic period (e.g., 2025-2)
 *         example: "2025-2"
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by academic year
 *         example: 2025
 *     responses:
 *       200:
 *         description: Median distribution analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       example: 500
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         median:
 *                           type: number
 *                           example: 574.18
 *                         mean:
 *                           type: number
 *                           example: 575.50
 *                         standardDeviation:
 *                           type: number
 *                           example: 85.32
 *                         variance:
 *                           type: number
 *                         minScore:
 *                           type: number
 *                         maxScore:
 *                           type: number
 *                         range:
 *                           type: number
 *                     segmentation:
 *                       type: object
 *                       properties:
 *                         aboveMedian:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                             sampleStudents:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         belowMedian:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                             sampleStudents:
 *                               type: array
 *                         equalMedian:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                             percentage:
 *                               type: number
 *                     scoreDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           range:
 *                             type: string
 *                           midPoint:
 *                             type: number
 *                           count:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *                     normalCurveData:
 *                       type: object
 *                       properties:
 *                         mean:
 *                           type: number
 *                         stdDev:
 *                           type: number
 *                         withinOneStdDev:
 *                           type: object
 *                         withinTwoStdDev:
 *                           type: object
 *                         withinThreeStdDev:
 *                           type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
const getMedianDistributionAnalysis = async (req, res, next) => {
  try {
    const { period, year } = req.query;

    const filters = {
      period,
      year: year ? parseInt(year) : undefined
    };

    const distribution = await getMedianDistribution(filters);

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDistributionAnalysis,
  getComponents,
  getComparativeReport,
  getMedianDistributionAnalysis
};
