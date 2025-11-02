const express = require('express');
const router = express.Router();

const userController = require('../v1.controllers/userController');
const buyerRoutes = require('./buyer');
const farmerRoutes = require('./farmer');
const adminRoutes = require('./admin');
const environmentalDataRoutes = require('./environmentalData');
const weatherRoutes = require('./weather');

router.use('/buyer', buyerRoutes);
router.use('/farmer', farmerRoutes);
router.delete('/logout', userController.logout);
router.use('/admin', adminRoutes);
router.use('/environmental-data', environmentalDataRoutes);
router.use('/weather', weatherRoutes);

module.exports = router;
