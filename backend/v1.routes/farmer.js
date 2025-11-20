const express = require('express');
const upload = require('../v1.middlewares/upload')
const userController = require('../v1.controllers/userController')
const productController = require('../v1.controllers/productController')
const orderController = require('../v1.controllers/orderController')
const farmerProfileController = require('../v1.controllers/farmerProfileController')
const recommendationController = require('../v1.controllers/recommendationController')
const { verifyToken, requireRole } = require('../v1.middlewares/autheticate')

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/register', userController.register);
router.post('/login', userController.login);

// ==========================================
// PROFILE ROUTES
// ==========================================
router.post('/editprofile', verifyToken, requireRole(["farmer"]), userController.editProfile);
router.get('/viewprofile/:userId', verifyToken, requireRole(["farmer"]), userController.viewProfile);

// ==========================================
// FARM DETAILS ROUTES (NEW)
// ==========================================
router.post('/update-farm-details', verifyToken, requireRole(["farmer"]), farmerProfileController.updateFarmDetails);
router.post('/update-farm-profile', verifyToken, requireRole(["farmer"]), farmerProfileController.updateFarmProfile);
router.get('/farm-details/:farmerId', verifyToken, requireRole(["farmer"]), farmerProfileController.getFarmDetails);
router.post('/add-historical-yield', verifyToken, requireRole(["farmer"]), farmerProfileController.addHistoricalYield);

// ==========================================
// PRODUCT ROUTES
// ==========================================
router.post('/addproduct', upload.single("productImage"), verifyToken, requireRole(["farmer"]), productController.addProduct);
router.get('/myproducts/:farmerId', verifyToken, requireRole(["farmer"]), productController.listProducts);
router.post('/updateproduct/:id', upload.single("productImage") ,verifyToken, requireRole(["farmer"]), productController.updateProduct);
router.delete('/deleteproduct/:id', verifyToken, requireRole(["farmer"]), productController.deleteProduct);

// ==========================================
// ORDER ROUTES
// ==========================================
router.get('/viewSales', verifyToken, requireRole(["farmer"]), orderController.viewSales);
router.get('/vieworders/:farmerId', verifyToken, requireRole(["farmer"]), orderController.viewOrders);
router.post('/confirmorders', verifyToken, requireRole(["farmer"]), orderController.confirmOrder);

// ==========================================
// AI RECOMMENDATION ROUTES (NEW)
// ==========================================
router.post('/request-recommendation', verifyToken, requireRole(["farmer"]), recommendationController.requestRecommendation);
router.get('/recommendations/:farmerId', verifyToken, requireRole(["farmer"]), recommendationController.getFarmerRecommendations);
router.get('/recommendation/:recommendationId', verifyToken, requireRole(["farmer"]), recommendationController.getRecommendationById);
router.post('/respond-to-recommendation', verifyToken, requireRole(["farmer"]), recommendationController.respondToRecommendation);
router.post('/update-implementation', verifyToken, requireRole(["farmer"]), recommendationController.updateImplementation);
router.get('/recommendation-stats/:farmerId', verifyToken, requireRole(["farmer"]), recommendationController.getRecommendationStats);

module.exports = router;
