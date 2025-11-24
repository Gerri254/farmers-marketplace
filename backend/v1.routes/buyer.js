const express = require('express');
const userController = require('../v1.controllers/userController');
const productController = require('../v1.controllers/productController');
const orderController = require('../v1.controllers/orderController');
const transactionController = require('../v1.controllers/transactionController');
const cartController = require('../v1.controllers/cartController');
const farmerProfileController = require('../v1.controllers/farmerProfileController');
const { verifyToken, requireRole } = require('../v1.middlewares/autheticate');

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/register', userController.register);
router.post('/login', userController.login);

// ==========================================
// PROFILE ROUTES
// ==========================================
router.post('/editprofile', verifyToken, requireRole(["buyer"]), userController.editProfile);
router.get('/viewfarmer/:farmerId', verifyToken, requireRole(["buyer"]), userController.viewFarmer);
router.get('/viewprofile/:userId', verifyToken, requireRole(["buyer"]), userController.viewProfile);

// ==========================================
// BUYER PROFILE ROUTES (NEW)
// ==========================================
router.post('/update-buyer-profile', verifyToken, requireRole(["buyer"]), farmerProfileController.updateBuyerProfile);
router.get('/buyer-profile/:buyerId', verifyToken, requireRole(["buyer"]), farmerProfileController.getBuyerProfile);
router.post('/add-demand-forecast', verifyToken, requireRole(["buyer"]), farmerProfileController.addDemandForecast);

// ==========================================
// PRODUCT ROUTES
// ==========================================
router.get('/viewdetails/:productId', verifyToken, requireRole(["buyer"]), productController.getProduct);
router.get('/getproducts', verifyToken, requireRole(["buyer"]), productController.getAllProducts);
router.get('/farmer/:farmerId/products', verifyToken, requireRole(["buyer"]), productController.getFarmerProductsForBuyer);

// ==========================================
// CART ROUTES
// ==========================================
router.post('/cart', verifyToken, requireRole(["buyer"]), cartController.addAndUpdateToCart);
router.delete('/removefromcart', verifyToken, requireRole(["buyer"]), cartController.deleteFromCart);
router.get('/cart/:buyerId', verifyToken, requireRole(["buyer"]), cartController.viewCart);

// ==========================================
// ORDER ROUTES
// ==========================================
router.post('/placeorder', verifyToken, requireRole(["buyer"]), orderController.placeOrder);
router.get('/vieworders/:buyerId', verifyToken, requireRole(["buyer"]), orderController.viewAllOrders);
router.post('/cancelorder/:orderId', verifyToken, requireRole(["buyer"]), orderController.cancelOrder);
router.get('/orderdetails/:orderId', verifyToken, requireRole(["buyer"]), orderController.getOrderDetails);

// ==========================================
// PAYMENT ROUTES
// ==========================================
router.post('/processpayment', verifyToken, requireRole(["buyer"]), transactionController.processPayment);

module.exports = router;
