const express = require('express');
const weatherController = require('../v1.controllers/weatherController');
const { verifyToken, requireRole } = require('../v1.middlewares/autheticate');

const router = express.Router();

// ==========================================
// PUBLIC / AUTHENTICATED ROUTES
// ==========================================

// Health check (no auth required for monitoring)
router.get('/health', weatherController.healthCheck);

// Get current weather for a county
router.get('/current/:county', verifyToken, weatherController.getCurrentWeather);

// Get weather forecast for a county
router.get('/forecast/:county', verifyToken, weatherController.getWeatherForecast);

// Get comprehensive weather (current + forecast + insights)
router.get('/comprehensive/:county', verifyToken, weatherController.getComprehensiveWeather);

// ==========================================
// ADMIN ROUTES (Data Collection)
// ==========================================

// Fetch and store weather for a county
router.post('/fetch-and-store/:county', verifyToken, requireRole(['admin']), weatherController.fetchAndStoreWeather);

// Fetch and store weather for all pilot counties
router.post('/fetch-all-pilot', verifyToken, requireRole(['admin']), weatherController.fetchAllPilotCounties);

module.exports = router;
