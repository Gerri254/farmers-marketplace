const EnvironmentalData = require('../models/environmentalData');
const logger = require('../v1.utils/log');

class EnvironmentalDataController {
    /**
     * Get environmental data by county
     * GET /api/v1/environmental-data/:county
     */
    async getByCounty(req, res) {
        try {
            const { county } = req.params;
            const { limit = 10 } = req.query;

            logger.info(`Fetching environmental data for county: ${county}`);

            const data = await EnvironmentalData.find({ "location.county": county })
                .sort({ date: -1 })
                .limit(parseInt(limit));

            if (!data || data.length === 0) {
                logger.warn(`No environmental data found for county: ${county}`);
                return res.status(404).json({ message: `No environmental data found for ${county}` });
            }

            logger.info(`Environmental data retrieved successfully for ${county}: ${data.length} records`);
            res.status(200).json({
                county,
                count: data.length,
                data
            });
        } catch (error) {
            logger.error(`Error fetching environmental data: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get latest environmental data for a specific location
     * GET /api/v1/environmental-data/latest/:county
     */
    async getLatest(req, res) {
        try {
            const { county } = req.params;

            logger.info(`Fetching latest environmental data for: ${county}`);

            const data = await EnvironmentalData.findOne({ "location.county": county })
                .sort({ date: -1 });

            if (!data) {
                logger.warn(`No environmental data found for county: ${county}`);
                return res.status(404).json({ message: `No environmental data found for ${county}` });
            }

            // Get risk summary
            const risks = data.getRiskSummary();

            logger.info(`Latest environmental data retrieved for ${county}`);
            res.status(200).json({
                data,
                risks,
                lastUpdated: data.date
            });
        } catch (error) {
            logger.error(`Error fetching latest environmental data: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Check crop suitability for a location
     * POST /api/v1/environmental-data/check-crop-suitability
     */
    async checkCropSuitability(req, res) {
        try {
            const { county, cropType } = req.body;

            logger.info(`Checking crop suitability for ${cropType} in ${county}`);

            // Get latest environmental data
            const data = await EnvironmentalData.findOne({ "location.county": county })
                .sort({ date: -1 });

            if (!data) {
                logger.warn(`No environmental data found for county: ${county}`);
                return res.status(404).json({ message: `No environmental data available for ${county}` });
            }

            // Check suitability
            const suitability = data.isSuitableForCrop(cropType);

            if (!suitability) {
                logger.warn(`No suitability data available for crop: ${cropType}`);
                return res.status(404).json({ message: `No suitability data available for ${cropType}` });
            }

            logger.info(`Crop suitability checked for ${cropType} in ${county}`);
            res.status(200).json({
                county,
                cropType,
                suitability,
                environmentalData: {
                    temperature: data.weather?.temperature,
                    rainfall: data.weather?.rainfall,
                    soilType: data.soil?.type
                }
            });
        } catch (error) {
            logger.error(`Error checking crop suitability: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Add environmental data (Admin/System only)
     * POST /api/v1/environmental-data/add
     */
    async addEnvironmentalData(req, res) {
        try {
            const {
                location,
                date,
                season,
                weather,
                soil,
                climateIndicators,
                alerts,
                pestDiseaseData,
                dataSource,
                dataQuality
            } = req.body;

            logger.info(`Adding environmental data for ${location.county}`);

            const environmentalData = new EnvironmentalData({
                location,
                date: date || new Date(),
                season,
                weather,
                soil,
                climateIndicators,
                alerts,
                pestDiseaseData,
                dataSource: dataSource || "Manual Entry",
                dataQuality: dataQuality || "Medium"
            });

            await environmentalData.save();

            logger.info(`Environmental data added successfully for ${location.county}`);
            res.status(201).json({
                message: "Environmental data added successfully",
                data: environmentalData
            });
        } catch (error) {
            logger.error(`Error adding environmental data: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get active alerts for a county
     * GET /api/v1/environmental-data/alerts/:county
     */
    async getActiveAlerts(req, res) {
        try {
            const { county } = req.params;

            logger.info(`Fetching active alerts for: ${county}`);

            const data = await EnvironmentalData.findOne({ "location.county": county })
                .sort({ date: -1 });

            if (!data) {
                logger.warn(`No environmental data found for county: ${county}`);
                return res.status(404).json({ message: `No data available for ${county}` });
            }

            // Filter active alerts
            const activeAlerts = data.alerts ? data.alerts.filter(alert =>
                alert.isActive && (!alert.validUntil || new Date(alert.validUntil) > new Date())
            ) : [];

            // Get risk summary
            const risks = data.getRiskSummary();

            logger.info(`Active alerts retrieved for ${county}: ${activeAlerts.length} alerts`);
            res.status(200).json({
                county,
                activeAlerts,
                risks,
                climateIndicators: data.climateIndicators
            });
        } catch (error) {
            logger.error(`Error fetching active alerts: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get weather data for multiple counties (for comparison)
     * POST /api/v1/environmental-data/compare-counties
     */
    async compareCounties(req, res) {
        try {
            const { counties } = req.body;

            if (!counties || !Array.isArray(counties) || counties.length === 0) {
                return res.status(400).json({ message: "Please provide an array of counties" });
            }

            logger.info(`Comparing environmental data for counties: ${counties.join(', ')}`);

            const comparison = [];

            for (const county of counties) {
                const data = await EnvironmentalData.findOne({ "location.county": county })
                    .sort({ date: -1 });

                if (data) {
                    comparison.push({
                        county,
                        temperature: data.weather?.temperature?.avg,
                        rainfall: data.weather?.rainfall?.monthly,
                        soilType: data.soil?.type,
                        droughtRisk: data.climateIndicators?.droughtRisk,
                        lastUpdated: data.date
                    });
                }
            }

            logger.info(`County comparison completed: ${comparison.length} counties`);
            res.status(200).json({
                comparison,
                totalCounties: comparison.length
            });
        } catch (error) {
            logger.error(`Error comparing counties: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get historical environmental trends
     * GET /api/v1/environmental-data/trends/:county
     */
    async getHistoricalTrends(req, res) {
        try {
            const { county } = req.params;
            const { months = 6 } = req.query;

            logger.info(`Fetching historical trends for ${county} (${months} months)`);

            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - parseInt(months));

            const data = await EnvironmentalData.find({
                "location.county": county,
                date: { $gte: startDate }
            }).sort({ date: 1 });

            if (!data || data.length === 0) {
                logger.warn(`No historical data found for county: ${county}`);
                return res.status(404).json({ message: `No historical data found for ${county}` });
            }

            // Calculate trends
            const trends = {
                temperature: {
                    data: data.map(d => ({
                        date: d.date,
                        value: d.weather?.temperature?.avg
                    })),
                    average: data.reduce((sum, d) => sum + (d.weather?.temperature?.avg || 0), 0) / data.length
                },
                rainfall: {
                    data: data.map(d => ({
                        date: d.date,
                        value: d.weather?.rainfall?.monthly
                    })),
                    total: data.reduce((sum, d) => sum + (d.weather?.rainfall?.monthly || 0), 0)
                }
            };

            logger.info(`Historical trends retrieved for ${county}: ${data.length} records`);
            res.status(200).json({
                county,
                period: `${months} months`,
                recordCount: data.length,
                trends
            });
        } catch (error) {
            logger.error(`Error fetching historical trends: ${error.message}`);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new EnvironmentalDataController();
