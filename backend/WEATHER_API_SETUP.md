# 🌤️ Weather API Integration - Setup & Testing Guide

## ⚠️ IMPORTANT: API Key Activation

Your OpenWeather API key: `31cc89ded338c845b8595b79b624ec84`

**Status:** Pending activation (can take up to 2 hours)

### Check Activation Status

Test if your key is active:
```bash
curl "https://api.openweathermap.org/data/2.5/weather?lat=-1.2864&lon=36.8172&appid=31cc89ded338c845b8595b79b624ec84&units=metric"
```

**When activated, you'll see weather data instead of a 401 error.**

---

## ✅ WHAT'S ALREADY DONE

### 1. Environment Configuration
- ✅ API key added to `.env`
- ✅ Base URL configured
- ✅ Packages installed (axios, node-cron)

### 2. Services Created
- ✅ **weatherService.js** - Fetches weather from OpenWeather API
- ✅ **cronJobs.js** - Automated daily weather collection (6 AM)

### 3. Controllers & Routes
- ✅ **weatherController.js** - 6 weather endpoints
- ✅ **weather.js** - Routes configured

### 4. Automated Collection
- ✅ Cron job runs daily at 6:00 AM EAT
- ✅ Collects weather for all 3 pilot counties
- ✅ Stores in Environmental Data collection
- ✅ Generates alerts (drought, flood, heat wave)

---

## 📍 COUNTY COORDINATES (Pre-configured)

```javascript
Trans-Nzoia:   { lat: 1.0667,  lon: 34.9667 }
Kirinyaga:     { lat: -0.6569, lon: 37.3833 }
Makueni:       { lat: -2.0167, lon: 37.8333 }
Nairobi:       { lat: -1.2864, lon: 36.8172 }
Mombasa:       { lat: -4.0435, lon: 39.6682 }
... (10 more counties)
```

---

## 🚀 NEW WEATHER ENDPOINTS

### 1. Health Check (No Auth Required)
```bash
GET /api/v1/weather/health
```

**Response when API key is active:**
```json
{
  "success": true,
  "status": "healthy",
  "message": "OpenWeather API is accessible",
  "timestamp": "2025-11-02T15:00:00.000Z"
}
```

---

### 2. Get Current Weather
```bash
GET /api/v1/weather/current/:county
Authorization: Bearer {{token}}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/weather/current/Trans-Nzoia \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "county": "Trans-Nzoia",
  "weather": {
    "county": "Trans-Nzoia",
    "coordinates": { "lat": 1.0667, "lon": 34.9667 },
    "temperature": {
      "current": 22,
      "min": 18,
      "max": 28,
      "avg": 22,
      "feelsLike": 23
    },
    "humidity": 65,
    "pressure": 1013,
    "windSpeed": 3.5,
    "conditions": "Partly Cloudy",
    "description": "scattered clouds",
    "timestamp": "2025-11-02T15:00:00.000Z"
  },
  "source": "OpenWeather API",
  "fetchedAt": "2025-11-02T15:00:00.000Z"
}
```

---

### 3. Get Weather Forecast (5 days)
```bash
GET /api/v1/weather/forecast/:county?days=5
Authorization: Bearer {{token}}
```

**Response includes:**
- 40 forecast entries (3-hour intervals)
- Temperature, humidity, wind, precipitation probability
- Weather conditions

---

### 4. Get Comprehensive Weather
```bash
GET /api/v1/weather/comprehensive/:county
Authorization: Bearer {{token}}
```

**Includes:**
- Current weather
- 5-day forecast
- Air quality (if available)
- Rainfall estimates
- Drought & flood risk assessment

**Response:**
```json
{
  "success": true,
  "county": "Trans-Nzoia",
  "data": {
    "current": { ... },
    "forecast": { ... },
    "airQuality": { ... }
  },
  "insights": {
    "rainfall": {
      "estimated24h": 5,
      "estimated7days": 35
    },
    "risks": {
      "drought": "Low",
      "flood": "None"
    }
  }
}
```

---

### 5. Fetch and Store Weather (Admin Only)
```bash
POST /api/v1/weather/fetch-and-store/:county
Authorization: Bearer {{admin_token}}
```

**What it does:**
- Fetches weather from OpenWeather
- Calculates drought/flood risk
- Generates weather alerts
- Saves to EnvironmentalData collection

---

### 6. Fetch All Pilot Counties (Admin Only)
```bash
POST /api/v1/weather/fetch-all-pilot
Authorization: Bearer {{admin_token}}
```

**What it does:**
- Fetches weather for Trans-Nzoia, Kirinyaga, Makueni
- Stores all data in database
- Returns success/failure summary

**Response:**
```json
{
  "success": true,
  "message": "Weather data fetched for pilot counties",
  "result": {
    "totalAttempted": 3,
    "successful": 3,
    "stored": 3,
    "failed": 0,
    "storedCounties": ["Trans-Nzoia", "Kirinyaga", "Makueni"],
    "errors": []
  }
}
```

---

## 🤖 AUTOMATED WEATHER COLLECTION

### Daily Cron Job (6:00 AM EAT)
Automatically runs every morning to collect fresh weather data.

