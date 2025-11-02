# ⚡ Quick Test Commands - cURL Examples

Fast reference for testing endpoints using cURL in terminal

---

## 🔐 STEP 1: AUTHENTICATION

### Register Farmer
```bash
curl -X POST http://localhost:3000/api/v1/farmer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Kamau",
    "email": "john.kamau@example.com",
    "password": "password123",
    "phone": "+254712345678",
    "role": "farmer",
    "farm": {
      "farmName": "Green Valley Farm",
      "location": "Trans-Nzoia"
    }
  }'
```

### Login Farmer (Save the token!)
```bash
curl -X POST http://localhost:3000/api/v1/farmer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.kamau@example.com",
    "password": "password123",
    "role": "farmer"
  }'
```

**Response:** Copy the `token` and `id` values!

---

## 📝 SET VARIABLES (Replace with your actual values)

```bash
export FARMER_TOKEN="your_token_here"
export FARMER_ID="your_farmer_id_here"
export BUYER_TOKEN="your_buyer_token_here"
export BUYER_ID="your_buyer_id_here"
```

---

## 👨‍🌾 STEP 2: UPDATE FARM DETAILS

```bash
curl -X POST http://localhost:3000/api/v1/farmer/update-farm-details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "farmerId": "'$FARMER_ID'",
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
    ]
  }'
```

---

## 📊 STEP 3: GET FARM DETAILS

```bash
curl -X GET http://localhost:3000/api/v1/farmer/farm-details/$FARMER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

---

## 🌾 STEP 4: ADD HISTORICAL YIELD

```bash
curl -X POST http://localhost:3000/api/v1/farmer/add-historical-yield \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "farmerId": "'$FARMER_ID'",
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
  }'
```

---

## 🤖 STEP 5: REQUEST CROP RECOMMENDATION

```bash
curl -X POST http://localhost:3000/api/v1/farmer/request-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "farmerId": "'$FARMER_ID'"
  }'
```

**Save the recommendation `_id` from response!**

```bash
export REC_ID="recommendation_id_here"
```

---

## 📋 STEP 6: GET ALL RECOMMENDATIONS

```bash
curl -X GET "http://localhost:3000/api/v1/farmer/recommendations/$FARMER_ID?status=Pending&limit=10" \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

---

## ✅ STEP 7: ACCEPT RECOMMENDATION

```bash
curl -X POST http://localhost:3000/api/v1/farmer/respond-to-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "recommendationId": "'$REC_ID'",
    "decision": "Accepted",
    "feedback": "This looks promising! I will plant this crop."
  }'
```

---

## 🌱 STEP 8: UPDATE IMPLEMENTATION

```bash
curl -X POST http://localhost:3000/api/v1/farmer/update-implementation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "recommendationId": "'$REC_ID'",
    "planted": true,
    "plantingDate": "2025-03-15",
    "landAllocated": 3,
    "actualYield": 2200,
    "harvestDate": "2025-07-20",
    "profitRealized": 54000,
    "wasSuccessful": true
  }'
```

---

## 📈 STEP 9: GET STATISTICS

```bash
curl -X GET http://localhost:3000/api/v1/farmer/recommendation-stats/$FARMER_ID \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

---

## 🛒 BUYER ENDPOINTS

### Register Buyer
```bash
curl -X POST http://localhost:3000/api/v1/buyer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mary Wanjiru",
    "email": "mary.wanjiru@example.com",
    "password": "password123",
    "phone": "+254723456789",
    "role": "buyer",
    "address": "Nairobi, Kenya"
  }'
```

### Login Buyer
```bash
curl -X POST http://localhost:3000/api/v1/buyer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mary.wanjiru@example.com",
    "password": "password123",
    "role": "buyer"
  }'
```

### Update Buyer Profile
```bash
curl -X POST http://localhost:3000/api/v1/buyer/update-buyer-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "buyerId": "'$BUYER_ID'",
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
  }'
