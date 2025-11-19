import React, { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, AlertTriangle } from "lucide-react";
import axios from "axios";

const WeatherWidget = ({ county }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!county) {
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/v1/weather/current/${county}`
        );
        setWeather(response.data.data);
        setError(null);
      } catch (err) {
        setError("Unable to fetch weather data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [county]);

  if (!county) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
        Select a county to view weather data
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        <AlertTriangle className="inline mr-2" size={16} />
        {error || "Weather data unavailable"}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{county} Weather</h3>
        <Cloud className="text-blue-600" size={24} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-3">
          <div className="text-3xl font-bold text-gray-800">
            {weather.temperature?.toFixed(1)}°C
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {weather.description || "Clear"}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2">
            <Droplets className="text-blue-500" size={16} />
            <div>
              <div className="text-xs text-gray-600">Humidity</div>
              <div className="text-sm font-semibold">{weather.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg p-2">
            <Wind className="text-gray-500" size={16} />
            <div>
              <div className="text-xs text-gray-600">Wind</div>
              <div className="text-sm font-semibold">{weather.windSpeed} m/s</div>
            </div>
          </div>
        </div>
      </div>

      {weather.rainfall > 0 && (
        <div className="mt-3 bg-blue-200 rounded-lg p-2 text-sm text-blue-800">
          <Droplets className="inline mr-1" size={14} />
          Rainfall: {weather.rainfall} mm
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
