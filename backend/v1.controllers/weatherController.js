const weatherService = require('../v1.services/weatherService');
const EnvironmentalData = require('../models/environmentalData');
const logger = require('../v1.utils/log');

class WeatherController {
    /**
     * Get current weather for a county
     * GET /api/v1/weather/current/:county
     */
    async getCurrentWeather(req, res) {
        try {
            const { county } = req.params;

            logger.info(`Fetching current weather for: ${county}`);

            const weather = await weatherService.getCurrentWeather(county);

            res.status(200).json({
                success: true,
                county,
                weather,
                source: 'OpenWeather API',
                fetchedAt: new Date()
            });
        } catch (error) {
            logger.error(`Error in getCurrentWeather: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get weather forecast for a county
     * GET /api/v1/weather/forecast/:county
     */
    async getWeatherForecast(req, res) {
        try {
            const { county } = req.params;
            const { days = 5 } = req.query;

            logger.info(`Fetching ${days}-day forecast for: ${county}`);

            const forecast = await weatherService.getWeatherForecast(county);

            // Limit to requested days (8 forecasts per day - 3 hour intervals)
            const limitedForecasts = forecast.forecasts.slice(0, parseInt(days) * 8);

            res.status(200).json({
                success: true,
                county,
                forecast: {
                    ...forecast,
                    forecasts: limitedForecasts
                },
                days: parseInt(days),
                source: 'OpenWeather API',
                fetchedAt: new Date()
            });
        } catch (error) {
            logger.error(`Error in getWeatherForecast: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Get comprehensive weather data (current + forecast)
     * GET /api/v1/weather/comprehensive/:county
     */
    async getComprehensiveWeather(req, res) {
        try {
            const { county } = req.params;

            logger.info(`Fetching comprehensive weather for: ${county}`);

            const data = await weatherService.getComprehensiveWeather(county);

            // Calculate additional insights
            const rainfall = weatherService.calculateRainfallEstimate(data.forecast);
            const droughtRisk = weatherService.assessDroughtRisk(data.current, data.forecast);
            const floodRisk = weatherService.assessFloodRisk(data.forecast);

            res.status(200).json({
                success: true,
                county,
                data,
                insights: {
                    rainfall,
                    risks: {
                        drought: droughtRisk,
                        flood: floodRisk
                    }
                },
                source: 'OpenWeather API',
                fetchedAt: new Date()
            });
        } catch (error) {
            logger.error(`Error in getComprehensiveWeather: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Fetch and store weather data for a county
     * POST /api/v1/weather/fetch-and-store/:county
     */
    async fetchAndStoreWeather(req, res) {
        try {
            const { county } = req.params;

            logger.info(`Fetching and storing weather for: ${county}`);

            // Fetch comprehensive weather data
            const weatherData = await weatherService.getComprehensiveWeather(county);

            // Calculate insights
            const rainfall = weatherService.calculateRainfallEstimate(weatherData.forecast);
            const droughtRisk = weatherService.assessDroughtRisk(weatherData.current, weatherData.forecast);
            const floodRisk = weatherService.assessFloodRisk(weatherData.forecast);

            // Determine season
            const month = new Date().getMonth() + 1;
            let season = 'Off-season';
            if (month >= 3 && month <= 5) season = 'Long Rains (March-May)';
            else if (month >= 10 && month <= 12) season = 'Short Rains (Oct-Dec)';

            // Create environmental data entry
            const environmentalData = new EnvironmentalData({
                location: {
                    county: county,
                    coordinates: {
                        latitude: weatherData.current.coordinates.lat,
                        longitude: weatherData.current.coordinates.lon
                    }
                },
                date: new Date(),
                season,
                weather: {
                    temperature: {
                        current: weatherData.current.temperature.current,
                        min: weatherData.current.temperature.min,
                        max: weatherData.current.temperature.max,
                        avg: weatherData.current.temperature.avg
                    },
                    rainfall: {
                        daily: 0, // OpenWeather doesn't provide this directly
                        weekly: rainfall.estimated7days,
                        monthly: rainfall.estimated7days * 4 // Rough estimate
                    },
                    humidity: weatherData.current.humidity,
                    windSpeed: weatherData.current.windSpeed,
                    pressure: weatherData.current.pressure,
                    conditions: weatherData.current.conditions
                },
                climateIndicators: {
                    droughtRisk,
                    floodRisk,
                    heatStress: weatherData.current.temperature.avg > 32 ? 'High' :
                               weatherData.current.temperature.avg > 28 ? 'Moderate' : 'Low'
                },
                alerts: this._generateWeatherAlerts(weatherData, droughtRisk, floodRisk),
                dataSource: 'OpenWeather API',
                dataQuality: 'High',
                isVerified: true
            });

            await environmentalData.save();

            logger.info(`Weather data saved successfully for ${county}`);

            res.status(201).json({
                success: true,
                message: `Weather data fetched and stored for ${county}`,
                data: environmentalData,
                insights: {
                    rainfall,
                    risks: { drought: droughtRisk, flood: floodRisk }
                }
            });
        } catch (error) {
            logger.error(`Error in fetchAndStoreWeather: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Fetch and store weather for all pilot counties
     * POST /api/v1/weather/fetch-all-pilot
     */
    async fetchAllPilotCounties(req, res) {
        try {
            logger.info('Fetching weather for all pilot counties');

            const result = await weatherService.getAllPilotCountiesWeather();

            // Store each successful fetch
            const stored = [];
            for (const data of result.success) {
                try {
                    const rainfall = weatherService.calculateRainfallEstimate(data.forecast);
                    const droughtRisk = weatherService.assessDroughtRisk(data.current, data.forecast);
                    const floodRisk = weatherService.assessFloodRisk(data.forecast);

                    const month = new Date().getMonth() + 1;
                    let season = 'Off-season';
                    if (month >= 3 && month <= 5) season = 'Long Rains (March-May)';
                    else if (month >= 10 && month <= 12) season = 'Short Rains (Oct-Dec)';

                    const environmentalData = new EnvironmentalData({
                        location: {
                            county: data.county,
                            coordinates: {
                                latitude: data.current.coordinates.lat,
                                longitude: data.current.coordinates.lon
                            }
                        },
                        date: new Date(),
                        season,
                        weather: {
                            temperature: {
                                current: data.current.temperature.current,
                                min: data.current.temperature.min,
                                max: data.current.temperature.max,
                                avg: data.current.temperature.avg
                            },
                            rainfall: {
                                daily: 0,
                                weekly: rainfall.estimated7days,
                                monthly: rainfall.estimated7days * 4
                            },
                            humidity: data.current.humidity,
                            windSpeed: data.current.windSpeed,
                            pressure: data.current.pressure,
                            conditions: data.current.conditions
                        },
                        climateIndicators: {
                            droughtRisk,
                            floodRisk,
                            heatStress: data.current.temperature.avg > 32 ? 'High' :
                                       data.current.temperature.avg > 28 ? 'Moderate' : 'Low'
                        },
                        alerts: this._generateWeatherAlerts(data, droughtRisk, floodRisk),
                        dataSource: 'OpenWeather API',
                        dataQuality: 'High',
                        isVerified: true
                    });

                    await environmentalData.save();
                    stored.push(data.county);
                } catch (error) {
                    logger.error(`Error storing weather for ${data.county}: ${error.message}`);
                }
            }

            logger.info(`Weather data stored for: ${stored.join(', ')}`);

            res.status(201).json({
                success: true,
                message: 'Weather data fetched for pilot counties',
                result: {
                    totalAttempted: result.totalFetched + result.totalErrors,
                    successful: result.totalFetched,
                    stored: stored.length,
                    failed: result.totalErrors,
                    storedCounties: stored,
                    errors: result.errors
                }
            });
        } catch (error) {
            logger.error(`Error in fetchAllPilotCounties: ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Health check for weather service
     * GET /api/v1/weather/health
     */
    async healthCheck(req, res) {
        try {
            const health = await weatherService.healthCheck();

            res.status(health.status === 'healthy' ? 200 : 503).json({
                success: health.status === 'healthy',
                ...health,
                timestamp: new Date()
            });
        } catch (error) {
            logger.error(`Error in weather health check: ${error.message}`);
            res.status(503).json({
                success: false,
                status: 'unhealthy',
                message: error.message
            });
        }
    }

    /**
     * Generate weather alerts based on conditions
     */
    _generateWeatherAlerts(weatherData, droughtRisk, floodRisk) {
        const alerts = [];
        const validUntil = new Date();
        validUntil.setHours(validUntil.getHours() + 24);

        // Drought alert
        if (['High', 'Severe'].includes(droughtRisk)) {
            alerts.push({
                type: 'Drought Alert',
                severity: droughtRisk === 'Severe' ? 'Critical' : 'High',
                description: `${droughtRisk} drought risk detected. Low rainfall expected in coming days.`,
                isActive: true,
                validUntil
            });
        }

        // Flood alert
        if (['High', 'Severe'].includes(floodRisk)) {
            alerts.push({
                type: 'Flood Warning',
                severity: floodRisk === 'Severe' ? 'Critical' : 'High',
                description: `${floodRisk} flood risk. Heavy rainfall expected in next 24 hours.`,
                isActive: true,
                validUntil
            });
        }

        // Heat wave alert
        if (weatherData.current.temperature.avg > 35) {
            alerts.push({
                type: 'Heat Wave',
                severity: 'High',
                description: 'Extreme heat detected. Take precautions for crops and livestock.',
                isActive: true,
                validUntil
            });
        }

        // High wind alert
        if (weatherData.current.windSpeed > 15) {
            alerts.push({
                type: 'Weather Warning',
                severity: 'Moderate',
                description: 'High winds detected. Secure loose structures.',
                isActive: true,
                validUntil
            });
        }

        return alerts;
    }
}

module.exports = new WeatherController();
