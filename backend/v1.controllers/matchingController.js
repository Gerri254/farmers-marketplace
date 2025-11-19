const matchingService = require("../v1.services/matchingService");
const Match = require("../models/match");
const User = require("../models/user");

// Generate matches for a farmer
exports.generateFarmerMatches = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const matches = await matchingService.findMatchesForFarmer(farmerId);

    // Save top matches to database
    const savedMatches = [];
    for (const match of matches.slice(0, 10)) {
      // Save top 10 matches
      const saved = await matchingService.saveMatches(farmerId, match.buyer, match);
      savedMatches.push(saved);
    }

    res.status(200).json({
      success: true,
      message: `Found ${matches.length} potential buyers`,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating matches",
      error: error.message,
    });
  }
};

// Generate matches for a buyer
exports.generateBuyerMatches = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const matches = await matchingService.findMatchesForBuyer(buyerId);

    // Save top matches to database
    const savedMatches = [];
    for (const match of matches.slice(0, 10)) {
      // Save top 10 matches
      const saved = await matchingService.saveMatches(match.farmer, buyerId, match);
      savedMatches.push(saved);
    }

    res.status(200).json({
      success: true,
      message: `Found ${matches.length} potential farmers`,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating matches",
      error: error.message,
    });
  }
};

// Get saved matches for a farmer
exports.getFarmerMatches = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const matches = await Match.find({
      farmer: farmerId,
      expiresAt: { $gt: new Date() },
    })
      .populate("buyer", "name email buyerProfile")
      .populate("matchedProducts.productId")
      .sort({ matchScore: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching matches",
      error: error.message,
    });
  }
};

// Get saved matches for a buyer
exports.getBuyerMatches = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const matches = await Match.find({
      buyer: buyerId,
      expiresAt: { $gt: new Date() },
    })
      .populate("farmer", "name email farmProfile")
      .populate("matchedProducts.productId")
      .sort({ matchScore: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching matches",
      error: error.message,
    });
  }
};

// Farmer accepts/rejects a match
exports.farmerRespondToMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { response } = req.body; // 'accepted' or 'rejected'
    const farmerId = req.user.id;

    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Invalid response. Must be 'accepted' or 'rejected'",
      });
    }

    const match = await Match.findOne({ _id: matchId, farmer: farmerId });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    match.farmerResponse = response;

    // Update overall status
    if (response === "rejected") {
      match.status = "rejected";
    } else if (response === "accepted" && match.buyerResponse === "accepted") {
      match.status = "both_accepted";
    } else if (response === "accepted") {
      match.status = "accepted_by_farmer";
    }

    await match.save();

    res.status(200).json({
      success: true,
      message: `Match ${response}`,
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error responding to match",
      error: error.message,
    });
  }
};

// Buyer accepts/rejects a match
exports.buyerRespondToMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { response } = req.body; // 'accepted' or 'rejected'
    const buyerId = req.user.id;

    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({
        success: false,
        message: "Invalid response. Must be 'accepted' or 'rejected'",
      });
    }

    const match = await Match.findOne({ _id: matchId, buyer: buyerId });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    match.buyerResponse = response;

    // Update overall status
    if (response === "rejected") {
      match.status = "rejected";
    } else if (response === "accepted" && match.farmerResponse === "accepted") {
      match.status = "both_accepted";
    } else if (response === "accepted") {
      match.status = "accepted_by_buyer";
    }

    await match.save();

    res.status(200).json({
      success: true,
      message: `Match ${response}`,
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error responding to match",
      error: error.message,
    });
  }
};

// Get match details
exports.getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ farmer: userId }, { buyer: userId }],
    })
      .populate("farmer", "name email farmProfile")
      .populate("buyer", "name email buyerProfile")
      .populate("matchedProducts.productId");

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching match details",
      error: error.message,
    });
  }
};

// Get match statistics
exports.getMatchStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = userRole === "farmer" ? { farmer: userId } : { buyer: userId };

    const totalMatches = await Match.countDocuments({
      ...query,
      expiresAt: { $gt: new Date() },
    });

    const acceptedMatches = await Match.countDocuments({
      ...query,
      status: "both_accepted",
    });

    const pendingMatches = await Match.countDocuments({
      ...query,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    const rejectedMatches = await Match.countDocuments({
      ...query,
      status: "rejected",
    });

    // Calculate total potential revenue from accepted matches
    const revenueMatches = await Match.find({
      ...query,
      status: "both_accepted",
    });

    const totalPotentialRevenue = revenueMatches.reduce(
      (sum, match) => sum + (match.potentialRevenue || 0),
      0
    );

    res.status(200).json({
      success: true,
      stats: {
        totalMatches,
        acceptedMatches,
        pendingMatches,
        rejectedMatches,
        totalPotentialRevenue,
        acceptanceRate:
          totalMatches > 0 ? ((acceptedMatches / totalMatches) * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching match statistics",
      error: error.message,
    });
  }
};

// Delete expired matches (can be called via cron or manually)
exports.cleanupExpiredMatches = async (req, res) => {
  try {
    const result = await Match.deleteMany({
      expiresAt: { $lt: new Date() },
      status: { $in: ["pending", "accepted_by_farmer", "accepted_by_buyer"] },
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} expired matches`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cleaning up expired matches",
      error: error.message,
    });
  }
};
