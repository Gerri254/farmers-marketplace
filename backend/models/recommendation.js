const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
    // ==========================================
    // USER & FARM INFORMATION
    // ==========================================
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    farmLocation: {
        county: { type: String },
        subCounty: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },

    // ==========================================
    // RECOMMENDATION DETAILS
    // ==========================================
    recommendedCrop: {
        type: String,
        required: true,
        enum: [
            "Maize", "Beans", "Wheat", "Rice", "Sorghum", "Millet",
            "Tomatoes", "Kale", "Cabbage", "Carrots", "Onions", "Potatoes",
            "Bananas", "Mangoes", "Avocados", "Oranges", "Pineapples",
            "Coffee", "Tea", "Sugarcane", "Cotton",
            "Other"
        ]
    },

    // Alternative crop recommendations
    alternativeCrops: [{
        crop: { type: String },
        confidence: { type: Number, min: 0, max: 100 },
        reason: { type: String }
    }],

    // AI model confidence score
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    // ==========================================
    // INFLUENCING FACTORS
    // ==========================================
    factors: {
        soilCompatibility: {
            score: { type: Number, min: 0, max: 100 },
            description: { type: String }
        },

        climateMatch: {
            score: { type: Number, min: 0, max: 100 },
            description: { type: String }
        },

        marketDemand: {
            score: { type: Number, min: 0, max: 100 },
            description: { type: String }
        },

        historicalSuccess: {
            score: { type: Number, min: 0, max: 100 },
            description: { type: String }
        },

        waterAvailability: {
            score: { type: Number, min: 0, max: 100 },
            description: { type: String }
        },

        seasonalSuitability: {
            score: { type: Number, min: 0, max: 100 },
            description: { type: String }
        }
    },

    // ==========================================
    // EXPLAINABLE AI (LIME & SHAP)
    // ==========================================
    explanation: {
        // Human-readable summary
        summary: {
            type: String,
            required: true
        },

        // LIME (Local Interpretable Model-Agnostic Explanations)
        limeExplanation: {
            // Visual representation data (for charts)
            featureImportance: [{
                feature: { type: String },      // e.g., "Soil Type", "Rainfall"
                importance: { type: Number },   // Importance score
                positiveImpact: { type: Boolean }  // Whether it increases/decreases recommendation
            }],

            // URL or base64 of visualization image
            visualizationUrl: { type: String }
        },

        // SHAP (SHapley Additive exPlanations)
        shapValues: {
            // Individual feature contributions
            features: [{
                name: { type: String },
                value: { type: Number },
                shapValue: { type: Number },     // SHAP contribution
                description: { type: String }
            }],

            // Base value (average prediction)
            baseValue: { type: Number },

            // Final prediction value
            predictionValue: { type: Number },

            // URL or base64 of SHAP visualization
            visualizationUrl: { type: String }
        },

        // Key factors in simple language
        keyFactors: [{
            factor: { type: String },
            impact: {
                type: String,
                enum: ["Very Positive", "Positive", "Neutral", "Negative", "Very Negative"]
            },
            explanation: { type: String }
        }],

        // Why NOT other crops
        whyNotOtherCrops: [{
            crop: { type: String },
            reason: { type: String }
        }]
    },

    // ==========================================
    // MARKET DATA
    // ==========================================
    marketData: {
        currentPrice: {
            amount: { type: Number },
            unit: { type: String, default: "per Kg" },
            currency: { type: String, default: "KES" }
        },

        priceRange: {
            min: { type: Number },
            max: { type: Number },
            average: { type: Number }
        },

        priceTrend: {
            type: String,
            enum: ["Rising", "Stable", "Falling", "Volatile"]
        },

        projectedDemand: {
            level: {
                type: String,
                enum: ["Very Low", "Low", "Moderate", "High", "Very High"]
            },
            growthRate: { type: Number },  // Percentage
            forecast: { type: String }
        },

        competition: {
            level: {
                type: String,
                enum: ["Very Low", "Low", "Moderate", "High", "Very High"]
            },
            nearbyFarmersGrowing: { type: Number },
            marketSaturation: { type: Number }  // Percentage
        },

        buyerDemand: {
            activeBuyers: { type: Number },
            averageOrderSize: { type: Number },
            frequentBuyers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
        }
    },

    // ==========================================
    // AGRONOMIC GUIDANCE
    // ==========================================
    guidance: {
        bestPlantingTime: {
            startDate: { type: Date },
            endDate: { type: Date },
            season: { type: String }
        },

        expectedYield: {
            min: { type: Number },
            max: { type: Number },
            average: { type: Number },
            unit: { type: String, default: "Kg per acre" }
        },

        growingPeriod: {
            days: { type: Number },
            harvestWindows: [{
                startDate: { type: Date },
                endDate: { type: Date }
            }]
        },

        requirements: {
            waterNeeds: { type: String },
            fertilizer: { type: String },
            pestManagement: { type: String },
            laborIntensity: {
                type: String,
                enum: ["Low", "Medium", "High"]
            }
        },

        estimatedCosts: {
            seeds: { type: Number },
            fertilizer: { type: Number },
            pesticides: { type: Number },
            labor: { type: Number },
            irrigation: { type: Number },
            total: { type: Number }
        },

        estimatedRevenue: {
            min: { type: Number },
            max: { type: Number },
            average: { type: Number }
        },

        profitMargin: {
            percentage: { type: Number },
            breakEvenQuantity: { type: Number }
        }
    },

    // ==========================================
    // RISK ASSESSMENT
    // ==========================================
    risks: {
        overall: {
            type: String,
            enum: ["Very Low", "Low", "Moderate", "High", "Very High"]
        },

        identified: [{
            type: {
                type: String,
                enum: [
                    "Weather Risk", "Pest Risk", "Disease Risk",
                    "Market Risk", "Price Volatility", "Water Shortage",
                    "Labor Availability", "Input Cost"
                ]
            },
            level: {
                type: String,
                enum: ["Low", "Moderate", "High", "Critical"]
            },
            mitigation: { type: String },
            probability: { type: Number, min: 0, max: 100 }
        }]
    },

    // ==========================================
    // INPUT DATA SNAPSHOT
    // ==========================================
    inputData: {
        environmentalDataId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EnvironmentalData"
        },

        soilType: { type: String },
        landSize: { type: Number },
        irrigationType: { type: String },
        currentSeason: { type: String },

        weatherSnapshot: {
            temperature: { type: Number },
            rainfall: { type: Number },
            humidity: { type: Number }
        }
    },

    // ==========================================
    // FARMER RESPONSE & FEEDBACK
    // ==========================================
    status: {
        type: String,
        enum: ["Pending", "Viewed", "Accepted", "Rejected", "Implemented", "Expired"],
        default: "Pending"
    },

    farmerResponse: {
        viewedAt: { type: Date },
        respondedAt: { type: Date },
        decision: {
            type: String,
            enum: ["Accepted", "Rejected", "Deferred", "Need More Info"]
        },
        feedback: { type: String },
        reasonForRejection: { type: String }
    },

    implementation: {
        planted: { type: Boolean, default: false },
        plantingDate: { type: Date },
        landAllocated: { type: Number },  // in acres
        actualYield: { type: Number },
        harvestDate: { type: Date },
        profitRealized: { type: Number },
        wasSuccessful: { type: Boolean }
    },

    // ==========================================
    // AI MODEL METADATA
    // ==========================================
    modelInfo: {
        modelVersion: { type: String },
        modelType: {
            type: String,
            enum: ["Random Forest", "XGBoost", "Neural Network", "Hybrid"]
        },
        trainingDate: { type: Date },
        accuracy: { type: Number },
        dataPoints: { type: Number }  // Number of historical records used
    },

    // ==========================================
    // VALIDITY & EXPIRATION
    // ==========================================
    validFrom: {
        type: Date,
        default: Date.now
    },

    validUntil: {
        type: Date,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    // ==========================================
    // ADDITIONAL METADATA
    // ==========================================
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium"
    },

    tags: [{ type: String }],

    notes: { type: String },

    generatedBy: {
        type: String,
        default: "AI Crop Recommendation Engine"
    }

}, { timestamps: true });

