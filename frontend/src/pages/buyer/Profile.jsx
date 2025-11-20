import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { viewBuyerProfile, editBuyerProfile } from "../../api";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [buyerProfile, setBuyerProfile] = useState({
    county: "",
    businessName: "",
    buyerType: "",
    preferredCrops: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Product categories that match the backend Product model
  const availableCrops = [
    "Fruits",
    "Vegetables",
    "Grains",
    "Dairy",
    "Meat",
    "Poultry",
    "Seafood"
  ];

  const counties = [
    "Trans-Nzoia", "Kirinyaga", "Makueni", "Nairobi", "Mombasa",
    "Kisumu", "Nakuru", "Uasin Gishu", "Kiambu", "Meru",
    "Machakos", "Bungoma", "Kakamega", "Other"
  ];

  const buyerTypes = [
    "Institutional", "Retailer", "Exporter", "Wholesaler",
    "School Program", "Hotel/Restaurant", "Processing Company", "Individual"
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userID = Cookies.get("id"); // Retrieve userID from cookies
      //console.log("User ID:", userID); // Debugging
      if (!userID) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await viewBuyerProfile(userID);
        setUser(response.data.user);

        // Set buyer profile if it exists
        if (response.data.user.buyerProfile) {
          setBuyerProfile({
            county: response.data.user.buyerProfile.county || "",
            businessName: response.data.user.buyerProfile.businessName || "",
            buyerType: response.data.user.buyerProfile.buyerType || "",
            preferredCrops: response.data.user.buyerProfile.preferences?.preferredCrops || [],
          });
        }
        //console.log("Fetched profile:", response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleBuyerProfileChange = (e) => {
    setBuyerProfile({ ...buyerProfile, [e.target.name]: e.target.value });
  };

  const handleCropToggle = (crop) => {
    setBuyerProfile((prev) => {
      const isSelected = prev.preferredCrops.includes(crop);
      return {
        ...prev,
        preferredCrops: isSelected
          ? prev.preferredCrops.filter((c) => c !== crop)
          : [...prev.preferredCrops, crop],
      };
    });
  };

  const handleSave = async () => {
    const userID = Cookies.get("id");
    if (!userID) {
      setError("User not logged in.");
      return;
    }

    // Build buyer profile object, only including non-empty values
    const buyerProfileData = {
      preferences: {
        preferredCrops: buyerProfile.preferredCrops,
      },
    };

    // Only add county if it's not empty
    if (buyerProfile.county && buyerProfile.county !== "") {
      buyerProfileData.county = buyerProfile.county;
    }

    // Only add businessName if it's not empty
    if (buyerProfile.businessName && buyerProfile.businessName !== "") {
      buyerProfileData.businessName = buyerProfile.businessName;
    }

    // Only add buyerType if it's not empty
    if (buyerProfile.buyerType && buyerProfile.buyerType !== "") {
      buyerProfileData.buyerType = buyerProfile.buyerType;
    }

    const formData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      id: userID,
      buyerProfile: buyerProfileData,
    };

    // console.log("Sending updated data:", formData); // Debugging

    try {
      await editBuyerProfile(formData);
      setIsEditing(false);
      console.log("Profile updated successfully.");
    } catch (err) {
      console.error(
        "Error updating profile:",
        err.response?.data || err.message
      );
      setError("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Buyer Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Basic Information</h2>

          <label className="block mb-2 text-gray-600 font-medium">Name:</label>
          <input
            type="text"
            name="name"
            value={user.name}
            disabled={!isEditing}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg mb-4 disabled:bg-gray-100"
          />

          <label className="block mb-2 text-gray-600 font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={user.email}
            disabled
            className="w-full p-2 border rounded-lg mb-4 bg-gray-100"
          />

          <label className="block mb-2 text-gray-600 font-medium">Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={user.phone}
            disabled={!isEditing}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg mb-4 disabled:bg-gray-100"
          />

          <label className="block mb-2 text-gray-600 font-medium">Address:</label>
          <input
            type="text"
            name="address"
            value={user.address}
            disabled={!isEditing}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
          />
        </div>

        {/* Buyer Profile Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Business Information</h2>

          <label className="block mb-2 text-gray-600 font-medium">Business Name:</label>
          <input
            type="text"
            name="businessName"
            value={buyerProfile.businessName}
            disabled={!isEditing}
            onChange={handleBuyerProfileChange}
            className="w-full p-2 border rounded-lg mb-4 disabled:bg-gray-100"
            placeholder="Enter your business name"
          />

          <label className="block mb-2 text-gray-600 font-medium">Buyer Type:</label>
          <select
            name="buyerType"
            value={buyerProfile.buyerType}
            disabled={!isEditing}
            onChange={handleBuyerProfileChange}
            className="w-full p-2 border rounded-lg mb-4 disabled:bg-gray-100"
          >
            <option value="">Select buyer type</option>
            {buyerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <label className="block mb-2 text-gray-600 font-medium">County:</label>
          <select
            name="county"
            value={buyerProfile.county}
            disabled={!isEditing}
            onChange={handleBuyerProfileChange}
            className="w-full p-2 border rounded-lg disabled:bg-gray-100"
          >
            <option value="">Select your county</option>
            {counties.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preferred Product Categories Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Preferred Product Categories
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Required for AI matching)
          </span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Select the product categories you're interested in buying. This helps us match you with the right farmers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableCrops.map((crop) => (
            <button
              key={crop}
              type="button"
              disabled={!isEditing}
              onClick={() => handleCropToggle(crop)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-base font-semibold ${
                buyerProfile.preferredCrops.includes(crop)
                  ? "bg-green-500 text-white border-green-600 hover:bg-green-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:shadow"
              } ${!isEditing ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {crop}
            </button>
          ))}
        </div>

        {buyerProfile.preferredCrops.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Selected ({buyerProfile.preferredCrops.length}):</strong>{" "}
              {buyerProfile.preferredCrops.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6">
        {isEditing ? (
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
