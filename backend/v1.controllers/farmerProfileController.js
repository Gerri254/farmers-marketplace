const User = require('../models/user');
const logger = require('../v1.utils/log');

class FarmerProfileController {
    /**
     * Update farmer's detailed farm information
     * POST /api/v1/farmer/update-farm-details
     */
    async updateFarmDetails(req, res) {
        try {
            const { farmerId } = req.body;
            const {
                farmName,
                location,
                landSize,
                soilType,
                irrigationType,
                cropsGrown,
                certifications
            } = req.body;

            logger.info(`Updating farm details for farmer: ${farmerId}`);

            // Find the farmer
            const farmer = await User.findOne({ _id: farmerId, role: "farmer" });
            if (!farmer) {
                logger.warn(`Farmer not found: ${farmerId}`);
                return res.status(404).json({ message: "Farmer not found" });
            }

            // Update farm information
            if (farmName) farmer.farm.farmName = farmName;

            // Update location details
            if (location) {
                if (location.county) farmer.farm.location.county = location.county;
                if (location.subCounty) farmer.farm.location.subCounty = location.subCounty;
                if (location.ward) farmer.farm.location.ward = location.ward;
                if (location.gpsCoordinates) {
                    farmer.farm.location.gpsCoordinates = location.gpsCoordinates;
                }
            }

            // Update farm characteristics
            if (landSize !== undefined) farmer.farm.landSize = landSize;
            if (soilType) farmer.farm.soilType = soilType;
            if (irrigationType) farmer.farm.irrigationType = irrigationType;

            // Update crops grown
            if (cropsGrown) farmer.farm.cropsGrown = cropsGrown;

            // Update certifications
            if (certifications) farmer.farm.certifications = certifications;

            await farmer.save();

            logger.info(`Farm details updated successfully for farmer: ${farmerId}`);
            res.status(200).json({
                message: "Farm details updated successfully",
                farm: farmer.farm
            });
        } catch (error) {
            logger.error(`Error updating farm details: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update farm profile (simpler version for basic farm info)
     * POST /api/v1/farmer/update-farm-profile
     */
    async updateFarmProfile(req, res) {
        try {
            const farmerId = req.user.id; // Get from authenticated user
            const { county, location, gpsCoordinates, soilType, landSize } = req.body;

            logger.info(`Updating farm profile for farmer: ${farmerId}`);

            // Find the farmer
            const farmer = await User.findOne({ _id: farmerId, role: "farmer" });
            if (!farmer) {
                logger.warn(`Farmer not found: ${farmerId}`);
                return res.status(404).json({ message: "Farmer not found" });
            }

            // Initialize farm object if it doesn't exist
            if (!farmer.farm) {
                farmer.farm = {};
            }

            // Handle mixed type location field (can be string or object)
            // IMPORTANT: Ensure location is always an object before setting properties
            if (!farmer.farm.location) {
                // Initialize location as an object if it doesn't exist
                farmer.farm.location = {};
            } else {
                // Check if location is a string value (handles Mongoose wrapper objects)
                const locationStr = JSON.stringify(farmer.farm.location);
                const isStringValue = locationStr && locationStr.startsWith('"') && locationStr.endsWith('"');

                if (typeof farmer.farm.location === 'string' || isStringValue) {
                    // Convert string location to object structure
                    const oldLocation = isStringValue ? JSON.parse(locationStr) : farmer.farm.location;
                    farmer.farm.location = {
                        type: oldLocation // Preserve the old string value
                    };
                    farmer.markModified('farm.location');
                }
            }

            // Update farm information
            if (county) {
                // Ensure location is an object one more time before setting property
                if (typeof farmer.farm.location !== 'object' || farmer.farm.location === null) {
                    logger.warn('Location is not an object, converting...');
                    const temp = String(farmer.farm.location || '');
                    farmer.farm.location = temp ? { type: temp } : {};
                }
                farmer.farm.location.county = county;
                farmer.markModified('farm.location');
            }
            if (location) {
                farmer.farm.location.type = location; // Simple location string
                farmer.markModified('farm.location');
            }
            if (gpsCoordinates) {
                if (!farmer.farm.location.gpsCoordinates) {
                    farmer.farm.location.gpsCoordinates = {};
                }
                if (gpsCoordinates.latitude !== undefined && gpsCoordinates.latitude !== null && gpsCoordinates.latitude !== '') {
                    const lat = parseFloat(gpsCoordinates.latitude);
                    if (!isNaN(lat)) {
                        farmer.farm.location.gpsCoordinates.latitude = lat;
                    }
                }
                if (gpsCoordinates.longitude !== undefined && gpsCoordinates.longitude !== null && gpsCoordinates.longitude !== '') {
                    const lng = parseFloat(gpsCoordinates.longitude);
                    if (!isNaN(lng)) {
                        farmer.farm.location.gpsCoordinates.longitude = lng;
                    }
                }
                farmer.markModified('farm.location.gpsCoordinates');
            }
            if (soilType) farmer.farm.soilType = soilType;
            if (landSize !== undefined && landSize !== null && landSize !== '') {
                const size = parseFloat(landSize);
                if (!isNaN(size)) {
                    farmer.farm.landSize = size;
                }
            }

            await farmer.save();

            logger.info(`Farm profile updated successfully for farmer: ${farmerId}`);
            res.status(200).json({
                message: "Farm profile updated successfully",
                farm: farmer.farm
            });
        } catch (error) {
            logger.error(`Error updating farm profile: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get farmer's complete farm profile
     * GET /api/v1/farmer/farm-details/:farmerId
     */
    async getFarmDetails(req, res) {
        try {
            const { farmerId } = req.params;

            logger.info(`Fetching farm details for farmer: ${farmerId}`);

            const farmer = await User.findOne({ _id: farmerId, role: "farmer" })
                .select('name email phone farm historicalYields tradingHistory aiInsights');

            if (!farmer) {
                logger.warn(`Farmer not found: ${farmerId}`);
                return res.status(404).json({ message: "Farmer not found" });
            }

            // Calculate additional metrics
            const reliabilityScore = farmer.calculateReliabilityScore();
            const averageRating = farmer.getAverageRating();
            const isInPilotRegion = farmer.isInPilotRegion();

            logger.info(`Farm details retrieved successfully for farmer: ${farmerId}`);
            res.status(200).json({
                farmer: {
                    id: farmer._id,
                    name: farmer.name,
                    email: farmer.email,
                    phone: farmer.phone,
                    farm: farmer.farm,
                    historicalYields: farmer.historicalYields,
                    tradingHistory: farmer.tradingHistory,
                    aiInsights: farmer.aiInsights,
                    metrics: {
                        reliabilityScore,
                        averageRating,
                        isInPilotRegion
                    }
                }
            });
        } catch (error) {
            logger.error(`Error fetching farm details: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Add historical yield data
     * POST /api/v1/farmer/add-historical-yield
     */
    async addHistoricalYield(req, res) {
        try {
            const { farmerId, crop, season, year, actualYield, quality, sellPrice, weather } = req.body;

            logger.info(`Adding historical yield for farmer: ${farmerId}`);

            const farmer = await User.findOne({ _id: farmerId, role: "farmer" });
            if (!farmer) {
                logger.warn(`Farmer not found: ${farmerId}`);
                return res.status(404).json({ message: "Farmer not found" });
            }

            // Add new historical yield
            farmer.historicalYields.push({
                crop,
                season,
                year,
                actualYield,
                quality,
                sellPrice,
                weather
            });

            await farmer.save();

            logger.info(`Historical yield added successfully for farmer: ${farmerId}`);
            res.status(200).json({
                message: "Historical yield added successfully",
                historicalYields: farmer.historicalYields
            });
        } catch (error) {
            logger.error(`Error adding historical yield: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update buyer profile with preferences
     * POST /api/v1/buyer/update-buyer-profile
     */
    async updateBuyerProfile(req, res) {
        try {
            const { buyerId } = req.body;
            const {
                buyerType,
                businessName,
                businessRegistration,
                county,
                preferences
            } = req.body;

            logger.info(`Updating buyer profile for: ${buyerId}`);

            const buyer = await User.findOne({ _id: buyerId, role: "buyer" });
            if (!buyer) {
                logger.warn(`Buyer not found: ${buyerId}`);
                return res.status(404).json({ message: "Buyer not found" });
            }

            // Initialize buyerProfile if it doesn't exist
            if (!buyer.buyerProfile) {
                buyer.buyerProfile = {};
            }

            // Update buyer information
            if (buyerType) buyer.buyerProfile.buyerType = buyerType;
            if (businessName) buyer.buyerProfile.businessName = businessName;
            if (businessRegistration) buyer.buyerProfile.businessRegistration = businessRegistration;
            if (county) buyer.buyerProfile.county = county;

            // Update preferences
            if (preferences) {
                if (!buyer.buyerProfile.preferences) {
                    buyer.buyerProfile.preferences = {};
                }

                if (preferences.preferredCrops) {
                    buyer.buyerProfile.preferences.preferredCrops = preferences.preferredCrops;
                }
                if (preferences.qualityStandards) {
                    buyer.buyerProfile.preferences.qualityStandards = preferences.qualityStandards;
                }
                if (preferences.certificationRequired !== undefined) {
                    buyer.buyerProfile.preferences.certificationRequired = preferences.certificationRequired;
                }
                if (preferences.deliverySchedule) {
                    buyer.buyerProfile.preferences.deliverySchedule = preferences.deliverySchedule;
                }
                if (preferences.volumeRequirements) {
                    buyer.buyerProfile.preferences.volumeRequirements = preferences.volumeRequirements;
                }
                if (preferences.preferredLocations) {
                    buyer.buyerProfile.preferences.preferredLocations = preferences.preferredLocations;
                }
                if (preferences.maxDistance !== undefined) {
                    buyer.buyerProfile.preferences.maxDistance = preferences.maxDistance;
                }
            }

            await buyer.save();

            logger.info(`Buyer profile updated successfully: ${buyerId}`);
            res.status(200).json({
                message: "Buyer profile updated successfully",
                buyerProfile: buyer.buyerProfile
            });
        } catch (error) {
            logger.error(`Error updating buyer profile: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get buyer's complete profile
     * GET /api/v1/buyer/buyer-profile/:buyerId
     */
    async getBuyerProfile(req, res) {
        try {
            const { buyerId } = req.params;

            logger.info(`Fetching buyer profile for: ${buyerId}`);

            const buyer = await User.findOne({ _id: buyerId, role: "buyer" })
                .select('name email phone address buyerProfile tradingHistory aiInsights');

            if (!buyer) {
                logger.warn(`Buyer not found: ${buyerId}`);
                return res.status(404).json({ message: "Buyer not found" });
            }

            // Calculate additional metrics
            const reliabilityScore = buyer.calculateReliabilityScore();
            const averageRating = buyer.getAverageRating();

            logger.info(`Buyer profile retrieved successfully: ${buyerId}`);
            res.status(200).json({
                buyer: {
                    id: buyer._id,
                    name: buyer.name,
                    email: buyer.email,
                    phone: buyer.phone,
                    address: buyer.address,
                    buyerProfile: buyer.buyerProfile,
                    tradingHistory: buyer.tradingHistory,
                    aiInsights: buyer.aiInsights,
                    metrics: {
                        reliabilityScore,
                        averageRating
                    }
                }
            });
        } catch (error) {
            logger.error(`Error fetching buyer profile: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Add demand forecast for buyer
     * POST /api/v1/buyer/add-demand-forecast
     */
    async addDemandForecast(req, res) {
        try {
            const { buyerId, product, quantity, deadline, priority } = req.body;

            logger.info(`Adding demand forecast for buyer: ${buyerId}`);

            const buyer = await User.findOne({ _id: buyerId, role: "buyer" });
            if (!buyer) {
                logger.warn(`Buyer not found: ${buyerId}`);
                return res.status(404).json({ message: "Buyer not found" });
            }

            // Initialize buyerProfile if needed
            if (!buyer.buyerProfile) {
                buyer.buyerProfile = {};
            }
            if (!buyer.buyerProfile.demandForecasts) {
                buyer.buyerProfile.demandForecasts = [];
            }

            // Add demand forecast
            buyer.buyerProfile.demandForecasts.push({
                product,
                quantity,
                deadline,
                priority: priority || "Medium",
                status: "Active"
            });

            await buyer.save();

            logger.info(`Demand forecast added successfully for buyer: ${buyerId}`);
            res.status(200).json({
                message: "Demand forecast added successfully",
                demandForecasts: buyer.buyerProfile.demandForecasts
            });
        } catch (error) {
            logger.error(`Error adding demand forecast: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new FarmerProfileController();
