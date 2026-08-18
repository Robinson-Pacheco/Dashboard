const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processAdmissionData, getAdmissionData, getAdmissionStatistics, getUploadHistory } = require('../../application/services/admissionService');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  },
  fileFilter
});

/**
 * @swagger
 * /api/admission/upload:
 *   post:
 *     summary: Upload and process admission data from Excel file
 *     tags: [Admission Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - period
 *               - year
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing admission data
 *               period:
 *                 type: string
 *                 description: Academic period (e.g., 2025-2)
 *               year:
 *                 type: integer
 *                 description: Academic year
 *     responses:
 *       200:
 *         description: File processed successfully
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
 *                     message:
 *                       type: string
 *                       example: "Admission data processed successfully"
 *                     recordsProcessed:
 *                       type: integer
 *                       description: Number of records processed
 *       400:
 *         description: Bad request - Missing file or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const uploadAdmissionData = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an Excel file'
      });
    }
    
    let { period, year } = req.body;
    
    if (!period || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both period and year'
      });
    }

    year = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      return res.status(400).json({
        success: false,
        message: `El año no puede ser superior al año actual (${currentYear})`
      });
    }

    const periodMatch = period.match(/(\d{4})-(\d)$/);
    if (!periodMatch || !['1', '2'].includes(periodMatch[2])) {
      return res.status(400).json({
        success: false,
        message: 'El período debe tener formato YYYY-N donde N es 1 o 2'
      });
    }
    
    const result = await processAdmissionData(
      req.file.path,
      period,
      year,
      req.user.id,
      req.file.originalname
    );
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admission/:
 *   get:
 *     summary: Get admission data with optional filters
 *     tags: [Admission Data]
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Admission data retrieved successfully
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
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AdmissionData'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getAdmissionRecords = async (req, res, next) => {
  try {
    const { period, year, page = 1, limit = 20 } = req.query;
    
    const filters = {
      period,
      year: year ? parseInt(year) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    const result = await getAdmissionData(filters);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admission/stats:
 *   get:
 *     summary: Get admission statistics
 *     tags: [Admission Data]
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
 *     responses:
 *       200:
 *         description: Admission statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AdmissionStats'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getAdmissionStats = async (req, res, next) => {
  try {
    const { period, year } = req.query;
    
    const filters = {
      period,
      year: year ? parseInt(year) : undefined
    };
    
    const stats = await getAdmissionStatistics(filters);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getUploadHistoryHandler = async (req, res, next) => {
  try {
    const history = await getUploadHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAdmissionData,
  getAdmissionRecords,
  getAdmissionStats,
  getUploadHistoryHandler,
  upload
};