**What it does:**
1. Fetches weather for Trans-Nzoia, Kirinyaga, Makueni
2. Calculates drought/flood risks
3. Generates weather alerts
4. Stores in database
5. Logs results

**Check logs:**
```bash
tail -f backend/logs/*.log
```

**Manually trigger collection:**
```javascript
const cronJobs = require('./v1.services/cronJobs');
const result = await cronJobs.runManualCollection();
console.log(result);
```

---

## 🧪 TESTING WHILE API KEY ACTIVATES

### Option 1: Use Sample Data

Create sample weather data manually:

```bash
POST /api/v1/environmental-data/add
Authorization: Bearer {{admin_token}}

{
  "location": {
    "county": "Trans-Nzoia",
    "coordinates": { "latitude": 1.0667, "longitude": 34.9667 }
  },
  "weather": {
    "temperature": { "avg": 22, "min": 18, "max": 28 },
    "rainfall": { "monthly": 85 },
    "humidity": 65
  },
  "soil": { "type": "Clay Loam", "pH": 6.5 },
  "climateIndicators": {
    "droughtRisk": "Low",
    "floodRisk": "None"
  },
  "dataSource": "Manual Entry"
}
```

---

### Option 2: Wait for Activation

1. **Check every 30 minutes:**
   ```bash
   curl "https://api.openweathermap.org/data/2.5/weather?lat=-1.2864&lon=36.8172&appid=31cc89ded338c845b8595b79b624ec84&units=metric"
   ```

2. **When you see weather data instead of 401:**
   - Restart your server: `npm start`
   - Test health check: `GET /api/v1/weather/health`
   - Fetch pilot counties: `POST /api/v1/weather/fetch-all-pilot`

---

## ✅ VERIFICATION CHECKLIST

Once API key is active:

- [ ] Health check returns "healthy"
- [ ] Can fetch current weather for Trans-Nzoia
- [ ] Can fetch forecast for Kirinyaga
- [ ] Can get comprehensive weather for Makueni
- [ ] Admin can fetch and store weather
- [ ] Data appears in EnvironmentalData collection
- [ ] Cron job runs at 6 AM (check logs next morning)

---

## 🎯 INTEGRATION WITH RECOMMENDATIONS

Once weather data is flowing:

### Updated Recommendation Logic

The recommendation controller will now use real weather data:

```javascript
// In recommendationController.js
const environmentalData = await EnvironmentalData.findOne({
    "location.county": farmer.farm.location.county
}).sort({ date: -1 });

// Use real temperature, rainfall, etc.
if (environmentalData) {
    const temp = environmentalData.weather.temperature.avg;
    const rainfall = environmentalData.weather.rainfall.monthly;

    // Adjust recommendations based on real conditions
    if (temp > 30 && rainfall < 50) {
        // Recommend drought-resistant crops
    }
}
```

---

## 📊 WEATHER DATA STRUCTURE IN DATABASE

**EnvironmentalData Collection:**
```javascript
{
  location: {
    county: "Trans-Nzoia",
    coordinates: { latitude: 1.0667, longitude: 34.9667 }
  },
  date: "2025-11-02T06:00:00.000Z",
  season: "Off-season",
  weather: {
    temperature: { current: 22, min: 18, max: 28, avg: 22 },
    rainfall: { daily: 0, weekly: 35, monthly: 140 },
    humidity: 65,
    windSpeed: 3.5,
    pressure: 1013,
    conditions: "Partly Cloudy"
  },
  climateIndicators: {
    droughtRisk: "Low",
    floodRisk: "None",
    heatStress: "Low"
  },
  alerts: [
    {
      type: "Weather Warning",
      severity: "Low",
      description: "Moderate winds expected",
      isActive: true,
      validUntil: "2025-11-03T06:00:00.000Z"
    }
  ],
  dataSource: "OpenWeather API",
  dataQuality: "High",
  isVerified: true
}
```

---

## 🔧 TROUBLESHOOTING

### API Key Still Not Working After 2 Hours?

1. **Check OpenWeather Dashboard:**
   - Go to: https://home.openweathermap.org/api_keys
   - Verify key status
   - Check usage limits (free tier = 1000 calls/day)

2. **Regenerate Key:**
   - Delete current key
   - Create new key
   - Update `.env` file
   - Restart server

3. **Alternative: Use Different Free API:**
   - WeatherAPI.com (also free tier available)
   - Tomorrow.io (free tier)

---

## 📈 NEXT STEPS

1. ✅ **Wait for API key activation** (up to 2 hours)
2. ✅ **Test health endpoint**
3. ✅ **Fetch weather for all pilot counties**
4. ✅ **Verify data in database**
5. ✅ **Test recommendation with real weather data**
6. 🚀 **Build frontend weather widgets**

---

## 🎉 SUCCESS INDICATORS

When everything is working:

```bash
✅ Health check: "healthy"
✅ Weather data for 3 pilot counties in database
✅ Cron job runs daily at 6 AM
✅ Recommendations use real weather data
✅ Drought/flood alerts generated automatically
✅ Frontend can display current weather
```

---

**Check back in 1-2 hours and test again!**

In the meantime, you can:
- Test other endpoints (profiles, recommendations)
- Design frontend weather components
- Plan ML model training

**Your weather integration is ready - just waiting for API activation!** 🌤️
