import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { viewFarmerProfile, updateFarmProfile } from "../../api";
import CountySelector from "../../components/CountySelector";
import { MapPin, Maximize, Droplet } from "lucide-react";

const SOIL_TYPES = [
  "Clay",
  "Sandy",
  "Loam",
  "Silt",
  "Peaty",
  "Chalky",
  "Red Volcanic",
  "Black Cotton",
];

const FarmProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmData, setFarmData] = useState({
    county: "",
    location: "",
    gpsCoordinates: { latitude: "", longitude: "" },
    soilType: "",
    landSize: "",
  });

  useEffect(() => {
    fetchFarmProfile();
  }, []);

  const fetchFarmProfile = async () => {
    try {
      setLoading(true);
      const userID = Cookies.get("id");
      const response = await viewFarmerProfile(userID);
      const profile = response.data.user.farmProfile || {};

      setFarmData({
        county: profile.county || "",
        location: profile.location || "",
        gpsCoordinates: {
          latitude: profile.gpsCoordinates?.latitude || "",
          longitude: profile.gpsCoordinates?.longitude || "",
        },
        soilType: profile.soilType || "",
        landSize: profile.landSize || "",
      });
    } catch (error) {
      toast.error("Failed to load farm profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!farmData.county || !farmData.soilType || !farmData.landSize) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      await updateFarmProfile(farmData);
      toast.success("Farm profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update farm profile");
      console.error(error);
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Farm Profile Setup</h2>
        <p className="text-gray-600 mb-6">
          Complete your farm profile to receive personalized AI crop recommendations
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* County */}
          <div>
            <CountySelector
              value={farmData.county}
              onChange={(value) => setFarmData({ ...farmData, county: value })}
              label="County"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-1" size={16} />
              Specific Location
            </label>
            <input
              type="text"
              value={farmData.location}
              onChange={(e) => setFarmData({ ...farmData, location: e.target.value })}
              placeholder="e.g., Kitale Town, Ward 3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={farmData.gpsCoordinates.latitude}
                onChange={(e) =>
                  setFarmData({
                    ...farmData,
                    gpsCoordinates: {
                      ...farmData.gpsCoordinates,
                      latitude: e.target.value,
                    },
                  })
                }
                placeholder="e.g., 1.0504"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={farmData.gpsCoordinates.longitude}
                onChange={(e) =>
                  setFarmData({
                    ...farmData,
                    gpsCoordinates: {
                      ...farmData.gpsCoordinates,
                      longitude: e.target.value,
                    },
                  })
                }
                placeholder="e.g., 34.9510"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Soil Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplet className="inline mr-1" size={16} />
              Soil Type <span className="text-red-500">*</span>
            </label>
            <select
              value={farmData.soilType}
              onChange={(e) => setFarmData({ ...farmData, soilType: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select soil type</option>
              {SOIL_TYPES.map((soil) => (
                <option key={soil} value={soil}>
                  {soil}
                </option>
              ))}
            </select>
          </div>

          {/* Land Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Maximize className="inline mr-1" size={16} />
              Land Size (in acres) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={farmData.landSize}
              onChange={(e) => setFarmData({ ...farmData, landSize: e.target.value })}
              required
              placeholder="e.g., 5.5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Farm Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FarmProfile;