// ==========================================
// INDEXES for faster queries
// ==========================================
RecommendationSchema.index({ farmerId: 1, createdAt: -1 });
RecommendationSchema.index({ status: 1, isActive: 1 });
RecommendationSchema.index({ recommendedCrop: 1 });
RecommendationSchema.index({ validUntil: 1 });

// ==========================================
// METHODS
// ==========================================

// Check if recommendation is still valid
RecommendationSchema.methods.isValid = function() {
    return this.isActive && new Date() <= this.validUntil;
};

// Get overall score
RecommendationSchema.methods.getOverallScore = function() {
    const factors = this.factors;
    const scores = [
        factors.soilCompatibility?.score || 0,
        factors.climateMatch?.score || 0,
        factors.marketDemand?.score || 0,
        factors.historicalSuccess?.score || 0,
        factors.waterAvailability?.score || 0,
        factors.seasonalSuitability?.score || 0
    ];

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

// Calculate potential ROI
RecommendationSchema.methods.calculateROI = function() {
    const revenue = this.guidance?.estimatedRevenue?.average || 0;
    const costs = this.guidance?.estimatedCosts?.total || 0;

    if (costs === 0) return 0;

    return Math.round(((revenue - costs) / costs) * 100);
};

// Generate simple summary for farmer
RecommendationSchema.methods.getSimpleSummary = function() {
    const roi = this.calculateROI();
    const demand = this.marketData?.projectedDemand?.level || "Unknown";
    const risk = this.risks?.overall || "Unknown";

    return {
        crop: this.recommendedCrop,
        confidence: `${this.confidence}%`,
        expectedReturn: `${roi}% ROI`,
        marketDemand: demand,
        riskLevel: risk,
        bestPlanting: this.guidance?.bestPlantingTime?.season || "Consult agronomist"
    };
};

// Auto-expire old recommendations
RecommendationSchema.methods.checkExpiration = function() {
    if (new Date() > this.validUntil && this.isActive) {
        this.isActive = false;
        this.status = "Expired";
        return this.save();
    }
    return Promise.resolve(this);
};

module.exports = mongoose.model("Recommendation", RecommendationSchema);
