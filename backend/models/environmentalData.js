const mongoose = require("mongoose");

const EnvironmentalDataSchema = new mongoose.Schema({
    // ==========================================
    // LOCATION INFORMATION
    // ==========================================
    location: {
        county: {
            type: String,
            required: true,
            enum: [
                "Trans-Nzoia", "Kirinyaga", "Makueni",  // Pilot counties
                "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Uasin Gishu",
                "Kiambu", "Meru", "Machakos", "Bungoma", "Kakamega",
                "Other"
            ]
        },
        subCounty: { type: String },
        ward: { type: String },
        coordinates: {
            latitude: {
                type: Number,
                required: true,
                min: -5,
                max: 6  // Kenya's latitude range
            },
            longitude: {
                type: Number,
                required: true,
                min: 33,
                max: 42  // Kenya's longitude range
            }
        }
    },

    // ==========================================
    // TEMPORAL INFORMATION
    // ==========================================
    date: {
        type: Date,
        required: true,
        default: Date.now
    },

    season: {
        type: String,
        enum: ["Long Rains (March-May)", "Short Rains (Oct-Dec)", "Dry Season", "Off-season"]
    },

    // ==========================================
    // WEATHER DATA
    // ==========================================
    weather: {
        temperature: {
            current: { type: Number },  // Celsius
            min: { type: Number },      // Daily minimum
            max: { type: Number },      // Daily maximum
            avg: { type: Number }       // Daily average
        },

        rainfall: {
            daily: { type: Number },    // mm per day
            weekly: { type: Number },   // mm per week
            monthly: { type: Number },  // mm per month
            seasonal: { type: Number }  // mm per season
        },

        humidity: {
            type: Number,  // Percentage
            min: 0,
            max: 100
        },

        windSpeed: {
            type: Number,  // km/h
            min: 0
        },

        sunlight: {
            hours: { type: Number },    // Hours of sunlight per day
            uvIndex: { type: Number }   // UV index
        },

        pressure: {
            type: Number  // hPa (hectopascals)
        },

        conditions: {
            type: String,
            enum: [
                "Clear", "Partly Cloudy", "Cloudy", "Overcast",
                "Light Rain", "Moderate Rain", "Heavy Rain",
                "Thunderstorm", "Fog", "Haze", "Windy"
            ]
        }
    },

    // ==========================================
    // SOIL DATA
    // ==========================================
    soil: {
        type: {
            type: String,
            enum: [
                "Sandy", "Clay", "Loam", "Silt",
                "Sandy Loam", "Clay Loam", "Silty Clay",
                "Peaty", "Chalky"
            ]
        },

        pH: {
            type: Number,
            min: 0,
            max: 14
        },

        // NPK values (Nitrogen, Phosphorus, Potassium)
        nitrogen: {
            type: Number,  // mg/kg
            min: 0
        },

        phosphorus: {
            type: Number,  // mg/kg
            min: 0
        },

        potassium: {
            type: Number,  // mg/kg
            min: 0
        },

        organicMatter: {
            type: Number,  // Percentage
            min: 0,
            max: 100
        },

        moisture: {
            type: Number,  // Percentage
            min: 0,
            max: 100
        },

        texture: {
            type: String,
            enum: ["Coarse", "Medium", "Fine"]
        },

        drainage: {
            type: String,
            enum: ["Poor", "Moderate", "Good", "Excellent"]
        }
    },

    // ==========================================
    // CLIMATE INDICATORS
    // ==========================================
    climateIndicators: {
        droughtRisk: {
            type: String,
            enum: ["None", "Low", "Moderate", "High", "Severe"]
        },

        floodRisk: {
            type: String,
            enum: ["None", "Low", "Moderate", "High", "Severe"]
        },

        heatStress: {
            type: String,
            enum: ["None", "Low", "Moderate", "High", "Extreme"]
        },

        frostRisk: {
            type: String,
            enum: ["None", "Low", "Moderate", "High"]
        }
    },

    // ==========================================
    // ALERTS & WARNINGS
    // ==========================================
    alerts: [{
        type: {
            type: String,
            enum: [
                "Weather Warning", "Drought Alert", "Flood Warning",
                "Pest Outbreak", "Disease Alert", "Heat Wave",
                "Frost Warning", "Heavy Rain Expected"
            ]
        },
        severity: {
            type: String,
            enum: ["Low", "Moderate", "High", "Critical"]
        },
        description: { type: String },
        isActive: {
            type: Boolean,
            default: true
        },
        validUntil: { type: Date }
    }],

    // ==========================================
    // PEST & DISEASE DATA
    // ==========================================
    pestDiseaseData: {
        commonPests: [{
            name: { type: String },
            severity: {
                type: String,
                enum: ["Low", "Moderate", "High"]
            },
            affectedCrops: [{ type: String }]
        }],

        commonDiseases: [{
            name: { type: String },
            severity: {
                type: String,
                enum: ["Low", "Moderate", "High"]
            },
            affectedCrops: [{ type: String }]
        }]
    },

    // ==========================================
    // DATA SOURCE & QUALITY
    // ==========================================
    dataSource: {
        type: String,
        enum: [
            "Kenya Meteorological Department",
            "OpenWeather API",
            "Manual Entry",
            "IoT Sensor",
            "Farmer Report",
            "KALRO",
            "Other"
        ],
        default: "OpenWeather API"
    },

    dataQuality: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "High"
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    // ==========================================
    // ADDITIONAL METADATA
    // ==========================================
    notes: { type: String },

    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

// ==========================================
// INDEXES for faster queries
// ==========================================
EnvironmentalDataSchema.index({ "location.county": 1, date: -1 });
EnvironmentalDataSchema.index({ "location.coordinates": "2dsphere" });
EnvironmentalDataSchema.index({ date: -1 });

// ==========================================
// METHODS
// ==========================================

// Check if conditions are suitable for a specific crop
EnvironmentalDataSchema.methods.isSuitableForCrop = function(cropType) {
    const cropRequirements = {
        "Maize": {
            tempMin: 18, tempMax: 32,
            rainfallMin: 500, rainfallMax: 1000,
            soilTypes: ["Loam", "Sandy Loam", "Clay Loam"]
        },
        "Tomatoes": {
            tempMin: 18, tempMax: 27,
            rainfallMin: 600, rainfallMax: 1300,
            soilTypes: ["Loam", "Sandy Loam"]
        },
        "Kale": {
            tempMin: 15, tempMax: 25,
            rainfallMin: 400, rainfallMax: 800,
            soilTypes: ["Loam", "Clay Loam"]
        }
        // Add more crops as needed
    };

    const requirements = cropRequirements[cropType];
    if (!requirements) return null;

    const temp = this.weather?.temperature?.avg;
    const rainfall = this.weather?.rainfall?.monthly;
    const soilType = this.soil?.type;

    const tempSuitable = temp >= requirements.tempMin && temp <= requirements.tempMax;
    const rainfallSuitable = rainfall >= requirements.rainfallMin && rainfall <= requirements.rainfallMax;
    const soilSuitable = requirements.soilTypes.includes(soilType);

    return {
        suitable: tempSuitable && rainfallSuitable && soilSuitable,
        temperature: tempSuitable ? "Suitable" : "Unsuitable",
        rainfall: rainfallSuitable ? "Suitable" : "Unsuitable",
        soil: soilSuitable ? "Suitable" : "Unsuitable"
    };
};

// Get risk level summary
EnvironmentalDataSchema.methods.getRiskSummary = function() {
    const risks = [];

    if (this.climateIndicators?.droughtRisk &&
        ["High", "Severe"].includes(this.climateIndicators.droughtRisk)) {
        risks.push({
            type: "Drought",
            level: this.climateIndicators.droughtRisk
        });
    }

    if (this.climateIndicators?.floodRisk &&
        ["High", "Severe"].includes(this.climateIndicators.floodRisk)) {
        risks.push({
            type: "Flood",
            level: this.climateIndicators.floodRisk
        });
    }

    if (this.alerts && this.alerts.length > 0) {
        const activeAlerts = this.alerts.filter(a => a.isActive);
        risks.push(...activeAlerts.map(a => ({
            type: a.type,
            level: a.severity
        })));
    }

    return risks;
};

module.exports = mongoose.model("EnvironmentalData", EnvironmentalDataSchema);
