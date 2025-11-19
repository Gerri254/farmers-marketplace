import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, RefreshCw, TrendingUp } from "lucide-react";
import { getRecommendations, requestRecommendation, getRecommendationStats } from "../../api";
import RecommendationCard from "../../components/RecommendationCard";
import { useNavigate } from "react-router-dom";

const CropRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchStats();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getRecommendations();
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      toast.error("Failed to load recommendations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getRecommendationStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleRequestRecommendation = async () => {
    try {
      setRequesting(true);
      await requestRecommendation();
      toast.success("Recommendation requested! Processing...");
      setTimeout(fetchRecommendations, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to request recommendation";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setRequesting(false);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Crop Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Get personalized crop recommendations based on your farm conditions
          </p>
        </div>
        <button
          onClick={handleRequestRecommendation}
          disabled={requesting}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {requesting ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Requesting...
            </>
          ) : (
            <>
              <Plus size={20} />
              Request New Recommendation
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-gray-600 text-sm">Total Recommendations</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4">
            <div className="text-gray-600 text-sm">Accepted</div>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4">
            <div className="text-gray-600 text-sm">Implemented</div>
            <div className="text-2xl font-bold text-blue-600">{stats.implemented}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-4">
            <div className="text-gray-600 text-sm">Success Rate</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.successRate?.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Request your first AI-powered crop recommendation to get started
          </p>
          <button
            onClick={handleRequestRecommendation}
            disabled={requesting}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {requesting ? "Requesting..." : "Get Started"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec._id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CropRecommendations;
