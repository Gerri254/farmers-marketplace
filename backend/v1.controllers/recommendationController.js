const Recommendation = require('../models/recommendation');
const User = require('../models/user');
const EnvironmentalData = require('../models/environmentalData');
const logger = require('../v1.utils/log');

class RecommendationController {
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
     * Private method: Generate recommendation using rule-based logic
     * This is a simplified version for Phase 1
     * In Phase 2, this will be replaced with ML model
     */
    async _generateRecommendation(farmer, environmentalData) {
        // Simple rule-based recommendation logic
        const county = farmer.farm.location.county;
        const soilType = farmer.farm.soilType || environmentalData?.soil?.type || "Unknown";
        const season = this._getCurrentSeason();

        // County-specific crop recommendations (based on project spec pilot locations)
        let recommendedCrop, confidence, factors;

        if (county === "Trans-Nzoia") {
            // Trans-Nzoia is known for maize farming
            recommendedCrop = "Maize";
            confidence = 85;
            factors = {
                soilCompatibility: { score: 90, description: "Trans-Nzoia soils are excellent for maize" },
                climateMatch: { score: 85, description: "Climate is suitable for maize production" },
                marketDemand: { score: 80, description: "High demand for maize in Kenya" },
                historicalSuccess: { score: 85, description: "Trans-Nzoia is a major maize-growing region" },
                waterAvailability: { score: 75, description: "Adequate rainfall for maize" },
                seasonalSuitability: { score: 90, description: "Current season is ideal for maize planting" }
            };
        } else if (county === "Kirinyaga") {
            // Kirinyaga is known for horticulture
            recommendedCrop = "Tomatoes";
            confidence = 82;
            factors = {
                soilCompatibility: { score: 88, description: "Volcanic soils are excellent for tomatoes" },
                climateMatch: { score: 85, description: "Moderate temperatures ideal for tomatoes" },
                marketDemand: { score: 90, description: "Very high demand for tomatoes" },
                historicalSuccess: { score: 80, description: "Kirinyaga has successful horticulture history" },
                waterAvailability: { score: 85, description: "Good water availability from Mt. Kenya" },
                seasonalSuitability: { score: 75, description: "Season suitable for tomato production" }
            };
        } else if (county === "Makueni") {
            // Makueni is drought-prone, recommend drought-resistant crops
            recommendedCrop = "Sorghum";
            confidence = 78;
            factors = {
                soilCompatibility: { score: 75, description: "Soils can support sorghum" },
                climateMatch: { score: 85, description: "Drought-resistant crop suitable for Makueni" },
                marketDemand: { score: 70, description: "Growing demand for sorghum" },
                historicalSuccess: { score: 75, description: "Sorghum performs well in semi-arid areas" },
                waterAvailability: { score: 90, description: "Low water requirements match Makueni conditions" },
                seasonalSuitability: { score: 80, description: "Good season for planting" }
            };
        } else {
            // Default recommendation
            recommendedCrop = "Kale";
            confidence = 70;
            factors = {
                soilCompatibility: { score: 75, description: "Kale grows in various soil types" },
                climateMatch: { score: 70, description: "Versatile crop for different climates" },
                marketDemand: { score: 85, description: "Consistent demand for kale" },
                historicalSuccess: { score: 70, description: "Widely grown across Kenya" },
                waterAvailability: { score: 75, description: "Moderate water requirements" },
                seasonalSuitability: { score: 70, description: "Can be grown year-round" }
            };
        }

        // Calculate validity period (3 months)
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
            confidence,
            factors,
            explanation: {
                summary: `Based on ${county}'s agricultural profile, soil conditions, and market demand, we recommend ${recommendedCrop}. This crop is well-suited to your location and has strong market potential.`,
                keyFactors: [
                    {
                        factor: "Location Suitability",
                        impact: "Very Positive",
                        explanation: `${county} has favorable conditions for ${recommendedCrop} production`
                    },
                    {
                        factor: "Market Demand",
                        impact: "Positive",
                        explanation: `Strong market demand ensures good selling prices for ${recommendedCrop}`
                    },
                    {
                        factor: "Seasonal Timing",
                        impact: "Positive",
                        explanation: `Current ${season} season is suitable for planting`
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
                    level: "High",
                    forecast: "Demand expected to remain strong"
                }
            },
            guidance: {
                bestPlantingTime: {
                    season: season,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                },
                expectedYield: {
                    average: this._getExpectedYield(recommendedCrop),
                    unit: "Kg per acre"
                }
            },
            risks: {
                overall: "Moderate",
                identified: [
                    {
                        type: "Weather Risk",
                        level: "Moderate",
                        mitigation: "Monitor weather forecasts and prepare irrigation if needed",
                        probability: 40
                    }
                ]
            },
            inputData: {
                environmentalDataId: environmentalData?._id,
                soilType,
                landSize: farmer.farm.landSize,
                irrigationType: farmer.farm.irrigationType,
                currentSeason: season
            },
            modelInfo: {
                modelVersion: "1.0.0-rule-based",
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
