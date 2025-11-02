const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    // ==========================================
    // EXISTING FIELDS (Keep unchanged)
    // ==========================================
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["farmer", "buyer", "admin"],  // Added "admin" for completeness
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String
    },

    // ==========================================
    // ENHANCED FARM INFORMATION (For Farmers)
    // ==========================================
    farm: {
        farmName: { type: String },

        // Extended location information
        location: {
            type: String,  // Keep existing simple string for backward compatibility
            county: {
                type: String,
                enum: [
                    "Trans-Nzoia", "Kirinyaga", "Makueni",  // Pilot counties
                    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu",
                    "Kiambu", "Meru", "Machakos", "Bungoma", "Kakamega",
                    "Other"
                ]
            },
            subCounty: { type: String },
            ward: { type: String },
            gpsCoordinates: {
                latitude: { type: Number, min: -5, max: 6 },   // Kenya's latitude range
                longitude: { type: Number, min: 33, max: 42 }   // Kenya's longitude range
            }
        },

        // Farm characteristics
        landSize: {
            type: Number,  // in acres
            min: 0
        },

        soilType: {
            type: String,
            enum: [
                "Sandy", "Clay", "Loam", "Silt",
                "Sandy Loam", "Clay Loam", "Silty Clay",
                "Peaty", "Chalky", "Unknown"
            ]
        },

        irrigationType: {
            type: String,
            enum: [
                "Rain-fed", "Drip Irrigation", "Sprinkler",
                "Furrow", "Flood", "None", "Mixed"
            ],
            default: "Rain-fed"
        },

        // Current crops being grown
        cropsGrown: [{
            cropType: {
                type: String,
                enum: [
                    "Maize", "Beans", "Wheat", "Rice", "Sorghum", "Millet",
                    "Tomatoes", "Kale", "Cabbage", "Carrots", "Onions", "Potatoes",
                    "Bananas", "Mangoes", "Avocados", "Oranges", "Pineapples",
                    "Coffee", "Tea", "Sugarcane", "Cotton",
                    "Other"
                ]
            },
            plantingDate: { type: Date },
            expectedHarvestDate: { type: Date },
            estimatedYield: { type: Number },  // in kg or units
            season: {
                type: String,
                enum: ["Long Rains (March-May)", "Short Rains (Oct-Dec)", "Off-season"]
            }
        }],

        certifications: [{
            type: {
                type: String,
                enum: ["Organic", "GlobalGAP", "Fair Trade", "Kenya Organic", "None"]
            },
            issuedDate: { type: Date },
            expiryDate: { type: Date }
        }]
    },

    // ==========================================
    // HISTORICAL DATA (For AI Training)
    // ==========================================
    historicalYields: [{
        crop: { type: String },
        season: { type: String },
        year: { type: Number },
        actualYield: { type: Number },  // in kg
        quality: {
            type: String,
            enum: ["Premium", "Grade A", "Grade B", "Standard", "Below Standard"]
        },
        sellPrice: { type: Number },  // Price per kg
        weather: {
            avgRainfall: { type: Number },  // mm
            avgTemperature: { type: Number }  // Celsius
        }
    }],

    tradingHistory: [{
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        partnerRole: {
            type: String,
            enum: ["buyer", "farmer"]
        },
        productType: { type: String },
        quantity: { type: Number },
        transactionDate: { type: Date },
        deliverySuccess: {
            type: Boolean,
            default: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: { type: String }
    }],

    // ==========================================
    // BUYER-SPECIFIC INFORMATION
    // ==========================================
    buyerProfile: {
        buyerType: {
            type: String,
            enum: [
                "Institutional", "Retailer", "Exporter",
                "Wholesaler", "School Program", "Hotel/Restaurant",
                "Processing Company", "Individual"
            ]
        },

        businessName: { type: String },

        businessRegistration: { type: String },

        preferences: {
            preferredCrops: [{ type: String }],

            qualityStandards: {
                type: String,
                enum: ["Premium Only", "Grade A and Above", "Standard", "Any Quality"]
            },

            certificationRequired: {
                type: Boolean,
                default: false
            },

            deliverySchedule: {
                type: String,
                enum: ["Daily", "Weekly", "Bi-weekly", "Monthly", "On-demand"]
            },

            volumeRequirements: {
                minQuantity: { type: Number },  // minimum order in kg
                maxQuantity: { type: Number },  // maximum order in kg
                frequency: {
                    type: String,
                    enum: ["Daily", "Weekly", "Monthly", "Seasonal"]
                }
            },

            preferredLocations: [{ type: String }],  // Counties they want to source from

            maxDistance: { type: Number }  // Maximum distance willing to source from (km)
        },

        // Demand forecasting
        demandForecasts: [{
            product: { type: String },
            quantity: { type: Number },
            deadline: { type: Date },
            priority: {
                type: String,
                enum: ["Low", "Medium", "High", "Urgent"]
            },
            status: {
                type: String,
                enum: ["Active", "Fulfilled", "Cancelled"],
                default: "Active"
            }
        }]
    },

    // ==========================================
    // AI RECOMMENDATIONS & INSIGHTS
    // ==========================================
    aiInsights: {
        lastRecommendationDate: { type: Date },
        recommendationAcceptanceRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        matchSuccessRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        riskScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },

    // ==========================================
    // NOTIFICATION PREFERENCES
    // ==========================================
    notificationSettings: {
        emailNotifications: { type: Boolean, default: true },
        smsNotifications: { type: Boolean, default: false },
        pushNotifications: { type: Boolean, default: true },
        marketAlerts: { type: Boolean, default: true },
        weatherAlerts: { type: Boolean, default: true },
        priceAlerts: { type: Boolean, default: true }
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================
    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: { type: Date }

}, { timestamps: true });

// ==========================================
// MIDDLEWARE (Keep existing)
// ==========================================
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// ==========================================
// METHODS
// ==========================================

// Calculate user's reliability score
UserSchema.methods.calculateReliabilityScore = function() {
    if (this.tradingHistory.length === 0) return 100; // New users start with 100

    const successfulTrades = this.tradingHistory.filter(t => t.deliverySuccess).length;
    return Math.round((successfulTrades / this.tradingHistory.length) * 100);
};

// Get user's average rating
UserSchema.methods.getAverageRating = function() {
    const ratedTrades = this.tradingHistory.filter(t => t.rating);
    if (ratedTrades.length === 0) return 0;

    const sum = ratedTrades.reduce((acc, t) => acc + t.rating, 0);
    return (sum / ratedTrades.length).toFixed(1);
};

// Check if farm is in pilot counties
UserSchema.methods.isInPilotRegion = function() {
    const pilotCounties = ["Trans-Nzoia", "Kirinyaga", "Makueni"];
    return pilotCounties.includes(this.farm?.location?.county);
};

module.exports = mongoose.model("User", UserSchema);