```

### Get Buyer Profile
```bash
curl -X GET http://localhost:3000/api/v1/buyer/buyer-profile/$BUYER_ID \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### Add Demand Forecast
```bash
curl -X POST http://localhost:3000/api/v1/buyer/add-demand-forecast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "buyerId": "'$BUYER_ID'",
    "product": "Tomatoes",
    "quantity": 300,
    "deadline": "2025-12-01",
    "priority": "High"
  }'
```

---

## 🌍 ENVIRONMENTAL DATA ENDPOINTS

### Get Latest Environmental Data
```bash
curl -X GET http://localhost:3000/api/v1/environmental-data/latest/Trans-Nzoia \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

### Check Crop Suitability
```bash
curl -X POST http://localhost:3000/api/v1/environmental-data/check-crop-suitability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "county": "Trans-Nzoia",
    "cropType": "Maize"
  }'
```

### Compare Counties
```bash
curl -X POST http://localhost:3000/api/v1/environmental-data/compare-counties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -d '{
    "counties": ["Trans-Nzoia", "Kirinyaga", "Makueni"]
  }'
```

### Get Historical Trends
```bash
curl -X GET "http://localhost:3000/api/v1/environmental-data/trends/Trans-Nzoia?months=6" \
  -H "Authorization: Bearer $FARMER_TOKEN"
```

---

## 🎯 COMPLETE TEST SCRIPT

Save this as `test-api.sh`:

```bash
#!/bin/bash

echo "=== AI Marketplace API Test ==="
echo ""

# Step 1: Register and Login
echo "1. Registering Farmer..."
curl -s -X POST http://localhost:3000/api/v1/farmer/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Kamau",
    "email": "john.test@example.com",
    "password": "password123",
    "phone": "+254712345678",
    "role": "farmer",
    "farm": {"farmName": "Test Farm", "location": "Trans-Nzoia"}
  }'

echo -e "\n\n2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/farmer/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.test@example.com",
    "password": "password123",
    "role": "farmer"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
FARMER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
echo "Farmer ID: $FARMER_ID"

# Step 2: Update Farm Details
echo -e "\n\n3. Updating farm details..."
curl -s -X POST http://localhost:3000/api/v1/farmer/update-farm-details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "farmerId": "'$FARMER_ID'",
    "farmName": "Test Farm",
    "location": {
      "county": "Trans-Nzoia",
      "gpsCoordinates": {"latitude": 1.0667, "longitude": 34.9667}
    },
    "landSize": 5,
    "soilType": "Clay Loam"
  }'

# Step 3: Request Recommendation
echo -e "\n\n4. Requesting crop recommendation..."
REC_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/farmer/request-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"farmerId": "'$FARMER_ID'"}')

echo $REC_RESPONSE | jq .

REC_ID=$(echo $REC_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

# Step 4: Accept Recommendation
echo -e "\n\n5. Accepting recommendation..."
curl -s -X POST http://localhost:3000/api/v1/farmer/respond-to-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recommendationId": "'$REC_ID'",
    "decision": "Accepted",
    "feedback": "Great recommendation!"
  }' | jq .

# Step 5: Get Statistics
echo -e "\n\n6. Getting statistics..."
curl -s -X GET http://localhost:3000/api/v1/farmer/recommendation-stats/$FARMER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n\n=== Test Complete ==="
```

Make executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📝 NOTES

1. **Pretty Print JSON:** Add `| jq .` to any curl command
2. **Save Response:** Add `-o response.json` to save response
3. **Verbose Output:** Add `-v` flag to see full request/response
4. **Silent Mode:** Add `-s` flag to hide progress

---

## 🎉 SUCCESS INDICATORS

✅ Registration returns: `"message": "user registered successfully"`
✅ Login returns: `token` and `id`
✅ Farm update returns: `"message": "Farm details updated successfully"`
✅ Recommendation returns: County-specific crop (Trans-Nzoia → Maize)
✅ Statistics show: 100% acceptance rate

---

**All working? You're ready to build the frontend! 🚀**
