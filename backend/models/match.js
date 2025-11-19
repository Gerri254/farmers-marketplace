const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    factors: {
      productMatch: { type: Number, default: 0 },
      geographicProximity: { type: Number, default: 0 },
      qualityMatch: { type: Number, default: 0 },
      volumeMatch: { type: Number, default: 0 },
      historicalSuccess: { type: Number, default: 0 },
      priceMatch: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "accepted_by_farmer", "accepted_by_buyer", "both_accepted", "rejected"],
      default: "pending",
    },
    farmerResponse: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    buyerResponse: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    matchedProducts: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        category: String,
        quantity: Number,
      },
    ],
    distance: {
      type: Number, // in kilometers
      default: 0,
    },
    estimatedTransportCost: {
      type: Number,
      default: 0,
    },
    potentialRevenue: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true }
);

// Indexes for performance
matchSchema.index({ farmer: 1, createdAt: -1 });
matchSchema.index({ buyer: 1, createdAt: -1 });
matchSchema.index({ matchScore: -1 });
matchSchema.index({ status: 1 });
matchSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Match", matchSchema);
