const axios = require('axios');
const logger = require('../v1.utils/log');
require('dotenv').config();

// County coordinates for Kenyan pilot regions
const COUNTY_COORDINATES = {
    "Trans-Nzoia": { lat: 1.0667, lon: 34.9667 },
    "Kirinyaga": { lat: -0.6569, lon: 37.3833 },
    "Makueni": { lat: -2.0167, lon: 37.8333 },
    "Nairobi": { lat: -1.2864, lon: 36.8172 },
    "Mombasa": { lat: -4.0435, lon: 39.6682 },
    "Kisumu": { lat: -0.0917, lon: 34.7680 },
    "Nakuru": { lat: -0.3031, lon: 36.0800 },
    "Uasin Gishu": { lat: 0.5143, lon: 35.2698 },
    "Kiambu": { lat: -1.1714, lon: 36.8356 },
    "Meru": { lat: 0.0469, lon: 37.6556 },
    "Machakos": { lat: -1.5177, lon: 37.2634 },
    "Bungoma": { lat: 0.5635, lon: 34.5606 },
    "Kakamega": { lat: 0.2827, lon: 34.7519 }
};

class WeatherService {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseUrl = process.env.OPENWEATHER_BASE_URL;

        if (!this.apiKey) {
            logger.error('OpenWeather API key is not configured');
            throw new Error('OPENWEATHER_API_KEY is required in environment variables');
        }
    }

    /**
     * Get coordinates for a county
     */
    getCountyCoordinates(county) {
        const coords = COUNTY_COORDINATES[county];
        if (!coords) {
            throw new Error(`No coordinates found for county: ${county}`);
        }
        return coords;
    }

    /**
     * Fetch current weather data for a county
     */
    async getCurrentWeather(county) {
        try {
            const { lat, lon } = this.getCountyCoordinates(county);

            logger.info(`Fetching current weather for ${county} (${lat}, ${lon})`);

            const response = await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric' // Celsius
                }
            });

            const data = response.data;

            // Transform to our schema format
            return {
                county,
                coordinates: { lat, lon },
                temperature: {
                    current: data.main.temp,
                    min: data.main.temp_min,
                    max: data.main.temp_max,
                    avg: data.main.temp,
                    feelsLike: data.main.feels_like
                },
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                windSpeed: data.wind.speed,
                conditions: this._mapWeatherCondition(data.weather[0].main),
                description: data.weather[0].description,
                visibility: data.visibility,
                clouds: data.clouds.all,
                sunrise: new Date(data.sys.sunrise * 1000),
                sunset: new Date(data.sys.sunset * 1000),
                timestamp: new Date(data.dt * 1000)
            };
        } catch (error) {
            logger.error(`Error fetching current weather for ${county}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fetch 5-day weather forecast
     */
    async getWeatherForecast(county) {
        try {
            const { lat, lon } = this.getCountyCoordinates(county);

            logger.info(`Fetching weather forecast for ${county}`);

            const response = await axios.get(`${this.baseUrl}/forecast`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            const forecasts = response.data.list.map(item => ({
                date: new Date(item.dt * 1000),
                temperature: {
                    temp: item.main.temp,
                    min: item.main.temp_min,
                    max: item.main.temp_max
                },
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                windSpeed: item.wind.speed,
                conditions: this._mapWeatherCondition(item.weather[0].main),
                description: item.weather[0].description,
                pop: item.pop * 100 // Probability of precipitation as percentage
            }));

            return {
                county,
                coordinates: { lat, lon },
                forecasts
            };
        } catch (error) {
            logger.error(`Error fetching forecast for ${county}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fetch air quality data
     */
    async getAirQuality(county) {
        try {
            const { lat, lon } = this.getCountyCoordinates(county);

            logger.info(`Fetching air quality for ${county}`);

            const response = await axios.get(`${this.baseUrl.replace('data/2.5', 'data/2.5')}/air_pollution`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey
                }
            });

            const aqi = response.data.list[0];

            return {
                county,
                coordinates: { lat, lon },
                aqi: aqi.main.aqi, // 1-5 scale
                components: aqi.components,
                timestamp: new Date(aqi.dt * 1000)
            };
        } catch (error) {
            logger.warn(`Air quality data not available for ${county}: ${error.message}`);
            return null; // Air quality might not be available for all locations
        }
    }

    /**
     * Get comprehensive weather data for a county
     */
    async getComprehensiveWeather(county) {
        try {
            logger.info(`Fetching comprehensive weather data for ${county}`);

            const [current, forecast] = await Promise.all([
                this.getCurrentWeather(county),
                this.getWeatherForecast(county)
            ]);

            // Try to get air quality, but don't fail if unavailable
            let airQuality = null;
            try {
                airQuality = await this.getAirQuality(county);
            } catch (error) {
                logger.warn(`Air quality unavailable for ${county}`);
            }

            return {
                county,
                current,
                forecast,
                airQuality,
                fetchedAt: new Date()
            };
        } catch (error) {
            logger.error(`Error fetching comprehensive weather for ${county}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Fetch weather for all pilot counties
     */
    async getAllPilotCountiesWeather() {
        const pilotCounties = ["Trans-Nzoia", "Kirinyaga", "Makueni"];

        logger.info('Fetching weather for all pilot counties');

        const results = await Promise.allSettled(
            pilotCounties.map(county => this.getComprehensiveWeather(county))
        );

        const weatherData = [];
        const errors = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                weatherData.push(result.value);
            } else {
                errors.push({
                    county: pilotCounties[index],
                    error: result.reason.message
                });
            }
        });

        return {
            success: weatherData,
            errors,
            totalFetched: weatherData.length,
            totalErrors: errors.length
        };
    }

    /**
     * Calculate rainfall estimate from forecast
     */
    calculateRainfallEstimate(forecastData) {
        // Calculate estimated rainfall from probability
        const dailyRainfall = forecastData.forecasts
            .slice(0, 8) // Next 24 hours (3-hour intervals)
            .reduce((sum, forecast) => sum + (forecast.pop / 10), 0);

        const weeklyRainfall = forecastData.forecasts
            .slice(0, 56) // Next 7 days
            .reduce((sum, forecast) => sum + (forecast.pop / 10), 0);

        return {
            estimated24h: Math.round(dailyRainfall),
            estimated7days: Math.round(weeklyRainfall)
        };
    }

    /**
     * Assess drought risk based on weather data
     */
    assessDroughtRisk(currentWeather, forecastData) {
        const rainfall = this.calculateRainfallEstimate(forecastData);
        const avgTemp = currentWeather.temperature.avg;
        const humidity = currentWeather.humidity;

        // Simple drought risk assessment
        if (rainfall.estimated7days < 10 && avgTemp > 30 && humidity < 40) {
            return 'Severe';
        } else if (rainfall.estimated7days < 20 && avgTemp > 28 && humidity < 50) {
            return 'High';
        } else if (rainfall.estimated7days < 40 && avgTemp > 25) {
            return 'Moderate';
        } else if (rainfall.estimated7days < 60) {
            return 'Low';
        } else {
            return 'None';
        }
    }

    /**
     * Assess flood risk based on weather data
     */
    assessFloodRisk(forecastData) {
        const rainfall = this.calculateRainfallEstimate(forecastData);

        if (rainfall.estimated24h > 50) {
            return 'Severe';
        } else if (rainfall.estimated24h > 30) {
            return 'High';
        } else if (rainfall.estimated24h > 20) {
            return 'Moderate';
        } else if (rainfall.estimated24h > 10) {
            return 'Low';
        } else {
            return 'None';
        }
    }

    /**
     * Map OpenWeather conditions to our schema
     */
    _mapWeatherCondition(condition) {
        const conditionMap = {
            'Clear': 'Clear',
            'Clouds': 'Cloudy',
            'Rain': 'Light Rain',
            'Drizzle': 'Light Rain',
            'Thunderstorm': 'Thunderstorm',
            'Snow': 'Cloudy',
            'Mist': 'Fog',
            'Fog': 'Fog',
            'Haze': 'Haze'
        };

        return conditionMap[condition] || 'Partly Cloudy';
    }

    /**
     * Check if API is accessible
     */
    async healthCheck() {
        try {
            const { lat, lon } = this.getCountyCoordinates('Nairobi');
            await axios.get(`${this.baseUrl}/weather`, {
                params: {
                    lat,
                    lon,
                    appid: this.apiKey,
                    units: 'metric'
                },
                timeout: 5000
            });
            return { status: 'healthy', message: 'OpenWeather API is accessible' };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `OpenWeather API is not accessible: ${error.message}`
            };
        }
    }
}

module.exports = new WeatherService();
