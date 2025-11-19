import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Sprout,
  Cloud,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getRecommendationDetails, respondToRecommendation } from "../../api";
import ConfidenceScore from "../../components/ConfidenceScore";
import WeatherWidget from "../../components/WeatherWidget";

const RecommendationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await getRecommendationDetails(id);
      setRecommendation(response.data.recommendation);
    } catch (error) {
      toast.error("Failed to load recommendation details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    try {
      setResponding(true);
      await respondToRecommendation(id, response);
      toast.success(`Recommendation ${response}!`);
      fetchDetails();
    } catch (error) {
      toast.error("Failed to respond to recommendation");
      console.error(error);
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-800">Recommendation not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/farmer-dashboard/recommendations")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Recommendations
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Sprout className="text-green-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {recommendation.cropRecommendation}
              </h1>
              <p className="text-gray-600">
                Recommended on {new Date(recommendation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <ConfidenceScore score={recommendation.confidenceScore} size="lg" />

        {/* Action Buttons */}
        {recommendation.status === "pending" && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleResponse("accepted")}
              disabled={responding}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Accept Recommendation
            </button>
            <button
              onClick={() => handleResponse("rejected")}
              disabled={responding}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
            >
              <XCircle size={20} />
              Reject Recommendation
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Why This Crop?
            </h2>
            <p className="text-gray-700 leading-relaxed">{recommendation.explanation}</p>
          </div>

          {/* Key Factors */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Factors</h2>
            <div className="grid grid-cols-2 gap-4">
              {recommendation.keyFactors?.map((factor, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-lg p-4 border border-green-200"
                >
                  <div className="font-semibold text-green-800">{factor.factor}</div>
                  <div className="text-sm text-gray-600 mt-1">{factor.description}</div>
                  <div className="mt-2">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planting Guidance */}
          {recommendation.plantingGuidance && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Planting Guidance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={24} />
                  <div>
                    <div className="text-sm text-gray-600">Best Planting Time</div>
                    <div className="font-semibold text-gray-800">
                      {recommendation.plantingGuidance.bestPlantingTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-green-600" size={24} />
                  <div>
                    <div className="text-sm text-gray-600">Expected Yield</div>
                    <div className="font-semibold text-gray-800">
                      {recommendation.plantingGuidance.expectedYield}
                    </div>
                  </div>
                </div>
                {recommendation.plantingGuidance.potentialRevenue && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="text-purple-600" size={24} />
                    <div>
                      <div className="text-sm text-gray-600">Potential Revenue</div>
                      <div className="font-semibold text-purple-600 text-xl">
                        KES{" "}
                        {recommendation.plantingGuidance.potentialRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget county={recommendation.farmProfile?.county} />

          {/* Farm Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Farm Details</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">County</div>
                <div className="font-semibold">{recommendation.farmProfile?.county}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Soil Type</div>
                <div className="font-semibold">{recommendation.farmProfile?.soilType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Land Size</div>
                <div className="font-semibold">
                  {recommendation.farmProfile?.landSize} acres
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
            <div
              className={`px-4 py-2 rounded-lg text-center font-semibold ${
                recommendation.status === "accepted"
                  ? "bg-green-100 text-green-800"
                  : recommendation.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {recommendation.status?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationDetails;
