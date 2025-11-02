const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    // ==========================================
    // EXISTING FIELDS (Keep unchanged)
    // ==========================================
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            "Fruits",
            "Vegetables",
            "Grains",
            "Dairy",
            "Meat",
            "Poultry",
            "Seafood"
        ]
    },
    unit: {
        type: String,
        default: "Kg",
        enum: [
            "Kg",
            "Pieces",
            "Liters"
        ]
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },

    // ==========================================
    // ENHANCED PRODUCT INFORMATION
    // ==========================================

    // Specific crop type (more detailed than category)
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

    // Quality grading
    quality: {
        grade: {
            type: String,
            enum: ["Premium", "Grade A", "Grade B", "Standard", "Below Standard"],
            default: "Standard"
        },
        certified: {
            type: Boolean,
            default: false
        },
        certifications: [{
            type: {
                type: String,
                enum: ["Organic", "GlobalGAP", "Fair Trade", "Kenya Organic", "None"]
            },
            certificateNumber: { type: String },
            issuedDate: { type: Date },
            expiryDate: { type: Date }
        }]
    },

    // Origin information
    origin: {
        county: { type: String },
        subCounty: { type: String },
        ward: { type: String },
        farmName: { type: String },
        coordinates: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    },

    // Harvest information
    harvest: {
        plantingDate: { type: Date },
        harvestDate: { type: Date },
        season: {
            type: String,
            enum: ["Long Rains (March-May)", "Short Rains (Oct-Dec)", "Off-season"]
        },
        batchNumber: { type: String },
        farmingMethod: {
            type: String,
            enum: ["Organic", "Conventional", "Hydroponic", "Greenhouse", "Open Field"]
        }
    },

    // Storage and freshness
    freshness: {
        harvestAge: { type: Number },  // Days since harvest
        shelfLife: { type: Number },   // Days remaining
        storageMethod: {
            type: String,
            enum: ["Cold Storage", "Room Temperature", "Refrigerated", "Fresh from Farm"]
        },
        condition: {
            type: String,
            enum: ["Fresh", "Good", "Fair", "Poor"],
            default: "Fresh"
        }
    },

    // Packaging details
    packaging: {
        type: {
            type: String,
            enum: ["Bulk", "Crate", "Bag", "Box", "Basket", "Individual"],
            default: "Bulk"
        },
        minOrderQuantity: { type: Number },  // Minimum order in units
        packageSize: { type: Number },        // Size per package
        bulkDiscount: {
            available: { type: Boolean, default: false },
            threshold: { type: Number },      // Order quantity for discount
            percentage: { type: Number }      // Discount percentage
        }
    },

    // ==========================================
    // DELIVERY & LOGISTICS
    // ==========================================
    delivery: {
        available: {
            type: Boolean,
            default: true
        },
        method: {
            type: String,
            enum: ["Self-Pickup", "Farmer Delivery", "Third-Party Courier", "Flexible"],
            default: "Flexible"
        },
        radius: { type: Number },  // Delivery radius in km
        cost: { type: Number },     // Delivery cost
        estimatedDays: { type: Number },  // Delivery time in days
        minimumForFreeDelivery: { type: Number }  // Minimum order for free delivery
    },

    // ==========================================
    // PRICING & MARKET INFO
    // ==========================================
    pricing: {
        pricePerUnit: { type: Number },  // Same as main price, for clarity
        currency: { type: String, default: "KES" },
        negotiable: {
            type: Boolean,
            default: false
        },
        bulkPricing: [{
            minQuantity: { type: Number },
            maxQuantity: { type: Number },
            pricePerUnit: { type: Number }
        }],
        marketPrice: {  // Current market average
            average: { type: Number },
            source: { type: String },
            lastUpdated: { type: Date }
        }
    },

    // ==========================================
    // AVAILABILITY & STOCK MANAGEMENT
    // ==========================================
    availability: {
        status: {
            type: String,
            enum: ["In Stock", "Low Stock", "Out of Stock", "Pre-Order", "Coming Soon"],
            default: "In Stock"
        },
        lowStockThreshold: { type: Number, default: 10 },
        restockDate: { type: Date },
        expectedNextHarvest: { type: Date },
        isSeasonalProduct: { type: Boolean, default: false },
        availableSeasons: [{
            type: String,
            enum: ["Long Rains (March-May)", "Short Rains (Oct-Dec)", "Year-Round"]
        }]
    },

    // ==========================================
    // AI MATCHING SUPPORT
    // ==========================================
    matchingData: {
        // Target buyers (for AI matching)
        targetBuyerTypes: [{
            type: String,
            enum: [
                "Institutional", "Retailer", "Exporter",
                "Wholesaler", "School Program", "Hotel/Restaurant",
                "Processing Company", "Individual"
            ]
        }],

        // Matching preferences
        preferredBuyerLocations: [{ type: String }],  // Counties
        maxDeliveryDistance: { type: Number },  // km

        // Historical matching success
        totalMatches: { type: Number, default: 0 },
        successfulMatches: { type: Number, default: 0 },
        matchSuccessRate: { type: Number, default: 0 }
    },

    // ==========================================
    // PERFORMANCE METRICS
    // ==========================================
    metrics: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        addedToCart: { type: Number, default: 0 },
        purchased: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 }
    },

    // ==========================================
    // REVIEWS & RATINGS
    // ==========================================
    reviews: [{
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: { type: String },
        qualityRating: { type: Number, min: 1, max: 5 },
        freshnessRating: { type: Number, min: 1, max: 5 },
        packagingRating: { type: Number, min: 1, max: 5 },
        deliveryRating: { type: Number, min: 1, max: 5 },
        wouldBuyAgain: { type: Boolean },
        images: [{ type: String }],  // Review images
        verifiedPurchase: { type: Boolean, default: false },
        helpful: { type: Number, default: 0 },  // Helpful votes
        createdAt: { type: Date, default: Date.now }
    }],

    // ==========================================
    // TAGS & SEARCH OPTIMIZATION
    // ==========================================
    tags: [{ type: String }],  // e.g., "organic", "fresh", "local"

    searchKeywords: [{ type: String }],  // For better search

    featured: {
        type: Boolean,
        default: false
    },

    // ==========================================
    // ADMIN & MODERATION
    // ==========================================
    approvalDetails: {
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        approvedAt: { type: Date },
        rejectionReason: { type: String }
    },

    flags: [{
        type: {
            type: String,
            enum: ["Quality Issue", "Pricing Issue", "Misleading Info", "Duplicate", "Other"]
        },
        description: { type: String },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reportedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false }
    }],

    isActive: {
        type: Boolean,
        default: true
    },

    // ==========================================
    // METADATA
    // ==========================================
    lastUpdated: { type: Date, default: Date.now },

    notes: { type: String }  // Internal notes

}, { timestamps: true });

