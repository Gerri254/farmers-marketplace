const cron = require('node-cron');
const weatherService = require('./weatherService');
const EnvironmentalData = require('../models/environmentalData');
const logger = require('../v1.utils/log');

class CronJobService {
    constructor() {
        this.jobs = [];
    }

    /**
     * Start all cron jobs
     */
    startAll() {
        logger.info('Starting cron jobs...');

        // Daily weather update at 6:00 AM
        this.scheduleDailyWeatherUpdate();

        // Hourly weather check (optional, for real-time updates)
        // this.scheduleHourlyWeatherCheck();

        logger.info(`${this.jobs.length} cron jobs scheduled`);
    }

    /**
     * Stop all cron jobs
     */
    stopAll() {
        logger.info('Stopping all cron jobs...');
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        logger.info('All cron jobs stopped');
    }

    /**
     * Schedule daily weather data collection for pilot counties
     * Runs every day at 6:00 AM
     */
    scheduleDailyWeatherUpdate() {
        const job = cron.schedule('0 6 * * *', async () => {
            logger.info('Running scheduled daily weather update...');

            try {
                await this.collectWeatherForPilotCounties();
                logger.info('Daily weather update completed successfully');
            } catch (error) {
                logger.error(`Daily weather update failed: ${error.message}`);
            }
        }, {
            scheduled: true,
            timezone: "Africa/Nairobi"
        });

        this.jobs.push(job);
        logger.info('Daily weather update job scheduled (6:00 AM EAT)');
    }

    /**
     * Schedule hourly weather checks
     * Runs every hour
     */
    scheduleHourlyWeatherCheck() {
        const job = cron.schedule('0 * * * *', async () => {
            logger.info('Running hourly weather check...');

            try {
                // Just check critical alerts, don't store full data
                await this.checkCriticalWeatherAlerts();
                logger.info('Hourly weather check completed');
            } catch (error) {
                logger.error(`Hourly weather check failed: ${error.message}`);
            }
        }, {
            scheduled: true,
            timezone: "Africa/Nairobi"
        });

        this.jobs.push(job);
        logger.info('Hourly weather check job scheduled');
    }

    /**
     * Collect and store weather data for all pilot counties
     */
    async collectWeatherForPilotCounties() {
        const pilotCounties = ["Trans-Nzoia", "Kirinyaga", "Makueni"];
        const results = {
            success: [],
            failed: []
        };

        for (const county of pilotCounties) {
            try {
                logger.info(`Collecting weather data for ${county}...`);

                // Fetch comprehensive weather data
                const weatherData = await weatherService.getComprehensiveWeather(county);

                // Calculate insights
                const rainfall = weatherService.calculateRainfallEstimate(weatherData.forecast);
                const droughtRisk = weatherService.assessDroughtRisk(weatherData.current, weatherData.forecast);
                const floodRisk = weatherService.assessFloodRisk(weatherData.forecast);

                // Determine current season
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
                            daily: 0,
                            weekly: rainfall.estimated7days,
                            monthly: rainfall.estimated7days * 4
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

                logger.info(`✓ Weather data saved for ${county}`);
                results.success.push(county);

            } catch (error) {
                logger.error(`✗ Failed to collect weather for ${county}: ${error.message}`);
                results.failed.push({ county, error: error.message });
            }
        }

        logger.info(`Weather collection complete: ${results.success.length} successful, ${results.failed.length} failed`);
        return results;
    }

    /**
     * Check for critical weather alerts (used in hourly checks)
     */
    async checkCriticalWeatherAlerts() {
        const pilotCounties = ["Trans-Nzoia", "Kirinyaga", "Makueni"];
        const criticalAlerts = [];

        for (const county of pilotCounties) {
            try {
                const current = await weatherService.getCurrentWeather(county);

                // Check for critical conditions
                if (current.temperature.avg > 35) {
                    criticalAlerts.push({
                        county,
                        type: 'Heat Wave',
                        severity: 'Critical',
                        temperature: current.temperature.avg
                    });
                }

                if (current.windSpeed > 20) {
                    criticalAlerts.push({
                        county,
                        type: 'High Winds',
                        severity: 'High',
                        windSpeed: current.windSpeed
                    });
                }

            } catch (error) {
                logger.error(`Failed to check alerts for ${county}: ${error.message}`);
            }
        }

        if (criticalAlerts.length > 0) {
            logger.warn(`Critical weather alerts detected: ${JSON.stringify(criticalAlerts)}`);
            // TODO: Send notifications to affected farmers
        }

        return criticalAlerts;
    }

    /**
     * Run weather collection manually (for testing or on-demand)
     */
    async runManualCollection() {
        logger.info('Running manual weather collection...');
        return await this.collectWeatherForPilotCounties();
    }

    /**
     * Generate weather alerts
     */
    _generateWeatherAlerts(weatherData, droughtRisk, floodRisk) {
        const alerts = [];
        const validUntil = new Date();
        validUntil.setHours(validUntil.getHours() + 24);

        if (['High', 'Severe'].includes(droughtRisk)) {
            alerts.push({
                type: 'Drought Alert',
                severity: droughtRisk === 'Severe' ? 'Critical' : 'High',
                description: `${droughtRisk} drought risk detected. Low rainfall expected in coming days.`,
                isActive: true,
                validUntil
            });
        }

        if (['High', 'Severe'].includes(floodRisk)) {
            alerts.push({
                type: 'Flood Warning',
                severity: floodRisk === 'Severe' ? 'Critical' : 'High',
                description: `${floodRisk} flood risk. Heavy rainfall expected in next 24 hours.`,
                isActive: true,
                validUntil
            });
        }

        if (weatherData.current.temperature.avg > 35) {
            alerts.push({
                type: 'Heat Wave',
                severity: 'High',
                description: 'Extreme heat detected. Take precautions for crops and livestock.',
                isActive: true,
                validUntil
            });
        }

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

    /**
     * Get job status
     */
    getStatus() {
        return {
            totalJobs: this.jobs.length,
            jobs: this.jobs.map((job, index) => ({
                id: index,
                running: job.running
            }))
        };
    }
}

module.exports = new CronJobService();
