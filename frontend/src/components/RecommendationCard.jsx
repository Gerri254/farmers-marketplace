import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Calendar, TrendingUp, DollarSign } from "lucide-react";
import ConfidenceScore from "./ConfidenceScore";

const RecommendationCard = ({ recommendation }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      implemented: "bg-blue-100 text-blue-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border-l-4 border-green-500"
      onClick={() => navigate(`/farmer-dashboard/recommendation/${recommendation._id}`)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Sprout className="text-green-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800">
            {recommendation.cropRecommendation}
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
            recommendation.status
          )}`}
        >
          {recommendation.status?.toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <ConfidenceScore score={recommendation.confidenceScore} size="md" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-500" size={16} />
          <div>
            <div className="text-xs text-gray-600">Best Planting Time</div>
            <div className="text-sm font-semibold text-gray-800">
              {recommendation.plantingGuidance?.bestPlantingTime || "N/A"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="text-gray-500" size={16} />
          <div>
            <div className="text-xs text-gray-600">Expected Yield</div>
            <div className="text-sm font-semibold text-gray-800">
              {recommendation.plantingGuidance?.expectedYield || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {recommendation.plantingGuidance?.potentialRevenue && (
        <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
          <DollarSign className="text-green-600" size={20} />
          <div>
            <div className="text-xs text-gray-600">Potential Revenue</div>
            <div className="text-lg font-bold text-green-600">
              KES {recommendation.plantingGuidance.potentialRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Recommended on {new Date(recommendation.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default RecommendationCard;
