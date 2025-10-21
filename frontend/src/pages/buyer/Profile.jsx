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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleSave = async () => {
    const userID = Cookies.get("id");
    if (!userID) {
      setError("User not logged in.");
      return;
    }

    const formData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      id: userID,
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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buyer Profile</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <label className="block mb-2">Name:</label>
        <input
          type="text"
          name="name"
          value={user.name}
          disabled={!isEditing}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-4"
        />

        <label className="block mb-2">Email:</label>
        <input
          type="email"
          name="email"
          value={user.email}
          disabled
          className="w-full p-2 border rounded-lg mb-4 bg-gray-200"
        />

        <label className="block mb-2">Phone Number:</label>
        <input
          type="tel"
          name="phone"
          value={user.phone}
          disabled={!isEditing}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-4"
        />

        <label className="block mb-2">Address:</label>
        <input
          type="text"
          name="address"
          value={user.address}
          disabled={!isEditing}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg mb-4"
        />

        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg w-full hover:bg-green-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
