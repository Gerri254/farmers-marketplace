const Recommendation = require('../models/recommendation');
const User = require('../models/user');
const EnvironmentalData = require('../models/environmentalData');
const logger = require('../v1.utils/log');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

class RecommendationController {
    constructor() {
        // Bind all methods to preserve 'this' context when used as route handlers
        this.requestRecommendation = this.requestRecommendation.bind(this);
        this.getFarmerRecommendations = this.getFarmerRecommendations.bind(this);
        this.getRecommendationById = this.getRecommendationById.bind(this);
        this.respondToRecommendation = this.respondToRecommendation.bind(this);
        this.updateImplementation = this.updateImplementation.bind(this);
        this.getRecommendationStats = this.getRecommendationStats.bind(this);
    }

    /**
     * Request crop recommendation for a farmer
     * POST /api/v1/farmer/request-recommendation
     */
    async requestRecommendation(req, res) {
        try {
            const { farmerId } = req.body;

            logger.info(`Processing crop recommendation request for farmer: ${farmerId}`);

            // Get farmer details
            const farmer = await User.findOne({ _id: farmerId, role: "farmer" });
            if (!farmer) {
                logger.warn(`Farmer not found: ${farmerId}`);
                return res.status(404).json({ message: "Farmer not found" });
            }

            // Validate farmer has required farm details
            if (!farmer.farm?.location?.county) {
                logger.warn(`Farm location not set for farmer: ${farmerId}`);
                return res.status(400).json({
                    message: "Please complete your farm profile with location information before requesting recommendations"
                });
            }

            // Get latest environmental data for farmer's location
            const environmentalData = await EnvironmentalData.findOne({
                "location.county": farmer.farm.location.county
            }).sort({ date: -1 });

            // Generate recommendation using rule-based logic (Phase 1)
            // TODO: Replace with ML model in Phase 2
            const recommendation = await this._generateRecommendation(farmer, environmentalData);

            // Save recommendation
            const newRecommendation = new Recommendation(recommendation);
            await newRecommendation.save();

            // Update farmer's AI insights
            farmer.aiInsights.lastRecommendationDate = new Date();
            await farmer.save();

            logger.info(`Crop recommendation generated successfully for farmer: ${farmerId}`);
            res.status(201).json({
                message: "Crop recommendation generated successfully",
                recommendation: newRecommendation
            });
        } catch (error) {
            logger.error(`Error generating crop recommendation: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get all recommendations for a farmer
     * GET /api/v1/farmer/recommendations/:farmerId
     */
    async getFarmerRecommendations(req, res) {
        try {
            const { farmerId } = req.params;
            const { status, limit = 10 } = req.query;

            logger.info(`Fetching recommendations for farmer: ${farmerId}`);

            const query = { farmerId };
            if (status) {
                query.status = status;
            }

            const recommendations = await Recommendation.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            logger.info(`Recommendations retrieved for farmer ${farmerId}: ${recommendations.length} found`);
            res.status(200).json({
                farmerId,
                count: recommendations.length,
                recommendations
            });
        } catch (error) {
            logger.error(`Error fetching recommendations: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get a specific recommendation by ID
     * GET /api/v1/farmer/recommendation/:recommendationId
     */
    async getRecommendationById(req, res) {
        try {
            const { recommendationId } = req.params;

            logger.info(`Fetching recommendation: ${recommendationId}`);

            const recommendation = await Recommendation.findById(recommendationId);

            if (!recommendation) {
                logger.warn(`Recommendation not found: ${recommendationId}`);
                return res.status(404).json({ message: "Recommendation not found" });
            }

            // Get simple summary
            const summary = recommendation.getSimpleSummary();

            // Calculate ROI
            const roi = recommendation.calculateROI();

            logger.info(`Recommendation retrieved: ${recommendationId}`);
            res.status(200).json({
                recommendation,
                summary,
                roi: `${roi}%`
            });
        } catch (error) {
            logger.error(`Error fetching recommendation: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update farmer's response to a recommendation
     * POST /api/v1/farmer/respond-to-recommendation
     */
    async respondToRecommendation(req, res) {
        try {
            const { recommendationId, decision, feedback, reasonForRejection } = req.body;

            logger.info(`Processing farmer response for recommendation: ${recommendationId}`);

            const recommendation = await Recommendation.findById(recommendationId);

            if (!recommendation) {
                logger.warn(`Recommendation not found: ${recommendationId}`);
                return res.status(404).json({ message: "Recommendation not found" });
            }

            // Update farmer response
            recommendation.farmerResponse = {
                viewedAt: recommendation.farmerResponse?.viewedAt || new Date(),
                respondedAt: new Date(),
                decision,
                feedback,
                reasonForRejection
            };

            // Update status
            if (decision === "Accepted") {
                recommendation.status = "Accepted";
            } else if (decision === "Rejected") {
                recommendation.status = "Rejected";
            }

            await recommendation.save();

            // Update farmer's AI insights
            const farmer = await User.findById(recommendation.farmerId);
            if (farmer) {
                const acceptedCount = await Recommendation.countDocuments({
                    farmerId: recommendation.farmerId,
                    status: "Accepted"
                });
                const totalResponded = await Recommendation.countDocuments({
                    farmerId: recommendation.farmerId,
                    status: { $in: ["Accepted", "Rejected"] }
                });

                if (totalResponded > 0) {
                    farmer.aiInsights.recommendationAcceptanceRate = (acceptedCount / totalResponded) * 100;
                    await farmer.save();
                }
            }

            logger.info(`Farmer response recorded for recommendation: ${recommendationId}`);
            res.status(200).json({
                message: "Response recorded successfully",
                recommendation
            });
        } catch (error) {
            logger.error(`Error recording farmer response: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update implementation status
     * POST /api/v1/farmer/update-implementation
     */
    async updateImplementation(req, res) {
        try {
            const {
                recommendationId,
                planted,
                plantingDate,
                landAllocated,
                actualYield,
                harvestDate,
                profitRealized,
                wasSuccessful
            } = req.body;

            logger.info(`Updating implementation status for recommendation: ${recommendationId}`);

            const recommendation = await Recommendation.findById(recommendationId);

            if (!recommendation) {
                logger.warn(`Recommendation not found: ${recommendationId}`);
                return res.status(404).json({ message: "Recommendation not found" });
            }

            // Update implementation details
            recommendation.implementation = {
                planted: planted !== undefined ? planted : recommendation.implementation?.planted,
                plantingDate: plantingDate || recommendation.implementation?.plantingDate,
                landAllocated: landAllocated || recommendation.implementation?.landAllocated,
                actualYield: actualYield || recommendation.implementation?.actualYield,
                harvestDate: harvestDate || recommendation.implementation?.harvestDate,
                profitRealized: profitRealized || recommendation.implementation?.profitRealized,
                wasSuccessful: wasSuccessful !== undefined ? wasSuccessful : recommendation.implementation?.wasSuccessful
            };

            if (planted) {
                recommendation.status = "Implemented";
            }

            await recommendation.save();

            logger.info(`Implementation status updated for recommendation: ${recommendationId}`);
            res.status(200).json({
                message: "Implementation status updated successfully",
                implementation: recommendation.implementation
            });
        } catch (error) {
            logger.error(`Error updating implementation: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get recommendation statistics for a farmer
     * GET /api/v1/farmer/recommendation-stats/:farmerId
     */
    async getRecommendationStats(req, res) {
        try {
            const { farmerId } = req.params;

            logger.info(`Fetching recommendation statistics for farmer: ${farmerId}`);

            const totalRecommendations = await Recommendation.countDocuments({ farmerId });
            const acceptedRecommendations = await Recommendation.countDocuments({
                farmerId,
                status: "Accepted"
            });
            const implementedRecommendations = await Recommendation.countDocuments({
                farmerId,
                status: "Implemented"
            });
            const successfulImplementations = await Recommendation.countDocuments({
                farmerId,
                "implementation.wasSuccessful": true
            });

            const acceptanceRate = totalRecommendations > 0
                ? (acceptedRecommendations / totalRecommendations) * 100
                : 0;

            const implementationRate = acceptedRecommendations > 0
                ? (implementedRecommendations / acceptedRecommendations) * 100
                : 0;

            const successRate = implementedRecommendations > 0
                ? (successfulImplementations / implementedRecommendations) * 100
                : 0;

            logger.info(`Recommendation statistics retrieved for farmer: ${farmerId}`);
            res.status(200).json({
                farmerId,
                statistics: {
                    total: totalRecommendations,
                    accepted: acceptedRecommendations,
                    implemented: implementedRecommendations,
                    successful: successfulImplementations,
                    acceptanceRate: Math.round(acceptanceRate),
                    implementationRate: Math.round(implementationRate),
                    successRate: Math.round(successRate)
                }
            });
        } catch (error) {
            logger.error(`Error fetching recommendation statistics: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Private method: Generate recommendation using Gemini AI
     * Uses Google's Gemini AI to generate intelligent crop recommendations
     */
    async _generateRecommendation(farmer, environmentalData) {
        const county = farmer.farm.location.county;
        const soilType = farmer.farm.soilType || environmentalData?.soil?.type || "Unknown";
        const season = this._getCurrentSeason();

        // Prepare farmer profile data
        const farmerProfile = {
            farmName: farmer.farm?.farmName || "Not specified",
            county: county,
            landSizeAcres: farmer.farm.landSize || "Not specified",
            soilType: soilType,
            irrigation: farmer.farm.irrigationType || "None",
            historicalYields: farmer.historicalYields || []
        };

        // Prepare weather data
        const weatherData = environmentalData ? {
            temperature: environmentalData.weather.temperature,
            rainfall: environmentalData.weather.rainfall,
            humidity: environmentalData.weather.humidity,
            conditions: environmentalData.weather.conditions,
            droughtRisk: environmentalData.climateIndicators?.droughtRisk || "Unknown",
            floodRisk: environmentalData.climateIndicators?.floodRisk || "Unknown"
        } : {
            temperature: { avg: null },
            rainfall: { monthly: null },
            note: "No recent weather data available"
        };

        // Prepare market data (can be enhanced with real market API later)
        const marketData = {
            demand: "Stable",
            prices: "Average for Kenya",
            season: season
        };

        // Create comprehensive prompt for Gemini
        const prompt = `You are an expert agricultural advisor for Kenyan farmers. Your goal is to provide a highly relevant, data-driven crop recommendation.

**Context:**
1. **Farmer Profile:** ${JSON.stringify(farmerProfile, null, 2)}
2. **Real-time Weather Data:** ${JSON.stringify(weatherData, null, 2)}
3. **Market Data:** ${JSON.stringify(marketData, null, 2)}

**Your Task:**
Based on all the provided context, recommend the single best crop for this farmer to plant in the upcoming season.

**Reasoning Instructions:**
- Analyze the farmer's soil type, land size, and location (${county}, Kenya).
- Cross-reference this with the provided real-time weather data (temperature, rainfall, drought risk).
- Consider the market demand and potential profitability from the market data.
- Your recommendation should be practical and tailored to the farmer's specific conditions in ${county}, Kenya.

**Output Format:**
You MUST respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or additional text. The JSON object must have this exact structure:

{
  "recommendedCrop": "Name of the Crop",
  "confidenceScore": 85,
  "explanation": {
    "summary": "A brief, one-sentence summary of why you chose this crop.",
    "keyFactors": [
      {
        "factor": "Soil and Climate Match",
        "reasoning": "Explain how the crop matches the farmer's soil and the local climate."
      },
      {
        "factor": "Weather Resilience",
        "reasoning": "Explain how the crop choice is resilient to the forecasted weather."
      },
      {
        "factor": "Market Opportunity",
        "reasoning": "Explain the market demand and potential profitability for this crop."
      }
    ]
  },
  "guidance": {
    "bestPlantingTime": "Suggest the best planting season or months",
    "expectedYield": "Provide an estimated yield per acre in Kg",
    "potentialRevenue": "Estimate the potential revenue per acre in KES"
  }
}`;

        try {
            // Call Gemini AI
            logger.info(`Calling Gemini AI for crop recommendation for ${county}`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text();

            // Parse the AI response
            logger.info('Gemini AI response received, parsing JSON...');

            // Clean the response (remove markdown code blocks if present)
            let cleanedResponse = responseText.trim();
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            const aiRecommendation = JSON.parse(cleanedResponse);

            // Calculate validity period (3 months)
            const validUntil = new Date();
            validUntil.setMonth(validUntil.getMonth() + 3);

            // Build the final recommendation object
            return {
                farmerId: farmer._id,
                farmLocation: {
                    county: county,
                    subCounty: farmer.farm.location.subCounty,
                    coordinates: farmer.farm.location.gpsCoordinates
                },
                recommendedCrop: aiRecommendation.recommendedCrop,
                confidence: aiRecommendation.confidenceScore,
                factors: this._convertToFactorsFormat(aiRecommendation.explanation.keyFactors),
                explanation: {
                    summary: aiRecommendation.explanation.summary,
                    keyFactors: aiRecommendation.explanation.keyFactors.map(kf => ({
                        factor: kf.factor,
                        impact: "Positive",
                        explanation: kf.reasoning
                    }))
                },
                marketData: {
                    currentPrice: {
                        amount: this._getMarketPrice(aiRecommendation.recommendedCrop),
                        unit: "per Kg",
                        currency: "KES"
                    },
                    projectedDemand: {
                        level: "High",
                        forecast: "Demand expected to remain strong"
                    }
                },
                guidance: {
                    bestPlantingTime: {
                        season: aiRecommendation.guidance.bestPlantingTime,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    },
                    expectedYield: {
                        average: aiRecommendation.guidance.expectedYield,
                        unit: "Kg per acre"
                    },
                    potentialRevenue: {
                        estimated: aiRecommendation.guidance.potentialRevenue,
                        currency: "KES"
                    }
                },
                risks: {
                    overall: weatherData.droughtRisk === "High" || weatherData.floodRisk === "High" ? "High" : "Moderate",
                    identified: this._identifyRisks(weatherData)
                },
                inputData: {
                    environmentalDataId: environmentalData?._id,
                    soilType,
                    landSize: farmer.farm.landSize,
                    irrigationType: farmer.farm.irrigationType,
                    currentSeason: season
                },
                modelInfo: {
                    modelVersion: "2.0.0-gemini-ai",
                    modelType: "Neural Network",
                    trainingDate: new Date(),
                    apiModel: "gemini-1.5-pro"
                },
                validUntil,
                priority: "Medium"
            };

        } catch (error) {
            logger.error(`Error calling Gemini AI: ${error.message}`);

            // Fallback to a basic recommendation if AI fails
            logger.warn('Falling back to basic recommendation due to AI error');
            return this._generateFallbackRecommendation(farmer, environmentalData, season);
        }
    }

    /**
     * Convert AI key factors to the factors format expected by the model
     */
    _convertToFactorsFormat(keyFactors) {
        const factors = {};
        keyFactors.forEach((kf, index) => {
            const key = kf.factor.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '');
            factors[key] = {
                score: 85, // Default score
                description: kf.reasoning
            };
        });
        return factors;
    }

    /**
     * Identify risks based on weather data
     */
    _identifyRisks(weatherData) {
        const risks = [];

        if (weatherData.droughtRisk === "High" || weatherData.droughtRisk === "Severe") {
            risks.push({
                type: "Drought Risk",
                level: weatherData.droughtRisk,
                mitigation: "Consider drought-resistant crops and prepare irrigation systems",
                probability: 70
            });
        }

        if (weatherData.floodRisk === "High" || weatherData.floodRisk === "Severe") {
            risks.push({
                type: "Flood Risk",
                level: weatherData.floodRisk,
                mitigation: "Ensure proper drainage and consider raised bed farming",
                probability: 60
            });
        }

        if (risks.length === 0) {
            risks.push({
                type: "Weather Risk",
                level: "Moderate",
                mitigation: "Monitor weather forecasts and prepare irrigation if needed",
                probability: 40
            });
        }

        return risks;
    }

    /**
     * Fallback recommendation if AI fails
     */
    _generateFallbackRecommendation(farmer, environmentalData, season) {
        const county = farmer.farm.location.county;
        let recommendedCrop = "Maize"; // Default

        // Simple county-based fallback
        if (county === "Trans-Nzoia") recommendedCrop = "Maize";
        else if (county === "Kirinyaga") recommendedCrop = "Tomatoes";
        else if (county === "Makueni") recommendedCrop = "Sorghum";

        const validUntil = new Date();
        validUntil.setMonth(validUntil.getMonth() + 3);

        return {
            farmerId: farmer._id,
            farmLocation: {
                county: county,
                subCounty: farmer.farm.location.subCounty,
                coordinates: farmer.farm.location.gpsCoordinates
            },
            recommendedCrop,
            confidence: 70,
            factors: {
                location: { score: 75, description: "Based on county location" }
            },
            explanation: {
                summary: `Fallback recommendation for ${county}: ${recommendedCrop} is a suitable crop for this region.`,
                keyFactors: [
                    {
                        factor: "Location",
                        impact: "Positive",
                        explanation: `${recommendedCrop} is commonly grown in ${county}`
                    }
                ]
            },
            marketData: {
                currentPrice: {
                    amount: this._getMarketPrice(recommendedCrop),
                    unit: "per Kg",
                    currency: "KES"
                },
                projectedDemand: {
                    level: "Moderate",
                    forecast: "Stable demand"
                }
            },
            guidance: {
                bestPlantingTime: {
                    season: season,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                expectedYield: {
                    average: this._getExpectedYield(recommendedCrop),
                    unit: "Kg per acre"
                }
            },
            risks: {
                overall: "Moderate",
                identified: [{
                    type: "Weather Risk",
                    level: "Moderate",
                    mitigation: "Monitor weather conditions",
                    probability: 40
                }]
            },
            inputData: {
                environmentalDataId: environmentalData?._id,
                soilType: farmer.farm.soilType,
                landSize: farmer.farm.landSize,
                irrigationType: farmer.farm.irrigationType,
                currentSeason: season
            },
            modelInfo: {
                modelVersion: "1.0.0-fallback",
                modelType: "Hybrid",
                trainingDate: new Date()
            },
            validUntil,
            priority: "Medium"
        };
    }

    _getCurrentSeason() {
        const month = new Date().getMonth() + 1; // 1-12
        if (month >= 3 && month <= 5) return "Long Rains (March-May)";
        if (month >= 10 && month <= 12) return "Short Rains (Oct-Dec)";
        return "Off-season";
    }

    _getMarketPrice(crop) {
        const prices = {
            "Maize": 45,
            "Tomatoes": 80,
            "Sorghum": 40,
            "Kale": 60,
            "Beans": 100,
            "Potatoes": 50
        };
        return prices[crop] || 50;
    }

    _getExpectedYield(crop) {
        const yields = {
            "Maize": 2000,
            "Tomatoes": 3000,
            "Sorghum": 1500,
            "Kale": 2500,
            "Beans": 1000,
            "Potatoes": 4000
        };
        return yields[crop] || 2000;
    }
}

module.exports = new RecommendationController();
