# New Features Test Guide

## Features Implemented

### 1. AI Crop Recommendations (Farmers)
### 2. Farmer-Buyer Matching Algorithm (Both Roles)

---

## Testing AI Recommendations

### Backend Endpoints
```bash
# Request a recommendation
POST http://localhost:3000/api/v1/farmer/request-recommendation
Headers: Authorization: Bearer <token>
Body: { "farmerId": "<farmer_id>" }

# Get all recommendations
GET http://localhost:3000/api/v1/farmer/recommendations/<farmer_id>
Headers: Authorization: Bearer <token>

# Get single recommendation
GET http://localhost:3000/api/v1/farmer/recommendation/<recommendation_id>
Headers: Authorization: Bearer <token>

# Accept/Reject recommendation
POST http://localhost:3000/api/v1/farmer/respond-to-recommendation
Headers: Authorization: Bearer <token>
Body: { "recommendationId": "<id>", "response": "accepted" }

# Get stats
GET http://localhost:3000/api/v1/farmer/recommendation-stats/<farmer_id>
Headers: Authorization: Bearer <token>

# Update farm profile
POST http://localhost:3000/api/v1/farmer/update-farm-profile
Headers: Authorization: Bearer <token>
Body: {
  "farmerId": "<farmer_id>",
  "county": "Trans-Nzoia",
  "soilType": "Clay",
  "landSize": 5.5,
  "location": "Kitale",
  "gpsCoordinates": { "latitude": 1.0504, "longitude": 34.9510 }
}
```

### Frontend Testing (Farmer)
1. Login as farmer
2. Click "Farm Profile" in sidebar
3. Fill in:
   - County (select from dropdown)
   - Soil Type
   - Land Size in acres
   - Optional: Location and GPS coordinates
4. Click "Save Farm Profile"
5. Click "AI Recommendations" in sidebar
6. Click "Request New Recommendation" button
7. Wait 3-5 seconds for AI to generate recommendation
8. View recommendation card with confidence score
9. Click on card to see full details
10. Click "Accept" or "Reject"

---

## Testing Matching Algorithm

### Backend Endpoints

**Farmer Endpoints:**
```bash
# Generate matches for farmer
POST http://localhost:3000/api/v1/matching/farmer/generate
Headers: Authorization: Bearer <token>

# Get farmer's matches
GET http://localhost:3000/api/v1/matching/farmer/matches
Headers: Authorization: Bearer <token>

# Respond to match
POST http://localhost:3000/api/v1/matching/farmer/respond/<match_id>
Headers: Authorization: Bearer <token>
Body: { "response": "accepted" }
```

**Buyer Endpoints:**
```bash
# Generate matches for buyer
POST http://localhost:3000/api/v1/matching/buyer/generate
Headers: Authorization: Bearer <token>

# Get buyer's matches
GET http://localhost:3000/api/v1/matching/buyer/matches
Headers: Authorization: Bearer <token>

# Respond to match
POST http://localhost:3000/api/v1/matching/buyer/respond/<match_id>
Headers: Authorization: Bearer <token>
Body: { "response": "accepted" }
```

**Common Endpoints:**
```bash
# Get match details
GET http://localhost:3000/api/v1/matching/details/<match_id>
Headers: Authorization: Bearer <token>

# Get match statistics
GET http://localhost:3000/api/v1/matching/stats
Headers: Authorization: Bearer <token>
```

### Frontend Testing (Farmer)
1. Login as farmer
2. Make sure you have approved products
3. Click "Matched Buyers" in sidebar
4. Click "Generate Matches" button
5. View matched buyers with:
   - Match score percentage
   - Buyer name and location
   - Distance in km
   - Number of matching products
   - Potential revenue
   - Match factors (Product, Location, Quality scores)
6. Click "Accept" or "Reject" on a match

### Frontend Testing (Buyer)
1. Login as buyer
2. Make sure your buyer profile has preferences set
3. Click "Matched Farmers" in sidebar
4. Click "Generate Matches" button
5. View matched farmers with:
   - Match score percentage
   - Farmer name and county
   - Distance in km
   - Farm size
   - Available products
   - Match factors
6. Click "Accept" or "Reject" on a match

---

## Matching Algorithm Logic

The algorithm scores matches based on:

1. **Product Match (25%)** - How well farmer's products match buyer's preferences
2. **Geographic Proximity (20%)** - Distance between farmer and buyer (0km=100%, 500km+=0%)
3. **Quality Match (15%)** - Average quality grade of farmer's products
4. **Volume Match (20%)** - Can farmer supply buyer's demand quantity
5. **Historical Success (10%)** - Past successful orders between parties
6. **Price Match (10%)** - Farmer's prices within buyer's budget

**Match Score Threshold:** Only matches with score > 40% are shown

---

## Prerequisites for Testing

### For AI Recommendations:
- Farmer must have farm profile setup with county
- Backend must have Gemini AI key configured
- Weather data should be available for the county

### For Matching:
- **Farmers:** Must have approved products
- **Buyers:** Should have buyer profile with preferences and demand forecasts
- Both should have county set in their profiles

---

## Expected Issues & Solutions

### Issue: "Farm profile not found"
**Solution:** Complete farm profile setup first

### Issue: "No matches found"
**Solution:**
- Ensure farmer has approved products
- Ensure buyer has preferences set
- Try with different counties

### Issue: Weather widget not loading
**Solution:** Check OpenWeather API key in backend .env

### Issue: AI recommendation fails
**Solution:** Check Gemini AI API key in backend .env

---

## File Structure Created

### Backend:
- `models/match.js` - Match model
- `v1.services/matchingService.js` - Matching algorithm
- `v1.controllers/matchingController.js` - Match endpoints
- `v1.routes/matching.js` - Match routes

### Frontend:
- `components/CountySelector.jsx` - County dropdown
- `components/ConfidenceScore.jsx` - Score display
- `components/WeatherWidget.jsx` - Weather info
- `components/RecommendationCard.jsx` - Recommendation preview
- `pages/farmer/FarmProfile.jsx` - Farm setup
- `pages/farmer/CropRecommendations.jsx` - List recommendations
- `pages/farmer/RecommendationDetails.jsx` - Single recommendation
- `pages/farmer/MatchedBuyers.jsx` - Buyer matches
- `pages/buyer/MatchedFarmers.jsx` - Farmer matches

### API:
- `api/index.js` - Added 13 new API functions

---

## Quick Test Commands

### Test Backend is Running:
```bash
curl http://localhost:3000/api/v1/weather/health
```

### Test Auth (after login):
```bash
curl -H "Authorization: Bearer <your_token>" \
  http://localhost:3000/api/v1/matching/stats
```

---

## Notes
- All existing features remain unchanged
- UI styling matches existing dashboard theme
- All routes protected with JWT authentication
- Match data expires after 30 days automatically
