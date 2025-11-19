const express = require("express");
const router = express.Router();
const matchingController = require("../v1.controllers/matchingController");
const { verifyToken } = require("../v1.middlewares/autheticate");

// Farmer matching routes
router.post(
  "/farmer/generate",
  verifyToken,
  matchingController.generateFarmerMatches
);
router.get(
  "/farmer/matches",
  verifyToken,
  matchingController.getFarmerMatches
);
router.post(
  "/farmer/respond/:matchId",
  verifyToken,
  matchingController.farmerRespondToMatch
);

// Buyer matching routes
router.post(
  "/buyer/generate",
  verifyToken,
  matchingController.generateBuyerMatches
);
router.get(
  "/buyer/matches",
  verifyToken,
  matchingController.getBuyerMatches
);
router.post(
  "/buyer/respond/:matchId",
  verifyToken,
  matchingController.buyerRespondToMatch
);

// Common routes
router.get(
  "/details/:matchId",
  verifyToken,
  matchingController.getMatchDetails
);
router.get(
  "/stats",
  verifyToken,
  matchingController.getMatchStats
);

// Admin/cleanup route
router.delete(
  "/cleanup-expired",
  verifyToken,
  matchingController.cleanupExpiredMatches
);

module.exports = router;
