const express = require('express');
const { uploadAdmissionData, getAdmissionRecords, getAdmissionStats, getUploadHistoryHandler, upload } = require('../controllers/admissionController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// Upload admission data (Excel file)
router.post('/upload', upload.single('file'), uploadAdmissionData);

// Get admission records with filters
router.get('/', getAdmissionRecords);

// Get admission statistics
router.get('/stats', getAdmissionStats);

// Get upload history
router.get('/history', getUploadHistoryHandler);

module.exports = router;