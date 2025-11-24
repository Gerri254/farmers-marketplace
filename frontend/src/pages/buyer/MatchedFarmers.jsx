import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { RefreshCw, Users, MapPin, DollarSign, Package, Maximize, ShoppingCart, Eye } from "lucide-react";
import { generateBuyerMatches, getBuyerMatches, respondToMatch, pushToCart } from "../../api";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const MatchedFarmers = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await getBuyerMatches();
      setMatches(response.data.matches || []);
    } catch (error) {
      toast.error("Failed to load matches");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async () => {
    try {
      setGenerating(true);
      const response = await generateBuyerMatches();

      if (response.data.count === 0) {
        toast.error(response.data.message || "No matches found. Please complete your buyer profile.");
      } else {
        toast.success(`Found ${response.data.count} potential farmers!`);
      }

      fetchMatches();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to generate matches";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleRespond = async (matchId, response) => {
    try {
      await respondToMatch(matchId, response, "buyer");
      toast.success(`Match ${response}!`);
      fetchMatches();
    } catch (error) {
      toast.error("Failed to respond to match");
      console.error(error);
    }
  };

  const handleViewProducts = (farmerId) => {
    navigate(`/buyer-dashboard/farmer/${farmerId}/products`);
  };

  const handleAddToCart = async (product, matchId) => {
    try {
      const buyerId = Cookies.get("id");
      await pushToCart({
        buyerId,
        product: {
          ...product,
          quantity: 1,
          matchId // Track which match this product came from
        }
      });
      toast.success(`${product.productName || product.category} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Matched Farmers</h1>
          <p className="text-gray-600 mt-2">
            AI-matched farmers with products you need
          </p>
        </div>
        <button
          onClick={handleGenerateMatches}
          disabled={generating}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Generate Matches
            </>
          )}
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matches Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate AI matches to find farmers with your desired products
          </p>
          <button
            onClick={handleGenerateMatches}
            disabled={generating}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Generate Matches
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <div
              key={match._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {match.farmer?.name || "Farmer"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {match.farmer?.farmProfile?.county || ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {match.matchScore}%
                  </div>
                  <div className="text-xs text-gray-600">Match Score</div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm">{match.farmer?.farmProfile?.county}</span>
                  <span className="text-sm text-gray-500">
                    ({match.distance?.toFixed(1)} km away)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Maximize size={16} className="text-gray-500" />
                  <span className="text-sm">
                    Farm Size: {match.farmSize || "N/A"} acres
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Package size={16} className="text-gray-500" />
                  <span className="text-sm">
                    {match.matchedProducts?.length || 0} matching products
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-green-600">
                    Potential: KES {match.potentialRevenue?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              {/* Matched Products */}
              {match.matchedProducts && match.matchedProducts.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Available Products:</div>
                  <div className="space-y-2">
                    {match.matchedProducts.slice(0, 3).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">
                            {product.productName || product.category}
                          </span>
                          {product.quantity && (
                            <span className="text-xs text-gray-600 ml-2">
                              ({product.quantity} {product.unit || 'units'})
                            </span>
                          )}
                          {product.price && (
                            <span className="text-xs text-green-600 ml-2 font-semibold">
                              KES {product.price}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product, match._id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1 transition duration-200"
                        >
                          <ShoppingCart size={14} />
                          Add
                        </button>
                      </div>
                    ))}
                    {match.matchedProducts.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{match.matchedProducts.length - 3} more products
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Match Factors */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-600">Product</div>
                  <div className="font-semibold text-sm">
                    {match.factors?.productMatch?.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-600">Location</div>
                  <div className="font-semibold text-sm">
                    {match.factors?.geographicProximity?.toFixed(0)}%
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-600">Quality</div>
                  <div className="font-semibold text-sm">
                    {match.factors?.qualityMatch?.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* View All Products Button */}
                <button
                  onClick={() => handleViewProducts(match.farmer?._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  View All Products from this Farmer
                </button>

                {/* Accept/Reject Buttons */}
                {match.buyerResponse === "pending" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(match._id, "accepted")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Accept Match
                    </button>
                    <button
                      onClick={() => handleRespond(match._id, "rejected")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Reject Match
                    </button>
                  </div>
                ) : (
                  <div
                    className={`text-center py-2 rounded-lg font-semibold ${
                      match.buyerResponse === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Match {match.buyerResponse?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchedFarmers;
