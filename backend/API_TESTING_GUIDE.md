# 🧪 API Testing Guide - AI-Driven Agricultural Marketplace

Complete guide for testing all 23 new API endpoints

---

## 📋 TABLE OF CONTENTS

1. [Setup Instructions](#setup-instructions)
2. [Testing Workflow](#testing-workflow)
3. [Endpoint Tests](#endpoint-tests)
4. [Sample Test Scenarios](#sample-test-scenarios)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Import Postman Collection

1. Open Postman (or download from https://www.postman.com/)
2. Click **Import** button
3. Select the file: `AI_Marketplace_Endpoints.postman_collection.json`
4. Collection will appear in your sidebar

### Step 2: Start Backend Server

```bash
cd backend
npm start
```

Server should be running on: `http://localhost:3000`

### Step 3: Set Environment Variables

In Postman, after each login, save these values:
- `farmer_token` - From farmer login response
- `buyer_token` - From buyer login response
- `farmer_id` - From farmer login response
- `buyer_id` - From buyer login response
- `recommendation_id` - From create recommendation response

---

## 🔄 TESTING WORKFLOW

### Phase 1: Setup (Authentication)

```
1. Register Farmer ✓
2. Login Farmer ✓ → Save token & ID
3. Register Buyer ✓
4. Login Buyer ✓ → Save token & ID
```

### Phase 2: Profile Setup

```
5. Update Farm Details ✓
6. Get Farm Details ✓
7. Add Historical Yield ✓
8. Update Buyer Profile ✓
9. Get Buyer Profile ✓
10. Add Demand Forecast ✓
```

### Phase 3: Environmental Data (Optional - requires admin data)

```
11. Add Environmental Data (Admin) ✓
12. Get Environmental Data by County ✓
13. Get Latest Environmental Data ✓
14. Check Crop Suitability ✓
15. Get Active Alerts ✓
16. Compare Counties ✓
17. Get Historical Trends ✓
```

### Phase 4: AI Recommendations

```
18. Request Crop Recommendation ✓
19. Get All Recommendations ✓
20. Get Recommendation by ID ✓
21. Accept/Reject Recommendation ✓
22. Update Implementation Status ✓
23. Get Recommendation Statistics ✓
```

---

## 📝 DETAILED ENDPOINT TESTS

### 1. AUTHENTICATION

#### 1.1 Register Farmer

**Endpoint:** `POST /api/v1/farmer/register`

**Request:**
```json
{
  "name": "John Kamau",
  "email": "john.kamau@example.com",
  "password": "password123",
  "phone": "+254712345678",
  "role": "farmer",
  "farm": {
    "farmName": "Green Valley Farm",
    "location": "Trans-Nzoia"
  }
}
```

**Expected Response (201):**
```json
{
  "message": "user registered successfully"
}
```

**✅ Success Criteria:**
- Status Code: 201
- Message confirms registration

---

#### 1.2 Login Farmer

**Endpoint:** `POST /api/v1/farmer/login`

**Request:**
```json
{
  "email": "john.kamau@example.com",
  "password": "password123",
  "role": "farmer"
}
```

**Expected Response (201):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "674653f2b6c5d8e7f9a1b2c3"
}
```

**✅ Success Criteria:**
- Status Code: 201
- Token is present
- Save `token` to `{{farmer_token}}`
- Save `id` to `{{farmer_id}}`

---

### 2. FARMER PROFILE MANAGEMENT

#### 2.1 Update Farm Details

**Endpoint:** `POST /api/v1/farmer/update-farm-details`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "farmerId": "{{farmer_id}}",
  "farmName": "Green Valley Farm",
  "location": {
    "county": "Trans-Nzoia",
    "subCounty": "Kwanza",
    "ward": "Keiyo",
    "gpsCoordinates": {
      "latitude": 1.0667,
      "longitude": 34.9667
    }
  },
  "landSize": 5,
  "soilType": "Clay Loam",
  "irrigationType": "Rain-fed",
  "cropsGrown": [
    {
      "cropType": "Maize",
      "plantingDate": "2025-03-15",
      "expectedHarvestDate": "2025-07-15",
      "estimatedYield": 2000,
      "season": "Long Rains (March-May)"
    }
  ],
  "certifications": [
    {
      "type": "Organic",
      "issuedDate": "2024-01-15",
      "expiryDate": "2026-01-15"
    }
  ]
}
```

**Expected Response (200):**
```json
{
  "message": "Farm details updated successfully",
  "farm": {
    "farmName": "Green Valley Farm",
    "location": {
      "county": "Trans-Nzoia",
      "subCounty": "Kwanza",
      "ward": "Keiyo",
      "gpsCoordinates": {
        "latitude": 1.0667,
        "longitude": 34.9667
      }
    },
    "landSize": 5,
    "soilType": "Clay Loam",
    "irrigationType": "Rain-fed",
    "cropsGrown": [...]
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Farm details are returned
- Location includes county and GPS coordinates

---

#### 2.2 Get Farm Details

**Endpoint:** `GET /api/v1/farmer/farm-details/{{farmer_id}}`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
```

**Expected Response (200):**
```json
{
  "farmer": {
    "id": "674653f2b6c5d8e7f9a1b2c3",
    "name": "John Kamau",
    "email": "john.kamau@example.com",
    "phone": "+254712345678",
    "farm": {
      "farmName": "Green Valley Farm",
      "location": {
        "county": "Trans-Nzoia",
        ...
      }
    },
    "metrics": {
      "reliabilityScore": 100,
      "averageRating": "0",
      "isInPilotRegion": true
    }
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Complete farm details returned
- Metrics include reliability score
- `isInPilotRegion` is true for Trans-Nzoia

---

#### 2.3 Add Historical Yield

**Endpoint:** `POST /api/v1/farmer/add-historical-yield`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "farmerId": "{{farmer_id}}",
  "crop": "Maize",
  "season": "Long Rains (March-May)",
  "year": 2024,
  "actualYield": 2100,
  "quality": "Grade A",
  "sellPrice": 45,
  "weather": {
    "avgRainfall": 850,
    "avgTemperature": 22
  }
}
```

**Expected Response (200):**
```json
{
  "message": "Historical yield added successfully",
  "historicalYields": [
    {
      "crop": "Maize",
      "season": "Long Rains (March-May)",
      "year": 2024,
      "actualYield": 2100,
      "quality": "Grade A",
      "sellPrice": 45,
      "weather": {
        "avgRainfall": 850,
        "avgTemperature": 22
      }
    }
  ]
}
```

**✅ Success Criteria:**
- Status Code: 200
- Historical yield is added to array
- All fields are present

---

### 3. BUYER PROFILE MANAGEMENT

#### 3.1 Update Buyer Profile

**Endpoint:** `POST /api/v1/buyer/update-buyer-profile`

**Headers:**
```
Authorization: Bearer {{buyer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "buyerId": "{{buyer_id}}",
  "buyerType": "Institutional",
  "businessName": "Fresh Harvest Supplies Ltd",
  "businessRegistration": "BN-2023-12345",
  "preferences": {
    "preferredCrops": ["Tomatoes", "Kale", "Cabbage"],
    "qualityStandards": "Grade A and Above",
    "certificationRequired": true,
    "deliverySchedule": "Weekly",
    "volumeRequirements": {
      "minQuantity": 100,
      "maxQuantity": 500,
      "frequency": "Weekly"
    },
    "preferredLocations": ["Kirinyaga", "Kiambu"],
    "maxDistance": 150
  }
}
```

**Expected Response (200):**
```json
{
  "message": "Buyer profile updated successfully",
  "buyerProfile": {
    "buyerType": "Institutional",
    "businessName": "Fresh Harvest Supplies Ltd",
    ...
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Buyer profile is updated
- Preferences are saved

---

### 4. AI CROP RECOMMENDATIONS

#### 4.1 Request Crop Recommendation

**Endpoint:** `POST /api/v1/farmer/request-recommendation`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "farmerId": "{{farmer_id}}"
}
```

**Expected Response (201):**
```json
{
  "message": "Crop recommendation generated successfully",
  "recommendation": {
    "_id": "674653f2b6c5d8e7f9a1b2c4",
    "farmerId": "{{farmer_id}}",
    "farmLocation": {
      "county": "Trans-Nzoia",
      "subCounty": "Kwanza",
      "coordinates": {
        "latitude": 1.0667,
        "longitude": 34.9667
      }
    },
    "recommendedCrop": "Maize",
    "confidence": 85,
    "factors": {
      "soilCompatibility": {
        "score": 90,
        "description": "Trans-Nzoia soils are excellent for maize"
      },
      "climateMatch": {
        "score": 85,
        "description": "Climate is suitable for maize production"
      },
      "marketDemand": {
        "score": 80,
        "description": "High demand for maize in Kenya"
      }
    },
    "explanation": {
      "summary": "Based on Trans-Nzoia's agricultural profile...",
      "keyFactors": [...]
    },
    "marketData": {
      "currentPrice": {
        "amount": 45,
        "unit": "per Kg",
        "currency": "KES"
      },
      "projectedDemand": {
        "level": "High"
      }
    },
    "guidance": {
      "bestPlantingTime": {
        "season": "Long Rains (March-May)"
      },
      "expectedYield": {
        "average": 2000,
        "unit": "Kg per acre"
      }
    },
    "status": "Pending",
    "validUntil": "2026-02-02T00:00:00.000Z"
  }
}
```

**✅ Success Criteria:**
- Status Code: 201
- Recommendation is generated
- Recommended crop matches county (Trans-Nzoia → Maize, Kirinyaga → Tomatoes, Makueni → Sorghum)
- Confidence score is present
- Save `_id` to `{{recommendation_id}}`

---

#### 4.2 Get All Recommendations

**Endpoint:** `GET /api/v1/farmer/recommendations/{{farmer_id}}?status=Pending&limit=10`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
```

**Expected Response (200):**
```json
{
  "farmerId": "{{farmer_id}}",
  "count": 1,
  "recommendations": [
    {
      "_id": "674653f2b6c5d8e7f9a1b2c4",
      "recommendedCrop": "Maize",
      "confidence": 85,
      "status": "Pending",
      ...
    }
  ]
}
```

**✅ Success Criteria:**
- Status Code: 200
- Recommendations array is returned
- Count matches array length

---

#### 4.3 Accept Recommendation

**Endpoint:** `POST /api/v1/farmer/respond-to-recommendation`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "recommendationId": "{{recommendation_id}}",
  "decision": "Accepted",
  "feedback": "This recommendation looks very promising! I will plant this crop next season."
}
```

**Expected Response (200):**
```json
{
  "message": "Response recorded successfully",
  "recommendation": {
    "_id": "{{recommendation_id}}",
    "status": "Accepted",
    "farmerResponse": {
      "respondedAt": "2025-11-02T...",
      "decision": "Accepted",
      "feedback": "This recommendation looks very promising..."
    },
    ...
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Status changed to "Accepted"
- Farmer response is recorded

---

#### 4.4 Update Implementation

**Endpoint:** `POST /api/v1/farmer/update-implementation`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "recommendationId": "{{recommendation_id}}",
  "planted": true,
  "plantingDate": "2025-03-15",
  "landAllocated": 3,
  "actualYield": 2200,
  "harvestDate": "2025-07-20",
  "profitRealized": 54000,
  "wasSuccessful": true
}
```

**Expected Response (200):**
```json
{
  "message": "Implementation status updated successfully",
  "implementation": {
    "planted": true,
    "plantingDate": "2025-03-15T00:00:00.000Z",
    "landAllocated": 3,
    "actualYield": 2200,
    "harvestDate": "2025-07-20T00:00:00.000Z",
    "profitRealized": 54000,
    "wasSuccessful": true
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Implementation details are saved
- Status changes to "Implemented"

---

#### 4.5 Get Recommendation Statistics

**Endpoint:** `GET /api/v1/farmer/recommendation-stats/{{farmer_id}}`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
```

**Expected Response (200):**
```json
{
  "farmerId": "{{farmer_id}}",
  "statistics": {
    "total": 1,
    "accepted": 1,
    "implemented": 1,
    "successful": 1,
    "acceptanceRate": 100,
    "implementationRate": 100,
    "successRate": 100
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Statistics are calculated correctly
- Rates are percentages (0-100)

---

### 5. ENVIRONMENTAL DATA

#### 5.1 Add Environmental Data (Admin)

**Endpoint:** `POST /api/v1/environmental-data/add`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "location": {
    "county": "Trans-Nzoia",
    "subCounty": "Kwanza",
    "coordinates": {
      "latitude": 1.0667,
      "longitude": 34.9667
    }
  },
  "date": "2025-11-02",
  "season": "Off-season",
  "weather": {
    "temperature": {
      "current": 22,
      "min": 15,
      "max": 28,
      "avg": 22
    },
    "rainfall": {
      "daily": 0,
      "weekly": 15,
      "monthly": 85
    },
    "humidity": 65,
    "conditions": "Partly Cloudy"
  },
  "soil": {
    "type": "Clay Loam",
    "pH": 6.5,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 150
  },
  "climateIndicators": {
    "droughtRisk": "Low",
    "floodRisk": "None"
  }
}
```

**Expected Response (201):**
```json
{
  "message": "Environmental data added successfully",
  "data": { ... }
}
```

**✅ Success Criteria:**
- Status Code: 201
- Data is saved to database

---

#### 5.2 Get Latest Environmental Data

**Endpoint:** `GET /api/v1/environmental-data/latest/Trans-Nzoia`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
```

**Expected Response (200):**
```json
{
  "data": {
    "location": { "county": "Trans-Nzoia" },
    "weather": { ... },
    "soil": { ... }
  },
  "risks": [],
  "lastUpdated": "2025-11-02T00:00:00.000Z"
}
```

**✅ Success Criteria:**
- Status Code: 200 (or 404 if no data exists)
- Latest data is returned

---

#### 5.3 Check Crop Suitability

**Endpoint:** `POST /api/v1/environmental-data/check-crop-suitability`

**Headers:**
```
Authorization: Bearer {{farmer_token}}
Content-Type: application/json
```

**Request:**
```json
{
  "county": "Trans-Nzoia",
  "cropType": "Maize"
}
```

**Expected Response (200):**
```json
{
  "county": "Trans-Nzoia",
  "cropType": "Maize",
  "suitability": {
    "suitable": true,
    "temperature": "Suitable",
    "rainfall": "Suitable",
    "soil": "Suitable"
  }
}
```

**✅ Success Criteria:**
- Status Code: 200
- Suitability analysis is returned

---

## 🎯 SAMPLE TEST SCENARIOS

### Scenario 1: Complete Farmer Journey

```
1. Register Farmer (Trans-Nzoia)
2. Login Farmer
3. Update Farm Details with location
4. Add 2-3 Historical Yields
5. Request Crop Recommendation → Should recommend Maize
6. Accept Recommendation
7. Update Implementation (planted, yield data)
8. Check Recommendation Statistics
```

**Expected Outcome:**
- Farmer gets Maize recommendation for Trans-Nzoia
- Confidence score ~85%
- Statistics show 100% acceptance & success rate

---

### Scenario 2: Multi-County Comparison

```
1. Add Environmental Data for Trans-Nzoia (Admin)
2. Add Environmental Data for Kirinyaga (Admin)
3. Add Environmental Data for Makueni (Admin)
4. Compare Counties endpoint
5. Check different crop suitability for each county
```

**Expected Outcome:**
- Trans-Nzoia: Suitable for Maize
- Kirinyaga: Suitable for Tomatoes
- Makueni: Suitable for drought-resistant crops

---

### Scenario 3: Buyer-Farmer Matching Prep

```
1. Register Buyer
2. Update Buyer Profile with preferences
3. Add Demand Forecasts
4. Register Multiple Farmers in different counties
5. View buyer profile to verify preferences
```

**Expected Outcome:**
- Buyer profile has complete preferences
- Ready for future AI matching implementation

---

## 🐛 TROUBLESHOOTING

### Error: "Access denied. No token provided"
**Solution:** Add Authorization header with Bearer token

### Error: "Farmer not found"
**Solution:** Ensure you're using correct `farmer_id` from login response

### Error: "Please complete your farm profile with location information"
**Solution:** Run "Update Farm Details" endpoint first with county information

### Error: 404 on Environmental Data
**Solution:** This is expected if no data exists. Run "Add Environmental Data" (admin) first

### Token Expired
**Solution:** Login again and update token in environment variables

---

## ✅ TESTING CHECKLIST

- [ ] All Authentication endpoints working
- [ ] Farmer can update farm details
- [ ] Farmer can add historical yields
- [ ] Buyer can update profile
- [ ] Buyer can add demand forecasts
- [ ] Environmental data can be added (admin)
- [ ] Environmental data can be retrieved
- [ ] Crop suitability check works
- [ ] Crop recommendations are generated
- [ ] Recommendations are county-specific
- [ ] Farmer can accept/reject recommendations
- [ ] Implementation tracking works
- [ ] Statistics are calculated correctly

---

## 📊 EXPECTED TEST RESULTS

**All tests passing means:**
✅ 23/23 endpoints working
✅ Database models functioning correctly
✅ AI recommendation logic working (Phase 1)
✅ Authentication & authorization working
✅ Ready for frontend integration

---

**Next Steps After Testing:**
1. ✅ Confirm all endpoints work
2. Build frontend forms for these endpoints
3. Integrate weather API for real environmental data
4. Build Python ML service for advanced recommendations
5. Implement LIME/SHAP explanations

---

**Need Help?**
- Check server logs in `backend/logs/`
- Verify MongoDB connection
- Ensure all environment variables are set
- Review controller code for error messages
