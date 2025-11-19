import React from "react";

const KENYAN_COUNTIES = [
  "Trans-Nzoia",
  "Kirinyaga",
  "Makueni",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Uasin Gishu",
  "Kiambu",
  "Meru",
  "Machakos",
  "Bungoma",
  "Kakamega",
];

const CountySelector = ({ value, onChange, label = "County", required = false }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
      >
        <option value="">Select a county</option>
        {KENYAN_COUNTIES.map((county) => (
          <option key={county} value={county}>
            {county}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountySelector;
