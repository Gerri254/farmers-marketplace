const User = require("../models/user");
const Product = require("../models/product");
const Match = require("../models/match");
const Order = require("../models/order");

// County coordinates for Kenya (approximate centers)
const COUNTY_COORDINATES = {
  "Trans-Nzoia": { lat: 1.0504, lon: 34.9510 },
  Kirinyaga: { lat: -0.6588, lon: 37.3830 },
  Makueni: { lat: -2.2500, lon: 37.8333 },
  Nairobi: { lat: -1.2864, lon: 36.8172 },
  Mombasa: { lat: -4.0435, lon: 39.6682 },
  Kisumu: { lat: -0.0917, lon: 34.7680 },
  Nakuru: { lat: -0.3031, lon: 36.0800 },
  "Uasin Gishu": { lat: 0.5500, lon: 35.2833 },
  Kiambu: { lat: -1.1714, lon: 36.8356 },
  Meru: { lat: 0.0500, lon: 37.6500 },
  Machakos: { lat: -1.5177, lon: 37.2634 },
  Bungoma: { lat: 0.5635, lon: 34.5606 },
  Kakamega: { lat: 0.2827, lon: 34.7519 },
};

class MatchingService {
  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate geographic proximity score
  calculateProximityScore(distance) {
    // 0 km = 100%, 500+ km = 0%
    if (distance === 0) return 100;
    if (distance >= 500) return 0;
    return Math.max(0, 100 - (distance / 500) * 100);
  }

  // Calculate product match score
  calculateProductMatchScore(farmerProducts, buyerPreferredCrops) {
    if (!buyerPreferredCrops || buyerPreferredCrops.length === 0) return 50;

    let matchedCategories = 0;
    const buyerCrops = buyerPreferredCrops.map((crop) => crop?.toLowerCase());

    farmerProducts.forEach((product) => {
      if (buyerCrops.includes(product.category?.toLowerCase())) {
        matchedCategories++;
      }
    });

    const score = (matchedCategories / Math.max(buyerPreferredCrops.length, 1)) * 100;
    return Math.min(100, score);
  }

  // Calculate quality match score
  calculateQualityMatchScore(farmerProducts, buyerPreferences) {
    if (!farmerProducts || farmerProducts.length === 0) return 50;

    const avgQuality =
      farmerProducts.reduce((sum, p) => sum + (p.qualityGrade?.score || 50), 0) /
      farmerProducts.length;

    // Prefer higher quality
    return Math.min(100, avgQuality);
  }

  // Calculate volume match score
  calculateVolumeMatchScore(farmerProducts, buyerDemandForecasts) {
    if (!buyerDemandForecasts || buyerDemandForecasts.length === 0) return 50;

    let totalMatchScore = 0;
    let matchedItems = 0;

    buyerDemandForecasts.forEach((demand) => {
      const farmerProduct = farmerProducts.find(
        (p) => p.category?.toLowerCase() === demand.product?.toLowerCase()
      );
      if (farmerProduct) {
        const farmerQty = farmerProduct.availableQuantity || farmerProduct.estimatedYield || 0;
        const demandQty = demand.quantity || 1;
        const ratio = Math.min(farmerQty / demandQty, 1);
        totalMatchScore += ratio * 100;
        matchedItems++;
      }
    });

    return matchedItems > 0 ? totalMatchScore / matchedItems : 50;
  }

  // Calculate historical success score
  async calculateHistoricalSuccessScore(farmerId, buyerId) {
    try {
      const pastOrders = await Order.find({
        farmer: farmerId,
        buyer: buyerId,
        status: "Completed",
      });

      if (pastOrders.length === 0) return 50; // Neutral for new relationships

      // More successful past orders = higher score
      return Math.min(100, 50 + pastOrders.length * 10);
    } catch (error) {
      return 50;
    }
  }

  // Calculate price match score
  calculatePriceMatchScore(farmerProducts, buyerBudget) {
    if (!buyerBudget || buyerBudget === 0) return 50;

    const avgPrice =
      farmerProducts.reduce((sum, p) => sum + (p.price || 0), 0) /
      Math.max(farmerProducts.length, 1);

    // If average price is within budget, higher score
    if (avgPrice <= buyerBudget) {
      return 100;
    } else {
      const ratio = buyerBudget / avgPrice;
      return Math.max(0, ratio * 100);
    }
  }