// ==========================================
// INDEXES for faster queries
// ==========================================
ProductSchema.index({ farmerId: 1, approved: 1 });
ProductSchema.index({ category: 1, cropType: 1 });
ProductSchema.index({ "origin.county": 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ "availability.status": 1 });
ProductSchema.index({ tags: 1 });

// ==========================================
// MIDDLEWARE
// ==========================================

// Update availability status based on stock
ProductSchema.pre("save", function(next) {
    if (this.stock === 0) {
        this.availability.status = "Out of Stock";
    } else if (this.stock <= this.availability.lowStockThreshold) {
        this.availability.status = "Low Stock";
    } else {
        this.availability.status = "In Stock";
    }

    // Update last updated timestamp
    this.lastUpdated = new Date();

    // Calculate average rating
    if (this.reviews && this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.metrics.averageRating = totalRating / this.reviews.length;
        this.metrics.totalReviews = this.reviews.length;
    }

    // Calculate conversion rate
    if (this.metrics.views > 0) {
        this.metrics.conversionRate = (this.metrics.purchased / this.metrics.views) * 100;
    }

    // Calculate match success rate
    if (this.matchingData.totalMatches > 0) {
        this.matchingData.matchSuccessRate =
            (this.matchingData.successfulMatches / this.matchingData.totalMatches) * 100;
    }

    next();
});

// ==========================================
// METHODS
// ==========================================

// Calculate freshness score
ProductSchema.methods.getFreshnessScore = function() {
    if (!this.freshness.harvestAge || !this.freshness.shelfLife) return 100;

    const totalLife = this.freshness.harvestAge + this.freshness.shelfLife;
    if (totalLife === 0) return 100;

    return Math.round((this.freshness.shelfLife / totalLife) * 100);
};

// Check if product is eligible for matching
ProductSchema.methods.isEligibleForMatching = function() {
    return (
        this.approved &&
        this.isActive &&
        this.availability.status === "In Stock" &&
        this.stock > 0
    );
};

// Get distance from buyer (requires buyer coordinates)
ProductSchema.methods.getDistanceFrom = function(latitude, longitude) {
    if (!this.origin.coordinates.latitude || !this.origin.coordinates.longitude) {
        return null;
    }

    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (latitude - this.origin.coordinates.latitude) * Math.PI / 180;
    const dLon = (longitude - this.origin.coordinates.longitude) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.origin.coordinates.latitude * Math.PI / 180) *
        Math.cos(latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Get price competitiveness
ProductSchema.methods.getPriceCompetitiveness = function() {
    if (!this.pricing.marketPrice?.average) return "Unknown";

    const diff = ((this.price - this.pricing.marketPrice.average) / this.pricing.marketPrice.average) * 100;

    if (diff < -10) return "Very Competitive";
    if (diff < 0) return "Competitive";
    if (diff < 10) return "Fair";
    if (diff < 20) return "Above Market";
    return "Expensive";
};

module.exports = mongoose.model("Product", ProductSchema);
