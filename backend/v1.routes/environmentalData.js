const express = require('express');
const environmentalDataController = require('../v1.controllers/environmentalDataController');
const { verifyToken, requireRole } = require('../v1.middlewares/autheticate');

const router = express.Router();

// ==========================================
// PUBLIC / FARMER / BUYER ROUTES
// ==========================================

// Get environmental data by county
router.get('/:county', verifyToken, environmentalDataController.getByCounty);

// Get latest environmental data for a county
router.get('/latest/:county', verifyToken, environmentalDataController.getLatest);

// Check crop suitability for a location
router.post('/check-crop-suitability', verifyToken, environmentalDataController.checkCropSuitability);

// Get active alerts for a county
router.get('/alerts/:county', verifyToken, environmentalDataController.getActiveAlerts);

// Compare multiple counties
router.post('/compare-counties', verifyToken, environmentalDataController.compareCounties);

// Get historical trends
router.get('/trends/:county', verifyToken, environmentalDataController.getHistoricalTrends);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Add environmental data (Admin only)
router.post('/add', verifyToken, requireRole(["admin"]), environmentalDataController.addEnvironmentalData);

module.exports = router;