  // Calculate overall match score
  calculateOverallScore(factors) {
    const weights = {
      productMatch: 0.25,
      geographicProximity: 0.2,
      qualityMatch: 0.15,
      volumeMatch: 0.2,
      historicalSuccess: 0.1,
      priceMatch: 0.1,
    };

    let totalScore = 0;
    Object.keys(weights).forEach((key) => {
      totalScore += (factors[key] || 0) * weights[key];
    });

    return Math.round(totalScore);
  }

  // Estimate transport cost
  estimateTransportCost(distance) {
    // Basic estimation: KES 50 per km
    return Math.round(distance * 50);
  }

  // Calculate potential revenue
  calculatePotentialRevenue(matchedProducts) {
    return matchedProducts.reduce((sum, p) => {
      const qty = p.quantity || p.availableQuantity || p.estimatedYield || 0;
      const price = p.price || p.pricePerUnit || 0;
      return sum + qty * price;
    }, 0);
  }

  // Main matching algorithm - finds matches for a specific farmer
  async findMatchesForFarmer(farmerId) {
    try {
      // Get farmer details
      const farmer = await User.findById(farmerId);
      if (!farmer || farmer.role !== "farmer") {
        throw new Error("Invalid farmer ID");
      }

      // Get farmer's products
      const farmerProducts = await Product.find({
        farmerId: farmerId,
        approved: true,
      });

      if (farmerProducts.length === 0) {
        return [];
      }

      // Get all buyers
      const buyers = await User.find({ role: "buyer" });
      const matches = [];

      for (const buyer of buyers) {
        // Skip if buyer has no profile
        if (!buyer.buyerProfile) continue;

        // Calculate distance
        let distance = 0;
        if (farmer.farm?.location?.county && buyer.buyerProfile?.county) {
          const farmerCoords = COUNTY_COORDINATES[farmer.farm.location.county];
          const buyerCoords = COUNTY_COORDINATES[buyer.buyerProfile.county];

          if (farmerCoords && buyerCoords) {
            distance = this.calculateDistance(
              farmerCoords.lat,
              farmerCoords.lon,
              buyerCoords.lat,
              buyerCoords.lon
            );
          }
        }

        // Calculate all match factors
        const factors = {
          productMatch: this.calculateProductMatchScore(
            farmerProducts,
            buyer.buyerProfile?.preferences?.preferredCrops || []
          ),
          geographicProximity: this.calculateProximityScore(distance),
          qualityMatch: this.calculateQualityMatchScore(
            farmerProducts,
            buyer.buyerProfile?.preferences || []
          ),
          volumeMatch: this.calculateVolumeMatchScore(
            farmerProducts,
            buyer.buyerProfile?.demandForecasts || []
          ),
          historicalSuccess: await this.calculateHistoricalSuccessScore(farmerId, buyer._id),
          priceMatch: this.calculatePriceMatchScore(
            farmerProducts,
            buyer.buyerProfile?.preferences?.volumeRequirements?.maxQuantity || 0
          ),
        };

        const matchScore = this.calculateOverallScore(factors);

        // Only include matches with score > 40
        if (matchScore > 40) {
          // Find matched products
          const buyerPreferredCrops = buyer.buyerProfile?.preferences?.preferredCrops || [];
          const matchedProducts = farmerProducts
            .filter((fp) => {
              return buyerPreferredCrops.some(
                (crop) => crop?.toLowerCase() === fp.category?.toLowerCase()
              );
            })
            .map((p) => ({
              productId: p._id,
              productName: p.name || p.productName,
              category: p.category,
              quantity: p.availableQuantity || p.estimatedYield || 0,
              price: p.pricePerUnit || p.price || 0,
            }));

          matches.push({
            buyer: buyer._id,
            buyerName: buyer.name,
            buyerEmail: buyer.email,
            buyerCounty: buyer.buyerProfile?.county,
            buyerBusinessName: buyer.buyerProfile?.businessName,
            matchScore,
            factors,
            distance,
            estimatedTransportCost: this.estimateTransportCost(distance),
            potentialRevenue: this.calculatePotentialRevenue(matchedProducts),
            matchedProducts,
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches;
    } catch (error) {
      throw error;
    }
  }

  // Main matching algorithm - finds matches for a specific buyer
  async findMatchesForBuyer(buyerId) {
    try {
      // Get buyer details
      const buyer = await User.findById(buyerId);
      if (!buyer || buyer.role !== "buyer") {
        throw new Error("Invalid buyer ID");
      }

      // Check if buyer has a profile - if not, return empty matches instead of erroring
      if (!buyer.buyerProfile) {
        console.warn(`Buyer ${buyerId} does not have a buyerProfile set up`);
        return [];
      }

      // Also check if buyer has preferences set up
      if (!buyer.buyerProfile.preferences || !buyer.buyerProfile.preferences.preferredCrops || buyer.buyerProfile.preferences.preferredCrops.length === 0) {
        console.warn(`Buyer ${buyerId} does not have preferred crops set up`);
        return [];
      }

      // Get all farmers with approved products
      const farmers = await User.find({ role: "farmer" });
      const matches = [];

      for (const farmer of farmers) {
        // Get farmer's products
        const farmerProducts = await Product.find({
          farmerId: farmer._id,
          approved: true,
        });

        if (farmerProducts.length === 0) continue;

        // Calculate distance
        let distance = 0;
        if (farmer.farm?.location?.county && buyer.buyerProfile?.county) {
          const farmerCoords = COUNTY_COORDINATES[farmer.farm.location.county];
          const buyerCoords = COUNTY_COORDINATES[buyer.buyerProfile.county];

          if (farmerCoords && buyerCoords) {
            distance = this.calculateDistance(
              farmerCoords.lat,
              farmerCoords.lon,
              buyerCoords.lat,
              buyerCoords.lon
            );
          }
        }

        // Calculate all match factors
        const factors = {
          productMatch: this.calculateProductMatchScore(
            farmerProducts,
            buyer.buyerProfile?.preferences?.preferredCrops || []
          ),
          geographicProximity: this.calculateProximityScore(distance),
          qualityMatch: this.calculateQualityMatchScore(
            farmerProducts,
            buyer.buyerProfile?.preferences || []
          ),
          volumeMatch: this.calculateVolumeMatchScore(
            farmerProducts,
            buyer.buyerProfile?.demandForecasts || []
          ),
          historicalSuccess: await this.calculateHistoricalSuccessScore(farmer._id, buyerId),
          priceMatch: this.calculatePriceMatchScore(
            farmerProducts,
            buyer.buyerProfile?.preferences?.volumeRequirements?.maxQuantity || 0
          ),
        };

        const matchScore = this.calculateOverallScore(factors);

        // Only include matches with score > 40
        if (matchScore > 40) {
          // Find matched products
          const buyerPreferredCrops = buyer.buyerProfile?.preferences?.preferredCrops || [];
          const matchedProducts = farmerProducts
            .filter((fp) => {
              return buyerPreferredCrops.some(
                (crop) => crop?.toLowerCase() === fp.category?.toLowerCase()
              );
            })
            .map((p) => ({
              productId: p._id,
              productName: p.name || p.productName,
              category: p.category,
              quantity: p.availableQuantity || p.estimatedYield || 0,
              price: p.pricePerUnit || p.price || 0,
            }));

          matches.push({
            farmer: farmer._id,
            farmerName: farmer.name,
            farmerEmail: farmer.email,
            farmerCounty: farmer.farm?.location?.county,
            farmSize: farmer.farm?.landSize,
            matchScore,
            factors,
            distance,
            estimatedTransportCost: this.estimateTransportCost(distance),
            potentialRevenue: this.calculatePotentialRevenue(matchedProducts),
            matchedProducts,
          });
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches;
    } catch (error) {
      throw error;
    }
  }

  // Save matches to database
  async saveMatches(farmerId, buyerId, matchData) {
    try {
      // Check if match already exists
      const existingMatch = await Match.findOne({
        farmer: farmerId,
        buyer: buyerId,
        status: { $ne: "rejected" },
      });

      if (existingMatch) {
        // Update existing match
        existingMatch.matchScore = matchData.matchScore;
        existingMatch.factors = matchData.factors;
        existingMatch.distance = matchData.distance;
        existingMatch.estimatedTransportCost = matchData.estimatedTransportCost;
        existingMatch.potentialRevenue = matchData.potentialRevenue;
        existingMatch.matchedProducts = matchData.matchedProducts;
        await existingMatch.save();
        return existingMatch;
      } else {
        // Create new match
        const newMatch = new Match({
          farmer: farmerId,
          buyer: buyerId,
          matchScore: matchData.matchScore,
          factors: matchData.factors,
          distance: matchData.distance,
          estimatedTransportCost: matchData.estimatedTransportCost,
          potentialRevenue: matchData.potentialRevenue,
          matchedProducts: matchData.matchedProducts,
        });
        await newMatch.save();
        return newMatch;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MatchingService();
